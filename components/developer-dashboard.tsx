"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { WorkEntry, Task, getColorBgClass, getColorLightBgClass, getColorTextClass, getColorBorderClass } from "@/lib/data";
import { Header } from "./header";
import { AddWorkEntryDialog } from "./add-work-entry-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Popover, PopoverContent, PopoverTrigger
} from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  ChevronLeft, ChevronRight, Calendar, Plus, Pencil, Trash2,
  Clock, TrendingUp, FolderKanban, AlertCircle, ChevronDown,
  ArrowLeftCircle, ArrowRightCircle, GripVertical
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectPreviewDialog } from "./project-preview-dialog";
import { ProjectLegend } from "./project-legend";

interface DragInfo {
  type: 'card' | 'task';
  projectId: string;
  date: string;
  entryId?: string;
}

function getWeekDates(offset = 0): string[] {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1) + offset * 7);
  const dates: string[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }
  return dates;
}

const shiftDate = (dateStr: string, days: number): string => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

// ─── Task edit popover ────────────────────────────────────────────────────────
function TaskEditPopover({
  entry,
  task,
  onClose,
}: {
  entry: WorkEntry;
  task: Task | undefined;
  onClose: () => void;
}) {
  const { updateWorkEntry, updateTask, deleteWorkEntry } = useAuth();
  const [hours, setHours] = useState(entry.hours.toString());
  const [status, setStatus] = useState(task?.status ?? "in-progress");

  // Re-sync local status when the task prop changes (after updateTask propagates)
  useEffect(() => {
    setStatus(task?.status ?? "in-progress");
  }, [task?.status]);

  useEffect(() => {
    setHours(entry.hours.toString());
  }, [entry.hours]);

  const handleSave = () => {
    updateWorkEntry(entry.id, { hours: parseFloat(hours) });
    if (task) updateTask(task.id, { status });
    onClose();
  };

  const handleDelete = () => {
    deleteWorkEntry(entry.id);
    onClose();
  };

  return (
    <div className="space-y-3 p-1">
      <p className="text-xs font-semibold text-foreground truncate max-w-[200px]">
        {task?.title ?? "Tarea"}
      </p>

      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Estado</p>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="in-progress">En Progreso</SelectItem>
            <SelectItem value="completed">Completado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Horas</p>
        <Input
          type="number" min="0.5" max="12" step="0.5"
          value={hours}
          onChange={e => setHours(e.target.value)}
          className="h-8 text-xs"
        />
      </div>

      <div className="flex gap-1.5 pt-1">
        <Button size="sm" className="flex-1 h-7 text-xs" onClick={handleSave}>Guardar</Button>
        <Button size="sm" variant="destructive" className="h-7 text-xs px-2" onClick={handleDelete}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}


// ─── Project day card ─────────────────────────────────────────────────────────
function ProjectDayCard({
  projectId,
  entries,
  isFuture,
  onAddTask,
  onDragStartCard,
  onDragStartTask,
  onDragEnd,
  draggingInfo,
  isOpen,
  onToggleOpen,
}: {
  projectId: string;
  entries: WorkEntry[];
  isFuture: boolean;
  onAddTask: () => void;
  onDragStartCard: () => void;
  onDragStartTask: (entryId: string) => void;
  onDragEnd: () => void;
  draggingInfo: DragInfo | null;
  isOpen: boolean;
  onToggleOpen: () => void;
}) {
  const { projects, tasks } = useAuth();
  const [openPopoverEntryId, setOpenPopoverEntryId] = useState<string | null>(null);

  const project = projects.find(p => p.id === projectId);
  if (!project) return null;

  const totalHours = entries.reduce((s, e) => s + e.hours, 0);

  const getTask = (entry: WorkEntry) =>
    entry.taskId ? tasks.find(t => t.id === entry.taskId) : undefined;

  const isDraggingCard = draggingInfo?.type === 'card' && draggingInfo.projectId === projectId && draggingInfo.date === entries[0]?.date;

  return (
    <motion.div layout>
      {/* Marquee keyframe */}
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          30%  { transform: translateX(0); }
          70%  { transform: translateX(calc(-100% + 80px)); }
          100% { transform: translateX(0); }
        }
        .marquee-hover:hover .marquee-text { animation: marquee-scroll 3s ease-in-out; }
      `}</style>
      <div
        draggable={!isFuture}
        onDragStart={onDragStartCard}
        onDragEnd={onDragEnd}
        className={`rounded-lg border-l-[3px] ${getColorLightBgClass(project.color)} ${getColorBorderClass(project.color)} overflow-hidden cursor-grab active:cursor-grabbing transition-opacity ${isDraggingCard ? 'opacity-40' : ''} marquee-hover`}
      >
        <div className="flex items-center justify-between px-2.5 py-2 gap-1" onMouseDown={e => e.stopPropagation()}>
          {/* Left: project name with marquee (Now clickable) */}
          <button
            onClick={() => onToggleOpen()}
            className="overflow-hidden max-w-[90px] shrink-0 text-left hover:opacity-80 transition-opacity"
          >
            <Badge
              variant="secondary"
              className={`text-[10px] px-1.5 py-0 h-4 ${getColorTextClass(project.color)} bg-transparent whitespace-nowrap block marquee-text`}
            >
              {project.name}
            </Badge>
          </button>

          {/* Right: hours + add + task toggle */}
          <div className="flex items-center gap-1 shrink-0">
            <span className={`text-[10px] font-semibold ${getColorTextClass(project.color)}`}>
              {totalHours}h
            </span>
            {!isFuture && (
              <button
                onClick={e => { e.stopPropagation(); onAddTask(); }}
                title="Añadir tarea"
                className={`h-5 w-5 flex items-center justify-center rounded border border-current hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${getColorTextClass(project.color)} bg-white/40 dark:bg-black/20 shadow-sm`}
              >
                <Plus className="h-3 w-3" />
              </button>
            )}
            {!isFuture && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleOpen(); }}
                className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>
        </div>

        {/* Visible task count summary — always shown */}
        {!isFuture && entries.length > 0 && (
          <div className="flex items-center gap-2 px-2.5 pb-1.5" onMouseDown={e => e.stopPropagation()}>
            {(() => {
              const taskList = entries.map(e => e.taskId ? tasks.find(t => t.id === e.taskId) : undefined);
              const inProg = taskList.filter(t => t?.status === 'in-progress').length;
              const done = taskList.filter(t => t?.status === 'completed').length;
              return (
                <>
                  {inProg > 0 && <span className="text-[9px] bg-amber-500/10 text-amber-600 border border-amber-500/20 px-1 py-0.5 rounded-sm font-medium">{inProg} en progreso</span>}
                  {done > 0 && <span className="text-[9px] bg-green-500/10 text-green-600 border border-green-500/20 px-1 py-0.5 rounded-sm font-medium">{done} completada{done > 1 ? 's' : ''}</span>}
                </>
              );
            })()}
          </div>
        )}

        {/* Task list dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border/60 divide-y divide-slate-400 dark:divide-slate-500 overflow-hidden"
            >
              {entries.map(entry => {
                const task = getTask(entry);
                const statusColor =
                  task?.status === "completed" ? "text-green-700 bg-green-500/20 border-green-500/30 dark:text-green-400"
                    : task?.status === "in-progress" ? "text-amber-700 bg-amber-500/20 border-amber-500/30 dark:text-amber-400"
                      : "text-slate-600 bg-slate-500/10 border-slate-500/20";

                const isDraggingTask = draggingInfo?.type === 'task' && draggingInfo.entryId === entry.id;

                return (
                  <li
                    key={entry.id}
                    draggable={!isFuture}
                    onDragStart={(e) => {
                      e.stopPropagation();
                      onDragStartTask(entry.id);
                    }}
                    onDragEnd={(e) => {
                      e.stopPropagation();
                      onDragEnd();
                    }}
                    className={`flex items-center justify-between gap-1 px-2.5 py-1.5 transition-colors group/task hover:bg-black/5 dark:hover:bg-white/5 cursor-grab active:cursor-grabbing ${task?.status === 'completed' ? 'bg-green-500/5' : ''} ${isDraggingTask ? 'opacity-30' : ''}`}
                  >
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <GripVertical className="h-3 w-3 text-muted-foreground/30 group-hover/task:text-muted-foreground/60 transition-colors shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-foreground truncate">
                          {task?.title ?? entry.description}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge variant="outline" className={`text-[9px] px-1 h-3.5 border font-semibold ${statusColor}`}>
                            {task?.status === "completed" ? "Completado"
                              : task?.status === "in-progress" ? "En Progreso"
                                : "Pendiente"}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-medium">{entry.hours}h</span>
                        </div>
                      </div>
                    </div>

                    {/* Edit popover */}
                    <Popover
                      open={openPopoverEntryId === entry.id}
                      onOpenChange={open => setOpenPopoverEntryId(open ? entry.id : null)}
                    >
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 hover:bg-background/80" onMouseDown={e => e.stopPropagation()}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent side="right" align="start" className="w-52 p-3">
                        <TaskEditPopover
                          entry={entry}
                          task={task}
                          onClose={() => setOpenPopoverEntryId(null)}
                        />
                      </PopoverContent>
                    </Popover>
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export function DeveloperDashboard() {
  const { user, projects, workEntries, tasks, updateWorkEntry, error } = useAuth();
  const [weekOffset, setWeekOffset] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [defaultProjectId, setDefaultProjectId] = useState<string | undefined>(undefined);
  const [previewProjectId, setPreviewProjectId] = useState<string | null>(null);

  // Drag state: supports both 'card' (group) and 'task' (single entry)
  const [dragging, setDragging] = useState<DragInfo | null>(null);
  const [dropTargetDate, setDropTargetDate] = useState<string | null>(null);
  const [dropTargetWeek, setDropTargetWeek] = useState<number | null>(null); // -1: prev, 1: next

  const navTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Map to store expanded state per date and project: 'yyyy-mm-dd:projectId'
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCard = (date: string, projectId: string) => {
    const key = `${date}:${projectId}`;
    setExpandedCards(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const isToday = (ds: string) => ds === today;
  const isFutureDate = (ds: string) => ds > today;

  // Check if moving to next week is allowed (at least one day must be available / not entirely in future)
  const canGoToNextWeek = useMemo(() => {
    const nextWeekDates = getWeekDates(weekOffset + 1);
    // If ANY day in the next week is NOT future, it's allowed.
    // Or if there's at least one non-future day available.
    return nextWeekDates.some(d => !isFutureDate(d));
  }, [weekOffset, today]);

  useEffect(() => {
    return () => {
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, []);

  const myEntries = useMemo(() => {
    if (!user) return [];
    return workEntries.filter(e => e.userId === user.id && weekDates.includes(e.date));
  }, [user, workEntries, weekDates]);

  const stats = useMemo(() => {
    const totalHours = myEntries.reduce((s, e) => s + e.hours, 0);
    const projectsWorked = new Set(myEntries.map(e => e.projectId)).size;
    const avgPerDay = myEntries.length > 0 ? (totalHours / 5).toFixed(1) : "0";
    return { totalHours, projectsWorked, avgPerDay };
  }, [myEntries]);

  const getEntriesForDate = (date: string) =>
    myEntries.filter(e => e.date === date);

  const formatDate = (ds: string) => parseInt(ds.split("-")[2], 10);
  const formatMonth = (ds: string) => {
    const [y, m, d] = ds.split("-");
    return new Date(+y, +m - 1, +d).toLocaleDateString("es-ES", { month: "short" });
  };
  const formatWeekRange = () => {
    if (weekDates.length < 5) return "";
    const fmt = (ds: string, opts: Intl.DateTimeFormatOptions) => {
      const [y, m, d] = ds.split("-");
      return new Date(+y, +m - 1, +d).toLocaleDateString("es-ES", opts);
    };
    return `${fmt(weekDates[0], { day: "numeric", month: "short" })} – ${fmt(weekDates[4], { day: "numeric", month: "short", year: "numeric" })}`;
  };

  const handleDragOverWeekZone = (direction: number) => {
    if (!dragging) return;

    // Restriction: Can't move to a future-only week when dragging
    if (direction === 1 && !canGoToNextWeek) {
      setDropTargetWeek(null);
      return;
    }

    if (dropTargetWeek !== direction) {
      setDropTargetWeek(direction);
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
      navTimerRef.current = setTimeout(() => {
        setWeekOffset(o => o + direction);
        toast.info(direction === 1 ? 'Cambiando a semana siguiente...' : 'Cambiando a semana anterior...');
      }, 600);
    }
  };

  const clearNavTimer = () => {
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
    navTimerRef.current = null;
    setDropTargetWeek(null);
  };

  const handleCrossWeekDrop = (direction: number) => {
    if (!dragging) return;
    setDropTargetWeek(null);
    const newDate = shiftDate(dragging.date, direction * 7);

    if (dragging.type === 'task' && dragging.entryId) {
      updateWorkEntry(dragging.entryId, { date: newDate }, true);
      toast.success('Tarea movida exitosamente');
    } else {
      // Transfer expansion state if the card was open
      if (expandedCards[`${dragging.date}:${dragging.projectId}`]) {
        setExpandedCards(prev => {
          const next = { ...prev };
          next[`${newDate}:${dragging.projectId}`] = true;
          delete next[`${dragging.date}:${dragging.projectId}`];
          return next;
        });
      }

      workEntries
        .filter(en => en.userId === user?.id && en.projectId === dragging.projectId && en.date === dragging.date)
        .forEach(en => updateWorkEntry(en.id, { date: newDate }, true));
      toast.success(`Proyecto movido a la semana ${direction === 1 ? 'siguiente' : 'anterior'}`);
    }
    setDragging(null);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <Header />
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="container mx-auto px-4 py-6 space-y-6"
      >
        {error && (
          <div className="bg-destructive/15 text-destructive border border-destructive/50 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div>
              <h3 className="font-medium text-destructive">Error de conexión a la base de datos</h3>
              <p className="text-sm mt-1 opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Esta semana", value: `${stats.totalHours}h`, icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Proyectos", value: stats.projectsWorked, icon: FolderKanban, color: "text-green-500", bg: "bg-green-500/10" },
            { label: "Promedio/día", value: `${stats.avgPerDay}h`, icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-500/10" }
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${s.bg}`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
                    <div>
                      <p className="text-2xl font-bold">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Week navigation */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setWeekOffset(o => o - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setWeekOffset(o => o + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)} className="gap-2">
            <Calendar className="h-4 w-4" /> Hoy
          </Button>
          <span className="text-sm font-medium ml-2">{formatWeekRange()}</span>
        </div>

        {/* Project legend */}
        <ProjectLegend onProjectClick={setPreviewProjectId} />

        {/* Weekly grid container for side drop zones */}
        <div className="relative group/grid">
          {/* Side Drop Zones (Portal Mode) */}
          <AnimatePresence>
            {dragging && (
              <>
                {/* Previous Week zone */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onDragOver={(e) => { e.preventDefault(); handleDragOverWeekZone(-1); }}
                  onDragLeave={clearNavTimer}
                  className={`absolute -left-12 top-0 bottom-0 w-10 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors z-10 ${dropTargetWeek === -1 ? 'bg-primary/20 border-primary text-primary' : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/50'}`}
                >
                  <ArrowLeftCircle className="w-6 h-6" />
                  <span className="[writing-mode:vertical-lr] rotate-180 text-[10px] font-bold uppercase tracking-widest">Semana Anterior</span>
                </motion.div>

                {/* Next Week zone */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onDragOver={(e) => { e.preventDefault(); handleDragOverWeekZone(1); }}
                  onDragLeave={clearNavTimer}
                  className={`absolute -right-12 top-0 bottom-0 w-10 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors z-10 ${dropTargetWeek === 1 ? 'bg-primary/20 border-primary text-primary' : (weekOffset >= 0 && !canGoToNextWeek) ? 'opacity-20 pointer-events-none grayscale' : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/50'}`}
                >
                  <ArrowRightCircle className="w-6 h-6" />
                  <span className="[writing-mode:vertical-lr] text-[10px] font-bold uppercase tracking-widest">Semana Siguiente</span>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Weekly grid */}
          <div className="grid grid-cols-5 gap-4">
            {weekDates.map((date, index) => {
              const entries = getEntriesForDate(date);
              const totalHours = entries.reduce((s, e) => s + e.hours, 0);
              const isFuture = isFutureDate(date);
              const isDragOver = dropTargetDate === date && (dragging?.date !== date || weekOffset !== 0);

              // Group entries by projectId
              const projectGroups = entries.reduce<Record<string, WorkEntry[]>>((acc, e) => {
                if (!acc[e.projectId]) acc[e.projectId] = [];
                acc[e.projectId].push(e);
                return acc;
              }, {});

              return (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`border-border/50 h-full transition-all ${isToday(date) ? "ring-2 ring-primary" : ""} ${isFuture ? "opacity-50 bg-muted/30" : ""} ${isDragOver ? "ring-2 ring-primary/50 bg-primary/5" : ""}`}
                    onDragOver={e => { if (!isFuture && dragging) { e.preventDefault(); setDropTargetDate(date); } }}
                    onDragLeave={() => setDropTargetDate(null)}
                    onDrop={e => {
                      e.preventDefault();
                      setDropTargetDate(null);
                      if (!dragging || isFuture) return;

                      if (dragging.type === 'task' && dragging.entryId) {
                        // Move only the specific task
                        updateWorkEntry(dragging.entryId, { date }, true);
                        toast.success('Tarea movida exitosamente');
                      } else {
                        // Transfer expansion state if the card was open
                        if (expandedCards[`${dragging.date}:${dragging.projectId}`]) {
                          setExpandedCards(prev => {
                            const next = { ...prev };
                            next[`${date}:${dragging.projectId}`] = true;
                            delete next[`${dragging.date}:${dragging.projectId}`];
                            return next;
                          });
                        }

                        // Move all entries of that project card to new date
                        workEntries
                          .filter(en => en.userId === user?.id && en.projectId === dragging.projectId && en.date === dragging.date)
                          .forEach(en => updateWorkEntry(en.id, { date }, true));
                        toast.success('Proyecto movido exitosamente');
                      }

                      setDragging(null);
                    }}
                  >
                    <CardHeader className="p-3 pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{dayNames[index]}</p>
                          <div className="flex items-baseline gap-1">
                            <CardTitle className="text-2xl">{formatDate(date)}</CardTitle>
                            <span className="text-xs text-muted-foreground uppercase">{formatMonth(date)}</span>
                          </div>
                        </div>
                        {isToday(date) && <Badge variant="default" className="text-xs">Hoy</Badge>}
                        {isFuture && <Badge variant="outline" className="text-xs text-muted-foreground">Futuro</Badge>}
                      </div>
                    </CardHeader>

                    <CardContent className="p-3 pt-0 space-y-2 flex flex-col h-[calc(100%-65px)]">
                      <div className="space-y-2 flex-1 min-h-[100px]">
                        {/* One project card per unique project */}
                        {Object.entries(projectGroups).map(([projectId, projEntries]) => (
                          <ProjectDayCard
                            key={projectId}
                            projectId={projectId}
                            entries={projEntries}
                            isFuture={isFuture}
                            onAddTask={() => {
                              setSelectedDate(date);
                              setDefaultProjectId(projectId);
                              setDialogOpen(true);
                            }}
                            onDragStartCard={() => setDragging({ type: 'card', projectId, date })}
                            onDragStartTask={(entryId) => setDragging({ type: 'task', entryId, projectId, date })}
                            onDragEnd={() => { setDragging(null); setDropTargetDate(null); clearNavTimer(); }}
                            draggingInfo={dragging}
                            isOpen={!!expandedCards[`${date}:${projectId}`]}
                            onToggleOpen={() => toggleCard(date, projectId)}
                          />
                        ))}
                      </div>

                      {/* Total row */}
                      {totalHours > 0 && (
                        <div className="flex items-center justify-end gap-1 pt-1 border-t border-border/30">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">{totalHours}h total</span>
                        </div>
                      )}

                      {/* Add button */}
                      <div className="mt-2">
                        {isFuture ? (
                          <div className="w-full h-8 flex items-center justify-center">
                            <span className="text-xs text-muted-foreground/50">Bloqueado</span>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full h-8 border border-dashed border-border/50 text-muted-foreground hover:text-foreground"
                            onClick={() => { setSelectedDate(date); setDefaultProjectId(undefined); setDialogOpen(true); }}
                          >
                            <Plus className="h-3 w-3 mr-1" /> Añadir
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.main>

      <AddWorkEntryDialog
        open={dialogOpen}
        onOpenChange={open => { setDialogOpen(open); if (!open) setDefaultProjectId(undefined); }}
        date={selectedDate}
        defaultProjectId={defaultProjectId}
      />

      <ProjectPreviewDialog
        projectId={previewProjectId}
        open={!!previewProjectId}
        onOpenChange={open => !open && setPreviewProjectId(null)}
        viewMode="developer"
      />
    </div>
  );
}

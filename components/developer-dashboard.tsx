"use client";

import { useState, useMemo, useEffect } from "react";
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
  Clock, TrendingUp, FolderKanban, AlertCircle, ChevronDown
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  projectId: string;
  entries: WorkEntry[];
  isFuture: boolean;
  onAddTask: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  isDragging: boolean;
}) {
  const { projects, tasks } = useAuth();
  const [taskListOpen, setTaskListOpen] = useState(false);
  const [openPopoverEntryId, setOpenPopoverEntryId] = useState<string | null>(null);

  const project = projects.find(p => p.id === projectId);
  if (!project) return null;

  const totalHours = entries.reduce((s, e) => s + e.hours, 0);

  const getTask = (entry: WorkEntry) =>
    entry.taskId ? tasks.find(t => t.id === entry.taskId) : undefined;

  return (
    <>
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
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className={`rounded-lg border-l-[3px] ${getColorLightBgClass(project.color)} ${getColorBorderClass(project.color)} overflow-hidden cursor-grab active:cursor-grabbing transition-opacity ${isDragging ? 'opacity-40' : ''} marquee-hover`}
      >
      <div className="flex items-center justify-between px-2.5 py-2 gap-1">
        {/* Left: project name with marquee */}
        <div className="overflow-hidden max-w-[90px] shrink-0">
          <Badge
            variant="secondary"
            className={`text-[10px] px-1.5 py-0 h-4 ${getColorTextClass(project.color)} bg-transparent whitespace-nowrap block marquee-text`}
          >
            {project.name}
          </Badge>
        </div>

        {/* Right: hours + add + task toggle */}
        <div className="flex items-center gap-1 shrink-0">
          <span className={`text-[10px] font-semibold ${getColorTextClass(project.color)}`}>
            {totalHours}h
          </span>
          {!isFuture && (
            <button
              onClick={e => { e.stopPropagation(); onAddTask(); }}
              title="Añadir tarea"
              className={`h-5 w-5 flex items-center justify-center rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${getColorTextClass(project.color)}`}
            >
              <Plus className="h-3 w-3" />
            </button>
          )}
          {!isFuture && (
            <button
              onClick={() => setTaskListOpen(o => !o)}
              className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown className={`h-3 w-3 transition-transform ${taskListOpen ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* Visible task count summary — always shown */}
      {!isFuture && entries.length > 0 && (
        <div className="flex items-center gap-2 px-2.5 pb-1.5">
          {(() => {
            const taskList = entries.map(e => e.taskId ? tasks.find(t => t.id === e.taskId) : undefined);
            const inProg = taskList.filter(t => t?.status === 'in-progress').length;
            const done   = taskList.filter(t => t?.status === 'completed').length;
            return (
              <>
                {inProg > 0 && <span className="text-[9px] bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 px-1 py-0.5 rounded-sm font-medium">{inProg} en progreso</span>}
                {done  > 0 && <span className="text-[9px] bg-green-500/10 text-green-600 border border-green-500/20 px-1 py-0.5 rounded-sm font-medium">{done} completada{done>1?'s':''}</span>}
              </>
            );
          })()}
        </div>
      )}

      {/* Task list dropdown */}
      {taskListOpen && (
        <ul className="border-t border-border/30 divide-y divide-border/20">
          {entries.map(entry => {
            const task = getTask(entry);
            const statusColor =
              task?.status === "completed" ? "text-green-600 bg-green-500/10 border-green-500/20"
              : task?.status === "in-progress" ? "text-yellow-600 bg-yellow-500/10 border-yellow-500/20"
              : "text-muted-foreground bg-muted border-border/50";

            return (
              <li key={entry.id} className="flex items-center justify-between gap-1 px-2.5 py-1.5">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-foreground truncate">
                    {task?.title ?? entry.description}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant="outline" className={`text-[9px] px-1 h-3.5 border ${statusColor}`}>
                      {task?.status === "completed" ? "Completado"
                        : task?.status === "in-progress" ? "En Progreso"
                        : "Pendiente"}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{entry.hours}h</span>
                  </div>
                </div>

                {/* Edit popover */}
                <Popover
                  open={openPopoverEntryId === entry.id}
                  onOpenChange={open => setOpenPopoverEntryId(open ? entry.id : null)}
                >
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 hover:bg-background/80">
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
        </ul>
      )}
    </div>
    </>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export function DeveloperDashboard() {
  const { user, projects, workEntries, tasks, updateWorkEntry, error } = useAuth();
  const [weekOffset, setWeekOffset] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [defaultProjectId, setDefaultProjectId] = useState<string | undefined>(undefined);
  // Drag state: tracks which project card on which date is being dragged
  const [dragging, setDragging] = useState<{ projectId: string; date: string } | null>(null);
  const [dropTargetDate, setDropTargetDate] = useState<string | null>(null);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

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

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const isToday = (ds: string) => ds === today;
  const isFutureDate = (ds: string) => ds > today;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 space-y-6">
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
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10"><Clock className="h-5 w-5 text-blue-500" /></div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalHours}h</p>
                  <p className="text-xs text-muted-foreground">Esta semana</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10"><FolderKanban className="h-5 w-5 text-green-500" /></div>
                <div>
                  <p className="text-2xl font-bold">{stats.projectsWorked}</p>
                  <p className="text-xs text-muted-foreground">Proyectos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10"><TrendingUp className="h-5 w-5 text-orange-500" /></div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgPerDay}h</p>
                  <p className="text-xs text-muted-foreground">Promedio/día</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm text-muted-foreground">Proyectos:</span>
          {projects.map(p => (
            <div key={p.id} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getColorBgClass(p.color)}`} />
              <span className="text-sm">{p.name}</span>
            </div>
          ))}
        </div>

        {/* Weekly grid */}
        <div className="grid grid-cols-5 gap-4">
          {weekDates.map((date, index) => {
            const entries = getEntriesForDate(date);
            const totalHours = entries.reduce((s, e) => s + e.hours, 0);
            const isFuture = isFutureDate(date);
            const isDragOver = dropTargetDate === date && dragging?.date !== date;

            // Group entries by projectId
            const projectGroups = entries.reduce<Record<string, WorkEntry[]>>((acc, e) => {
              if (!acc[e.projectId]) acc[e.projectId] = [];
              acc[e.projectId].push(e);
              return acc;
            }, {});

            return (
              <Card
                key={date}
                className={`border-border/50 transition-all ${isToday(date) ? "ring-2 ring-primary" : ""} ${isFuture ? "opacity-50 bg-muted/30" : ""} ${isDragOver ? "ring-2 ring-primary/50 bg-primary/5" : ""}`}
                onDragOver={e => { if (!isFuture && dragging) { e.preventDefault(); setDropTargetDate(date); }}}
                onDragLeave={() => setDropTargetDate(null)}
                onDrop={e => {
                  e.preventDefault();
                  setDropTargetDate(null);
                  if (!dragging || isFuture || dragging.date === date) return;
                  // Move all entries of that project card to new date
                  workEntries
                    .filter(en => en.userId === user?.id && en.projectId === dragging.projectId && en.date === dragging.date)
                    .forEach(en => updateWorkEntry(en.id, { date }));
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

                <CardContent className="p-3 pt-0 space-y-2">
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
                      onDragStart={() => setDragging({ projectId, date })}
                      onDragEnd={() => { setDragging(null); setDropTargetDate(null); }}
                      isDragging={dragging?.projectId === projectId && dragging?.date === date}
                    />
                  ))}

                  {/* Total row */}
                  {totalHours > 0 && (
                    <div className="flex items-center justify-end gap-1 pt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">{totalHours}h total</span>
                    </div>
                  )}

                  {/* Add button */}
                  {isFuture ? (
                    <div className="w-full h-8 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground/50">No disponible</span>
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      <AddWorkEntryDialog
        open={dialogOpen}
        onOpenChange={open => { setDialogOpen(open); if (!open) setDefaultProjectId(undefined); }}
        date={selectedDate}
        defaultProjectId={defaultProjectId}
      />
    </div>
  );
}

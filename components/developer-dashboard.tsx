"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { WorkEntry, Task, getColorBgClass, getColorLightBgClass, getColorTextClass, getColorBorderClass } from "@/lib/data";
import { Header } from "./header";
import { AddWorkEntryDialog } from "./add-work-entry-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Plus, Pencil, Trash2, Clock, TrendingUp, FolderKanban, AlertCircle, ClipboardList, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function getWeekDates(offset: number = 0): string[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + offset * 7);

  const dates: string[] = [];
  for (let i = 0; i < 5; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
  }
  return dates;
}

const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

export function DeveloperDashboard() {
  const { user, projects, workEntries, tasks, updateTask, deleteWorkEntry, error } = useAuth();
  const [weekOffset, setWeekOffset] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [editEntry, setEditEntry] = useState<WorkEntry | null>(null);
  const [showEntryDetails, setShowEntryDetails] = useState<WorkEntry | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  const myEntries = useMemo(() => {
    if (!user) return [];
    return workEntries.filter((e) => e.userId === user.id && weekDates.includes(e.date));
  }, [user, workEntries, weekDates]);

  const stats = useMemo(() => {
    const totalHours = myEntries.reduce((sum, e) => sum + e.hours, 0);
    const projectsWorked = new Set(myEntries.map((e) => e.projectId)).size;
    const avgPerDay = myEntries.length > 0 ? totalHours / 5 : 0;
    return { totalHours, projectsWorked, avgPerDay: avgPerDay.toFixed(1) };
  }, [myEntries]);

  const getEntriesForDate = (date: string) => {
    return myEntries.filter((e) => e.date === date);
  };

  const getProjectById = (projectId: string) => {
    return projects.find((p) => p.id === projectId);
  };

  const handleAddEntry = (date: string) => {
    setSelectedDate(date);
    setEditEntry(null);
    setDialogOpen(true);
  };

  const handleEditEntry = (entry: WorkEntry) => {
    setSelectedDate(entry.date);
    setEditEntry(entry);
    setDialogOpen(true);
  };

  const handleViewDetails = async (entry: WorkEntry) => {
    try {
      setIsLoadingDetails(true);
      // Consultamos en tiempo real a la base de datos (XAMPP)
      const res = await fetch(`/api/work-entries/${entry.id}`);
      if (res.ok) {
        const dbData = await res.json();
        // Aseguramos que la fecha venga sin formato "T00:00:00.000Z"
        const formattedDate = dbData.date && typeof dbData.date === 'string' && dbData.date.includes('T')
          ? dbData.date.split('T')[0]
          : dbData.date;

        setShowEntryDetails({
          ...dbData,
          id: String(dbData.id),
          userId: String(dbData.userId),
          projectId: String(dbData.projectId),
          date: formattedDate
        });
      } else {
        // Fallback si algo falla
        setShowEntryDetails(entry);
      }
    } catch (error) {
      console.error("Error obteniendo detalle de la base de datos:", error);
      setShowEntryDetails(entry);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-");
    return parseInt(day, 10);
  };

  const formatMonth = (dateString: string) => {
    const [year, month, day] = dateString.split("-");
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    return date.toLocaleDateString("es-ES", { month: "short" });
  };

  const formatWeekRange = () => {
    if (weekDates.length < 5) return "";
    const [sYear, sMonth, sDay] = weekDates[0].split("-");
    const [eYear, eMonth, eDay] = weekDates[4].split("-");
    const start = new Date(parseInt(sYear, 10), parseInt(sMonth, 10) - 1, parseInt(sDay, 10));
    const end = new Date(parseInt(eYear, 10), parseInt(eMonth, 10) - 1, parseInt(eDay, 10));
    const startStr = start.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    const endStr = end.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
    return `${startStr} - ${endStr}`;
  };
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const isToday = (dateString: string) => {
    return dateString === today;
  };

  const isFutureDate = (dateString: string) => {
    return dateString > today;
  };

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
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalHours}h</p>
                  <p className="text-xs text-muted-foreground">Esta semana</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <FolderKanban className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.projectsWorked}</p>
                  <p className="text-xs text-muted-foreground">Proyectos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.avgPerDay}h</p>
                  <p className="text-xs text-muted-foreground">Promedio/día</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((o) => o - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((o) => o + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)} className="gap-2">
            <Calendar className="h-4 w-4" />
            Hoy
          </Button>
          <span className="text-sm font-medium text-foreground ml-2">{formatWeekRange()}</span>
        </div>

        {/* Project Legend */}
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm text-muted-foreground">Proyectos:</span>
          {projects.map((project) => (
            <div key={project.id} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getColorBgClass(project.color)}`} />
              <span className="text-sm text-foreground">{project.name}</span>
            </div>
          ))}
        </div>

        {/* Weekly Grid */}
        <div className="grid grid-cols-5 gap-4">
          {weekDates.map((date, index) => {
            const entries = getEntriesForDate(date);
            const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
            const isFuture = isFutureDate(date);

            return (
              <Card
                key={date}
                className={`border-border/50 ${isToday(date) ? "ring-2 ring-primary" : ""} ${isFuture ? "opacity-50 bg-muted/30" : ""}`}
              >
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{dayNames[index]}</p>
                      <div className="flex items-baseline gap-1">
                        <CardTitle className="text-2xl">{formatDate(date)}</CardTitle>
                        <span className="text-xs text-muted-foreground uppercase">
                          {formatMonth(date)}
                        </span>
                      </div>
                    </div>
                    {isToday(date) && (
                      <Badge variant="default" className="text-xs">
                        Hoy
                      </Badge>
                    )}
                    {isFuture && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        Futuro
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-2">
                  {entries.map((entry) => {
                    const project = getProjectById(entry.projectId);
                    if (!project) return null;

                    const pTasks = tasks.filter(t => t.projectId === project.id);
                    const availableCount = pTasks.filter(t => !t.assignedTo && t.status !== 'completed').length;
                    const inProgressCount = pTasks.filter(t => t.assignedTo === user?.id && t.status === 'in-progress').length;
                    const completedCount = pTasks.filter(t => t.assignedTo === user?.id && t.status === 'completed').length;

                    return (
                      <div
                        key={entry.id}
                        className={`flex flex-col p-2 rounded-lg border-l-3 ${getColorLightBgClass(project.color)} ${getColorBorderClass(project.color)} group relative`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <Badge
                            variant="secondary"
                            className={`text-[10px] px-1.5 py-0 h-4 ${getColorTextClass(project.color)} bg-transparent`}
                          >
                            {project.name}
                          </Badge>
                          <span className={`text-[10px] font-medium ${getColorTextClass(project.color)}`}>
                            {entry.hours}h
                          </span>
                        </div>

                        {(availableCount > 0 || inProgressCount > 0 || completedCount > 0) && (
                          <div className="flex flex-wrap gap-1 mb-1.5 pr-12">
                            {availableCount > 0 && <span className="text-[9px] bg-muted/80 text-muted-foreground px-1 py-0.5 rounded-sm font-medium leading-none" title="Tareas disponibles">{availableCount} disp</span>}
                            {inProgressCount > 0 && <span className="text-[9px] bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 px-1 py-0.5 rounded-sm font-medium leading-none" title="Tareas en progreso">{inProgressCount} prog</span>}
                            {completedCount > 0 && <span className="text-[9px] bg-green-500/10 text-green-600 border border-green-500/20 px-1 py-0.5 rounded-sm font-medium leading-none" title="Tareas completadas">{completedCount} comp</span>}
                          </div>
                        )}

                        <p className="text-[11px] text-foreground/80 line-clamp-2 pr-12 leading-tight">
                          {entry.description}
                        </p>
                        <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 bg-background/80 backdrop-blur-sm p-0.5 rounded-md border border-border/50">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-muted"
                            onClick={() => handleViewDetails(entry)}
                            disabled={isLoadingDetails}
                          >
                            <Eye className={`h-3.5 w-3.5 ${isLoadingDetails ? "animate-pulse" : ""}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-muted"
                            onClick={() => handleEditEntry(entry)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteWorkEntry(entry.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {totalHours > 0 && (
                    <div className="flex items-center justify-end gap-1 pt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">
                        {totalHours}h total
                      </span>
                    </div>
                  )}

                  {isFuture ? (
                    <div className="w-full h-8 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground/50">No disponible</span>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-8 border border-dashed border-border/50 text-muted-foreground hover:text-foreground"
                      onClick={() => handleAddEntry(date)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Añadir
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
        onOpenChange={setDialogOpen}
        date={selectedDate}
        editEntry={editEntry}
      />

      {/* Modal de detalles de la tarea/registro */}
      <Dialog open={!!showEntryDetails} onOpenChange={(open) => !open && setShowEntryDetails(null)}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Tarea</DialogTitle>
          </DialogHeader>
          {showEntryDetails && (() => {
            const project = getProjectById(showEntryDetails.projectId);
            const projectName = project ? project.name : "Proyecto Desconocido";
            const projectColor = project ? project.color : "#666";

            return (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${getColorBgClass(projectColor)} shadow-sm`} />
                  <div>
                    <h3 className="text-xl font-bold leading-none text-foreground">{projectName}</h3>
                    <div className="flex gap-2 mt-2 items-center text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {showEntryDetails.date}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {showEntryDetails.hours}h</span>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/40 p-4 rounded-lg border border-border/50 mt-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    Descripción del Registro
                  </h4>
                  <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {showEntryDetails.description || "Sin descripción proporcionada."}
                  </p>
                </div>

                {/* Backlog de Tareas integrado */}
                <div className="pt-6 border-t border-border/50">
                  <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <FolderKanban className="h-4 w-4 text-primary" />
                    Tareas del Proyecto
                  </h4>

                  {(() => {
                    const projectTasks = tasks.filter(t => t.projectId === showEntryDetails.projectId && (t.assignedTo === user?.id || !t.assignedTo));

                    if (projectTasks.length === 0) {
                      return (
                        <div className="bg-muted/30 p-4 rounded-lg text-center text-sm text-muted-foreground">
                          No tienes tareas pendientes en este proyecto.
                        </div>
                      );
                    }

                    const activeTasks = projectTasks.filter(t => t.assignedTo === user?.id && t.status !== 'completed');
                    const completedTasks = projectTasks.filter(t => t.assignedTo === user?.id && t.status === 'completed');
                    const availableTasks = projectTasks.filter(t => !t.assignedTo && t.status !== 'completed');

                    const renderTaskCard = (task: Task) => (
                      <Card key={task.id} className="border border-border/50 shadow-sm">
                        <CardHeader className="p-3 pb-2">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-semibold text-sm leading-tight pr-2">{task.title}</h3>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 shrink-0 whitespace-nowrap ${task.status === 'completed' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                                task.status === 'in-progress' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                                  'bg-muted text-muted-foreground border-border/50'
                              }`}>
                              {task.status === 'completed' ? 'Completado' : task.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 pt-1">
                          <p className="text-xs text-foreground/80 line-clamp-3 mb-3">{task.description}</p>
                          {task.assignedTo === user?.id ? (
                            <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-border/50">
                              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tu Estado</span>
                              <Select
                                value={task.status}
                                onValueChange={(val) => updateTask(task.id, { status: val })}
                              >
                                <SelectTrigger className="h-8 text-xs bg-muted/50 border-border/50">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="in-progress">En Progreso</SelectItem>
                                  <SelectItem value="completed">Completado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          ) : !task.assignedTo ? (
                            <div className="flex justify-end mt-3 pt-3 border-t border-border/50">
                              <Button
                                size="sm"
                                variant="default"
                                className="h-8 text-xs w-full"
                                onClick={() => updateTask(task.id, { assignedTo: user?.id, status: 'in-progress' })}
                              >
                                Asignarme esta tarea
                              </Button>
                            </div>
                          ) : null}
                        </CardContent>
                      </Card>
                    );

                    return (
                      <div className="space-y-6">
                        {activeTasks.length > 0 && (
                          <div className="space-y-3">
                            <h5 className="text-xs font-bold text-foreground">Tus Tareas Activas</h5>
                            <div className="space-y-3">
                              {activeTasks.map(renderTaskCard)}
                            </div>
                          </div>
                        )}

                        {availableTasks.length > 0 && (
                          <div className="space-y-3">
                            <h5 className="text-xs font-bold text-foreground">Tareas Disponibles</h5>
                            <div className="space-y-3">
                              {availableTasks.map(renderTaskCard)}
                            </div>
                          </div>
                        )}

                        {completedTasks.length > 0 && (
                          <div className="space-y-3 opacity-60">
                            <h5 className="text-xs font-bold text-foreground">Tareas Completadas</h5>
                            <div className="space-y-3">
                              {completedTasks.map(renderTaskCard)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

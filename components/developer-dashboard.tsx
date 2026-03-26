"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { WorkEntry, getColorBgClass, getColorLightBgClass, getColorTextClass, getColorBorderClass } from "@/lib/data";
import { Header } from "./header";
import { AddWorkEntryDialog } from "./add-work-entry-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Plus, Pencil, Trash2, Clock, TrendingUp, FolderKanban, AlertCircle, ClipboardList } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  const myEntries = useMemo(() => {
    if (!user) return [];
    return workEntries.filter((e) => e.userId === user.id && weekDates.includes(e.date));
  }, [user, workEntries, weekDates]);

  const myTasks = useMemo(() => {
    if (!user || !tasks) return [];
    const myProjectIds = Array.from(new Set(workEntries.filter(e => e.userId === user.id).map(e => e.projectId)));
    return tasks.filter(t => t.assignedTo === user.id || myProjectIds.includes(t.projectId));
  }, [tasks, workEntries, user]);

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

                    return (
                      <div
                        key={entry.id}
                        className={`p-2 rounded-lg border-l-3 ${getColorLightBgClass(project.color)} ${getColorBorderClass(project.color)} group relative`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <Badge
                            variant="secondary"
                            className={`text-xs px-1.5 py-0 h-5 ${getColorTextClass(project.color)} bg-transparent`}
                          >
                            {project.name}
                          </Badge>
                          <span className={`text-xs font-medium ${getColorTextClass(project.color)}`}>
                            {entry.hours}h
                          </span>
                        </div>
                        <p className="text-xs text-foreground/80 line-clamp-2 pr-12">
                          {entry.description}
                        </p>
                        <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleEditEntry(entry)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() => deleteWorkEntry(entry.id)}
                          >
                            <Trash2 className="h-3 w-3" />
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

        {/* Project Backlog / Tareas */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Backlog de Tareas</h2>
          </div>
          {myTasks.length === 0 ? (
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-8 text-center text-muted-foreground">
                No tienes tareas pendientes en tus proyectos.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myTasks.map(task => {
                const project = getProjectById(task.projectId);
                return (
                  <Card key={task.id} className={`border-l-4 ${project ? getColorBorderClass(project.color) : ''}`}>
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-sm leading-tight pr-2">{task.title}</h3>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 shrink-0 whitespace-nowrap">
                          {task.status === 'completed' ? 'Completado' : task.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
                        </Badge>
                      </div>
                      {project && (
                         <div className={`text-xs ${getColorTextClass(project.color)} mt-1`}>{project.name}</div>
                      )}
                    </CardHeader>
                    <CardContent className="p-4 pt-1">
                      <p className="text-xs text-foreground/80 line-clamp-3 mb-3">{task.description}</p>
                      {task.assignedTo === user?.id ? (
                        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border/50">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tu Estado</span>
                          <Select 
                            value={task.status} 
                            onValueChange={(val) => updateTask(task.id, { status: val })}
                          >
                            <SelectTrigger className="h-8 text-xs bg-muted/50 border-border/50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendiente</SelectItem>
                              <SelectItem value="in-progress">En Progreso</SelectItem>
                              <SelectItem value="completed">Completado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ) : !task.assignedTo ? (
                        <div className="flex justify-end mt-4 pt-4 border-t border-border/50">
                          <Button 
                            size="sm" 
                            variant="default" 
                            className="h-8 text-xs w-full"
                            onClick={() => updateTask(task.id, { assignedTo: user?.id, status: 'in-progress' })}
                          >
                            Asignarme esta tarea
                          </Button>
                        </div>
                      ) : (
                        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                          <Badge variant="outline" className="text-[10px] text-muted-foreground bg-muted/50 border-border/50">Asignada a otro desarrollador</Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <AddWorkEntryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        date={selectedDate}
        editEntry={editEntry}
      />
    </div>
  );
}

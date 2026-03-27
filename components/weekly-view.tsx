"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getColorLightBgClass, getColorTextClass, getColorBorderClass, WorkEntry, Task, Project } from "@/lib/data";
import { Clock, ChevronDown } from "lucide-react";

interface WeeklyViewProps {
  weekDates: string[];
  selectedProject: string;
  selectedDeveloper: string;
}

// ─── Admin read-only project cell (mirrors dev card, no editing) ──────────────
function AdminProjectCell({
  project, entries, tasks, totalHours, inProg, done
}: {
  project: Project;
  entries: WorkEntry[];
  tasks: Task[];
  totalHours: number;
  inProg: number;
  done: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-lg border-l-[3px] ${getColorLightBgClass(project.color)} ${getColorBorderClass(project.color)} overflow-hidden`}>
      <div className="flex items-center justify-between px-2 py-1.5 gap-1">
        {/* Clickable title toggle */}
        <button
          onClick={() => setOpen(o => !o)}
          className="overflow-hidden max-w-[70px] shrink-0 text-left hover:opacity-80 transition-opacity"
        >
          <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-4 ${getColorTextClass(project.color)} bg-transparent whitespace-nowrap block truncate`}>
            {project.name}
          </Badge>
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <span className={`text-[10px] font-semibold ${getColorTextClass(project.color)}`}>{totalHours}h</span>
          <button onClick={() => setOpen(o => !o)} className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      {(inProg > 0 || done > 0) && (
        <div className="flex items-center gap-1.5 px-2 pb-1">
          {inProg > 0 && <span className="text-[9px] bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 px-1 py-0.5 rounded-sm font-medium">{inProg} progreso</span>}
          {done  > 0 && <span className="text-[9px] bg-green-500/10 text-green-600 border border-green-500/20 px-1 py-0.5 rounded-sm font-medium">{done} hecha{done>1?'s':''}</span>}
        </div>
      )}
      {open && (
        <ul className="border-t border-border/60 divide-y divide-slate-400 dark:divide-slate-500">
          {entries.map(entry => {
            const task = entry.taskId ? tasks.find(t => t.id === entry.taskId) : undefined;
            const statusColor =
              task?.status === "completed" ? "text-green-700 bg-green-500/20 border-green-500/30 dark:text-green-400"
              : task?.status === "in-progress" ? "text-amber-700 bg-amber-500/20 border-amber-500/30 dark:text-amber-400"
              : "text-slate-600 bg-slate-500/10 border-slate-500/20";

            return (
              <li key={entry.id} className={`flex items-center gap-1.5 px-2 py-1.5 transition-colors ${task?.status === 'completed' ? 'bg-green-500/5' : ''}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-foreground truncate">{task?.title ?? entry.description}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Badge variant="outline" className={`text-[9px] px-1 h-3.5 border font-semibold ${statusColor}`}>
                      {task?.status === 'completed' ? 'Completado' : task?.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-medium">{entry.hours}h</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

const isFutureDate = (dateString: string) => {
  return dateString > today;
};

const isToday = (dateString: string) => {
  return dateString === today;
};

export function WeeklyView({ weekDates, selectedProject, selectedDeveloper }: WeeklyViewProps) {
  const { users, projects, workEntries, tasks } = useAuth();

  const developers = useMemo(() => {
    return users.filter((u) => u.role === "developer");
  }, [users]);

  const filteredDevelopers = useMemo(() => {
    if (selectedDeveloper === "all") return developers;
    return developers.filter((d) => d.id === selectedDeveloper);
  }, [developers, selectedDeveloper]);

  const getEntriesForDeveloperAndDate = (developerId: string, date: string) => {
    return workEntries.filter((entry) => {
      const matchesDeveloper = entry.userId === developerId;
      const matchesDate = entry.date === date;
      const matchesProject = selectedProject === "all" || entry.projectId === selectedProject;
      return matchesDeveloper && matchesDate && matchesProject;
    });
  };

  const getProjectById = (projectId: string) => {
    return projects.find((p) => p.id === projectId);
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

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1000px]">
        {/* Header con días de la semana */}
        <div className="grid grid-cols-6 gap-3 mb-4">
          <div className="p-3">
            <span className="text-sm font-medium text-muted-foreground">Desarrollador</span>
          </div>
          {weekDates.map((date, index) => (
            <div 
              key={date} 
              className={`p-3 text-center ${isToday(date) ? "bg-primary/10 rounded-lg" : ""} ${isFutureDate(date) ? "opacity-40" : ""}`}
            >
              <p className="text-sm font-medium text-muted-foreground">{dayNames[index]}</p>
              <p className={`text-2xl font-bold ${isToday(date) ? "text-primary" : "text-foreground"}`}>{formatDate(date)}</p>
              <p className="text-xs text-muted-foreground uppercase">{formatMonth(date)}</p>
              {isToday(date) && <span className="text-xs text-primary font-medium">Hoy</span>}
              {isFutureDate(date) && <span className="text-xs text-muted-foreground">Futuro</span>}
            </div>
          ))}
        </div>

        {/* Filas de desarrolladores */}
        <div className="space-y-3">
          {filteredDevelopers.map((developer) => (
            <Card key={developer.id} className="border-border/50 overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-6 gap-px bg-border/30">
                  {/* Info del desarrollador */}
                  <div className="bg-card p-4 flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                        {developer.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{developer.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{developer.email}</p>
                    </div>
                  </div>

                  {weekDates.map((date) => {
                    const entries = getEntriesForDeveloperAndDate(developer.id, date);
                    const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
                    const isFuture = isFutureDate(date);
                    const isTodayDate = isToday(date);

                    // Group by project
                    const projectGroups = entries.reduce<Record<string, typeof entries>>((acc, e) => {
                      (acc[e.projectId] = acc[e.projectId] || []).push(e);
                      return acc;
                    }, {});

                    return (
                      <div
                        key={date}
                        className={`bg-card p-2 min-h-[120px] flex flex-col gap-2 ${isFuture ? "bg-muted/30" : ""} ${isTodayDate ? "ring-2 ring-primary ring-inset" : ""}`}
                      >
                        {isFuture ? (
                          <div className="flex-1 flex items-center justify-center">
                            <span className="text-xs text-muted-foreground/50">Pendiente</span>
                          </div>
                        ) : Object.keys(projectGroups).length > 0 ? (
                          <>
                            <div className="flex-1 space-y-1.5">
                              {Object.entries(projectGroups).map(([projectId, projEntries]) => {
                                const project = getProjectById(projectId);
                                if (!project) return null;

                                const phours = projEntries.reduce((s, e) => s + e.hours, 0);
                                const projTasks = projEntries.map(e =>
                                  e.taskId ? tasks.find(t => t.id === e.taskId) : undefined
                                );
                                const inProg = projTasks.filter(t => t?.status === 'in-progress').length;
                                const done   = projTasks.filter(t => t?.status === 'completed').length;

                                return (
                                  <AdminProjectCell
                                    key={projectId}
                                    project={project}
                                    entries={projEntries}
                                    tasks={tasks}
                                    totalHours={phours}
                                    inProg={inProg}
                                    done={done}
                                  />
                                );
                              })}
                            </div>
                            <div className="flex items-center justify-end gap-1 pt-1 border-t border-border/30">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground">{totalHours}h</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex-1 flex items-center justify-center">
                            <span className="text-xs text-muted-foreground/50">Sin registros</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDevelopers.length === 0 && (
          <Card className="border-border/50">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No hay desarrolladores que coincidan con los filtros</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

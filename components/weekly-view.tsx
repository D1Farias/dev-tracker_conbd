"use client";

import { useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getColorLightBgClass, getColorTextClass, getColorBorderClass } from "@/lib/data";
import { Clock } from "lucide-react";

interface WeeklyViewProps {
  weekDates: string[];
  selectedProject: string;
  selectedDeveloper: string;
}

const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

const today = new Date().toISOString().split("T")[0];

const isFutureDate = (dateString: string) => {
  return dateString > today;
};

const isToday = (dateString: string) => {
  return dateString === today;
};

export function WeeklyView({ weekDates, selectedProject, selectedDeveloper }: WeeklyViewProps) {
  const { users, projects, workEntries } = useAuth();

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
    const date = new Date(dateString);
    return date.getDate();
  };

  const formatMonth = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", { month: "short" });
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
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

                  {/* Celdas de cada día */}
                  {weekDates.map((date) => {
                    const entries = getEntriesForDeveloperAndDate(developer.id, date);
                    const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
                    const isFuture = isFutureDate(date);
                    const isTodayDate = isToday(date);

                    return (
                      <div
                        key={date}
                        className={`bg-card p-3 min-h-[120px] flex flex-col ${isFuture ? "bg-muted/30" : ""} ${isTodayDate ? "ring-2 ring-primary ring-inset" : ""}`}
                      >
                        {isFuture ? (
                          <div className="flex-1 flex items-center justify-center">
                            <span className="text-xs text-muted-foreground/50">Pendiente</span>
                          </div>
                        ) : entries.length > 0 ? (
                          <>
                            <div className="flex-1 space-y-2">
                              {entries.map((entry) => {
                                const project = getProjectById(entry.projectId);
                                if (!project) return null;

                                return (
                                  <div
                                    key={entry.id}
                                    className={`p-2 rounded-lg border-l-3 ${getColorLightBgClass(project.color)} ${getColorBorderClass(project.color)}`}
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
                                    <p className="text-xs text-foreground/80 line-clamp-2">
                                      {entry.description}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-border/50">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground">
                                {totalHours}h total
                              </span>
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

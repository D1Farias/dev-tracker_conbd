"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface FiltersProps {
  weekDates: string[];
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  selectedProject: string;
  onProjectChange: (value: string) => void;
  selectedDeveloper: string;
  onDeveloperChange: (value: string) => void;
}

export function Filters({
  weekDates,
  onPrevWeek,
  onNextWeek,
  onToday,
  selectedProject,
  onProjectChange,
  selectedDeveloper,
  onDeveloperChange,
}: FiltersProps) {
  const { users, projects } = useAuth();

  const developers = users.filter((u) => u.role === "developer");

  const formatWeekRange = () => {
    if (weekDates.length < 5) return "";
    const start = new Date(weekDates[0]);
    const end = new Date(weekDates[4]);
    const startStr = start.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    const endStr = end.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
    return `${startStr} - ${endStr}`;
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Navegación de semana */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPrevWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onToday} className="gap-2">
          <Calendar className="h-4 w-4" />
          Hoy
        </Button>
        <span className="text-sm font-medium text-foreground ml-2">
          {formatWeekRange()}
        </span>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Select value={selectedProject} onValueChange={onProjectChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Todos los proyectos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los proyectos</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  {project.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedDeveloper} onValueChange={onDeveloperChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Todos los desarrolladores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los desarrolladores</SelectItem>
            {developers.map((dev) => (
              <SelectItem key={dev.id} value={dev.id}>
                {dev.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

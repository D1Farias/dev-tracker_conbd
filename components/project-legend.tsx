"use client";

import { useAuth } from "@/lib/auth-context";
import { getColorBgClass } from "@/lib/data";

export function ProjectLegend() {
  const { projects } = useAuth();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <span className="text-sm text-muted-foreground">Proyectos:</span>
      {projects.map((project) => (
        <div key={project.id} className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getColorBgClass(project.color)}`} />
          <span className="text-sm text-foreground">{project.name}</span>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useAuth } from "@/lib/auth-context";
import { getColorBgClass } from "@/lib/data";

interface ProjectLegendProps {
  onProjectClick?: (projectId: string) => void;
}

export function ProjectLegend({ onProjectClick }: ProjectLegendProps) {
  const { projects } = useAuth();

  return (
    <div className="flex flex-wrap items-center gap-4 py-1">
      <span className="text-sm text-muted-foreground flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" /> Proyectos:
      </span>
      {projects.map((project) => {
        const Content = (
          <>
            <div className={`w-3 h-3 rounded-full ${getColorBgClass(project.color)} shadow-sm group-hover:scale-110 transition-transform`} />
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              {project.name}
            </span>
          </>
        );

        if (onProjectClick) {
          return (
            <button
              key={project.id}
              onClick={() => onProjectClick(project.id)}
              className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted/60 transition-all group border border-transparent hover:border-border/50"
              title="Click para ver detalles del proyecto"
            >
              {Content}
            </button>
          );
        }

        return (
          <div key={project.id} className="flex items-center gap-2 px-1">
            {Content}
          </div>
        );
      })}
    </div>
  );
}

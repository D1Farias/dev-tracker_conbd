"use client";

import { useAuth } from "@/lib/auth-context";
import { getColorBgClass } from "@/lib/data";
import { FolderKanban, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProjectPreviewDialogProps {
  projectId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewMode: "admin" | "developer";
}

export function ProjectPreviewDialog({
  projectId,
  open,
  onOpenChange,
  viewMode,
}: ProjectPreviewDialogProps) {
  const { user: currentUser, users, projects, tasks } = useAuth();

  const project = projects.find((p) => p.id === projectId);
  if (!project) return null;

  const projectTasks = tasks.filter((t) => t.projectId === project.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-hidden flex flex-col p-0 border-border/50">
        <DialogHeader className="p-6 pb-4 border-b border-border/40 bg-muted/5">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${getColorBgClass(project.color)} shadow-sm`} />
            <DialogTitle className="text-xl font-bold tracking-tight">{project.name}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Project Description */}
          <section className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <FolderKanban className="h-3.5 w-3.5" /> Descripción del Proyecto
            </h3>
            <p className="text-sm leading-relaxed text-foreground/80 bg-muted/30 p-4 rounded-xl border border-border/20">
              {project.description || "Sin descripción disponible para este proyecto."}
            </p>
          </section>

          {/* Tasks List */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" /> Tareas del Proyecto ({projectTasks.length})
              </h3>
            </div>

            <div className="space-y-3">
              {projectTasks.length === 0 ? (
                <div className="text-center py-8 bg-muted/10 border border-dashed rounded-xl border-border/50">
                  <p className="text-sm text-muted-foreground italic">No hay tareas registradas para este proyecto.</p>
                </div>
              ) : (
                projectTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl border border-border/40 bg-card hover:bg-muted/10 transition-colors space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{task.title}</h4>
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1.5 h-4 border uppercase font-bold
                          ${
                            task.status === "completed"
                              ? "text-green-600 bg-green-500/10 border-green-500/30"
                              : task.status === "in-progress"
                              ? "text-amber-600 bg-amber-500/10 border-amber-500/30"
                              : "text-slate-600 bg-slate-500/10 border-slate-500/20"
                          }`}
                      >
                        {task.status === "completed"
                          ? "Completado"
                          : task.status === "in-progress"
                          ? "En Progreso"
                          : "Pendiente"}
                        {(() => {
                          if (task.status === "pending" || !task.assignedTo) return null;
                          const assignedUser = users.find(u => u.id === task.assignedTo);
                          if (!assignedUser) return null;

                          // Admin sees everyone.
                          // Dev only sees themselves ("el mismo desarrollador").
                          if (viewMode === "admin" || (viewMode === "developer" && task.assignedTo === currentUser?.id)) {
                            return ` - ${assignedUser.name}`;
                          }
                          return null;
                        })()}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {task.description}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-border/40 bg-muted/20 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

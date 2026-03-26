"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, X, Check, ClipboardList, FolderDot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getColorTextClass, getColorBorderClass, getColorBgClass } from "@/lib/data";

interface ManageTasksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageTasksDialog({ open, onOpenChange }: ManageTasksDialogProps) {
  const { tasks, projects, users, addTask, updateTask, deleteTask } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const initialFormState = { title: "", description: "", status: "pending", assignedTo: "" };
  const [formData, setFormData] = useState(initialFormState);

  const developers = users.filter((u) => u.role === "developer");

  const projectTasks = tasks.filter(t => t.projectId === selectedProjectId);
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleAdd = () => {
    if (formData.title.trim() && selectedProjectId) {
      addTask({
        title: formData.title,
        description: formData.description,
        projectId: selectedProjectId,
        status: formData.status,
        assignedTo: formData.assignedTo || undefined
      });
      setFormData(initialFormState);
      setIsAdding(false);
    }
  };

  const handleEdit = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      setFormData({ 
        title: task.title, 
        description: task.description, 
        status: task.status || "pending",
        assignedTo: task.assignedTo || ""
      });
      setEditingId(id);
      setIsAdding(false);
    }
  };

  const handleUpdate = () => {
    if (editingId && formData.title.trim() && selectedProjectId) {
      updateTask(editingId, {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        assignedTo: formData.assignedTo || undefined
      });
      setEditingId(null);
      setFormData(initialFormState);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData(initialFormState);
  };

  const getUser = (id: string) => users.find((u) => u.id === id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] h-[80vh] flex flex-col overflow-hidden p-0 gap-0">
        <div className="p-6 pb-4 border-b border-border/50 shrink-0">
          <DialogHeader>
            <DialogTitle>Gestionar Backlog de Tareas</DialogTitle>
            <DialogDescription>
              Selecciona un proyecto para ver, añadir o editar sus tareas asignadas.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Panel Izquierdo: Lista de Proyectos */}
          <div className="w-1/3 border-r border-border/50 bg-muted/10 overflow-y-auto p-4 space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <FolderDot className="h-4 w-4" /> Proyectos
            </h3>
            {projects.map(project => {
              const taskCount = tasks.filter(t => t.projectId === project.id).length;
              return (
                <button
                  key={project.id}
                  onClick={() => { setSelectedProjectId(project.id); handleCancel(); }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors flex items-center justify-between ${
                    selectedProjectId === project.id 
                      ? "bg-card border-primary ring-1 ring-primary shadow-sm" 
                      : "bg-transparent border-transparent hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${getColorBgClass(project.color)}`} />
                    <span className={`font-medium text-sm truncate ${selectedProjectId === project.id ? "text-foreground" : "text-muted-foreground"}`}>
                      {project.name}
                    </span>
                  </div>
                  {taskCount > 0 && (
                    <Badge variant="secondary" className="scale-75 origin-right">{taskCount}</Badge>
                  )}
                </button>
              );
            })}
          </div>

          {/* Panel Derecho: Lista de Tareas del Proyecto Seleccionado */}
          <div className="w-2/3 flex flex-col overflow-hidden bg-background">
            {!selectedProjectId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-muted/5">
                <FolderDot className="h-12 w-12 opacity-20 mb-4" />
                <p>Selecciona un proyecto en la lista de la izquierda para ver su backlog.</p>
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-border/50 shrink-0 flex items-center justify-between bg-card/50">
                  <div>
                    <h3 className={`font-bold text-lg ${getColorTextClass(selectedProject?.color || "")}`}>
                      {selectedProject?.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">Tareas del backlog</p>
                  </div>
                  {!isAdding && !editingId && (
                    <Button size="sm" onClick={() => setIsAdding(true)}>
                      <Plus className="h-4 w-4 mr-2" /> Nueva Tarea
                    </Button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Formulario Añadir/Editar Tarea */}
                  {(isAdding || editingId) && (
                    <Card className="border-primary/50 ring-1 ring-primary/20 shadow-sm">
                      <CardContent className="p-4 space-y-3">
                        <FieldGroup>
                          <Field>
                            <FieldLabel>Título de la Tarea</FieldLabel>
                            <Input
                              placeholder="Ej. Crear vista de perfil"
                              value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              autoFocus
                            />
                          </Field>

                          <Field className="col-span-full">
                            <FieldLabel>Descripción</FieldLabel>
                            <Textarea
                              placeholder="Detalles sobre lo que hay que hacer..."
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              rows={3}
                            />
                          </Field>
                        </FieldGroup>
                        <div className="flex justify-end gap-2 pt-2">
                          <Button variant="ghost" size="sm" onClick={handleCancel}>
                            Cancelar
                          </Button>
                          <Button size="sm" onClick={editingId ? handleUpdate : handleAdd} disabled={!formData.title.trim()}>
                            {editingId ? "Guardar Cambios" : "Añadir Tarea"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Lista de Tareas Existentes */}
                  {!isAdding && projectTasks.map((task) => {
                    if (editingId === task.id) return null; // Ocultar tarjeta original si se está editando
                    const assignee = task.assignedTo ? getUser(task.assignedTo) : null;
                    
                    return (
                      <Card key={task.id} className={`border-l-4 ${selectedProject ? getColorBorderClass(selectedProject.color) : ''}`}>
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h4 className="font-semibold text-foreground truncate">{task.title}</h4>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                                  {task.status === 'completed' ? 'Completado' : task.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
                              {assignee && (
                                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                  <span className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-[8px] text-primary shrink-0">{assignee.avatar}</span>
                                  <span className="truncate">{assignee.name}</span>
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col gap-1 shrink-0">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(task.id)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => deleteTask(task.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                  {projectTasks.length === 0 && !isAdding && (
                    <div className="text-center py-12 text-muted-foreground">
                      <ClipboardList className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      <p>Este proyecto aún no tiene tareas en el backlog.</p>
                      <Button variant="link" onClick={() => setIsAdding(true)}>Crea la primera tarea</Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

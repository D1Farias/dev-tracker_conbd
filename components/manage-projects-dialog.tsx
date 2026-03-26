"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { PROJECT_COLORS, getColorBgClass } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, X, Check, Eye } from "lucide-react";

interface ManageProjectsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageProjectsDialog({ open, onOpenChange }: ManageProjectsDialogProps) {
  const { projects, addProject, updateProject, deleteProject } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", color: PROJECT_COLORS[0].value });
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const handleAdd = () => {
    if (formData.name.trim()) {
      addProject(formData);
      setFormData({ name: "", description: "", color: PROJECT_COLORS[0].value });
      setIsAdding(false);
    }
  };

  const handleEdit = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (project) {
      setFormData({ name: project.name, description: project.description, color: project.color });
      setEditingId(id);
    }
  };

  const handleUpdate = () => {
    if (editingId && formData.name.trim()) {
      updateProject(editingId, formData);
      setEditingId(null);
      setFormData({ name: "", description: "", color: PROJECT_COLORS[0].value });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ name: "", description: "", color: PROJECT_COLORS[0].value });
  };
  // Mostrar datos en el boton detalles
  const handleShowDetails = (id: string) => {
    setShowDetails(id);
  };

  const projectDetails = projects.find(p => p.id === showDetails);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestionar Proyectos</DialogTitle>
          <DialogDescription>
            Añade, edita o elimina proyectos del sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Lista de proyectos */}
          <div className="space-y-2">
            {projects.map((project) => (
              <Card key={project.id} className="border-border/50">
                <CardContent className="p-3">
                  {editingId === project.id ? (
                    <div className="space-y-3">
                      <FieldGroup>
                        <Field>
                          <FieldLabel>Nombre</FieldLabel>
                          <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Descripción</FieldLabel>
                          <Input
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Color</FieldLabel>
                          <div className="flex flex-wrap gap-2">
                            {PROJECT_COLORS.map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, color: color.value })}
                                className={`w-8 h-8 rounded-full ${color.bg} ${formData.color === color.value ? "ring-2 ring-offset-2 ring-primary" : ""
                                  }`}
                              />
                            ))}
                          </div>
                        </Field>
                      </FieldGroup>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={handleCancel}>
                          <X className="h-4 w-4" />
                        </Button>
                        <Button size="sm" onClick={handleUpdate}>
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${getColorBgClass(project.color)}`} />
                        <div>
                          <p className="font-medium text-foreground">{project.name}</p>
                          <p className="text-xs text-muted-foreground">{project.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(project.id)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleShowDetails(project.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteProject(project.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Añadir nuevo proyecto */}
          {isAdding ? (
            <Card className="border-dashed border-2 border-primary/50">
              <CardContent className="p-4 space-y-3">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Nombre</FieldLabel>
                    <Input
                      placeholder="Nombre del proyecto"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Descripción</FieldLabel>
                    <Input
                      placeholder="Descripción breve"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Color</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {PROJECT_COLORS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, color: color.value })}
                          className={`w-8 h-8 rounded-full ${color.bg} ${formData.color === color.value ? "ring-2 ring-offset-2 ring-primary" : ""
                            }`}
                        />
                      ))}
                    </div>
                  </Field>
                </FieldGroup>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={handleCancel}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAdd}>Añadir</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Proyecto
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>

      {/* Modal de detalles del proyecto */}
      <Dialog open={!!showDetails} onOpenChange={(open) => !open && setShowDetails(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles del Proyecto</DialogTitle>
          </DialogHeader>
          {projectDetails && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${getColorBgClass(projectDetails.color)} shadow-sm`} />
                <h3 className="text-2xl font-bold">{projectDetails.name}</h3>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Descripción</h4>
                <p className="text-foreground leading-relaxed">
                  {projectDetails.description || "Este proyecto no tiene una descripción proporcionada."}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

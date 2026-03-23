"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { WorkEntry } from "@/lib/data";
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

interface AddWorkEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  editEntry?: WorkEntry | null;
}

export function AddWorkEntryDialog({ open, onOpenChange, date, editEntry }: AddWorkEntryDialogProps) {
  const { user, projects, addWorkEntry, updateWorkEntry } = useAuth();
  const [projectId, setProjectId] = useState("");
  const [hours, setHours] = useState("1");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (editEntry) {
      setProjectId(editEntry.projectId);
      setHours(editEntry.hours.toString());
      setDescription(editEntry.description);
    } else {
      setProjectId("");
      setHours("1");
      setDescription("");
    }
  }, [editEntry, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !projectId || !description.trim()) return;

    if (editEntry) {
      updateWorkEntry(editEntry.id, {
        projectId,
        hours: parseFloat(hours),
        description: description.trim(),
      });
    } else {
      addWorkEntry({
        userId: user.id,
        projectId,
        date,
        hours: parseFloat(hours),
        description: description.trim(),
      });
    }

    onOpenChange(false);
    setProjectId("");
    setHours("1");
    setDescription("");
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editEntry ? "Editar Registro" : "Nuevo Registro de Trabajo"}</DialogTitle>
          <DialogDescription>
            {formatDate(date)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel>Proyecto</FieldLabel>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un proyecto" />
                </SelectTrigger>
                <SelectContent>
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
            </Field>

            <Field>
              <FieldLabel>Horas trabajadas</FieldLabel>
              <Input
                type="number"
                min="0.5"
                max="12"
                step="0.5"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel>Descripción del trabajo</FieldLabel>
              <Textarea
                placeholder="Describe las tareas realizadas..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </Field>
          </FieldGroup>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!projectId || !description.trim()}>
              {editEntry ? "Guardar cambios" : "Añadir registro"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

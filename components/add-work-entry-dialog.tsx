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
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";

interface AddWorkEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  editEntry?: WorkEntry | null;
  defaultProjectId?: string;
}

export function AddWorkEntryDialog({ open, onOpenChange, date, editEntry, defaultProjectId }: AddWorkEntryDialogProps) {
  const { user, projects, tasks, addWorkEntry, updateWorkEntry, updateTask } = useAuth();

  // ── EDIT mode state ──────────────────────────────────────────────────────
  const [editHours, setEditHours] = useState("1");
  const [editDescription, setEditDescription] = useState("");

  // ── ADD mode state ───────────────────────────────────────────────────────
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [newHours, setNewHours] = useState("1");

  useEffect(() => {
    if (editEntry) {
      setEditHours(editEntry.hours.toString());
      setEditDescription(editEntry.description);
    } else {
      setSelectedProjectId(defaultProjectId ?? "");
      setSelectedTaskId("");
      setNewHours("1");
    }
  }, [editEntry, open, defaultProjectId]);

  // Tasks available in the selected project (not assigned to anyone, not completed)
  const availableTasks = tasks.filter(
    t => t.projectId === selectedProjectId && !t.assignedTo && t.status !== "completed"
  );

  // ── EDIT submit ──────────────────────────────────────────────────────────
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEntry) return;
    updateWorkEntry(editEntry.id, {
      hours: parseFloat(editHours),
      description: editDescription.trim(),
    });
    onOpenChange(false);
  };

  // ── ADD submit ───────────────────────────────────────────────────────────
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedProjectId || !selectedTaskId) return;

    const chosenTask = tasks.find(t => t.id === selectedTaskId);
    if (!chosenTask) return;

    // Assign the task to this developer
    await updateTask(selectedTaskId, { assignedTo: user.id, status: "in-progress" });

    // Create one work entry for this task
    addWorkEntry({
      userId: user.id,
      projectId: selectedProjectId,
      taskId: selectedTaskId,
      date,
      hours: parseFloat(newHours),
      description: chosenTask.title,
    });

    onOpenChange(false);
    setSelectedProjectId("");
    setSelectedTaskId("");
    setNewHours("1");
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-");
    const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    return d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  };

  // ── EDIT render ──────────────────────────────────────────────────────────
  if (editEntry) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Registro</DialogTitle>
            <DialogDescription>{formatDate(date)}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Horas trabajadas</FieldLabel>
                <Input
                  type="number" min="0.5" max="12" step="0.5"
                  value={editHours}
                  onChange={e => setEditHours(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>Descripción</FieldLabel>
                <Textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  rows={3}
                />
              </Field>
            </FieldGroup>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">Guardar cambios</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // ── ADD render ───────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar trabajo</DialogTitle>
          <DialogDescription>{formatDate(date)}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAddSubmit} className="space-y-4">
          {/* Project selector */}
          <Field>
            <FieldLabel>Proyecto</FieldLabel>
            <Select value={selectedProjectId} onValueChange={v => { setSelectedProjectId(v); setSelectedTaskId(""); }}>
              <SelectTrigger><SelectValue placeholder="Selecciona un proyecto" /></SelectTrigger>
              <SelectContent>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                      {p.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Task list (shown once project is selected) */}
          {selectedProjectId && (
            <Field>
              <FieldLabel>Tarea disponible</FieldLabel>
              {availableTasks.length === 0 ? (
                <div className="flex flex-col items-center gap-2 p-4 rounded-md border border-dashed border-border/60 text-xs text-muted-foreground text-center">
                  <ClipboardList className="h-5 w-5 opacity-40" />
                  No hay tareas disponibles en este proyecto.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {availableTasks.map(task => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => setSelectedTaskId(task.id)}
                      className={`w-full text-left flex items-center gap-3 p-2.5 rounded-lg border text-xs transition-colors ${
                        selectedTaskId === task.id
                          ? "bg-primary/10 border-primary/40 text-foreground"
                          : "bg-muted/20 border-border/50 hover:bg-muted/50 text-foreground"
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full border-2 shrink-0 ${selectedTaskId === task.id ? "border-primary bg-primary" : "border-muted-foreground"}`} />
                      <span className="flex-1 font-medium truncate">{task.title}</span>
                      <Badge variant="outline" className="text-[9px] px-1 h-4">Disponible</Badge>
                    </button>
                  ))}
                </div>
              )}
            </Field>
          )}

          {/* Hours (shown once task selected) */}
          {selectedTaskId && (
            <Field>
              <FieldLabel>Horas dedicadas</FieldLabel>
              <Input
                type="number" min="0.5" max="12" step="0.5"
                value={newHours}
                onChange={e => setNewHours(e.target.value)}
              />
            </Field>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={!selectedProjectId || !selectedTaskId}>
              Registrar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

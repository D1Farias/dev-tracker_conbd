"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

interface ManageUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export function ManageUsersDialog({ open, onOpenChange }: ManageUsersDialogProps) {
  const { users, user: currentUser, addUser, updateUser, deleteUser } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "developer" as "admin" | "developer",
    avatar: "",
  });

  const handleAdd = () => {
    if (formData.name.trim() && formData.email.trim() && formData.password.trim()) {
      const avatar = getInitials(formData.name);
      addUser({ ...formData, avatar });
      setFormData({ name: "", email: "", password: "", role: "developer", avatar: "" });
      setIsAdding(false);
    }
  };

  const handleEdit = (id: string) => {
    const usr = users.find((u) => u.id === id);
    if (usr) {
      setFormData({
        name: usr.name,
        email: usr.email,
        password: usr.password,
        role: usr.role,
        avatar: usr.avatar,
      });
      setEditingId(id);
    }
  };

  const handleUpdate = () => {
    if (editingId && formData.name.trim() && formData.email.trim()) {
      const avatar = getInitials(formData.name);
      updateUser(editingId, { ...formData, avatar });
      setEditingId(null);
      setFormData({ name: "", email: "", password: "", role: "developer", avatar: "" });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ name: "", email: "", password: "", role: "developer", avatar: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestionar Usuarios</DialogTitle>
          <DialogDescription>
            Añade, edita o elimina usuarios del sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Lista de usuarios */}
          <div className="space-y-2">
            {users.map((usr) => (
              <Card key={usr.id} className="border-border/50">
                <CardContent className="p-3">
                  {editingId === usr.id ? (
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
                          <FieldLabel>Email</FieldLabel>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Contraseña</FieldLabel>
                          <Input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Rol</FieldLabel>
                          <Select
                            value={formData.role}
                            onValueChange={(v) => setFormData({ ...formData, role: v as "admin" | "developer" })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="developer">Desarrollador</SelectItem>
                              <SelectItem value="admin">Administrador</SelectItem>
                            </SelectContent>
                          </Select>
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
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {usr.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{usr.name}</p>
                            <Badge variant={usr.role === "admin" ? "default" : "secondary"}>
                              {usr.role === "admin" ? "Admin" : "Dev"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{usr.email}</p>
                        </div>
                      </div>
                      {usr.id !== currentUser?.id && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(usr.id)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteUser(usr.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Añadir nuevo usuario */}
          {isAdding ? (
            <Card className="border-dashed border-2 border-primary/50">
              <CardContent className="p-4 space-y-3">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Nombre</FieldLabel>
                    <Input
                      placeholder="Nombre completo"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Email</FieldLabel>
                    <Input
                      type="email"
                      placeholder="email@empresa.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Contraseña</FieldLabel>
                    <Input
                      type="password"
                      placeholder="********"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Rol</FieldLabel>
                    <Select
                      value={formData.role}
                      onValueChange={(v) => setFormData({ ...formData, role: v as "admin" | "developer" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="developer">Desarrollador</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
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
              Añadir Usuario
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

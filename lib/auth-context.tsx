"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import {
  User, Project, WorkEntry, Task
} from './data';

interface AuthContextType {
  user: User | null;
  users: User[];
  projects: Project[];
  workEntries: WorkEntry[];
  tasks: Task[];
  error: string | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addWorkEntry: (entry: Omit<WorkEntry, 'id'>) => void;
  updateWorkEntry: (id: string, entry: Partial<WorkEntry>) => void;
  deleteWorkEntry: (id: string) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar datos desde la base de datos MySQL (vía API Routes) y sesión local
  useEffect(() => {
    async function loadData() {
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('devtracker_user');
        if (savedUser) setUser(JSON.parse(savedUser));

        try {
          const [usersRes, projectsRes, entriesRes, tasksRes] = await Promise.all([
            fetch('/api/users'),
            fetch('/api/projects'),
            fetch('/api/work-entries'),
            fetch('/api/tasks')
          ]);

          if (!usersRes.ok || !projectsRes.ok || !entriesRes.ok || !tasksRes.ok) {
            throw new Error("No se pudo obtener información de la base de datos.");
          }

          const usersData = await usersRes.json();
          if (Array.isArray(usersData)) {
            setUsers(usersData.map((u: any) => ({ ...u, id: String(u.id) })));
          }

          const projectsData = await projectsRes.json();
          if (Array.isArray(projectsData)) {
            setProjects(projectsData.map((p: any) => ({ ...p, id: String(p.id) })));
          }

          const entriesData = await entriesRes.json();
          if (Array.isArray(entriesData)) {
            const formattedEntries = entriesData.map((e: any) => ({
              ...e,
              id: String(e.id),
              userId: String(e.userId),
              projectId: String(e.projectId),
              date: e.date && typeof e.date === 'string' && e.date.includes('T') ? e.date.split('T')[0] : e.date
            }));
            setWorkEntries(formattedEntries);
          }

          const tasksData = await tasksRes.json();
          if (Array.isArray(tasksData)) {
            setTasks(tasksData.map((t: any) => ({ ...t, id: String(t.id), projectId: String(t.projectId) })));
          }

          setError(null);
        } catch (err: any) {
          console.error("Error al obtener datos de MySQL:", err);
          setError(err.message || "Error al conectar con la base de datos MySQL.");
        } finally {
          setIsLoaded(true);
        }
      }
    }
    loadData();
  }, []);

  // Las funciones de actualizar, borrar e insertar de momento solo modifican el estado local
  // sin guardar a localStorage, para que funcione de "solo GET" respecto a la carga de datos.


  const login = (email: string, password: string): boolean => {
    const foundUser = users.find(u => u.email === email && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('devtracker_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('devtracker_user');
  };

  const addWorkEntry = async (entry: Omit<WorkEntry, 'id'>) => {
    try {
      const res = await fetch('/api/work-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (res.ok) {
        const data = await res.json();
        setWorkEntries(prev => [...prev, data.workEntry]);
        toast.success('Registro añadido correctamente');
      } else {
        toast.error('Error al añadir el registro');
      }
    } catch (e) {
      toast.error('Error de conexión al guardar el registro');
    }
  };

  const updateWorkEntry = async (id: string, entry: Partial<WorkEntry>) => {
    try {
      const res = await fetch(`/api/work-entries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (res.ok) {
        setWorkEntries(prev => prev.map(e => e.id === id ? { ...e, ...entry } : e));
        toast.success('Registro actualizado');
      } else {
        toast.error('Error al actualizar el registro');
      }
    } catch (e) {
      toast.error('Error de conexión al actualizar el registro');
    }
  };

  const deleteWorkEntry = async (id: string) => {
    try {
      const res = await fetch(`/api/work-entries/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setWorkEntries(prev => prev.filter(e => e.id !== id));
        toast.success('Registro eliminado');
      } else {
        toast.error('Error al eliminar el registro');
      }
    } catch (e) {
      toast.error('Error de conexión al eliminar el registro');
    }
  };

  const addProject = async (project: Omit<Project, 'id'>) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(prev => [...prev, data.project]);
        toast.success(`Proyecto "${project.name}" creado`);
      } else {
        toast.error('Error al crear el proyecto');
      }
    } catch (e) {
      toast.error('Error de conexión al crear el proyecto');
    }
  };

  const updateProject = async (id: string, project: Partial<Project>) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });
      if (res.ok) {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...project } : p));
        toast.success('Proyecto actualizado');
      } else {
        toast.error('Error al actualizar el proyecto');
      }
    } catch (e) {
      toast.error('Error de conexión al actualizar el proyecto');
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
        setWorkEntries(prev => prev.filter(e => e.projectId !== id));
        setTasks(prev => prev.filter(t => t.projectId !== id));
        toast.success('Proyecto eliminado');
      } else {
        toast.error('Error al eliminar el proyecto');
      }
    } catch (e) {
      toast.error('Error de conexión al eliminar el proyecto');
    }
  };

  const addUser = async (newUser: Omit<User, 'id'>) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(prev => [...prev, data.user]);
        toast.success(`Usuario "${newUser.name}" creado`);
      } else {
        toast.error('Error al crear el usuario');
      }
    } catch (e) {
      toast.error('Error de conexión al crear el usuario');
    }
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, ...userData } : u));
        toast.success('Usuario actualizado');
      } else {
        toast.error('Error al actualizar el usuario');
      }
    } catch (e) {
      toast.error('Error de conexión al actualizar el usuario');
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
        setWorkEntries(prev => prev.filter(e => e.userId !== id));
        toast.success('Usuario eliminado');
      } else {
        toast.error('Error al eliminar el usuario');
      }
    } catch (e) {
      toast.error('Error de conexión al eliminar el usuario');
    }
  };

  const addTask = async (task: Omit<Task, 'id'>) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(prev => [...prev, data.task]);
        toast.success(`Tarea "${task.title}" creada`);
      } else {
        toast.error('Error al crear la tarea');
      }
    } catch (e) {
      toast.error('Error de conexión al crear la tarea');
    }
  };

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (res.ok) {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...taskData } : t));
        if (taskData.assignedTo) {
          toast.success('¡Tarea asignada! Está en progreso.');
        } else if (taskData.status === 'completed') {
          toast.success('¡Tarea completada! 🎉');
        } else if (taskData.status) {
          toast.success('Estado de tarea actualizado');
        } else {
          toast.success('Tarea actualizada');
        }
      } else {
        toast.error('Error al actualizar la tarea');
      }
    } catch (e) {
      toast.error('Error de conexión al actualizar la tarea');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== id));
        toast.success('Tarea eliminada');
      } else {
        toast.error('Error al eliminar la tarea');
      }
    } catch (e) {
      toast.error('Error de conexión al eliminar la tarea');
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      users,
      projects,
      workEntries,
      error,
      login,
      logout,
      addWorkEntry,
      updateWorkEntry,
      deleteWorkEntry,
      addProject,
      updateProject,
      deleteProject,
      addUser,
      updateUser,
      deleteUser,
      tasks,
      addTask,
      updateTask,
      deleteTask,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

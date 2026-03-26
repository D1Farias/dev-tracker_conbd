"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
      } else {
        console.error("Failed to add work entry");
      }
    } catch (e) {
      console.error(e);
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
      } else {
        console.error("Failed to update work entry");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteWorkEntry = async (id: string) => {
    try {
      const res = await fetch(`/api/work-entries/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setWorkEntries(prev => prev.filter(e => e.id !== id));
      } else {
        console.error("Failed to delete work entry");
      }
    } catch (e) {
      console.error(e);
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
      } else {
        console.error("Failed to add project");
      }
    } catch (e) {
      console.error(e);
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
      } else {
        console.error("Failed to update project");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
        setWorkEntries(prev => prev.filter(e => e.projectId !== id));
      } else {
        console.error("Failed to delete project");
      }
    } catch (e) {
      console.error(e);
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
      } else {
        console.error("Failed to add user");
      }
    } catch (e) {
      console.error(e);
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
      } else {
        console.error("Failed to update user");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
        setWorkEntries(prev => prev.filter(e => e.userId !== id));
      } else {
        console.error("Failed to delete user");
      }
    } catch (e) {
      console.error(e);
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
      } else {
        console.error("Failed to add task");
      }
    } catch (e) {
      console.error(e);
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
      } else {
        console.error("Failed to update task");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== id));
      } else {
        console.error("Failed to delete task");
      }
    } catch (e) {
      console.error(e);
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

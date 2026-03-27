// Tipos de datos
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'developer';
  avatar: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  description: string;
}

export interface WorkEntry {
  id: string;
  userId: string;
  projectId: string;
  taskId?: string;
  date: string;
  hours: number;
  description: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  status: string;
  assignedTo?: string;
}

// Colores para proyectos
export const PROJECT_COLORS = [
  { name: 'Azul', value: '#3b82f6', bg: 'bg-blue-500', text: 'text-blue-500' },
  { name: 'Verde', value: '#22c55e', bg: 'bg-green-500', text: 'text-green-500' },
  { name: 'Naranja', value: '#f97316', bg: 'bg-orange-500', text: 'text-orange-500' },
  { name: 'Morado', value: '#a855f7', bg: 'bg-purple-500', text: 'text-purple-500' },
  { name: 'Rosa', value: '#ec4899', bg: 'bg-pink-500', text: 'text-pink-500' },
  { name: 'Cyan', value: '#06b6d4', bg: 'bg-cyan-500', text: 'text-cyan-500' },
  { name: 'Amarillo', value: '#eab308', bg: 'bg-yellow-500', text: 'text-yellow-500' },
  { name: 'Rojo', value: '#ef4444', bg: 'bg-red-500', text: 'text-red-500' },
  { name: 'Indigo', value: '#6366f1', bg: 'bg-indigo-500', text: 'text-indigo-500' },
  { name: 'Teal', value: '#14b8a6', bg: 'bg-teal-500', text: 'text-teal-500' },
];

// Datos iniciales
export const initialUsers: User[] = [
  {
    id: '1',
    name: 'Admin Principal',
    email: 'admin@empresa.com',
    password: 'admin123',
    role: 'admin',
    avatar: 'AP',
  },
  {
    id: '2',
    name: 'María García',
    email: 'maria@empresa.com',
    password: 'maria123',
    role: 'developer',
    avatar: 'MG',
  },
  {
    id: '3',
    name: 'Carlos López',
    email: 'carlos@empresa.com',
    password: 'carlos123',
    role: 'developer',
    avatar: 'CL',
  },
  {
    id: '4',
    name: 'Ana Martínez',
    email: 'ana@empresa.com',
    password: 'ana123',
    role: 'developer',
    avatar: 'AM',
  },
  {
    id: '5',
    name: 'Pedro Sánchez',
    email: 'pedro@empresa.com',
    password: 'pedro123',
    role: 'developer',
    avatar: 'PS',
  },
];

export const initialProjects: Project[] = [
  {
    id: '1',
    name: 'E-Commerce App',
    color: '#3b82f6',
    description: 'Plataforma de comercio electrónico',
  },
  {
    id: '2',
    name: 'CRM Sistema',
    color: '#22c55e',
    description: 'Sistema de gestión de clientes',
  },
  {
    id: '3',
    name: 'App Móvil',
    color: '#f97316',
    description: 'Aplicación móvil multiplataforma',
  },
  {
    id: '4',
    name: 'Dashboard Analytics',
    color: '#a855f7',
    description: 'Panel de análisis de datos',
  },
  {
    id: '5',
    name: 'API Backend',
    color: '#ec4899',
    description: 'Servicios backend y API REST',
  },
];

// Generar fechas pasadas (últimas 2 semanas hasta hoy)
function getPastDates(): string[] {
  const today = new Date();
  const dates: string[] = [];
  
  // Generar fechas de los últimos 14 días (solo días de semana)
  for (let i = 14; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dayOfWeek = date.getDay();
    // Solo días de lunes (1) a viernes (5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      dates.push(date.toISOString().split('T')[0]);
    }
  }
  return dates;
}

const pastDates = getPastDates();

// Usar las últimas fechas disponibles para los datos de ejemplo
export const initialWorkEntries: WorkEntry[] = [
  // María - Semana pasada
  { id: '1', userId: '2', projectId: '1', date: pastDates[0] || '2024-01-08', hours: 4, description: 'Desarrollo de carrito de compras' },
  { id: '2', userId: '2', projectId: '2', date: pastDates[0] || '2024-01-08', hours: 4, description: 'Revisión de módulo de contactos' },
  { id: '3', userId: '2', projectId: '1', date: pastDates[1] || '2024-01-09', hours: 6, description: 'Integración de pasarela de pago' },
  { id: '4', userId: '2', projectId: '3', date: pastDates[1] || '2024-01-09', hours: 2, description: 'Soporte en app móvil' },
  { id: '5', userId: '2', projectId: '1', date: pastDates[2] || '2024-01-10', hours: 8, description: 'Testing de checkout' },
  { id: '6', userId: '2', projectId: '2', date: pastDates[3] || '2024-01-11', hours: 5, description: 'Desarrollo de reportes CRM' },
  { id: '7', userId: '2', projectId: '4', date: pastDates[3] || '2024-01-11', hours: 3, description: 'Configuración de gráficos' },
  { id: '8', userId: '2', projectId: '1', date: pastDates[4] || '2024-01-12', hours: 4, description: 'Bug fixes en E-Commerce' },
  { id: '9', userId: '2', projectId: '5', date: pastDates[4] || '2024-01-12', hours: 4, description: 'Documentación de API' },
  // María - Esta semana (hasta hoy)
  { id: '35', userId: '2', projectId: '3', date: pastDates[5] || '2024-01-15', hours: 6, description: 'Desarrollo de nuevas funcionalidades móviles' },
  { id: '36', userId: '2', projectId: '1', date: pastDates[6] || '2024-01-16', hours: 8, description: 'Optimización de rendimiento E-Commerce' },
  
  // Carlos - Semana pasada
  { id: '10', userId: '3', projectId: '3', date: pastDates[0] || '2024-01-08', hours: 8, description: 'Desarrollo de pantalla principal' },
  { id: '11', userId: '3', projectId: '3', date: pastDates[1] || '2024-01-09', hours: 6, description: 'Implementación de notificaciones' },
  { id: '12', userId: '3', projectId: '5', date: pastDates[1] || '2024-01-09', hours: 2, description: 'Revisión de endpoints' },
  { id: '13', userId: '3', projectId: '3', date: pastDates[2] || '2024-01-10', hours: 4, description: 'UI de configuración' },
  { id: '14', userId: '3', projectId: '4', date: pastDates[2] || '2024-01-10', hours: 4, description: 'Integración de charts' },
  { id: '15', userId: '3', projectId: '5', date: pastDates[3] || '2024-01-11', hours: 8, description: 'Desarrollo de nuevos endpoints' },
  { id: '16', userId: '3', projectId: '3', date: pastDates[4] || '2024-01-12', hours: 6, description: 'Testing de app móvil' },
  { id: '17', userId: '3', projectId: '2', date: pastDates[4] || '2024-01-12', hours: 2, description: 'Soporte en CRM' },
  // Carlos - Esta semana
  { id: '37', userId: '3', projectId: '5', date: pastDates[5] || '2024-01-15', hours: 7, description: 'Refactoring de API REST' },
  { id: '38', userId: '3', projectId: '4', date: pastDates[6] || '2024-01-16', hours: 5, description: 'Nuevos widgets dashboard' },
  
  // Ana - Semana pasada
  { id: '18', userId: '4', projectId: '4', date: pastDates[0] || '2024-01-08', hours: 6, description: 'Diseño de dashboard principal' },
  { id: '19', userId: '4', projectId: '1', date: pastDates[0] || '2024-01-08', hours: 2, description: 'Revisión de UI E-Commerce' },
  { id: '20', userId: '4', projectId: '4', date: pastDates[1] || '2024-01-09', hours: 8, description: 'Implementación de widgets' },
  { id: '21', userId: '4', projectId: '2', date: pastDates[2] || '2024-01-10', hours: 5, description: 'Módulo de pipeline CRM' },
  { id: '22', userId: '4', projectId: '4', date: pastDates[2] || '2024-01-10', hours: 3, description: 'Optimización de rendimiento' },
  { id: '23', userId: '4', projectId: '1', date: pastDates[3] || '2024-01-11', hours: 4, description: 'Página de productos' },
  { id: '24', userId: '4', projectId: '3', date: pastDates[3] || '2024-01-11', hours: 4, description: 'Diseño de pantallas' },
  { id: '25', userId: '4', projectId: '4', date: pastDates[4] || '2024-01-12', hours: 8, description: 'Finalización de dashboard' },
  // Ana - Esta semana
  { id: '39', userId: '4', projectId: '2', date: pastDates[5] || '2024-01-15', hours: 6, description: 'Mejoras UX en CRM' },
  { id: '40', userId: '4', projectId: '1', date: pastDates[6] || '2024-01-16', hours: 4, description: 'Landing page E-Commerce' },
  
  // Pedro - Semana pasada
  { id: '26', userId: '5', projectId: '5', date: pastDates[0] || '2024-01-08', hours: 8, description: 'Arquitectura de microservicios' },
  { id: '27', userId: '5', projectId: '5', date: pastDates[1] || '2024-01-09', hours: 5, description: 'Implementación de autenticación' },
  { id: '28', userId: '5', projectId: '2', date: pastDates[1] || '2024-01-09', hours: 3, description: 'Backend CRM' },
  { id: '29', userId: '5', projectId: '1', date: pastDates[2] || '2024-01-10', hours: 4, description: 'APIs de E-Commerce' },
  { id: '30', userId: '5', projectId: '5', date: pastDates[2] || '2024-01-10', hours: 4, description: 'Testing de servicios' },
  { id: '31', userId: '5', projectId: '3', date: pastDates[3] || '2024-01-11', hours: 6, description: 'Backend app móvil' },
  { id: '32', userId: '5', projectId: '5', date: pastDates[3] || '2024-01-11', hours: 2, description: 'Deploy de servicios' },
  { id: '33', userId: '5', projectId: '5', date: pastDates[4] || '2024-01-12', hours: 6, description: 'Documentación técnica' },
  { id: '34', userId: '5', projectId: '1', date: pastDates[4] || '2024-01-12', hours: 2, description: 'Soporte E-Commerce' },
  // Pedro - Esta semana
  { id: '41', userId: '5', projectId: '5', date: pastDates[5] || '2024-01-15', hours: 8, description: 'Configuración CI/CD' },
  { id: '42', userId: '5', projectId: '3', date: pastDates[6] || '2024-01-16', hours: 6, description: 'APIs app móvil' },
];

// Funciones helper
export function getColorBgClass(color: string): string {
  const colorMap: Record<string, string> = {
    '#3b82f6': 'bg-blue-500',
    '#22c55e': 'bg-green-500',
    '#f97316': 'bg-orange-500',
    '#a855f7': 'bg-purple-500',
    '#ec4899': 'bg-pink-500',
    '#06b6d4': 'bg-cyan-500',
    '#eab308': 'bg-yellow-500',
    '#ef4444': 'bg-red-500',
    '#6366f1': 'bg-indigo-500',
    '#14b8a6': 'bg-teal-500',
  };
  return colorMap[color] || 'bg-gray-500';
}

export function getColorLightBgClass(color: string): string {
  const colorMap: Record<string, string> = {
    '#3b82f6': 'bg-blue-500/20',
    '#22c55e': 'bg-green-500/20',
    '#f97316': 'bg-orange-500/20',
    '#a855f7': 'bg-purple-500/20',
    '#ec4899': 'bg-pink-500/20',
    '#06b6d4': 'bg-cyan-500/20',
    '#eab308': 'bg-yellow-500/20',
    '#ef4444': 'bg-red-500/20',
    '#6366f1': 'bg-indigo-500/20',
    '#14b8a6': 'bg-teal-500/20',
  };
  return colorMap[color] || 'bg-gray-500/20';
}

export function getColorTextClass(color: string): string {
  const colorMap: Record<string, string> = {
    '#3b82f6': 'text-blue-600',
    '#22c55e': 'text-green-600',
    '#f97316': 'text-orange-600',
    '#a855f7': 'text-purple-600',
    '#ec4899': 'text-pink-600',
    '#06b6d4': 'text-cyan-600',
    '#eab308': 'text-yellow-600',
    '#ef4444': 'text-red-600',
    '#6366f1': 'text-indigo-600',
    '#14b8a6': 'text-teal-600',
  };
  return colorMap[color] || 'text-gray-600';
}

export function getColorBorderClass(color: string): string {
  const colorMap: Record<string, string> = {
    '#3b82f6': 'border-blue-500',
    '#22c55e': 'border-green-500',
    '#f97316': 'border-orange-500',
    '#a855f7': 'border-purple-500',
    '#ec4899': 'border-pink-500',
    '#06b6d4': 'border-cyan-500',
    '#eab308': 'border-yellow-500',
    '#ef4444': 'border-red-500',
    '#6366f1': 'border-indigo-500',
    '#14b8a6': 'border-teal-500',
  };
  return colorMap[color] || 'border-gray-500';
}

"use client";

import { useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, FolderKanban, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardsProps {
  weekDates: string[];
}

export function StatsCards({ weekDates }: StatsCardsProps) {
  const { users, projects, workEntries } = useAuth();

  const stats = useMemo(() => {
    const developers = users.filter((u) => u.role === "developer");
    const weekEntries = workEntries.filter((e) => weekDates.includes(e.date));
    const totalHours = weekEntries.reduce((sum, e) => sum + e.hours, 0);
    const avgHoursPerDev = developers.length > 0 ? totalHours / developers.length : 0;

    return {
      totalDevelopers: developers.length,
      totalProjects: projects.length,
      totalHours,
      avgHoursPerDev: avgHoursPerDev.toFixed(1),
    };
  }, [users, projects, workEntries, weekDates]);

  const cards = [
    {
      title: "Desarrolladores",
      value: stats.totalDevelopers,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Proyectos Activos",
      value: stats.totalProjects,
      icon: FolderKanban,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Horas Semanales",
      value: stats.totalHours,
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      title: "Promedio/Dev",
      value: `${stats.avgHoursPerDev}h`,
      icon: TrendingUp,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                  <p className="text-xs text-muted-foreground">{card.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

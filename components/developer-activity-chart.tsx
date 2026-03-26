"use client";

import { useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#3b82f6", "#ec4899",
  "#8b5cf6", "#14b8a6", "#f97316", "#06b6d4", "#84cc16"
];

interface DeveloperActivityChartProps {
  weekDates: string[];
}

export function DeveloperActivityChart({ weekDates }: DeveloperActivityChartProps) {
  const { users, workEntries } = useAuth();

  const chartData = useMemo(() => {
    const developers = users.filter(u => u.role === "developer");
    return developers
      .map(dev => {
        const hours = workEntries
          .filter(e => e.userId === dev.id && weekDates.includes(e.date))
          .reduce((sum, e) => sum + e.hours, 0);
        return { name: dev.name, hours, avatar: dev.avatar };
      })
      .filter(d => d.hours > 0)
      .sort((a, b) => b.hours - a.hours);
  }, [users, workEntries, weekDates]);

  const totalHours = chartData.reduce((sum, d) => sum + d.hours, 0);

  if (chartData.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Actividad Semanal del Equipo
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8 text-sm text-muted-foreground">
          Sin registros esta semana
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-card border border-border/50 rounded-lg p-3 shadow-lg text-sm">
          <p className="font-semibold text-foreground">{d.name}</p>
          <p className="text-muted-foreground">{d.hours}h registradas</p>
          <p className="text-primary font-medium">{((d.hours / totalHours) * 100).toFixed(0)}% del equipo</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Actividad Semanal del Equipo
        </CardTitle>
        <p className="text-xs text-muted-foreground">{totalHours}h totales registradas esta semana</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                dataKey="hours"
                paddingAngle={3}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="w-full md:w-auto flex flex-col gap-2 min-w-[160px]">
            {chartData.map((dev, index) => (
              <div key={dev.name} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-foreground truncate flex-1">{dev.name}</span>
                <span className="text-xs font-semibold text-foreground tabular-nums">{dev.hours}h</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

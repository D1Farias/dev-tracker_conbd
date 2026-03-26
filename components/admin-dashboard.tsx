"use client";

import { useState, useMemo } from "react";
import { Header } from "./header";
import { Filters } from "./filters";
import { WeeklyView } from "./weekly-view";
import { StatsCards } from "./stats-cards";
import { ProjectLegend } from "./project-legend";
import { ManageProjectsDialog } from "./manage-projects-dialog";
import { ManageUsersDialog } from "./manage-users-dialog";
import { ManageTasksDialog } from "./manage-tasks-dialog";
import { DeveloperActivityChart } from "./developer-activity-chart";
import { Button } from "@/components/ui/button";
import { Settings, Users, ClipboardList } from "lucide-react";

function getWeekDates(offset: number = 0): string[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + offset * 7);

  const dates: string[] = [];
  for (let i = 0; i < 5; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
  }
  return dates;
}

export function AdminDashboard() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedDeveloper, setSelectedDeveloper] = useState("all");
  const [showProjectsDialog, setShowProjectsDialog] = useState(false);
  const [showUsersDialog, setShowUsersDialog] = useState(false);
  const [showTasksDialog, setShowTasksDialog] = useState(false);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <StatsCards weekDates={weekDates} />

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <Filters
            weekDates={weekDates}
            onPrevWeek={() => setWeekOffset((o) => o - 1)}
            onNextWeek={() => setWeekOffset((o) => o + 1)}
            onToday={() => setWeekOffset(0)}
            selectedProject={selectedProject}
            onProjectChange={setSelectedProject}
            selectedDeveloper={selectedDeveloper}
            onDeveloperChange={setSelectedDeveloper}
          />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowTasksDialog(true)}>
              <ClipboardList className="h-4 w-4 mr-2" />
              Tareas
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowUsersDialog(true)}>
              <Users className="h-4 w-4 mr-2" />
              Usuarios
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowProjectsDialog(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Proyectos
            </Button>
          </div>
        </div>

        {/* Legend */}
        <ProjectLegend />

        {/* Weekly View */}
        <WeeklyView
          weekDates={weekDates}
          selectedProject={selectedProject}
          selectedDeveloper={selectedDeveloper}
        />

        {/* Activity Chart */}
        <DeveloperActivityChart weekDates={weekDates} />
      </main>

      <ManageProjectsDialog open={showProjectsDialog} onOpenChange={setShowProjectsDialog} />
      <ManageUsersDialog open={showUsersDialog} onOpenChange={setShowUsersDialog} />
      <ManageTasksDialog open={showTasksDialog} onOpenChange={setShowTasksDialog} />
    </div>
  );
}

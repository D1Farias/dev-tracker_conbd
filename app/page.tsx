"use client";

import { useAuth } from "@/lib/auth-context";
import { LoginForm } from "@/components/login-form";
import { AdminDashboard } from "@/components/admin-dashboard";
import { DeveloperDashboard } from "@/components/developer-dashboard";

export default function Home() {
  const { user } = useAuth();

  if (!user) {
    return <LoginForm />;
  }

  if (user.role === "admin") {
    return <AdminDashboard />;
  }

  return <DeveloperDashboard />;
}

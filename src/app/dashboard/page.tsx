"use client";

import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { UserInfo } from "@/components/dashboard/UserInfo";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { usePageLoading } from "@/hooks/usePageLoading";
import { useAuth } from "@/queries/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Auto page loading
  usePageLoading(isLoading, {
    loadingText: "Dashboard yükleniyor...",
    delay: 200,
    minDuration: 800,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, isLoading, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Cafe yönetim sisteminize hoş geldiniz
          </p>
        </div>

        <DashboardCards />

        <div className="grid gap-6 md:grid-cols-2">
          <UserInfo />
        </div>
      </div>
    </DashboardLayout>
  );
}

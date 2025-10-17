"use client";

import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { UserInfo } from "@/components/dashboard/UserInfo";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/queries/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

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

          <div className="space-y-6">
            {/* Quick Stats or Recent Activity can go here */}
            <div className="text-center text-muted-foreground py-8">
              <p>Hızlı istatistikler ve son aktiviteler burada görünecek</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

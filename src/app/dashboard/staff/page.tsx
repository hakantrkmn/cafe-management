"use client";

import { InviteStaffForm } from "@/components/forms/InviteStaffForm";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StaffList } from "@/components/staff/StaffList";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePageLoading } from "@/hooks/usePageLoading";
import { useStaffPage } from "@/hooks/useStaffPage";
import { useRouter } from "next/navigation";

export default function StaffPage() {
  const {
    allowedStaff,
    isLoading,
    isAuthenticated,
    isManager,
    hasCafe,
    handleInviteStaff,
    handleRemoveInvite,
  } = useStaffPage();
  const router = useRouter();

  // Auto page loading
  usePageLoading(isLoading, {
    loadingText: "Çalışanlar yükleniyor...",
    delay: 200,
    minDuration: 800,
  });

  if (!isAuthenticated) {
    return null;
  }

  if (!isManager) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center text-muted-foreground">
            <p>Bu sayfaya erişim yetkiniz yok.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!hasCafe) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center text-muted-foreground">
            <p>Önce bir kafe oluşturmanız gerekiyor.</p>
            <Button
              onClick={() => router.push("/dashboard/settings")}
              className="mt-4"
            >
              Kafe Oluştur
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Çalışan Yönetimi
          </h2>
          <p className="text-muted-foreground">
            Çalışanları davet edin ve yönetin
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Çalışan Davet Et</CardTitle>
            <CardDescription>
              Email adresi ile çalışan davet edin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InviteStaffForm
              onSubmit={handleInviteStaff}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Davetli Çalışanlar</CardTitle>
            <CardDescription>Davet edilen çalışanların listesi</CardDescription>
          </CardHeader>
          <CardContent>
            <StaffList
              allowedStaff={allowedStaff}
              isLoading={isLoading}
              onRemoveInvite={handleRemoveInvite}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

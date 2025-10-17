"use client";

import { CafeForm } from "@/components/forms/CafeForm";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSettingsPage } from "@/hooks/useSettingsPage";

export default function SettingsPage() {
  const { cafe, isLoading, isAuthenticated, isManager, handleSubmit } =
    useSettingsPage();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-lg">Yükleniyor...</div>
        </div>
      </DashboardLayout>
    );
  }

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

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Kafe Ayarları</h2>
          <p className="text-muted-foreground">
            Kafe bilgilerinizi düzenleyin ve yönetin
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{cafe ? "Kafe Bilgileri" : "Kafe Oluştur"}</CardTitle>
            <CardDescription>
              {cafe
                ? "Kafe bilgilerinizi güncelleyin"
                : "İlk kafenizi oluşturun"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CafeForm
              initialData={cafe}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              submitText={cafe ? "Güncelle" : "Kafe Oluştur"}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

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
import { usePageLoading } from "@/hooks/usePageLoading";
import { useSettingsPage } from "@/hooks/useSettingsPage";

export default function SettingsPage() {
  const { cafe, isLoading, isAuthenticated, isManager, handleSubmit } =
    useSettingsPage();

  // Auto page loading
  usePageLoading(isLoading, {
    loadingText: "Ayarlar yükleniyor...",
    delay: 200,
    minDuration: 800,
  });

  if (!isAuthenticated) {
    return null;
  }

  if (!isManager) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="text-center text-muted-foreground">
            <p>Bu sayfaya erişim yetkiniz yok.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="space-y-6">
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
      </div>
    </DashboardLayout>
  );
}

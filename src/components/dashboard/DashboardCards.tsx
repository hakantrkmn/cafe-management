"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/queries/auth";
import {
  BarChart3,
  Clock,
  Menu,
  Settings,
  ShoppingCart,
  Users,
  Utensils,
} from "lucide-react";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  onClick: () => void;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

function DashboardCard({
  title,
  description,
  icon,
  buttonText,
  onClick,
  variant = "default",
}: DashboardCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">{description}</CardDescription>
        <Button onClick={onClick} variant={variant} className="w-full">
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}

export function DashboardCards() {
  const { isManager, isStaff } = useAuth();

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {isManager && (
        <>
          <DashboardCard
            title="Kafe Ayarları"
            description="Kafe bilgilerini düzenleyin ve genel ayarları yapın"
            icon={<Settings className="h-4 w-4" />}
            buttonText="Ayarlar"
            onClick={() => handleNavigation("/dashboard/settings")}
            variant="outline"
          />

          <DashboardCard
            title="Menü Yönetimi"
            description="Kategoriler ve menü ürünlerini yönetin"
            icon={<Menu className="h-4 w-4" />}
            buttonText="Menü"
            onClick={() => handleNavigation("/dashboard/menu")}
            variant="default"
          />

          <DashboardCard
            title="Çalışan Yönetimi"
            description="Çalışanları davet edin ve yönetin"
            icon={<Users className="h-4 w-4" />}
            buttonText="Çalışanlar"
            onClick={() => handleNavigation("/dashboard/staff")}
            variant="secondary"
          />

          <DashboardCard
            title="Masa Yönetimi"
            description="Masaları ekleyin ve düzenleyin"
            icon={<Utensils className="h-4 w-4" />}
            buttonText="Masalar"
            onClick={() => handleNavigation("/dashboard/tables")}
            variant="outline"
          />

          <DashboardCard
            title="Raporlar"
            description="Satış raporları ve analizleri görüntüleyin"
            icon={<BarChart3 className="h-4 w-4" />}
            buttonText="Raporlar"
            onClick={() => handleNavigation("/dashboard/reports")}
            variant="secondary"
          />
        </>
      )}

      {(isManager || isStaff) && (
        <>
          <DashboardCard
            title="Sipariş Alma"
            description="Yeni siparişler alın ve müşteri hizmeti verin"
            icon={<ShoppingCart className="h-4 w-4" />}
            buttonText="Sipariş Al"
            onClick={() => handleNavigation("/dashboard/orders/new")}
            variant="default"
          />

          <DashboardCard
            title="Aktif Siparişler"
            description="Bekleyen ve hazırlanan siparişleri görüntüleyin"
            icon={<Clock className="h-4 w-4" />}
            buttonText="Siparişler"
            onClick={() => handleNavigation("/dashboard/orders")}
            variant="secondary"
          />
        </>
      )}
    </div>
  );
}

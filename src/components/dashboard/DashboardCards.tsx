"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/queries/auth";
import {
  BarChart3,
  Clock,
  Menu,
  Settings,
  Users,
  Utensils,
} from "lucide-react";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  onClick: () => void;
  variant?: "default" | "secondary" | "outline";
}

function DashboardCard({
  title,
  description,
  icon,
  buttonText,
  onClick,
  variant = "default",
}: DashboardCardProps) {
  const buttonVariantClass = {
    default: "dashboard-card-button dashboard-card-button-default",
    secondary: "dashboard-card-button dashboard-card-button-secondary",
    outline: "dashboard-card-button dashboard-card-button-outline",
  }[variant];

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <div className="dashboard-card-title-section">
          <div className="dashboard-card-icon">{icon}</div>
          <h3 className="dashboard-card-title">{title}</h3>
        </div>
      </div>
      <div className="dashboard-card-body">
        <p className="dashboard-card-description">{description}</p>
        <Button
          onClick={onClick}
          variant="ghost"
          className={buttonVariantClass}
        >
          {buttonText}
        </Button>
      </div>
    </div>
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
            description="Kafe bilgilerini düzenleyin ve genel ayatları yapın"
            icon={<Settings className="h-6 w-6" />}
            buttonText="Ayarlar"
            onClick={() => handleNavigation("/dashboard/settings")}
            variant="outline"
          />

          <DashboardCard
            title="Menü Yönetimi"
            description="Kategoriler ve menü ürünlerini yönetin"
            icon={<Menu className="h-6 w-6" />}
            buttonText="Menü"
            onClick={() => handleNavigation("/dashboard/menu")}
            variant="default"
          />

          <DashboardCard
            title="Çalışan Yönetimi"
            description="Çalışanları davet edin ve yönetin"
            icon={<Users className="h-6 w-6" />}
            buttonText="Çalışanlar"
            onClick={() => handleNavigation("/dashboard/staff")}
            variant="secondary"
          />

          <DashboardCard
            title="Masa Yönetimi"
            description="Masaları ekleyin ve düzenleyin"
            icon={<Utensils className="h-6 w-6" />}
            buttonText="Masalar"
            onClick={() => handleNavigation("/dashboard/tables")}
            variant="outline"
          />

          <DashboardCard
            title="Raporlar"
            description="Satış raporları ve analizleri görüntüleyin"
            icon={<BarChart3 className="h-6 w-6" />}
            buttonText="Raporlar"
            onClick={() => handleNavigation("/dashboard/reports")}
            variant="secondary"
          />
        </>
      )}

      {(isManager || isStaff) && (
        <DashboardCard
          title="Aktif Siparişler"
          description="Bekleyen ve hazırlanan siparişleri görüntüleyin"
          icon={<Clock className="h-6 w-6" />}
          buttonText="Siparişler"
          onClick={() => handleNavigation("/dashboard/orders")}
          variant="secondary"
        />
      )}
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/queries/auth";
import {
  BarChart3,
  Clock,
  Heart,
  Menu,
  Settings,
  Users,
  Utensils,
} from "lucide-react";
import { useState } from "react";

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
  const { isManager, isStaff, user } = useAuth();
  const [showLoveMessage, setShowLoveMessage] = useState(false);

  const isGamze = user?.name?.toLowerCase() === "gamze";

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  const handleLoveButton = () => {
    setShowLoveMessage(true);
    setTimeout(() => setShowLoveMessage(false), 3000); // Hide after 3 seconds
  };

  return (
    <>
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

        {isGamze && (
          <DashboardCard
            title="Acil tıkla"
            description="Çok acil"
            icon={<Heart className="h-6 w-6 text-red-500" />}
            //put fart emoji
            buttonText="💨"
            onClick={handleLoveButton}
            variant="default"
          />
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

      {/* Animated Love Message for Gamze */}
      {showLoveMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div
            className="gamze-love-message"
            style={{
              background: "linear-gradient(135deg, #ec4899, #ef4444, #9333ea)",
              borderRadius: "1.5rem",
              padding: "0 1rem 0 1rem",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              minHeight: "160px",
              position: "relative",
            }}
          >
            <div
              className="gamze-love-content"
              style={{
                textAlign: "center",
              }}
            >
              <Heart
                className="h-8 w-8 sm:h-10 sm:w-10 text-red-500 mx-auto animate-pulse"
                style={{ marginBottom: "0.25rem", marginTop: "0" }}
              />
              <h2
                className="text-lg sm:text-2xl font-bold text-white text-center leading-none"
                style={{ marginBottom: "0.25rem", marginTop: "0" }}
              >
                Seni Çok Seviyorum! 💖
              </h2>
              <p
                className="text-sm sm:text-base text-pink-200 text-center leading-none"
                style={{ marginTop: "0", marginBottom: "0" }}
              >
                ✨ yiyim seni ✨
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

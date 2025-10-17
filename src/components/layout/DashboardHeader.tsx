"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, useLogout } from "@/queries/auth";
import {
  BarChart3,
  Home,
  LogOut,
  Menu,
  Settings,
  ShoppingCart,
  Table,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";

export function DashboardHeader() {
  const { user, isManager } = useAuth();
  const logoutMutation = useLogout();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="dashboard-header">
      <div className="dashboard-header-content">
        {/* Left Section: Title, Cafe Badge, Navigation */}
        <div className="dashboard-header-left">
          <h1 className="dashboard-title">Cafe Yönetim Sistemi</h1>

          {/* Cafe Badge - Only for managers */}
          {isManager && user?.cafe && (
            <Badge variant="secondary" className="dashboard-cafe-badge">
              {user.cafe.name}
            </Badge>
          )}

          {/* Navigation Links */}
          <nav className="dashboard-nav">
            <Link href="/dashboard" className="dashboard-nav-link">
              <Home className="h-4 w-4" />
              Ana Sayfa
            </Link>

            {isManager ? (
              <>
                <Link href="/dashboard/menu" className="dashboard-nav-link">
                  <Menu className="h-4 w-4" />
                  Menü Yönetimi
                </Link>
                <Link href="/dashboard/tables" className="dashboard-nav-link">
                  <Table className="h-4 w-4" />
                  Masa Yönetimi
                </Link>
                <Link href="/dashboard/reports" className="dashboard-nav-link">
                  <BarChart3 className="h-4 w-4" />
                  Raporlar
                </Link>
                <Link href="/dashboard/staff" className="dashboard-nav-link">
                  <Users className="h-4 w-4" />
                  Personel Yönetimi
                </Link>
                <Link href="/dashboard/settings" className="dashboard-nav-link">
                  <Settings className="h-4 w-4" />
                  Ayarlar
                </Link>
              </>
            ) : (
              <Link href="/dashboard/orders" className="dashboard-nav-link">
                <ShoppingCart className="h-4 w-4" />
                Sipariş Yönetimi
              </Link>
            )}
          </nav>
        </div>

        {/* Right Section: Role Badge, User Menu */}
        <div className="dashboard-header-right">
          {/* Role Badge */}
          <Badge
            variant={user?.role === "MANAGER" ? "default" : "outline"}
            className="dashboard-role-badge"
          >
            {user?.role === "MANAGER" ? "Yönetici" : "Çalışan"}
          </Badge>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full hover:bg-muted/50 transition-colors"
              >
                <Avatar className="dashboard-user-avatar">
                  <AvatarImage src="" alt={user?.name} />
                  <AvatarFallback className="text-sm font-medium">
                    {getInitials(user?.name || "")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="dashboard-user-menu"
              align="end"
              forceMount
            >
              {/* User Info Section */}
              <div className="dashboard-user-info">
                <Avatar className="dashboard-user-avatar">
                  <AvatarImage src="" alt={user?.name} />
                  <AvatarFallback className="text-sm font-medium">
                    {getInitials(user?.name || "")}
                  </AvatarFallback>
                </Avatar>
                <div className="dashboard-user-details">
                  {/* Cafe Badge - Only for managers */}
                  {isManager && user?.cafe && (
                    <div className="dashboard-user-cafe">{user.cafe.name}</div>
                  )}
                  <div className="dashboard-user-name">{user?.name}</div>
                  <div className="dashboard-user-email">{user?.email}</div>
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* Menu Items */}
              <DropdownMenuItem className="dashboard-menu-item">
                <User className="h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="dashboard-menu-item">
                <Settings className="h-4 w-4" />
                <span>Ayarlar</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="dashboard-menu-item text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4" />
                <span>
                  {logoutMutation.isPending
                    ? "Çıkış yapılıyor..."
                    : "Çıkış Yap"}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

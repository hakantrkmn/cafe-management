"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/queries/auth";
import { AlertCircle, Building, CheckCircle, Mail } from "lucide-react";

export function UserInfo() {
  const { user, isManager } = useAuth();

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const hasActiveCafe = user.cafe || user.managedCafe;

  return (
    <div className="user-info-card">
      {/* Card Header with Avatar and Name */}
      <div className="user-info-card-header">
        <Avatar className="user-info-avatar">
          <AvatarImage src="" alt={user.name} />
          <AvatarFallback className="text-sm font-bold">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="user-info-header-content">
          <div className="user-info-name">{user.name}</div>
          <div className="user-info-role">
            {isManager ? "Kafe Yöneticisi" : "Kafe Çalışanı"}
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="user-info-content">
        {/* Email Field */}
        <div className="user-info-field">
          <Mail className="user-info-field-icon" />
          <div className="user-info-field-content">
            <div className="user-info-field-label">Email Adresi</div>
            <div className="user-info-field-value">{user.email}</div>
          </div>
        </div>

        {/* Cafe Field */}
        {user.cafe && (
          <div className="user-info-field">
            <Building className="user-info-field-icon" />
            <div className="user-info-field-content">
              <div className="user-info-field-label">
                {isManager ? "Yönettiğiniz Kafe" : "Çalıştığınız Kafe"}
              </div>
              <div className="user-info-field-value">{user.cafe.name}</div>
            </div>
          </div>
        )}

        {/* Managed Cafe Field (only for managers) */}
        {isManager && user.managedCafe && (
          <div className="user-info-field">
            <Building className="user-info-field-icon" />
            <div className="user-info-field-content">
              <div className="user-info-field-label">Kafe Adı</div>
              <div className="user-info-field-value">
                {user.managedCafe.name}
              </div>
              {user.managedCafe.address && (
                <div className="text-xs text-muted-foreground mt-1">
                  {user.managedCafe.address}
                </div>
              )}
              {user.managedCafe.phone && (
                <div className="text-xs text-muted-foreground">
                  {user.managedCafe.phone}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Account Status */}
        <div className="flex items-center gap-2 pt-2">
          {hasActiveCafe ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="user-info-status user-info-status-active">
                Aktif Kafe Bağlantısı
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span className="user-info-status user-info-status-pending">
                Kafe Bağlantısı Bekleniyor
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

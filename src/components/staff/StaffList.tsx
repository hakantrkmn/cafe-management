"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AllowedStaffWithRelations } from "@/types";
import { Mail, User, X } from "lucide-react";

interface StaffListProps {
  allowedStaff: AllowedStaffWithRelations[];
  isLoading: boolean;
  onRemoveInvite: (email: string) => Promise<void>;
}

export function StaffList({
  allowedStaff,
  isLoading,
  onRemoveInvite,
}: StaffListProps) {
  if (allowedStaff.length === 0) {
    return (
      <div className="staff-invite-empty">
        <Mail className="staff-invite-empty-icon" />
        <p className="staff-invite-empty-text">
          Henüz davet edilen çalışan yok
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {allowedStaff.map((staff) => (
        <div key={staff.id} className="staff-list-item">
          <div className="staff-list-item-left">
            <div className="staff-list-avatar">
              <User className="staff-list-avatar-icon" />
            </div>
            <div className="staff-list-info">
              <p className="staff-list-name">{staff.email}</p>
              <div className="staff-list-status">
                <Badge
                  variant={staff.user ? "default" : "secondary"}
                  className="staff-list-status-badge"
                >
                  {staff.user ? "Kayıtlı" : "Beklemede"}
                </Badge>
                {staff.user && (
                  <span className="staff-list-status-registered">
                    {staff.user.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="staff-list-actions">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={isLoading}>
                  <X className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Daveti İptal Et</AlertDialogTitle>
                  <AlertDialogDescription>
                    {staff.email} adresine gönderilen daveti iptal etmek
                    istediğinizden emin misiniz? Bu işlem geri alınamaz.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>İptal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onRemoveInvite(staff.email)}
                    disabled={isLoading}
                  >
                    Daveti İptal Et
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  );
}

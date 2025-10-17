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
      <div className="text-center text-muted-foreground py-8">
        <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Henüz davet edilen çalışan yok</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {allowedStaff.map((staff) => (
        <div
          key={staff.id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-muted rounded-full">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">{staff.email}</p>
              <div className="flex items-center space-x-2">
                <Badge variant={staff.user ? "default" : "secondary"}>
                  {staff.user ? "Kayıtlı" : "Beklemede"}
                </Badge>
                {staff.user && (
                  <span className="text-sm text-muted-foreground">
                    {staff.user.name}
                  </span>
                )}
              </div>
            </div>
          </div>

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
      ))}
    </div>
  );
}

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
} from "@/components/ui/alert-dialog";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

export interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning" | "success";
  onConfirm: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const variantConfig = {
  default: {
    icon: Info,
    iconColor: "text-blue-600",
    confirmButtonVariant: "default" as const,
  },
  destructive: {
    icon: XCircle,
    iconColor: "text-red-600",
    confirmButtonVariant: "destructive" as const,
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-yellow-600",
    confirmButtonVariant: "default" as const,
  },
  success: {
    icon: CheckCircle,
    iconColor: "text-green-600",
    confirmButtonVariant: "default" as const,
  },
};

export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Onayla",
  cancelText = "İptal",
  variant = "default",
  onConfirm,
  onCancel,
  isLoading = false,
  disabled = false,
}: ConfirmationModalProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
            <AlertDialogTitle className="text-lg font-semibold">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={disabled || isLoading}
            className={`flex-1 ${
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700"
                : variant === "success"
                ? "bg-green-600 hover:bg-green-700"
                : variant === "warning"
                ? "bg-yellow-600 hover:bg-yellow-700"
                : ""
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Yükleniyor...
              </div>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

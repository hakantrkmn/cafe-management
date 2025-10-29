"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CampaignWithRelations } from "@/types";
import { CampaignForm } from "./CampaignForm";

interface CampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: CampaignWithRelations;
  onSuccess: () => void;
}

export function CampaignDialog({
  open,
  onOpenChange,
  campaign,
  onSuccess,
}: CampaignDialogProps) {
  const handleSuccess = () => {
    onSuccess();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {campaign ? "Kampanyayı Düzenle" : "Yeni Kampanya Oluştur"}
          </DialogTitle>
        </DialogHeader>
        <CampaignForm
          campaign={campaign}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}

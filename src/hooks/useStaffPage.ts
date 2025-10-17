"use client";

import { useAuth } from "@/queries/auth";
import { useCafe } from "@/queries/cafe";
import {
  useAllowedStaff,
  useInviteStaff,
  useRemoveStaffInvite,
} from "@/queries/staff";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export function useStaffPage() {
  const { isAuthenticated, isLoading: authLoading, isManager } = useAuth();
  const { data: cafeData, isLoading: cafeLoading } = useCafe();
  const router = useRouter();

  const { data: allowedStaffData, isLoading: staffLoading } = useAllowedStaff(
    cafeData?.cafe?.id || ""
  );

  const inviteStaffMutation = useInviteStaff();
  const removeStaffInviteMutation = useRemoveStaffInvite();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleInviteStaff = async (data: { email: string }) => {
    if (!cafeData?.cafe) return;

    try {
      await inviteStaffMutation.mutateAsync({
        cafeId: cafeData.cafe.id,
        data,
      });
      toast.success("Çalışan başarıyla davet edildi");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bir hata oluştu");
    }
  };

  const handleRemoveInvite = async (email: string) => {
    if (!cafeData?.cafe) return;

    try {
      await removeStaffInviteMutation.mutateAsync({
        cafeId: cafeData.cafe.id,
        email,
      });
      toast.success("Davet başarıyla iptal edildi");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bir hata oluştu");
    }
  };

  const isLoading =
    authLoading ||
    cafeLoading ||
    staffLoading ||
    inviteStaffMutation.isPending ||
    removeStaffInviteMutation.isPending;

  return {
    allowedStaff: allowedStaffData?.allowedStaff || [],
    isLoading,
    isAuthenticated,
    isManager,
    hasCafe: !!cafeData?.cafe,
    cafe: cafeData?.cafe,
    handleInviteStaff,
    handleRemoveInvite,
  };
}

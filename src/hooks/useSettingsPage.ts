"use client";

import { useAuth } from "@/queries/auth";
import { useCafe, useCreateCafe, useUpdateCafe } from "@/queries/cafe";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export function useSettingsPage() {
  const { isAuthenticated, isLoading: authLoading, isManager } = useAuth();
  const { data: cafeData, isLoading: cafeLoading } = useCafe();
  const createCafeMutation = useCreateCafe();
  const updateCafeMutation = useUpdateCafe();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (data: {
    name: string;
    address?: string;
    phone?: string;
  }) => {
    if (cafeData?.cafe) {
      // Update existing cafe
      await updateCafeMutation.mutateAsync({
        id: cafeData.cafe.id,
        data,
      });
      toast.success("Kafe bilgileri başarıyla güncellendi");
    } else {
      // Create new cafe
      await createCafeMutation.mutateAsync(data);
      toast.success("Kafe başarıyla oluşturuldu");
    }
  };

  const isLoading =
    authLoading ||
    cafeLoading ||
    createCafeMutation.isPending ||
    updateCafeMutation.isPending;

  return {
    cafe: cafeData?.cafe,
    isLoading,
    isAuthenticated,
    isManager,
    handleSubmit,
  };
}

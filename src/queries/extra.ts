import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// API functions
const extraApi = {
  saveExtras: async ({
    cafeId,
    extras,
  }: {
    cafeId: string;
    extras: Array<{
      id: string;
      name: string;
      price: number;
      isAvailable: boolean;
      cafeId: string;
      createdAt: Date;
      updatedAt: Date;
      _status?: "new" | "modified" | "deleted";
      _tempId?: string;
    }>;
  }) => {
    const response = await fetch(`/api/cafes/${cafeId}/extras/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ extras }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Ekstralar kaydedilemedi");
    }

    return response.json();
  },
};

// Hooks
export function useSaveExtra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: extraApi.saveExtras,
    onSuccess: (data, variables) => {
      // Invalidate menu query to refresh data
      queryClient.invalidateQueries({
        queryKey: ["menuItems", variables.cafeId],
      });
    },
    onError: (error) => {
      console.error("Save extras error:", error);
      toast.error(error.message || "Ekstralar kaydedilirken bir hata oluştu.");
    },
  });
}

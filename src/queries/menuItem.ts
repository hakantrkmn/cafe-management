import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// API functions
const menuItemApi = {
  saveMenuItems: async ({
    cafeId,
    menuItems,
  }: {
    cafeId: string;
    menuItems: Array<{
      id: string;
      name: string;
      price: number;
      description?: string;
      isAvailable: boolean;
      categoryId: string;
      cafeId: string;
      createdAt: Date;
      updatedAt: Date;
      _status?: "new" | "modified" | "deleted";
      _tempId?: string;
    }>;
  }) => {
    const response = await fetch(`/api/cafes/${cafeId}/menu-items/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ menuItems }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Menü öğeleri kaydedilemedi");
    }

    return response.json();
  },
};

// Hooks
export function useSaveMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: menuItemApi.saveMenuItems,
    onSuccess: (data, variables) => {
      // Invalidate menu query to refresh data
      queryClient.invalidateQueries({
        queryKey: ["menuItems", variables.cafeId],
      });
    },
    onError: (error) => {
      console.error("Save menu items error:", error);
      toast.error(
        error.message || "Menü öğeleri kaydedilirken bir hata oluştu."
      );
    },
  });
}

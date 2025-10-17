import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// API functions
const categoryApi = {
  saveCategories: async ({
    cafeId,
    categories,
  }: {
    cafeId: string;
    categories: Array<{
      id: string;
      name: string;
      order: number;
      cafeId: string;
      createdAt: Date;
      updatedAt: Date;
      _status?: "new" | "modified" | "deleted";
      _tempId?: string;
    }>;
  }) => {
    const response = await fetch(`/api/cafes/${cafeId}/categories/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ categories }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Kategoriler kaydedilemedi");
    }

    return response.json();
  },
};

// Hooks
export function useSaveCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoryApi.saveCategories,
    onSuccess: (data, variables) => {
      // Invalidate menu query to refresh data
      queryClient.invalidateQueries({
        queryKey: ["menuItems", variables.cafeId],
      });
    },
    onError: (error) => {
      console.error("Save categories error:", error);
      toast.error(
        error.message || "Kategoriler kaydedilirken bir hata oluştu."
      );
    },
  });
}

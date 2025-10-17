import { QueryKeys } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// API functions
const menuApi = {
  getMenu: async (cafeId: string) => {
    const response = await fetch(`/api/cafes/${cafeId}/menu`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Menü verileri alınamadı");
    }
    const result = await response.json();
    return result.data;
  },

  saveMenu: async ({
    cafeId,
    data,
  }: {
    cafeId: string;
    data: {
      categories: {
        create: Array<{
          name: string;
          order: number;
        }>;
        update: Array<{
          id: string;
          data: {
            name?: string;
            order?: number;
          };
        }>;
        delete: string[];
      };
      menuItems: {
        create: Array<{
          categoryId: string;
          name: string;
          price: number;
          description?: string;
          isAvailable?: boolean;
        }>;
        update: Array<{
          id: string;
          data: {
            categoryId?: string;
            name?: string;
            price?: number;
            description?: string;
            isAvailable?: boolean;
          };
        }>;
        delete: string[];
      };
      extras: {
        create: Array<{
          name: string;
          price: number;
          isAvailable?: boolean;
        }>;
        update: Array<{
          id: string;
          data: {
            name?: string;
            price?: number;
            isAvailable?: boolean;
          };
        }>;
        delete: string[];
      };
    };
  }) => {
    const response = await fetch(`/api/cafes/${cafeId}/menu/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Menü kaydedilemedi");
    }

    return response.json();
  },
};

// Hooks
export function useMenu(cafeId: string) {
  return useQuery({
    queryKey: QueryKeys.menuItems(cafeId),
    queryFn: () => menuApi.getMenu(cafeId),
    retry: 1,
    enabled: !!cafeId,
  });
}

export function useSaveMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: menuApi.saveMenu,
    onSuccess: (data, variables) => {
      // Invalidate menu data to refetch
      queryClient.invalidateQueries({
        queryKey: QueryKeys.menuItems(variables.cafeId),
      });
    },
    onError: (error) => {
      console.error("Save menu error:", error);
    },
  });
}

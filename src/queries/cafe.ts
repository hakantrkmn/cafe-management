import { CreateCafeRequest, QueryKeys } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// API functions
const cafeApi = {
  getCafe: async () => {
    const response = await fetch("/api/cafes");
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Kafe bilgileri alınamadı");
    }
    return response.json();
  },

  createCafe: async (data: CreateCafeRequest) => {
    const response = await fetch("/api/cafes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Kafe oluşturulamadı");
    }

    return response.json();
  },

  updateCafe: async ({
    id,
    data,
  }: {
    id: string;
    data: Partial<CreateCafeRequest>;
  }) => {
    const response = await fetch(`/api/cafes/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Kafe güncellenemedi");
    }

    return response.json();
  },
};

// Hooks
export function useCafe() {
  return useQuery({
    queryKey: QueryKeys.cafes,
    queryFn: cafeApi.getCafe,
    retry: 1,
  });
}

export function useCreateCafe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cafeApi.createCafe,
    onSuccess: () => {
      // Kafe oluşturulduğunda hem cafe hem de auth cache'ini güncelle
      queryClient.invalidateQueries({ queryKey: QueryKeys.cafes });
      // Auth cache'ini de invalidate et çünkü session bilgileri değişmiş olabilir
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error("Create cafe error:", error);
    },
  });
}

export function useUpdateCafe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cafeApi.updateCafe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.cafes });
    },
    onError: (error) => {
      console.error("Update cafe error:", error);
    },
  });
}

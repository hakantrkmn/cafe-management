import { InviteStaffRequest, QueryKeys } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// API functions
const staffApi = {
  getAllowedStaff: async (cafeId: string) => {
    const response = await fetch(`/api/cafes/${cafeId}/staff`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Çalışan listesi alınamadı");
    }
    return response.json();
  },

  inviteStaff: async ({
    cafeId,
    data,
  }: {
    cafeId: string;
    data: InviteStaffRequest;
  }) => {
    const response = await fetch(`/api/cafes/${cafeId}/staff`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Çalışan davet edilemedi");
    }

    return response.json();
  },

  removeStaffInvite: async ({
    cafeId,
    email,
  }: {
    cafeId: string;
    email: string;
  }) => {
    const response = await fetch(
      `/api/cafes/${cafeId}/staff?email=${encodeURIComponent(email)}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Davet iptal edilemedi");
    }

    return response.json();
  },
};

// Hooks
export function useAllowedStaff(cafeId: string) {
  return useQuery({
    queryKey: QueryKeys.allowedStaff(cafeId),
    queryFn: () => staffApi.getAllowedStaff(cafeId),
    enabled: !!cafeId,
    retry: 1,
  });
}

export function useInviteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: staffApi.inviteStaff,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.allowedStaff(variables.cafeId),
      });
    },
    onError: (error) => {
      console.error("Invite staff error:", error);
    },
  });
}

export function useRemoveStaffInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: staffApi.removeStaffInvite,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.allowedStaff(variables.cafeId),
      });
    },
    onError: (error) => {
      console.error("Remove staff invite error:", error);
    },
  });
}

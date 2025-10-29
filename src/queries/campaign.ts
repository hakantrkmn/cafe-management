import {
  CampaignWithRelations,
  CreateCampaignRequest,
  QueryKeys,
  UpdateCampaignRequest,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./auth";

// Fetch campaigns for a cafe
export function useCampaigns(cafeId: string) {
  return useQuery({
    queryKey: QueryKeys.campaigns(cafeId),
    queryFn: async (): Promise<CampaignWithRelations[]> => {
      const response = await fetch(`/api/cafes/${cafeId}/campaigns`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Kampanyalar yüklenirken hata oluştu");
      }

      return data.data;
    },
    enabled: !!cafeId,
  });
}

// Fetch single campaign
export function useCampaign(cafeId: string, campaignId: string) {
  return useQuery({
    queryKey: QueryKeys.campaign(campaignId),
    queryFn: async (): Promise<CampaignWithRelations> => {
      const response = await fetch(
        `/api/cafes/${cafeId}/campaigns/${campaignId}`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Kampanya yüklenirken hata oluştu");
      }

      return data.data;
    },
    enabled: !!cafeId && !!campaignId,
  });
}

// Create campaign mutation
export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      data: CreateCampaignRequest
    ): Promise<CampaignWithRelations> => {
      const cafeId = user?.cafeId || user?.managedCafe?.id;
      if (!cafeId) {
        throw new Error("Kafe bilgisi bulunamadı");
      }

      const response = await fetch(`/api/cafes/${cafeId}/campaigns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Kampanya oluşturulurken hata oluştu");
      }

      return result.data;
    },
    onSuccess: () => {
      const cafeId = user?.cafeId || user?.managedCafe?.id;
      if (cafeId) {
        queryClient.invalidateQueries({
          queryKey: QueryKeys.campaigns(cafeId),
        });
      }
    },
  });
}

// Update campaign mutation
export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      campaignId,
      data,
    }: {
      campaignId: string;
      data: UpdateCampaignRequest;
    }): Promise<CampaignWithRelations> => {
      const cafeId = user?.cafeId || user?.managedCafe?.id;
      if (!cafeId) {
        throw new Error("Kafe bilgisi bulunamadı");
      }

      const response = await fetch(
        `/api/cafes/${cafeId}/campaigns/${campaignId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Kampanya güncellenirken hata oluştu");
      }

      return result.data;
    },
    onSuccess: (data) => {
      const cafeId = user?.cafeId || user?.managedCafe?.id;
      if (cafeId) {
        queryClient.invalidateQueries({
          queryKey: QueryKeys.campaigns(cafeId),
        });
        queryClient.setQueryData(QueryKeys.campaign(data.id), data);
      }
    },
  });
}

// Delete campaign mutation
export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (campaignId: string): Promise<void> => {
      const cafeId = user?.cafeId || user?.managedCafe?.id;
      if (!cafeId) {
        throw new Error("Kafe bilgisi bulunamadı");
      }

      const response = await fetch(
        `/api/cafes/${cafeId}/campaigns/${campaignId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Kampanya silinirken hata oluştu");
      }
    },
    onSuccess: () => {
      const cafeId = user?.cafeId || user?.managedCafe?.id;
      if (cafeId) {
        queryClient.invalidateQueries({
          queryKey: QueryKeys.campaigns(cafeId),
        });
      }
    },
  });
}

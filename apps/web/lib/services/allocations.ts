import apiClient from "@/lib/api-client";
import type { Allocation, RecommendationResponse } from "@/types";

export async function recommend(projectId: string): Promise<RecommendationResponse> {
  const { data } = await apiClient.post<RecommendationResponse>(
    "/api/v1/allocations/recommend",
    { project_id: projectId }
  );
  return data;
}

export async function getRecommendations(projectId: string): Promise<RecommendationResponse> {
  const { data } = await apiClient.get<RecommendationResponse>(
    `/api/v1/allocations/recommendations/${projectId}`
  );
  return data;
}

export async function confirmAllocation(body: {
  engineer_id: string;
  project_id: string;
  percentage: number;
  start_date?: string;
  end_date?: string;
}): Promise<Allocation> {
  const { data } = await apiClient.post<Allocation>("/api/v1/allocations/confirm", body);
  return data;
}

export async function getActiveAllocations(): Promise<Allocation[]> {
  const { data } = await apiClient.get<Allocation[]>("/api/v1/allocations/active");
  return data;
}

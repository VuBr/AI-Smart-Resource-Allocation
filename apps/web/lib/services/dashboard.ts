import apiClient from "@/lib/api-client";
import type { DashboardStats } from "@/types";

export async function getStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get<DashboardStats>("/api/v1/dashboard/stats");
  return data;
}

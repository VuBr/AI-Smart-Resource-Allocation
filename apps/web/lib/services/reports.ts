import apiClient from "@/lib/api-client";
import type { ShortageItem } from "@/types";

export async function getShortage(): Promise<ShortageItem[]> {
  const { data } = await apiClient.get<ShortageItem[]>("/api/v1/reports/shortage");
  return data;
}

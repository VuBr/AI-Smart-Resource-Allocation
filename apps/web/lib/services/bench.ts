import apiClient from "@/lib/api-client";
import type { BenchAlertItem, BenchForecastItem } from "@/types";

export async function getForecast(): Promise<BenchForecastItem[]> {
  const { data } = await apiClient.get<BenchForecastItem[]>("/api/v1/bench/forecast");
  return data;
}

export async function getAlerts(): Promise<BenchAlertItem[]> {
  const { data } = await apiClient.get<BenchAlertItem[]>("/api/v1/bench/alerts");
  return data;
}

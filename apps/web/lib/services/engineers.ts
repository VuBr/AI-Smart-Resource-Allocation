import apiClient from "@/lib/api-client";
import type { BenchForecastItem, CreateEngineerRequest, CsvImportResult, Engineer } from "@/types";

export async function listEngineers(): Promise<Engineer[]> {
  const { data } = await apiClient.get<Engineer[]>("/api/v1/engineers");
  return data;
}

export async function getEngineer(id: string): Promise<Engineer> {
  const { data } = await apiClient.get<Engineer>(`/api/v1/engineers/${id}`);
  return data;
}

export async function uploadEngineers(file: File): Promise<CsvImportResult> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post<CsvImportResult>("/api/v1/engineers/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function getBenchForecast(id: string): Promise<BenchForecastItem> {
  const { data } = await apiClient.get<BenchForecastItem>(
    `/api/v1/engineers/${id}/bench-forecast`
  );
  return data;
}

export async function createEngineer(body: CreateEngineerRequest): Promise<Engineer> {
  const { data } = await apiClient.post<Engineer>("/api/v1/engineers", body);
  return data;
}

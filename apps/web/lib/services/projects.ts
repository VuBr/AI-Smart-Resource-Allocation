import apiClient from "@/lib/api-client";
import type { CsvImportResult, Project } from "@/types";

export async function listProjects(): Promise<Project[]> {
  const { data } = await apiClient.get<Project[]>("/api/v1/projects");
  return data;
}

export async function getProject(id: string): Promise<Project> {
  const { data } = await apiClient.get<Project>(`/api/v1/projects/${id}`);
  return data;
}

export async function uploadProjects(file: File): Promise<CsvImportResult> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post<CsvImportResult>("/api/v1/projects/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

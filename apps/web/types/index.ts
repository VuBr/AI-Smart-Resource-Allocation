export type EngineerLevel = "junior" | "mid" | "senior" | "lead";
export type ProjectStatus = "planned" | "active" | "closed";
export type AllocationStatus = "active" | "completed" | "cancelled";
export type RiskLevel = "low" | "medium" | "high";

export interface Engineer {
  id: string;
  name: string;
  email: string;
  primary_skill: string;
  secondary_skills: string | null;
  level: EngineerLevel;
  years_of_experience: number;
  availability_percentage: number;
  bench_start_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  required_skills: string | null;
  required_level: string | null;
  headcount: number;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export interface Allocation {
  id: string;
  engineer_id: string;
  project_id: string;
  percentage: number;
  status: AllocationStatus;
  start_date: string | null;
  end_date: string | null;
}

export interface RecommendationItem {
  engineer_id: string;
  engineer_name: string;
  score: number;
  skill_match: number;
  experience_match: number;
  availability_match: number;
  availability_percentage: number;
}

export interface RecommendationResponse {
  project_id: string;
  recommendations: RecommendationItem[];
}

export interface BenchForecastItem {
  engineer_id: string;
  engineer_name: string;
  forecast_date: string;
  risk_level: RiskLevel;
  probability: number;
  days_until_bench: number | null;
  is_alert: boolean;
}

export interface BenchAlertItem {
  engineer_id: string;
  engineer_name: string;
  bench_start_date: string;
  days_until_bench: number;
  risk_level: RiskLevel;
}

export interface DashboardStats {
  total_engineers: number;
  engineers_on_bench: number;
  active_projects: number;
  allocation_rate_percentage: number;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: string;
}

export interface CsvImportResult {
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export interface ShortageItem {
  skill: string;
  required: number;
  available: number;
  gap: number;
}

export interface AllocationDetail {
  id: string;
  engineer_id: string;
  engineer_name: string;
  engineer_level: EngineerLevel;
  engineer_skill: string;
  project_id: string;
  project_name: string;
  project_status: ProjectStatus;
  percentage: number;
  status: AllocationStatus;
  start_date: string | null;
  end_date: string | null;
}

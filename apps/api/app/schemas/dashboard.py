from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_engineers: int
    engineers_on_bench: int
    active_projects: int
    allocation_rate_percentage: int

from app.models.engineer import Engineer
from app.models.project import Project


class ConstraintEngine:
    def apply_hard_constraints(self, engineers: list[Engineer], project: Project) -> list[Engineer]:
        """STUB: Return all engineers (no hard constraints applied in Phase 5)."""
        return engineers

    def apply_soft_constraints(self, engineers: list[Engineer], project: Project) -> list[Engineer]:
        """STUB: Return all engineers (no soft constraints applied in Phase 5)."""
        return engineers

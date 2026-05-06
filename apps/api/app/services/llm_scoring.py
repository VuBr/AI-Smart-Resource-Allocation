import json
from dataclasses import dataclass
from typing import Any

import google.generativeai as genai

from app.core.config import get_settings
from app.core.logging import log_event
from app.models.allocation import Allocation
from app.models.bench_forecast import BenchForecast
from app.models.engineer import Engineer
from app.models.match_score import MatchScore
from app.models.project import Project


@dataclass
class ScoreBreakdown:
    skill_match: float
    experience_match: float
    availability_match: float
    score: float
    explanation: str
    risk_notes: str
    llm_provider: str
    model_version: str


class LLMScoringService:
    async def score_engineer_project(
        self,
        engineer: Engineer,
        project: Project,
        active_allocations: list[Allocation] | None = None,
        bench_forecast: BenchForecast | None = None,
    ) -> MatchScore:
        active_allocations = active_allocations or []

        rule_result = self._compute_rule_based_score(
            engineer=engineer,
            project=project,
            active_allocations=active_allocations,
            bench_forecast=bench_forecast,
        )

        llm_result = await self._maybe_call_llm(
            engineer=engineer,
            project=project,
            rule_result=rule_result,
            bench_forecast=bench_forecast,
        )

        final_result = llm_result or rule_result

        log_event(
            "llm_score_computed",
            engineer_id=str(engineer.id),
            project_id=str(project.id),
            provider=final_result.llm_provider,
        )

        return MatchScore(
            engineer_id=engineer.id,
            project_id=project.id,
            score=final_result.score,
            skill_match=final_result.skill_match,
            experience_match=final_result.experience_match,
            availability_match=final_result.availability_match,
            explanation=final_result.explanation,
            risk_notes=final_result.risk_notes,
            llm_provider=final_result.llm_provider,
            model_version=final_result.model_version,
        )

    def _compute_rule_based_score(
        self,
        engineer: Engineer,
        project: Project,
        active_allocations: list[Allocation],
        bench_forecast: BenchForecast | None,
    ) -> ScoreBreakdown:
        skill_match = self._compute_skill_match(engineer, project)
        experience_match = self._compute_experience_match(engineer, project)
        availability_match = self._compute_availability_match(engineer, active_allocations)

        base_score = (
            0.50 * skill_match
            + 0.25 * experience_match
            + 0.25 * availability_match
        )

        risk_penalty, risk_notes = self._compute_risk_penalty(bench_forecast)
        final_score = self._clamp(base_score - risk_penalty)

        explanation = self._build_rule_explanation(
            engineer=engineer,
            project=project,
            skill_match=skill_match,
            experience_match=experience_match,
            availability_match=availability_match,
            final_score=final_score,
            risk_notes=risk_notes,
        )

        return ScoreBreakdown(
            skill_match=skill_match,
            experience_match=experience_match,
            availability_match=availability_match,
            score=final_score,
            explanation=explanation,
            risk_notes=risk_notes,
            llm_provider="fallback_rules",
            model_version="rules-v1",
        )

    async def _maybe_call_llm(
        self,
        engineer: Engineer,
        project: Project,
        rule_result: ScoreBreakdown,
        bench_forecast: BenchForecast | None,
    ) -> ScoreBreakdown | None:
        settings = get_settings()

        if settings.LLM_PROVIDER != "gemini":
            return None

        if not settings.GEMINI_API_KEY:
            return None

        payload: dict[str, Any] = {
            "engineer": {
                "id": str(engineer.id),
                "name": engineer.name,
                "primary_skill": engineer.primary_skill,
                "secondary_skills": self._parse_skills(engineer.secondary_skills),
                "level": engineer.level,
                "years_of_experience": engineer.years_of_experience,
                "availability_percentage": engineer.availability_percentage,
            },
            "project": {
                "id": str(project.id),
                "name": project.name,
                "description": project.description,
                "required_skills": self._parse_skills(project.required_skills),
                "required_level": project.required_level,
                "headcount": project.headcount,
                "status": project.status,
            },
            "bench_forecast": {
                "risk_level": bench_forecast.risk_level if bench_forecast else None,
                "probability": bench_forecast.probability if bench_forecast else None,
                "days_until_bench": bench_forecast.days_until_bench if bench_forecast else None,
            },
            "rule_based_baseline": {
                "skill_match": rule_result.skill_match,
                "experience_match": rule_result.experience_match,
                "availability_match": rule_result.availability_match,
                "score": rule_result.score,
                "explanation": rule_result.explanation,
                "risk_notes": rule_result.risk_notes,
            },
        }

        prompt = f"""
            You are an AI that scores engineer-project matching.

            You must return ONLY valid JSON.
            Do not wrap in markdown.
            Do not add explanation outside JSON.

            Scoring rules:
            - skill_match: float from 0.0 to 1.0
            - experience_match: float from 0.0 to 1.0
            - availability_match: float from 0.0 to 1.0
            - score: float from 0.0 to 1.0
            - explanation: short string
            - risk_notes: short string

            Use the provided rule_based_baseline as a baseline.
            You may refine the scores slightly based on semantic matching between skills and project description.
            Do not radically change the baseline without strong reason.

            Input:
            {json.dumps(payload, ensure_ascii=False, default=str)}

            Return exactly this JSON shape:
            {{
            "skill_match": 0.0,
            "experience_match": 0.0,
            "availability_match": 0.0,
            "score": 0.0,
            "explanation": "",
            "risk_notes": ""
            }}
            """.strip()

        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(settings.LLM_MODEL)

            response = model.generate_content(
                prompt,
                generation_config={
                    "temperature": settings.LLM_TEMPERATURE,
                    "max_output_tokens": min(settings.LLM_MAX_TOKENS, 300),
                    "response_mime_type": "application/json",
                },
            )

            raw_text = getattr(response, "text", None)
            print("Gemini raw_text =", raw_text)

            if not raw_text:
                print("Gemini error: empty response.text")
                return None

            data = json.loads(raw_text)
            print("Gemini parsed data =", data)

            skill_match = self._clamp(float(data["skill_match"]))
            experience_match = self._clamp(float(data["experience_match"]))
            availability_match = self._clamp(float(data["availability_match"]))
            score = self._clamp(float(data["score"]))
            explanation = str(data.get("explanation", "")).strip()
            risk_notes = str(data.get("risk_notes", "")).strip()

            return ScoreBreakdown(
                skill_match=skill_match,
                experience_match=experience_match,
                availability_match=availability_match,
                score=score,
                explanation=explanation or rule_result.explanation,
                risk_notes=risk_notes or rule_result.risk_notes,
                llm_provider="gemini",
                model_version=settings.LLM_MODEL,
            )
        except Exception as e:
            print("Gemini error:", repr(e))
            return None

    def _compute_skill_match(self, engineer: Engineer, project: Project) -> float:
        engineer_skills = {
            skill.lower().strip()
            for skill in [engineer.primary_skill, *self._parse_skills(engineer.secondary_skills)]
            if skill and skill.strip()
        }
        project_skills = {
            skill.lower().strip()
            for skill in self._parse_skills(project.required_skills)
            if skill and skill.strip()
        }

        if not project_skills:
            return 0.5

        overlap = engineer_skills.intersection(project_skills)
        ratio = len(overlap) / len(project_skills)
        primary_boost = 0.1 if engineer.primary_skill.lower().strip() in project_skills else 0.0

        return self._clamp(ratio + primary_boost)

    def _compute_experience_match(self, engineer: Engineer, project: Project) -> float:
        level_map = {
            "junior": 1,
            "mid": 2,
            "senior": 3,
            "lead": 4,
        }

        engineer_level = level_map.get((engineer.level or "").lower(), 0)
        project_level = level_map.get((project.required_level or "").lower(), 0)

        if project_level == 0:
            level_score = 0.5
        elif engineer_level >= project_level:
            level_score = 1.0
        elif engineer_level == project_level - 1:
            level_score = 0.7
        else:
            level_score = 0.4

        years_score = min(engineer.years_of_experience / 10.0, 1.0)
        return self._clamp((0.7 * level_score) + (0.3 * years_score))

    def _compute_availability_match(
        self,
        engineer: Engineer,
        active_allocations: list[Allocation],
    ) -> float:
        allocated_percentage = sum(
            allocation.percentage
            for allocation in active_allocations
            if allocation.status == "active"
        )

        remaining_capacity = max(engineer.availability_percentage - allocated_percentage, 0)

        if remaining_capacity >= 100:
            return 1.0
        if remaining_capacity >= 75:
            return 0.9
        if remaining_capacity >= 50:
            return 0.75
        if remaining_capacity >= 25:
            return 0.5
        if remaining_capacity > 0:
            return 0.25
        return 0.0

    def _compute_risk_penalty(
        self,
        bench_forecast: BenchForecast | None,
    ) -> tuple[float, str]:
        if bench_forecast is None:
            return 0.0, "No bench forecast available."

        risk_level = (bench_forecast.risk_level or "").lower()
        probability = bench_forecast.probability or 0.0
        days_until_bench = bench_forecast.days_until_bench

        if risk_level == "high":
            return 0.10, (
                f"High bench risk detected "
                f"(probability={probability:.2f}, "
                f"days_until_bench={days_until_bench})."
            )
        if risk_level == "medium":
            return 0.05, (
                f"Medium bench risk detected "
                f"(probability={probability:.2f}, "
                f"days_until_bench={days_until_bench})."
            )
        return 0.0, (
            f"Low bench risk "
            f"(probability={probability:.2f}, "
            f"days_until_bench={days_until_bench})."
        )

    def _build_rule_explanation(
        self,
        engineer: Engineer,
        project: Project,
        skill_match: float,
        experience_match: float,
        availability_match: float,
        final_score: float,
        risk_notes: str,
    ) -> str:
        return (
            f"Engineer '{engineer.name}' evaluated for project '{project.name}'. "
            f"Skill match={skill_match:.2f}, "
            f"experience match={experience_match:.2f}, "
            f"availability match={availability_match:.2f}, "
            f"overall score={final_score:.2f}. "
            f"{risk_notes}"
        )

    def _parse_skills(self, skills: str | None) -> list[str]:
        if not skills:
            return []
        return [item.strip() for item in skills.split(",") if item.strip()]

    def _clamp(self, value: float) -> float:
        return max(0.0, min(1.0, round(value, 4)))

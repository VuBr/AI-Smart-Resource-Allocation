from datetime import date

from app.core.config import get_settings
from app.models.engineer import Engineer


class BenchPredictionEngine:
    async def predict_bench(self, engineer: Engineer) -> dict:
        """
        REAL: Apply 30-day threshold using bench_start_date.
        Returns BenchForecastItem-compatible dict.
        """
        settings = get_settings()
        threshold = settings.BENCH_ALERT_DAYS_THRESHOLD
        today = date.today()

        if engineer.bench_start_date is None:
            return {
                "engineer_id": engineer.id,
                "engineer_name": engineer.name,
                "forecast_date": today,
                "risk_level": "low",
                "probability": 0.1,
                "days_until_bench": None,
                "is_alert": False,
            }

        days_until_bench = (engineer.bench_start_date - today).days

        # REAL: trigger alert when bench_start_date - today <= threshold
        is_alert = days_until_bench <= threshold

        if days_until_bench <= 0:
            risk_level = "high"
            probability = 0.9
        elif days_until_bench <= 7:
            risk_level = "high"
            probability = 0.8
        elif days_until_bench <= threshold:
            risk_level = "medium"
            probability = 0.6
        else:
            risk_level = "low"
            probability = 0.2

        return {
            "engineer_id": engineer.id,
            "engineer_name": engineer.name,
            "forecast_date": today,
            "risk_level": risk_level,
            "probability": probability,
            "days_until_bench": days_until_bench,
            "is_alert": is_alert,
        }

    async def get_alerts(self, engineers: list[Engineer]) -> list[dict]:
        """
        REAL: Return engineers whose bench_start_date - today <= BENCH_ALERT_DAYS_THRESHOLD.
        """
        settings = get_settings()
        threshold = settings.BENCH_ALERT_DAYS_THRESHOLD
        today = date.today()
        alerts = []

        for engineer in engineers:
            if engineer.bench_start_date is None:
                continue
            days_until_bench = (engineer.bench_start_date - today).days
            if days_until_bench <= threshold:
                risk_level = "high" if days_until_bench <= 7 else "medium"
                alerts.append(
                    {
                        "engineer_id": engineer.id,
                        "engineer_name": engineer.name,
                        "bench_start_date": engineer.bench_start_date,
                        "days_until_bench": days_until_bench,
                        "risk_level": risk_level,
                    }
                )

        return alerts

"""
Unit tests for BenchPredictionEngine.
Bảo vệ AC-13: 30-day threshold logic dùng bench_start_date.
"""
import uuid
from datetime import date, timedelta
from unittest.mock import MagicMock, patch

import pytest

from app.services.bench_prediction import BenchPredictionEngine


def _make_engineer(bench_start_date):
    """Tạo engineer mock với bench_start_date cho trước. Dùng MagicMock để tránh SQLAlchemy state."""
    engineer = MagicMock()
    engineer.id = uuid.uuid4()
    engineer.name = "Test Engineer"
    engineer.bench_start_date = bench_start_date
    return engineer


TODAY = date(2026, 4, 1)


@pytest.mark.asyncio
@patch("app.services.bench_prediction.date")
async def test_no_bench_start_date_is_not_alert(mock_date):
    """Engineer không có bench_start_date → is_alert=False, risk_level=low."""
    mock_date.today.return_value = TODAY
    engineer = _make_engineer(bench_start_date=None)
    engine = BenchPredictionEngine()
    result = await engine.predict_bench(engineer)
    assert result["is_alert"] is False
    assert result["risk_level"] == "low"
    assert result["days_until_bench"] is None


@pytest.mark.asyncio
@patch("app.services.bench_prediction.date")
async def test_bench_in_31_days_no_alert(mock_date):
    """bench_start_date = today+31 → ngoài threshold 30 ngày → is_alert=False."""
    mock_date.today.return_value = TODAY
    engineer = _make_engineer(bench_start_date=TODAY + timedelta(days=31))
    engine = BenchPredictionEngine()
    result = await engine.predict_bench(engineer)
    assert result["is_alert"] is False
    assert result["days_until_bench"] == 31


@pytest.mark.asyncio
@patch("app.services.bench_prediction.date")
async def test_bench_in_30_days_triggers_alert(mock_date):
    """bench_start_date = today+30 → đúng boundary threshold → is_alert=True (AC-13 key case)."""
    mock_date.today.return_value = TODAY
    engineer = _make_engineer(bench_start_date=TODAY + timedelta(days=30))
    engine = BenchPredictionEngine()
    result = await engine.predict_bench(engineer)
    assert result["is_alert"] is True
    assert result["days_until_bench"] == 30
    assert result["risk_level"] == "medium"


@pytest.mark.asyncio
@patch("app.services.bench_prediction.date")
async def test_bench_in_7_days_is_high_risk(mock_date):
    """bench_start_date = today+7 → is_alert=True, risk_level=high."""
    mock_date.today.return_value = TODAY
    engineer = _make_engineer(bench_start_date=TODAY + timedelta(days=7))
    engine = BenchPredictionEngine()
    result = await engine.predict_bench(engineer)
    assert result["is_alert"] is True
    assert result["risk_level"] == "high"


@pytest.mark.asyncio
@patch("app.services.bench_prediction.date")
async def test_already_benched_is_high_risk(mock_date):
    """bench_start_date = today-1 (đã benched) → is_alert=True, risk_level=high."""
    mock_date.today.return_value = TODAY
    engineer = _make_engineer(bench_start_date=TODAY - timedelta(days=1))
    engine = BenchPredictionEngine()
    result = await engine.predict_bench(engineer)
    assert result["is_alert"] is True
    assert result["risk_level"] == "high"
    assert result["days_until_bench"] == -1


@pytest.mark.asyncio
@patch("app.services.bench_prediction.date")
async def test_get_alerts_returns_only_within_threshold(mock_date):
    """get_alerts chỉ trả về engineers trong threshold, bỏ qua ngoài threshold và None."""
    mock_date.today.return_value = TODAY
    e_alert = _make_engineer(bench_start_date=TODAY + timedelta(days=15))
    e_no_alert = _make_engineer(bench_start_date=TODAY + timedelta(days=45))
    e_no_date = _make_engineer(bench_start_date=None)

    engine = BenchPredictionEngine()
    alerts = await engine.get_alerts([e_alert, e_no_alert, e_no_date])
    assert len(alerts) == 1
    assert alerts[0]["engineer_id"] == e_alert.id

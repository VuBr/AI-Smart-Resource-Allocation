import json
import logging
import sys
from datetime import UTC, datetime


class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        # If the message is already a JSON string (from log_event), pass through
        msg = record.getMessage()
        try:
            parsed = json.loads(msg)
            if isinstance(parsed, dict):
                return msg
        except (ValueError, TypeError):
            pass
        # Fall back to basic JSON structure
        return json.dumps(
            {
                "timestamp": datetime.now(UTC).isoformat(),
                "level": record.levelname,
                "event": msg,
            }
        )


def setup_logging(level: str = "INFO") -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())
    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(getattr(logging, level.upper(), logging.INFO))


def log_event(event: str, **kwargs: object) -> None:
    """Log a structured event. Never pass PII (email, name, personal info)."""
    log_data: dict[str, object] = {
        "timestamp": datetime.now(UTC).isoformat(),
        "level": "INFO",
        "event": event,
        **kwargs,
    }
    logger = logging.getLogger("app")
    logger.info(json.dumps(log_data))

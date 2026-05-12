import redis.asyncio as aioredis

from app.core.config import get_settings
from app.core.logging import log_event

_redis_client: aioredis.Redis | None = None  # type: ignore[type-arg]


async def get_redis() -> aioredis.Redis:  # type: ignore[type-arg]
    global _redis_client
    if _redis_client is None:
        settings = get_settings()
        _redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    return _redis_client


async def set_cache(key: str, value: str, ttl: int) -> None:
    client = await get_redis()
    await client.setex(key, ttl, value)
    log_event("cache_set", key=key, ttl=ttl)


async def get_cache(key: str) -> str | None:
    client = await get_redis()
    value = await client.get(key)
    if value is not None:
        log_event("cache_hit", key=key)
    else:
        log_event("cache_miss", key=key)
    return value


async def verify_redis_connection() -> bool:
    try:
        client = await get_redis()
        await client.ping()
        log_event("redis_connected")
        return True
    except Exception as e:
        log_event("redis_connection_failed", error=str(e))
        return False

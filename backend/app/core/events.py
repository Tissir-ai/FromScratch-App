# app/core/events.py
import time
import redis
from typing import Generator
from app.core.config import settings

_redis: redis.Redis | None = None


def get_redis() -> redis.Redis:
    """
    Singleton Redis connection.
    IMPORTANT: settings.redis_url يجب يكون redis://redis:6379/0 داخل Docker
    """
    global _redis

    if _redis is None:
        _redis = redis.from_url(
            settings.redis_url,
            decode_responses=True,
            socket_keepalive=True,
            health_check_interval=30,
        )

    return _redis


def publish(channel: str, message: str) -> None:
    """
    Publish message to Redis Pub/Sub channel.
    """
    r = get_redis()
    r.publish(channel, message)


def subscribe(channel: str) -> Generator[str, None, None]:
    """
    Generator كيرجع messages من Redis Pub/Sub.
    مناسب للـ WebSocket (sync loop).
    """
    r = get_redis()
    pubsub = r.pubsub(ignore_subscribe_messages=True)
    pubsub.subscribe(channel)

    try:
        for msg in pubsub.listen():
            # msg = {'type': 'message', 'channel': 'run:1', 'data': '...'}
            if msg and msg.get("type") == "message":
                yield msg["data"]
            else:
                time.sleep(0.01)
    finally:
        try:
            pubsub.unsubscribe(channel)
            pubsub.close()
        except Exception:
            pass

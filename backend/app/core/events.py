from redis import Redis
from app.core.config import settings

_redis = None
def get_redis() -> Redis:
    global _redis
    if _redis is None:
        _redis = Redis.from_url(settings.redis_url, decode_responses=True)
    return _redis

def publish(channel: str, message: str):
    get_redis().publish(channel, message)

def subscribe(channel: str):
    pubsub = get_redis().pubsub()
    pubsub.subscribe(channel)
    return pubsub

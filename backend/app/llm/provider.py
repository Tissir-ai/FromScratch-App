from app.core.config import settings
try:
    import litellm
except Exception:
    litellm = None

async def llm_call(prompt: str, **kwargs) -> str:
    if litellm is None:
        return "LLM not installed; echo: " + prompt[:200]
    resp = await litellm.acompletion(model=settings.litellm_model, messages=[{"role":"user","content":prompt}], **kwargs)
    return resp["choices"][0]["message"]["content"]

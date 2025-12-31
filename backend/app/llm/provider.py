from typing import Optional, Union

from app.core.config import settings

try:
    from langchain_nvidia_ai_endpoints import ChatNVIDIA
except ImportError:
    ChatNVIDIA = None

try:
    from langchain_openai import ChatOpenAI
except ImportError:
    ChatOpenAI = None

_chat_client: Optional[Union["ChatNVIDIA", "ChatOpenAI"]] = None


def get_nvidia_client() -> "ChatNVIDIA":
    """Initialise le client NVIDIA/DeepSeek"""
    global _chat_client

    if ChatNVIDIA is None:
        raise RuntimeError("langchain_nvidia_ai_endpoints n'est pas installé")

    if _chat_client is None:
        if not settings.nvidia_api_key:
            raise RuntimeError("NVIDIA_API_KEY manquant dans l'environnement")

        if not settings.nvidia_model:
            raise RuntimeError("NVIDIA_MODEL manquant dans l'environnement")

        _chat_client = ChatNVIDIA(
            model=settings.nvidia_model,
            api_key=settings.nvidia_api_key,
            temperature=0.6,
            top_p=0.7,
            max_tokens=4096,
        )

    return _chat_client


def get_openai_client() -> "ChatOpenAI":
    """Initialise le client OpenAI/ChatGPT"""
    global _chat_client

    if ChatOpenAI is None:
        raise RuntimeError("langchain_openai n'est pas installé. Installez: pip install langchain-openai")

    if _chat_client is None:
        if not settings.openai_api_key:
            raise RuntimeError("OPENAI_API_KEY manquant dans l'environnement")

        _chat_client = ChatOpenAI(
            model=settings.litellm_model,  # ex: "gpt-4o-mini" ou "gpt-4"
            api_key=settings.openai_api_key,
            temperature=0.6,
            max_tokens=4096,
        )

    return _chat_client


def get_llm_client():
    """Retourne le bon client selon MODEL_PROVIDER dans config"""
    if settings.model_provider == "openai":
        return get_openai_client()
    elif settings.model_provider == "nvidia":
        return get_nvidia_client()
    else:
        raise ValueError(f"Provider inconnu: {settings.model_provider}. Utilisez 'openai' ou 'nvidia'")


async def llm_call(prompt: str, **kwargs) -> str:
    """
    Appel LLM unifié (OpenAI ou NVIDIA selon config).
    Utilisé par les agents (requirements_agent, etc.).
    """
    client = get_llm_client()

    # On envoie un message au format "chat"
    resp = await client.ainvoke([{"role": "user", "content": prompt}], **kwargs)

    # DeepSeek-R1 renvoie parfois un champ reasoning_content séparé
    reasoning = None
    if getattr(resp, "additional_kwargs", None):
        reasoning = resp.additional_kwargs.get("reasoning_content")

    if reasoning:
        return reasoning + "\n\n" + resp.content

    return resp.content

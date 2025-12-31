from fastapi import APIRouter, Request

router = APIRouter()

@router.post("/webhook")
async def webhook_endpoint(request: Request):
    data = await request.json()
    # TODO: Ajoutez ici la logique de traitement du webhook
    return {"status": "ok"}

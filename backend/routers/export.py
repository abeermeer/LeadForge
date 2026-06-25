from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from slowapi import Limiter
from slowapi.util import get_remote_address
from ..database import get_session
from ..workers.sheet_exporter import export_to_sheets

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("/campaigns/{campaign_id}/export")
@limiter.limit("10/minute")
async def export_campaign(
    request: Request,
    campaign_id: int,
    db: AsyncSession = Depends(get_session),
):
    sheet_url = await export_to_sheets(campaign_id, db)
    return {"sheet_url": sheet_url}

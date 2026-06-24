from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_session
from ..workers.sheet_exporter import export_to_sheets

router = APIRouter()

@router.post("/campaigns/{campaign_id}/export")
async def export_campaign(
    campaign_id: int,
    db: AsyncSession = Depends(get_session),
):
    sheet_url = await export_to_sheets(campaign_id, db)
    return {"sheet_url": sheet_url}

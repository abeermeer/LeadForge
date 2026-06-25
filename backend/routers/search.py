from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_session
from ..models.campaign import Campaign, CampaignStatus
from ..workers.grid_search import run_grid_search

router = APIRouter()

class SearchRequest(BaseModel):
    query: str
    location: str
    lat: float | None = None
    lng: float | None = None
    radius: int = 50000
    min_rating: float | None = None

@router.post("/search")
async def create_search(
    req: SearchRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_session),
):
    campaign = Campaign(
        query=req.query,
        location=req.location,
        lat=req.lat,
        lng=req.lng,
        radius=req.radius,
        min_rating=req.min_rating,
        status=CampaignStatus.PENDING.value,
    )
    db.add(campaign)
    await db.commit()
    await db.refresh(campaign)

    background_tasks.add_task(run_grid_search, campaign.id, req, db)

    return {"campaign_id": campaign.id, "status": campaign.status}

@router.get("/search/{campaign_id}")
async def get_search_status(
    campaign_id: int,
    db: AsyncSession = Depends(get_session),
):
    from sqlalchemy import select
    result = await db.execute(select(Campaign).where(Campaign.id == campaign_id))
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign.to_dict()

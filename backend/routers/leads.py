from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_session
from ..models.lead import Lead

router = APIRouter()

@router.get("/campaigns/{campaign_id}/leads")
async def get_leads(
    campaign_id: int,
    status: str | None = Query(None),
    db: AsyncSession = Depends(get_session),
):
    stmt = select(Lead).where(Lead.campaign_id == campaign_id)
    if status:
        stmt = stmt.where(Lead.email_status == status)
    result = await db.execute(stmt)
    leads = result.scalars().all()
    return [l.to_dict() for l in leads]

@router.patch("/leads/{lead_id}")
async def update_lead(
    lead_id: int,
    data: dict,
    db: AsyncSession = Depends(get_session),
):
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        return {"error": "Lead not found"}, 404
    for key, value in data.items():
        if hasattr(lead, key):
            setattr(lead, key, value)
    await db.commit()
    return lead.to_dict()

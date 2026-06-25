from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel, field_validator
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_session
from ..models.lead import Lead

router = APIRouter()

ALLOWED_FIELDS = {"email", "email_subject", "email_body", "angle_used", "email_status"}

class LeadUpdate(BaseModel):
    email: str | None = None
    email_subject: str | None = None
    email_body: str | None = None
    angle_used: str | None = None
    email_status: str | None = None

    @field_validator("email_status")
    @classmethod
    def validate_status(cls, v):
        if v is not None and v not in ("draft", "generated", "sent", "failed"):
            raise ValueError("email_status must be one of: draft, generated, sent, failed")
        return v

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
    data: LeadUpdate,
    db: AsyncSession = Depends(get_session),
):
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(lead, key, value)
    await db.commit()
    return lead.to_dict()

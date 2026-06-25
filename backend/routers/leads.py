import html
from fastapi import APIRouter, Depends, Query, HTTPException, Request
from pydantic import BaseModel, field_validator
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from slowapi import Limiter
from slowapi.util import get_remote_address
from ..database import get_session
from ..models.lead import Lead

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

ALLOWED_FIELDS = {"email", "email_subject", "email_body", "angle_used", "email_status"}

def sanitize(v: str | None) -> str | None:
    return html.escape(v) if v else v

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

    @field_validator("email", "email_subject", "email_body", "angle_used")
    @classmethod
    def sanitize_fields(cls, v):
        return sanitize(v)

@router.get("/campaigns/{campaign_id}/leads")
@limiter.limit("30/minute")
async def get_leads(
    request: Request,
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
@limiter.limit("30/minute")
async def update_lead(
    request: Request,
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

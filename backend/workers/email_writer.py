import json
import random
import os
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import async_session
from ..models.lead import Lead
from ..models.campaign import Campaign

TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "..", "templates")

def load_templates():
    templates = {}
    for fname in os.listdir(TEMPLATES_DIR):
        if fname.endswith(".json"):
            with open(os.path.join(TEMPLATES_DIR, fname)) as f:
                data = json.load(f)
                templates[data["category"]] = data
    return templates

def match_category(category: str, templates: dict) -> str:
    if not category:
        return "generic"
    cat_lower = category.lower()
    for key, tmpl in templates.items():
        for kw in tmpl.get("matches", []):
            if kw in cat_lower:
                return key
    return "generic"

def generate_email(lead_name: str, category: str, location: str, rating: float, review_count: int, templates: dict):
    cat_key = match_category(category, templates)
    tmpl_data = templates.get(cat_key, templates.get("generic"))
    angle = random.choice(tmpl_data["angles"])
    body = angle["template"].format(
        business_name=lead_name or "your business",
        category=category or "local",
        location=location or "your area",
        rating=rating or "N/A",
        review_count=review_count or "many",
    )
    subject = f"Quick question about {lead_name}"
    return subject, body, angle["name"]

async def generate_emails_for_campaign(campaign_id: int):
    async with async_session() as db:
        result = await db.execute(
            select(Lead).where(Lead.campaign_id == campaign_id, Lead.email_body == None)
        )
        leads = result.scalars().all()

        if not leads:
            return

        templates = load_templates()
        campaign_result = await db.execute(select(Campaign).where(Campaign.id == campaign_id))
        campaign = campaign_result.scalar_one_or_none()
        location = campaign.location if campaign else "your area"

        for lead in leads:
            subject, body, angle = generate_email(
                lead.name,
                lead.category or "",
                location,
                lead.rating or 0,
                lead.review_count or 0,
                templates,
            )
            lead.email_subject = subject
            lead.email_body = body
            lead.angle_used = angle
            lead.email_status = "generated"

        await db.commit()

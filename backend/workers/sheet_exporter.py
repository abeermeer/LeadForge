import json
import os
import base64
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from google.oauth2 import service_account
from googleapiclient.discovery import build
from ..database import async_session
from ..models.lead import Lead
from ..models.campaign import Campaign
from ..config import GOOGLE_SERVICE_ACCOUNT_JSON

SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

def get_service():
    if not GOOGLE_SERVICE_ACCOUNT_JSON:
        return None
    try:
        info = json.loads(base64.b64decode(GOOGLE_SERVICE_ACCOUNT_JSON).decode())
    except Exception:
        info = json.loads(GOOGLE_SERVICE_ACCOUNT_JSON)
    creds = service_account.Credentials.from_service_account_info(info, scopes=SCOPES)
    return build("sheets", "v4", credentials=creds)

async def export_to_sheets(campaign_id: int, db: AsyncSession):
    service = get_service()
    if not service:
        return "Service account not configured"

    result = await db.execute(select(Campaign).where(Campaign.id == campaign_id))
    campaign = result.scalar_one_or_none()
    if not campaign:
        return "Campaign not found"

    leads_result = await db.execute(
        select(Lead).where(Lead.campaign_id == campaign_id)
    )
    leads = leads_result.scalars().all()

    sheet_title = f"LeadForge - {campaign.query} in {campaign.location}"
    spreadsheet = {
        "properties": {"title": sheet_title[:100]},
        "sheets": [
            {
                "properties": {"title": "Leads"},
                "data": [
                    {
                        "startRow": 0,
                        "startColumn": 0,
                        "rowData": [
                            {
                                "values": [
                                    {"userEnteredValue": {"stringValue": h}}
                                    for h in ["Name", "Email", "Business", "Category", "Phone", "Subject", "Body", "Status", "Sent At"]
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }

    created = service.spreadsheets().create(body=spreadsheet).execute()
    sheet_id = created["spreadsheetId"]

    rows = []
    for lead in leads:
        rows.append([
            lead.name or "",
            lead.email or "",
            lead.name or "",
            lead.category or "",
            lead.phone or "",
            lead.email_subject or "",
            lead.email_body or "",
            lead.email_status or "draft",
            "",
        ])

    if rows:
        body = {"values": rows}
        service.spreadsheets().values().append(
            spreadsheetId=sheet_id,
            range="Leads!A2",
            valueInputOption="USER_ENTERED",
            body=body,
        ).execute()

    return f"https://docs.google.com/spreadsheets/d/{sheet_id}"

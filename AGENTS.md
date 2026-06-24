# AGENTS.md — LeadForge Project

## Project Overview
LeadForge is a lead generation + cold email outreach tool. Finds businesses on Google Maps without websites, writes personalized emails via angle-based templates, exports to Google Sheets, and provides a copy-paste Apps Script for automated sending.

## Tech Stack
- **Backend**: FastAPI (Python 3.11+)
- **Frontend**: Next.js 14 (React)
- **Database**: PostgreSQL (async via SQLAlchemy + asyncpg)
- **Queue**: Redis + RQ (background job processing)
- **APIs**: Google Places API (New), Google Sheets API
- **Deployment**: Railway.app (auto-deploy from GitHub)

## Architecture

### Data Flow
```
Search Form → POST /api/search → Grid Search Worker (Places API)
    → Filter leads (no website) → Dedup by place_id → Store in Postgres
    → Email Writer (Angle Bank) → Generate subject/body per lead
    → POST /api/export → Sheets API → New Google Sheet
    → User pastes Apps Script → Automated batch email sending
```

### API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Health check |
| POST | /api/search | Start new lead search |
| GET | /api/search/{id} | Poll campaign status |
| GET | /api/campaigns/{id}/leads | Get leads for campaign |
| PATCH | /api/leads/{id} | Update lead email fields |
| POST | /api/campaigns/{id}/export | Export to Google Sheets |

### Database Schema
**campaigns**: id, query, location, lat, lng, radius, min_rating, status, total_leads, emailed_leads, created_at, updated_at
**leads**: id, campaign_id (FK), place_id (unique), name, address, phone, email, category, rating, review_count, website_uri, has_website, email_subject, email_body, angle_used, email_status, sent_at, created_at

## Angle Bank Templates
4 category files in `backend/templates/`:
- `restaurant.json` — lost_traffic, competition, delivery_trend
- `clinic.json` — trust, booking, credibility
- `retail.json` — google_search, instagram_limits, catalog
- `generic.json` — missed_opportunity, competitor_advantage, credibility_gap

## Email Templates Pattern
Subject: `Quick question about {business_name}`
Body: Angle-specific text with {business_name}, {category}, {location}, {rating}, {review_count}
Footer: CAN-SPAM opt-out line

## Apps Script
Static file: `scripts/apps_script.gs`
Features:
- sendBatch(): sends 8 emails per trigger run, respects quota
- setupTrigger(): installs 20-min timer
- sendTest(): previews first email to yourself
- Tracks status per row, skips already-sent

## Environment Variables
```
GOOGLE_MAPS_API_KEY=your_key
GOOGLE_SERVICE_ACCOUNT_JSON=base64_or_json
DATABASE_URL=postgresql+asyncpg://...
REDIS_URL=redis://...
```

## Local Development
```bash
docker-compose up -d  # Start Postgres + Redis
cd backend && pip install -r requirements.txt
uvicorn main:app --reload --port 8000
cd frontend && npm install && npm run dev
```

## Deployment Status
- **Frontend**: Deployed on Vercel
  - URL: https://frontend-alpha-teal-72.vercel.app
  - Env: `NEXT_PUBLIC_API_URL` = backend Railway URL
- **Backend**: Deploy to Railway.app (next step)

## Deployment (Railway.app)
1. Push project to GitHub
2. Create Railway project from GitHub repo
3. Add Postgres + Redis plugins
4. Set environment variables (`GOOGLE_MAPS_API_KEY`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `DATABASE_URL`, `REDIS_URL`)
5. Deploy — Railway auto-detects services
6. Update `NEXT_PUBLIC_API_URL` on Vercel with actual Railway URL

## Compliance
- CAN-SPAM: unsubscribe link, physical address, accurate subject
- Apps Script throttles to avoid spam flags
- Dedup prevents re-contacting same business

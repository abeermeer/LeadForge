# AGENTS.md — LeadForge Project

## Project Overview
LeadForge is a lead generation + cold email outreach tool. Finds businesses on Google Maps without websites, writes personalized emails via angle-based templates, exports to Google Sheets, and provides a copy-paste Apps Script for automated sending.

## Tech Stack
- **Backend**: FastAPI (Python 3.11+, async SQLAlchemy)
- **Frontend**: Next.js 14 (React, Tailwind CSS, Framer Motion)
- **Database**: PostgreSQL (async via SQLAlchemy + asyncpg)
- **Queue**: Redis + RQ (background job processing)
- **APIs**: Google Places API (New), Google Sheets API
- **Deployment**: Railway.app (backend via Dockerfile), Vercel (frontend)

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
GOOGLE_MAPS_API_KEY=your_key                 # NOT set yet — user needs to provide
GOOGLE_SERVICE_ACCOUNT_JSON=base64_or_json   # NOT set yet — user needs to provide
DATABASE_URL=postgresql+asyncpg://...         # Railway Postgres auto-injects
REDIS_URL=redis://...                         # Railway Redis auto-injects
```

## Deployment Status
- **GitHub**: https://github.com/abeermeer/LeadForge (public, MIT)
- **Frontend**: https://frontend-alpha-teal-72.vercel.app (Vercel, deployed)
- **Backend**: https://leadforge-production-126b.up.railway.app (Railway, deployed)
  - PostgreSQL plugin: ✅ Added
  - Redis plugin: ✅ Added
  - GOOGLE_MAPS_API_KEY: ❌ Not set yet (placeholder exists)
  - GOOGLE_SERVICE_ACCOUNT_JSON: ❌ Not set yet

## Known Issues
- `config.py` auto-converts `postgresql://` → `postgresql+asyncpg://` for Railway compat
- `init_db()` gracefully degrades if DB unavailable (logs warning, server still starts)
- Railway deploys from GitHub via Dockerfile — `railway.json` configures builder

## Local Development
```bash
docker-compose up -d  # Start Postgres + Redis
cd backend && pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
cd frontend && npm install && npm run dev
```

## Next Steps (pending)
1. Set GOOGLE_MAPS_API_KEY env var on Railway (user provides key)
2. Set GOOGLE_SERVICE_ACCOUNT_JSON env var on Railway (user provides JSON)
3. Redeploy Railway service after env vars set
4. Run end-to-end test: search → generate emails → export to Sheets
5. Test Apps Script with exported Sheet

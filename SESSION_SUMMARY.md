# Session Summary — LeadForge

## Date
June 24, 2026

## What Was Built
Complete lead generation + outreach automation tool (LeadForge).

### Architecture
- **Backend**: FastAPI (Python) — handles Places API searches, email generation, Sheets export
- **Frontend**: Next.js dashboard — search form, campaign status, results table, export flow
- **Database**: Postgres — lead storage, campaign history, dedup by place_id
- **Queue**: Redis + RQ — background jobs for long-running tasks
- **Deployment**: Railway.app — all services deploy via GitHub

### Components Built
1. **Places API Grid Search** — searches Google Maps via official API, subdivides area into overlapping circles (60-result cap per query), filters out businesses WITH websites
2. **Angle Bank Email Writer** — 3 templates per category (restaurant, clinic, retail, generic) with rotating angles to avoid repetition
3. **Google Sheets Export** — exports leads + generated emails to a new Sheet via service account
4. **Static Apps Script** — quata-aware batch sender with trigger-based scheduling, status tracking, CAN-SPAM footer
5. **Next.js Dashboard** — 4-page UI with modern glassmorphism design

## File Structure
```
LeadForge/
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── config.py             # Env vars (API keys, DB URLs)
│   ├── database.py           # SQLAlchemy async engine
│   ├── models/
│   │   ├── campaign.py       # Campaign table model
│   │   └── lead.py           # Lead table model
│   ├── routers/
│   │   ├── search.py         # POST /search, GET /search/{id}
│   │   ├── leads.py          # GET /campaigns/{id}/leads, PATCH /leads/{id}
│   │   └── export.py         # POST /campaigns/{id}/export
│   ├── workers/
│   │   ├── grid_search.py    # Places API grid search + dedup
│   │   ├── email_writer.py   # Angle bank template engine
│   │   └── sheet_exporter.py # Google Sheets API export
│   ├── templates/            # Angle bank JSON files
│   │   ├── restaurant.json
│   │   ├── clinic.json
│   │   ├── retail.json
│   │   └── generic.json
│   └── requirements.txt
├── frontend/
│   ├── pages/
│   │   ├── index.js          # Search form + live polling
│   │   ├── campaigns/[id].js # Results table + edit
│   │   └── export/[id].js    # Sheet export + script display
│   ├── components/
│   │   ├── SearchForm.js
│   │   ├── ResultsTable.js
│   │   ├── ScriptDisplay.js
│   │   └── StatusBadge.js
│   └── styles/globals.css
├── scripts/
│   └── apps_script.gs        # Static Apps Script (copy-paste)
├── docker-compose.yml        # Postgres + Redis for local dev
├── railway.json              # Railway deployment config
├── SESSION_SUMMARY.md
└── AGENTS.md
```

## Key Decisions
- **Places API over scraping** — legally safe, no CAPTCHAs, stable
- **Smart templates + angle bank** — no AI API needed, category-specific copy
- **Static Apps Script** — written once, reused for every campaign
- **Railway.app hosting** — 24/7 uptime, no computer needed
- **Postgres dedup by place_id** — never re-contact same business

## Deployment Status
- **Frontend**: ✅ Deployed to Vercel
  - URL: https://frontend-alpha-teal-72.vercel.app
  - Production: https://frontend-jodg8rqp8-abeermeer1.vercel.app
  - Env: `NEXT_PUBLIC_API_URL` set to `https://leadforge-backend.railway.app`

## What's Next
1. Deploy backend to Railway.app
2. Update `NEXT_PUBLIC_API_URL` on Vercel once Railway URL is known
3. Add Google Maps API key to Railway env vars
4. Integration testing with live Places API calls
5. Test with real campaigns

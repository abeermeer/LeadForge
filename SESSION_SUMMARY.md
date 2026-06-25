# Session Summary — LeadForge (June 24, 2026)

## What Was Built
Complete lead generation + outreach automation tool (LeadForge).

### Backend (FastAPI)
- `main.py` — FastAPI entry point with lifespan, CORS, 4 routers registered
- `config.py` — Env var loading with Railway DATABASE_URL compat fix
- `database.py` — Async SQLAlchemy engine with graceful init_db() failure handling
- `models/` — Campaign + Lead SQLAlchemy async models
- `routers/` — search.py, leads.py, export.py
- `workers/` — grid_search.py (Places API), email_writer.py (angle bank), sheet_exporter.py
- `templates/` — 4 angle bank JSON files (restaurant, clinic, retail, generic)

### Frontend (Next.js 14)
- 4 pages: index, campaigns/[id], export/[id], 404
- 4 components: SearchForm, ResultsTable, ScriptDisplay, StatusBadge
- Premium redesign: Tailwind CSS, Framer Motion, Lucide icons, DM Sans, Obsidian & Gold theme
- Google Sign-In landing page with restricted domain access

### Infrastructure
- `Dockerfile` — python:3.11-slim, uvicorn on port 8000
- `railway.json` — DOCKERFILE builder, 1 replica, ON_FAILURE restart
- `.env.production` — NEXT_PUBLIC_API_URL set to Railway backend URL

## Deployment Status — **LIVE**

| Component | URL | Status |
|-----------|-----|--------|
| Frontend | https://frontend-alpha-teal-72.vercel.app | ✅ Live |
| Backend | https://leadforge-production-126b.up.railway.app | ✅ Live (health: ok) |
| GitHub | https://github.com/abeermeer/LeadForge | ✅ Public, MIT |
| PostgreSQL | Railway plugin | ✅ Added (auto-injects DATABASE_URL) |
| Redis | Railway plugin | ✅ Added (auto-injects REDIS_URL) |
| GOOGLE_MAPS_API_KEY | Railway env var | ❌ Placeholder set, needs real key |
| GOOGLE_SERVICE_ACCOUNT_JSON | Railway env var | ❌ Not set, needs service account |

## Key Commands Used
- Railway API (GraphQL) for deployment management, env var setting
- Vercel API for env var updates
- `railway link` failed — project in different workspace than CLI token
- `vercel deploy --prod` for frontend redeployment

## Key Decisions
- **Places API over scraping** — legally safe, no CAPTCHAs, stable
- **Smart templates + angle bank** — no AI API needed, category-specific copy
- **Static Apps Script** — written once, reused for every campaign
- **Railway.app hosting** — 24/7 uptime, no computer needed
- **Postgres dedup by place_id** — never re-contact same business
- **Dockerfile over Nixpacks** — reliable builds despite Railway auto-detecting Next.js

## Issues Encountered & Fixes
1. **Docker build succeeded but container crashed** — DATABASE_URL had `postgresql://` prefix instead of `postgresql+asyncpg://` for async SQLAlchemy. Fixed by auto-replacing prefix in config.py.
2. **init_db() crashed FastAPI lifespan** — If DB unavailable on startup, the whole server crashed. Fixed by wrapping in try/except with graceful warning.
3. **Railway CLI can't access LeadForge project** — Project created under different workspace. Used GraphQL API directly with service ID.
4. **Railway URL returns Next.js frontend** — Railway auto-detected Next.js from repo and deployed it. The Dockerfile-based backend was at a different URL (`leadforge-production-126b.up.railway.app`).
5. **Vercel CLI interactive prompts** — Used Vercel REST API directly to update env vars.

## Remaining Tasks
1. Get user's **Google Maps API key** → set on Railway → test Places API search
2. Get user's **Google Service Account JSON** → set on Railway → test Sheets export
3. End-to-end test: search → email generation → export → Apps Script
4. Verify Postgres/Redis worker queue works end-to-end
5. Custom domain setup (optional)

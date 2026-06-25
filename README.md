<div align="center">
  <img src="https://img.shields.io/badge/Python-3.11%2B-blue?style=flat-square&logo=python" alt="Python">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/FastAPI-0.115-green?style=flat-square&logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT License">
  <img src="https://img.shields.io/badge/status-active-success?style=flat-square" alt="Status">


  <h1>LeadForge</h1>
  <p><strong>Find businesses without websites. Generate personalized outreach. Automate via email.</strong></p>
  <p>A complete lead generation platform that finds local businesses lacking an online presence, crafts targeted cold emails using smart templates, and automates delivery through Google Sheets + Apps Script.</p>

  <p>
    <a href="#features">Features</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#deployment">Deployment</a> •
    <a href="#usage">Usage</a> •
    <a href="#api">API Reference</a> •
    <a href="#faq">FAQ</a>
  </p>
</div>

---

## Features

- **Google Places API (New)** — Search any area, filter by category and rating, no scraping
- **No-Website Detection** — Automatically filters businesses that already have a website
- **Smart Email Generation** — 3 category-specific angles per vertical (restaurant, clinic, retail, generic) with rotating templates and varied subject lines
- **Google Sheets Export** — One-click export with all leads, generated emails, and status tracking
- **Apps Script Automation** — Copy-paste script sends batch emails from your Gmail (8 per 20 min, designed with opt-out footer)
- **Duplicate Prevention** — Dedup by Google Place ID across all campaigns
- **Background Processing** — Search runs asynchronously; poll campaign status from the dashboard
- **CI/CD** — GitHub Actions runs backend + frontend tests on every push

## Architecture

```
                  ┌──────────────────────────────────────┐
                  │         Vercel (Frontend)            │
                  │       Next.js 14 Dashboard           │
                  └────────────────┬─────────────────────┘
                                   │ /api/*
                  ┌────────────────▼─────────────────────┐
                  │      Railway.app (Backend)           │
                  │           FastAPI (Python)            │
                  ├──────────────────────────────────────┤
                  │  ┌──────────────────────────────────┐  │
                  │  │ Postgres (Leads + Campaigns)    │  │
                  │  └──────────────────────────────────┘  │
                  └────────────────┬─────────────────────┘
                                   │ HTTP
    ┌──────────────────────────────┼──────────────────────────┐
    │                              │                          │
    ▼                              ▼                          ▼
Google Places API          Google Sheets API          Google Apps Script
(Lead sourcing)            (Export)                   (Email sending)
```

### Data Flow

```
Search Form → POST /api/search → Grid Search (Places API)
    → Filter businesses WITHOUT websites → Dedup by place_id
    → Generate personalized emails (Angle Bank template engine)
    → Export to Google Sheet
    → User pastes Apps Script → Automated batch emailing via Gmail
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.11+, FastAPI, SQLAlchemy 2.0 (async), PostgreSQL |
| **Frontend** | Next.js 14, React 18, Tailwind CSS, Framer Motion |
| **Background Tasks** | FastAPI BackgroundTasks (async) |
| **APIs** | Google Places API (New), Google Sheets API v4 |
| **Automation** | Google Apps Script (Gmail send, quota-aware) |
| **Infrastructure** | Railway.app, Vercel, Docker Compose (local dev) |
| **CI/CD** | GitHub Actions (backend + frontend tests on push) |
| **Testing** | pytest (backend), Jest + RTL (frontend) |

## Quick Start

### Prerequisites

- Python 3.11+, Node.js 18+
- Docker Desktop
- Google Cloud project with [Places API (New)](https://console.cloud.google.com/apis/library/places.googleapis.com) enabled
- Google Service Account with [Sheets API](https://console.cloud.google.com/apis/library/sheets.googleapis.com) enabled

### Setup

```bash
# Clone
git clone https://github.com/abeermeer/LeadForge.git
cd LeadForge

# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install

# Start local infrastructure (Postgres only)
cd ..
docker compose up -d
```

### Configuration

Create `backend/.env`:

```env
GOOGLE_MAPS_API_KEY=your_places_api_key
GOOGLE_SERVICE_ACCOUNT_JSON=your_base64_service_account_json
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/leadforge
```

### Run

```bash
# Terminal 1 — Backend
cd backend
uvicorn backend.main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

### Frontend (Vercel)

```bash
cd frontend
npm run build
vercel --prod
```

Set `NEXT_PUBLIC_API_URL` to your Railway backend URL (e.g. `https://leadforge-production-xxxx.up.railway.app`).

### Backend (Railway)

1. Push to GitHub
2. Create a Railway project → "Deploy from GitHub repo" → select `abeermeer/LeadForge`
3. Add **PostgreSQL** plugin (DATABASE_URL auto-injected)
4. Set remaining env vars: `GOOGLE_MAPS_API_KEY`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `API_KEY`
5. Railway builds using the `Dockerfile` at repo root

The included `railway.json` configures Dockerfile builder with 1 replica and ON_FAILURE restart policy.

## Usage

### 1. Search for Leads

Enter a business type (e.g. "restaurant", "dentist", "plumber") and location (e.g. "Austin, TX"). Adjust radius and minimum rating. The engine:

- Subdivides the area into overlapping circles (Places API cap: 60 results per query)
- Searches each circle
- Filters out businesses with a listed website
- Deduplicates against all previous campaigns

### 2. Review & Edit

The results table shows each lead with its generated email. You can edit subject lines and body text inline. Each lead gets a personalized email from a rotating angle bank:

| Vertical | Angles |
|----------|--------|
| **Restaurants / Cafes** | Lost traffic, competition edge, delivery trends |
| **Clinics / Salons** | Trust building, online booking, credibility |
| **Retail / Shops** | Google visibility, Instagram limits, product catalog |
| **Generic** | Missed opportunity, competitor advantage, credibility gap |

### 3. Export

Click "Export to Sheets" to create a new Google Sheet with all leads, generated emails, and status tracking. The sheet includes columns for tracking send status (draft → generated → sent → failed).

### 4. Automate Sending

1. Open the exported Google Sheet
2. **Extensions → Apps Script**
3. Delete default code, paste `scripts/apps_script.gs`
4. Set `SENDER_NAME` to your name
5. Run `setupTrigger()` once

Emails send in batches of 8 every 20 minutes, respecting Gmail's 100/day quota (free accounts). Upgrade to Google Workspace for higher limits.

## API Reference

All endpoints (except `/api/health`) require `X-API-Key` header if `API_KEY` is set. POST `/api/search` is rate-limited to 5 requests per minute.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check (no auth required) |
| `POST` | `/api/search` | Create search campaign (rate-limited: 5/min) |
| `GET` | `/api/search/{id}` | Poll campaign status |
| `GET` | `/api/campaigns/{id}/leads` | List leads for campaign |
| `PATCH` | `/api/leads/{id}` | Update lead email fields |
| `POST` | `/api/campaigns/{id}/export` | Export to Google Sheets |

### POST /api/search

```json
{
  "query": "pizza",
  "location": "New York, NY",
  "lat": 40.7128,
  "lng": -74.006,
  "radius": 50000,
  "min_rating": 3.5
}
```

Returns `{"campaign_id": 1, "status": "pending"}`.

### PATCH /api/leads/{id}

Allowlisted fields: `email`, `email_subject`, `email_body`, `angle_used`, `email_status`.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_MAPS_API_KEY` | Google Places API (New) key | ✅ |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Service account key (base64 or raw JSON) | ✅ |
| `API_KEY` | API key for auth (set to enable) | ❌ |
| `DATABASE_URL` | PostgreSQL with async driver | ✅ |
| `NEXT_PUBLIC_API_URL` | Backend URL (frontend only) | ✅ |

## Project Structure

```
LeadForge/
├── backend/
│   ├── main.py                  # FastAPI entry point
│   ├── config.py                # Environment config
│   ├── auth.py                  # API key authentication
│   ├── database.py              # SQLAlchemy async engine
│   ├── models/
│   │   ├── campaign.py          # Campaign table model
│   │   └── lead.py              # Lead table model
│   ├── routers/
│   │   ├── search.py            # POST /api/search, GET /api/search/{id}
│   │   ├── leads.py             # GET /api/campaigns/{id}/leads, PATCH /leads/{id}
│   │   └── export.py            # POST /api/campaigns/{id}/export
│   ├── workers/
│   │   ├── grid_search.py       # Places API grid search + dedup
│   │   ├── email_writer.py      # Angle bank template engine
│   │   └── sheet_exporter.py    # Google Sheets export
│   └── templates/               # Angle bank JSON files
├── frontend/
│   ├── pages/
│   │   ├── index.js
│   │   ├── campaigns/[id].js
│   │   └── export/[id].js
│   ├── components/
│   │   ├── SearchForm.js
│   │   ├── ResultsTable.js
│   │   ├── ScriptDisplay.js
│   │   └── StatusBadge.js
│   └── styles/
├── scripts/
│   └── apps_script.gs
├── docker-compose.yml
├── Dockerfile
├── railway.json
└── .gitignore
```

## Limitations

| Area | Detail |
|------|--------|
| **Gmail quota** | 100 emails/day for free accounts. Google Workspace removes this |
| **Places API cap** | 60 results per query. Grid search covers large areas with overlapping circles |
| **Email discovery** | Google Maps doesn't expose emails. Manual entry may be needed |
| **Places API costs** | Free tier covers ~$200/month usage (~50,000+ text searches) |

## FAQ

**Places API vs scraping?**  
Scraping violates Google ToS, gets IPs banned, and breaks on UI changes. Places API is legal, stable, and returns structured data.

**Do I need an AI key?**  
No. Email generation uses category-specific angle banks with rotating templates. No AI API required.

**How are emails sent?**  
Leads export to Google Sheets → paste the provided Apps Script → run `setupTrigger()`. It sends 8 emails every 20 minutes from your Gmail account.

**Duplicate prevention?**  
Deduplication is enforced at the database level with a unique constraint on Google Place ID. Never contact the same business twice.

**Is this CAN-SPAM compliant?**  
The generated emails include an unsubscribe option and sender identity as a good-faith effort. Consult a legal professional to ensure your specific use case meets compliance requirements.

## License

MIT License — see [LICENSE](LICENSE).

---

<div align="center">
  <sub>Built with Python, Next.js, Google APIs, and ❤️</sub>
</div>

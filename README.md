<div align="center">
  <h1>LeadForge</h1>
  <p><strong>Find local businesses without websites. Generate personalized outreach. Automate via Google Sheets.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Python-3.11%2B-blue?style=flat-square&logo=python" alt="Python">
    <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" alt="Next.js">
    <img src="https://img.shields.io/badge/FastAPI-0.115+-green?style=flat-square&logo=fastapi" alt="FastAPI">
    <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="MIT License">
    <img src="https://img.shields.io/badge/status-active-brightgreen?style=flat-square" alt="Status">
  </p>

  <p>
    <a href="#features">Features</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#deployment">Deployment</a> •
    <a href="#usage">Usage</a> •
    <a href="#faq">FAQ</a>
  </p>
</div>

---

## Features

- 🔍 **Google Places API Integration** — Search any area for businesses, filter by category and rating
- 🚫 **No-Website Detection** — Automatically filters out businesses that already have a website
- 🧠 **Smart Email Generation** — Category-specific angle banks (restaurants, clinics, retail, generic) with rotating templates
- 📊 **Google Sheets Export** — One-click export with all leads, generated emails, and status tracking
- 🤖 **Apps Script Automation** — Copy-paste script sends emails in batches, respects Gmail quotas, tracks delivery
- 🎯 **Duplicate Prevention** — Dedup by Google Place ID across all campaigns
- 🌐 **Next-Gen UI** — Glassmorphism design dashboard with real-time progress tracking

## Architecture

```
                     ┌──────────────────────────────────────┐
                     │         Vercel (Frontend)            │
                     │       Next.js Dashboard              │
                     └────────────────┬─────────────────────┘
                                      │ API calls
                     ┌────────────────▼─────────────────────┐
                     │      Railway.app (Backend)           │
                     │           FastAPI                     │
                     ├──────────────────────────────────────┤
                     │  ┌──────────┐  ┌──────────────────┐  │
                     │  │ Postgres │  │ Redis + RQ       │  │
                     │  │ (Leads)  │  │ (Job Queue)      │  │
                     │  └──────────┘  └──────────────────┘  │
                     └────────────────┬─────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
          ▼                           ▼                           ▼
  Google Places API          Google Sheets API           Google Apps Script
  (Lead sourcing)            (Export)                    (Email sending)
```

### Data Flow

```
Search Form → POST /api/search → Grid Search (Places API)
    → Filter businesses WITHOUT websites → Dedup by place_id
    → Generate personalized emails (Angle Bank)
    → Export to Google Sheet
    → User pastes Apps Script → Automated batch emailing
```

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Backend** | Python 3.11+, FastAPI, SQLAlchemy (async), PostgreSQL |
| **Frontend** | Next.js 14, React 18, CSS3 (Glassmorphism) |
| **Queue** | Redis, RQ (background job processing) |
| **APIs** | Google Places API (New), Google Sheets API |
| **Automation** | Google Apps Script (static, sent via Gmail) |
| **Deployment** | Vercel (frontend), Railway.app (backend + DB + Redis) |

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker Desktop (for local Postgres + Redis)
- Google Cloud project with Places API enabled
- Google Service Account with Sheets API access

### 1. Clone & Install

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### 2. Start Local Infrastructure

```bash
docker compose up -d
```

### 3. Configure Environment

Create `backend/.env`:

```env
GOOGLE_MAPS_API_KEY=your_places_api_key
GOOGLE_SERVICE_ACCOUNT_JSON=your_base64_service_account_json
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/leadforge
REDIS_URL=redis://localhost:6379/0
```

### 4. Run

```bash
# Terminal 1 — Backend
cd backend
uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Frontend (Vercel)

```bash
cd frontend
vercel --prod
```

Set environment variable `NEXT_PUBLIC_API_URL` to your Railway backend URL.

### Backend (Railway.app)

1. Push repo to GitHub
2. Create new Railway project → "Deploy from GitHub repo"
3. Add **Postgres** and **Redis** plugins
4. Set environment variables:
   - `GOOGLE_MAPS_API_KEY`
   - `GOOGLE_SERVICE_ACCOUNT_JSON`
   - `DATABASE_URL` (auto-provided by Railway Postgres plugin)
   - `REDIS_URL` (auto-provided by Railway Redis plugin)
5. Deploy — Railway auto-detects the Python service

## Usage

### 1. Search for Leads

Enter a business type (e.g. "restaurant", "plumber", "dentist") and a location (e.g. "Austin, TX"). Adjust radius and minimum rating. The system will:

- Subdivide the area into overlapping circles (Places API cap: 60 results per query)
- Search each circle for matching businesses
- Filter out any business with a listed website
- Deduplicate against previous campaigns

### 2. Generate Emails

Review the results table. Each lead gets a personalized email generated from our angle bank:

| Category | Angles |
|----------|--------|
| **Restaurants/Cafes** | Lost traffic, competition, delivery trends |
| **Clinics/Salons** | Trust, online booking, credibility |
| **Retail/Shops** | Google search, Instagram limits, product catalog |
| **Generic** | Missed opportunity, competitor advantage, credibility gap |

You can edit subject lines and body text in-line before exporting.

### 3. Export to Google Sheets

Click "Export" to create a new Google Sheet with all leads, generated emails, and status tracking columns.

### 4. Deploy the Apps Script

1. Open the exported Google Sheet
2. Go to **Extensions → Apps Script**
3. Delete default code, paste the script from `scripts/apps_script.gs`
4. Set `SENDER_NAME` to your name
5. Click **Save**
6. Run `setupTrigger()` once

Emails will send automatically in batches of 8 every 20 minutes, respecting Gmail's daily quota (100/day for free accounts).

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_MAPS_API_KEY` | Places API key | ✅ |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Service account JSON (base64 or raw) | ✅ |
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `REDIS_URL` | Redis connection string | ✅ |
| `NEXT_PUBLIC_API_URL` | Backend URL (frontend only) | ✅ |

## Project Structure

```
LeadForge/
├── backend/                    # FastAPI backend
│   ├── main.py                # Entry point
│   ├── config.py              # Environment config
│   ├── database.py            # SQLAlchemy async engine
│   ├── models/
│   │   ├── campaign.py        # Campaign schema
│   │   └── lead.py            # Lead schema
│   ├── routers/
│   │   ├── search.py          # POST /api/search
│   │   ├── leads.py           # GET /api/campaigns/{id}/leads
│   │   └── export.py          # POST /api/campaigns/{id}/export
│   ├── workers/
│   │   ├── grid_search.py     # Places API grid search
│   │   ├── email_writer.py    # Angle bank template engine
│   │   └── sheet_exporter.py  # Google Sheets export
│   └── templates/             # Angle bank JSON files
├── frontend/                   # Next.js dashboard
│   ├── pages/
│   ├── components/
│   └── styles/
├── scripts/
│   └── apps_script.gs         # Static Apps Script
├── docker-compose.yml         # Local Postgres + Redis
├── railway.json               # Railway config
├── SESSION_SUMMARY.md
└── AGENTS.md
```

## Compliance

- **CAN-SPAM**: Every email includes an unsubscribe option and sender identity
- **Rate Limiting**: Apps Script batches sends (8 per 20 min) to protect sender reputation
- **Deduplication**: Never re-contacts the same business across campaigns
- **Data Privacy**: Lead data stored in your own Postgres database

## Limitations

| Limitation | Detail |
|-----------|--------|
| **Gmail free quota** | 100 emails/day per account. Use Google Workspace for higher limits |
| **Places API cap** | 60 results per query. Grid search compensates for full coverage |
| **Email availability** | Google Maps doesn't expose emails — manual entry may be needed |
| **API costs** | Places API charges per request (~$3-5/1000 leads at Contact Data tier) |

## FAQ

**Q: Why Places API instead of scraping Google Maps?**
A: Scraping violates Google's ToS, gets IPs banned, and breaks when Maps updates its UI. Places API is legal, stable, and returns clean structured data.

**Q: Do I need an AI API key?**
A: No. Emails use smart templates with category-specific angles — no AI API required.

**Q: How many leads can I find per search?**
A: Depends on the area and category. Grid search covers large areas by dividing them into overlapping circles. Typical results: 50-500 leads per city.

**Q: How does email sending work?**
A: You export leads to Google Sheets, paste the provided Apps Script, and run `setupTrigger()`. It sends 8 emails every 20 minutes from your Gmail.

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <p>Built with Python, Next.js, and Google APIs</p>
</div>

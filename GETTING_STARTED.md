# Getting Started with LeadForge

## What you need

- **Python 3.11+** installed
- **Node.js 18+** installed
- **Docker Desktop** installed (free)
- A **Google Cloud API key** (free with $200/month credit)

---

## Step 1: Download the project

```bash
git clone https://github.com/abeermeer/LeadForge.git
cd LeadForge
```

## Step 2: Install everything

```bash
# Install backend
cd backend
pip install -r requirements.txt

# Install frontend
cd ../frontend
npm install
```

## Step 3: Start the database

```bash
# Go back to main folder
cd ..
# Start Postgres (wait a few seconds)
docker compose up -d
```

## Step 4: Add your API key

Copy the example file:
```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` in any text editor and paste your Google Maps API key.

**Don't have a key?**
1. Go to https://console.cloud.google.com
2. Enable "Places API (New)"
3. Go to Credentials → Create API Key
4. Copy the key and paste it in `.env`

## Step 5: Run the app

Open **two terminal windows**:

**Terminal 1 — Backend:**
```bash
cd backend
uvicorn backend.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

## Step 6: Open in browser

Visit **http://localhost:3000**

---

## How it works

1. **Search** — Enter "restaurant" and "New York", click Find Leads
2. **Review** — See businesses without websites, edit emails
3. **Export** — Click export to create a Google Sheet
4. **Send** — Paste the Apps Script into the sheet to automate emails

## Need help?

Open an issue on GitHub: https://github.com/abeermeer/LeadForge/issues

---

*This project is MIT licensed — free to use, modify, and share.*

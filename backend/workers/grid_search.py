import asyncio
import aiohttp
import math
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import async_session
from ..models.campaign import Campaign, CampaignStatus
from ..models.lead import Lead
from ..config import GOOGLE_MAPS_API_KEY, MAX_RESULTS_PER_QUERY, SEARCH_RADIUS_METERS, OVERLAP_FACTOR

PLACES_API_BASE = "https://places.googleapis.com/v1/places:searchText"
FIELDS_MASK = "places.id,places.displayName,places.formattedAddress,places.internationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.primaryType"

def grid_circles(lat: float, lng: float, radius_m: int, step_m: int | None = None):
    if step_m is None:
        step_m = int(radius_m * OVERLAP_FACTOR)
    circles = []
    dlat = step_m / 111320
    dlng = step_m / (111320 * abs(math.cos(math.radians(lat))) + 1e-6)
    rlat = radius_m / 111320
    rlng = radius_m / (111320 * abs(math.cos(math.radians(lat))) + 1e-6)
    lat_start = lat - rlat
    lat_end = lat + rlat
    lng_start = lng - rlng
    lng_end = lng + rlng
    lat_c = lat_start
    while lat_c <= lat_end:
        lng_c = lng_start
        while lng_c <= lng_end:
            circles.append((round(lat_c, 6), round(lng_c, 6)))
            lng_c += dlng
        lat_c += dlat
    return circles

async def search_places(session: aiohttp.ClientSession, lat: float, lng: float, query: str, radius: int, min_rating: float | None = None):
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": FIELDS_MASK,
    }
    body = {
        "textQuery": query,
        "locationBias": {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": min(radius, SEARCH_RADIUS_METERS),
            }
        },
        "pageSize": MAX_RESULTS_PER_QUERY,
    }
    if min_rating:
        body["minRating"] = min_rating

    try:
        async with session.post(PLACES_API_BASE, json=body, headers=headers) as resp:
            if resp.status != 200:
                return []
            data = await resp.json()
            places = data.get("places", [])
            return places
    except Exception:
        return []

async def run_grid_search(campaign_id: int, req, db_session: AsyncSession):
    async with async_session() as db:
        result = await db.execute(select(Campaign).where(Campaign.id == campaign_id))
        campaign = result.scalar_one_or_none()
        if not campaign:
            return

        campaign.status = CampaignStatus.RUNNING.value
        await db.commit()

        lat = req.lat or 40.7128
        lng = req.lng or -74.0060
        radius = req.radius or 50000

        centers = grid_circles(lat, lng, radius)
        seen_place_ids = set()

        existing = await db.execute(select(Lead.place_id))
        for row in existing:
            seen_place_ids.add(row[0])

        all_leads = []
        async with aiohttp.ClientSession() as session:
            tasks = []
            for clat, clng in centers:
                tasks.append(search_places(session, clat, clng, req.query, radius, req.min_rating))
            batch_size = 5
            for i in range(0, len(tasks), batch_size):
                batch = tasks[i:i+batch_size]
                results = await asyncio.gather(*batch)
                for places in results:
                    for place in places:
                        pid = place.get("id")
                        if not pid or pid in seen_place_ids:
                            continue
                        seen_place_ids.add(pid)
                        website = place.get("websiteUri") or ""
                        has_web = bool(website.strip())
                        if has_web:
                            continue
                        cat = place.get("primaryType") or place.get("displayName", {}).get("text", "")
                        name = place.get("displayName", {}).get("text", "Unknown")
                        lead = Lead(
                            campaign_id=campaign_id,
                            place_id=pid,
                            name=name,
                            address=place.get("formattedAddress", ""),
                            phone=place.get("internationalPhoneNumber", ""),
                            category=cat,
                            rating=place.get("rating"),
                            review_count=place.get("userRatingCount"),
                            website_uri=website,
                            has_website=has_web,
                            email_status="no_email",
                        )
                        db.add(lead)
                        all_leads.append(pid)
                await db.commit()

        campaign.total_leads = len(all_leads)
        campaign.status = CampaignStatus.COMPLETED.value
        await db.commit()

from httpx import ASGITransport, AsyncClient

async def test_health_no_auth(app):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/health")
    assert resp.status_code == 200
    assert "status" in resp.json()

async def test_search_needs_auth_when_key_set(app_with_key):
    transport = ASGITransport(app=app_with_key)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/api/search", json={
            "query": "pizza", "location": "NYC", "radius": 5000
        })
    assert resp.status_code == 401

async def test_search_with_valid_key(app_with_key):
    transport = ASGITransport(app=app_with_key)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/api/search", json={
            "query": "pizza", "location": "NYC", "radius": 5000
        }, headers={"X-API-Key": "test-key-123"})
    assert resp.status_code in (200, 422)

async def test_health_no_auth_when_key_set(app_with_key):
    transport = ASGITransport(app=app_with_key)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/health")
    assert resp.status_code == 200

import pytest
from httpx import AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_health_check():
    """ヘルスチェックAPIのテスト"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "service" in data


@pytest.mark.asyncio
async def test_cors_headers():
    """CORSヘッダーのテスト"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.options(
            "/api/health",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET"
            }
        )
        
        # CORSが正しく設定されていることを確認
        assert response.status_code == 200


@pytest.mark.asyncio
async def test_docs_endpoint():
    """APIドキュメントエンドポイントのテスト"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/docs")
        
        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]


@pytest.mark.asyncio
async def test_invalid_endpoint():
    """存在しないエンドポイントのテスト"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/invalid-endpoint")
        
        assert response.status_code == 404
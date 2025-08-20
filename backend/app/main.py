from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# FastAPIアプリケーションの作成
app = FastAPI(
    title="里山ドッグラン管理システムAPI",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 基本ルートエンドポイント
@app.get("/")
async def root():
    return {
        "message": "里山ドッグラン管理システム API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/api/docs"
    }

# ヘルスチェックエンドポイント
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "里山ドッグラン管理システムAPI"}

@app.get("/health")
async def health_simple():
    return {"status": "ok"}

# APIルーターのインポートと登録
from app.api.v1 import auth, applications, dogs, users, files, posts, events, entries, announcements

app.include_router(auth.router)
app.include_router(applications.router)
app.include_router(dogs.router)
app.include_router(users.router)
app.include_router(files.router)
app.include_router(posts.router)
app.include_router(events.router)
app.include_router(entries.router)
app.include_router(announcements.router)
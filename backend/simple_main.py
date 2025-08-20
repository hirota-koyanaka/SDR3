from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 基本的なFastAPIアプリの作成
app = FastAPI(title="里山ドッグラン管理システム")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "里山ドッグラン管理システム API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "API is healthy"}

# ドキュメントのルート
@app.get("/api/docs")
async def custom_docs():
    return {"message": "API Documentation", "docs_url": "/docs"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
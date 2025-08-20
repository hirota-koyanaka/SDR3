"""
Vercel用エントリーポイント
FastAPIアプリケーションをVercelのサーバーレス関数として動作させる
"""
import sys
from pathlib import Path

# プロジェクトのルートパスをsys.pathに追加
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.main import app

# Vercelのサーバーレス関数として動作
handler = app
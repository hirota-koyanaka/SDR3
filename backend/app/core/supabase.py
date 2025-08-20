from supabase import create_client, Client
from app.core.config import settings

# Supabaseクライアントの作成
supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_KEY
)

def get_supabase_client() -> Client:
    """Supabaseクライアントを取得"""
    return supabase
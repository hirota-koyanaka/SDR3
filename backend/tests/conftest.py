import pytest
import asyncio
from typing import Dict, Any
from unittest.mock import MagicMock

# テスト用の設定
pytest_plugins = ('pytest_asyncio',)


@pytest.fixture(scope="session")
def event_loop():
    """テスト用のイベントループを提供"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def mock_supabase():
    """Supabaseクライアントのモック"""
    mock = MagicMock()
    
    # テーブル操作のモック
    mock.table.return_value.select.return_value.execute.return_value.data = []
    mock.table.return_value.insert.return_value.execute.return_value.data = [{"id": "test-id"}]
    mock.table.return_value.update.return_value.execute.return_value.data = [{"id": "test-id"}]
    mock.table.return_value.delete.return_value.execute.return_value.data = [{"id": "test-id"}]
    
    # 認証のモック
    mock.auth.sign_up.return_value.user.id = "test-user-id"
    mock.auth.sign_in_with_password.return_value.session.access_token = "test-token"
    mock.auth.get_user.return_value.user.id = "test-user-id"
    
    return mock


@pytest.fixture
def sample_user() -> Dict[str, Any]:
    """テスト用ユーザーデータ"""
    return {
        "id": "test-user-id",
        "auth_id": "test-auth-id",
        "email": "test@example.com",
        "name": "テストユーザー",
        "phone": "090-1234-5678",
        "address": "愛媛県今治市",
        "is_imabari_resident": True,
        "residence_years": 5,
        "status": "active"
    }


@pytest.fixture
def sample_dog() -> Dict[str, Any]:
    """テスト用犬データ"""
    return {
        "id": "test-dog-id",
        "user_id": "test-user-id",
        "name": "ポチ",
        "breed": "柴犬",
        "weight": 10.5,
        "gender": "オス",
        "birth_date": "2020-01-01",
        "personality": "人懐っこい",
        "is_active": True
    }


@pytest.fixture
def sample_application() -> Dict[str, Any]:
    """テスト用申請データ"""
    return {
        "id": "test-application-id",
        "email": "test@example.com",
        "name": "テストユーザー",
        "phone": "090-1234-5678",
        "address": "愛媛県今治市",
        "is_imabari_resident": True,
        "residence_years": 5,
        "status": "pending"
    }


@pytest.fixture
def sample_post() -> Dict[str, Any]:
    """テスト用投稿データ"""
    return {
        "id": "test-post-id",
        "user_id": "test-user-id",
        "content": "テスト投稿です",
        "category": "general",
        "status": "approved"
    }


@pytest.fixture
def sample_event() -> Dict[str, Any]:
    """テスト用イベントデータ"""
    return {
        "id": "test-event-id",
        "title": "テストイベント",
        "description": "テスト用のイベントです",
        "event_date": "2024-12-25T10:00:00",
        "location": "里山ドッグラン",
        "max_participants": 20,
        "created_by": "test-admin-id"
    }
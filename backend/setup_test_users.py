#!/usr/bin/env python3
"""
テストユーザー作成スクリプト
里山ドッグラン管理システムのテスト用アカウントを作成します
"""

import asyncio
import os
import sys
from pathlib import Path

# プロジェクトのルートディレクトリをPythonパスに追加
sys.path.insert(0, str(Path(__file__).parent))

from app.core.database import get_db
from app.models.user import User
from app.core.security import get_password_hash
from datetime import datetime
import uuid


async def create_test_users():
    """テストユーザーを作成"""
    
    # テストユーザーのデータ
    test_users = [
        {
            "email": "admin@satoyama-dogrun.jp",
            "password": "Admin123!@#",
            "name": "管理者太郎",
            "phone": "090-1234-5678",
            "address": "愛媛県今治市管理町1-2-3",
            "postal_code": "794-0000",
            "is_imabari_resident": True,
            "residence_years": 10,
            "role": "admin",
            "is_verified": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "email": "user@example.com",
            "password": "User123!@#",
            "name": "今治花子",
            "phone": "090-9876-5432",
            "address": "愛媛県今治市ユーザー町4-5-6",
            "postal_code": "794-0001",
            "is_imabari_resident": True,
            "residence_years": 5,
            "role": "user",
            "is_verified": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "email": "test@example.com",
            "password": "Test123!@#",
            "name": "テスト次郎",
            "phone": "090-1111-2222",
            "address": "愛媛県今治市テスト町7-8-9",
            "postal_code": "794-0002",
            "is_imabari_resident": True,
            "residence_years": 3,
            "role": "user",
            "is_verified": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    print("=" * 60)
    print("里山ドッグラン管理システム - テストユーザー作成")
    print("=" * 60)
    
    # データベース接続
    async for db in get_db():
        try:
            for user_data in test_users:
                # 既存ユーザーチェック
                existing_user = db.query(User).filter(
                    User.email == user_data["email"]
                ).first()
                
                if existing_user:
                    print(f"⚠️  ユーザー {user_data['email']} は既に存在します")
                    continue
                
                # パスワードハッシュ化
                hashed_password = get_password_hash(user_data["password"])
                
                # ユーザー作成
                new_user = User(
                    id=str(uuid.uuid4()),
                    email=user_data["email"],
                    hashed_password=hashed_password,
                    name=user_data["name"],
                    phone=user_data["phone"],
                    address=user_data["address"],
                    postal_code=user_data["postal_code"],
                    is_imabari_resident=user_data["is_imabari_resident"],
                    residence_years=user_data["residence_years"],
                    role=user_data["role"],
                    is_verified=user_data["is_verified"],
                    created_at=user_data["created_at"],
                    updated_at=user_data["updated_at"]
                )
                
                db.add(new_user)
                db.commit()
                
                print(f"✅ ユーザー作成成功: {user_data['email']}")
                print(f"   パスワード: {user_data['password']}")
                print(f"   権限: {user_data['role']}")
                print("-" * 40)
            
            print("\n" + "=" * 60)
            print("テストアカウント情報")
            print("=" * 60)
            print("\n【管理者アカウント】")
            print("メールアドレス: admin@satoyama-dogrun.jp")
            print("パスワード: Admin123!@#")
            print("\n【一般ユーザーアカウント】")
            print("メールアドレス: user@example.com")
            print("パスワード: User123!@#")
            print("\n【テストアカウント（未承認）】")
            print("メールアドレス: test@example.com")
            print("パスワード: Test123!@#")
            print("\n" + "=" * 60)
            print("✅ テストユーザーの作成が完了しました！")
            print("=" * 60)
            
        except Exception as e:
            print(f"❌ エラーが発生しました: {e}")
            db.rollback()
        finally:
            db.close()
            break


if __name__ == "__main__":
    asyncio.run(create_test_users())
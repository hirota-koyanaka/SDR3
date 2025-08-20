#!/usr/bin/env python3
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# 環境変数を読み込み
load_dotenv()

# Supabaseクライアントを作成
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

print("Checking Supabase tables...")

# applicationsテーブルの存在を確認
try:
    result = supabase.table("applications").select("*").limit(1).execute()
    print("✓ applications table exists")
    
    # カラム情報を取得するためのダミーデータを挿入して取得
    if not result.data:
        print("  No data in applications table")
except Exception as e:
    print(f"✗ applications table error: {e}")

# profilesテーブルの存在を確認
try:
    result = supabase.table("profiles").select("*").limit(1).execute()
    print("✓ profiles table exists")
except Exception as e:
    print(f"✗ profiles table error: {e}")

# dogsテーブルの存在を確認
try:
    result = supabase.table("dogs").select("*").limit(1).execute()
    print("✓ dogs table exists")
except Exception as e:
    print(f"✗ dogs table error: {e}")

print("\nNote: If tables don't exist, you need to run the migration script on your Supabase dashboard.")
print("Go to: https://supabase.com/dashboard/project/hoechpkznbpavyozjqni/sql/new")
print("And run the SQL from: supabase/migrations/001_initial_schema.sql")
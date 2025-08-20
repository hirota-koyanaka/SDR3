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

print("Checking applications table structure...")

# テーブルから1行取得して構造を確認
try:
    # 仮のデータを挿入してエラーメッセージから構造を推測
    test_data = {
        "name": "test",
        "email": "test@test.com",
        "phone": "0901234567"
    }
    result = supabase.table("applications").insert(test_data).execute()
    
    if result.data:
        print("Successfully inserted. Table columns:")
        for key in result.data[0].keys():
            print(f"  - {key}")
        
        # 削除
        supabase.table("applications").delete().eq("id", result.data[0]["id"]).execute()
    
except Exception as e:
    print(f"Error: {e}")
    
    # 最小限のデータで試す
    print("\nTrying minimal data...")
    try:
        test_data = {"test": "test"}
        result = supabase.table("applications").insert(test_data).execute()
        if result.data:
            print("Table accepts any data. Columns in response:")
            for key in result.data[0].keys():
                print(f"  - {key}")
            # 削除
            supabase.table("applications").delete().eq("id", result.data[0]["id"]).execute()
    except Exception as e2:
        print(f"Error with minimal data: {e2}")

# 既存のデータを取得
print("\nFetching existing data...")
try:
    result = supabase.table("applications").select("*").limit(1).execute()
    if result.data and len(result.data) > 0:
        print("Existing columns:")
        for key in result.data[0].keys():
            print(f"  - {key}: {type(result.data[0][key]).__name__}")
    else:
        print("No data in applications table")
except Exception as e:
    print(f"Error fetching data: {e}")
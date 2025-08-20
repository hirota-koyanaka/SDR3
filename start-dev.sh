#!/bin/bash

# 里山ドッグラン開発環境起動スクリプト
echo "🐕 里山ドッグラン開発環境を起動しています..."

# 現在のディレクトリを保存
ORIGINAL_DIR=$(pwd)
PROJECT_ROOT="/Users/hirotakoyanaka/Desktop/Tech0/里山ドッグラン3"

# プロジェクトルートに移動
cd "$PROJECT_ROOT"

# バックエンド環境チェック
echo "📡 バックエンド環境をチェック中..."
if [ ! -d "backend/venv" ]; then
    echo "🔧 Python仮想環境を作成中..."
    cd backend/
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# フロントエンド依存関係チェック
echo "🌐 フロントエンド環境をチェック中..."
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 npm依存関係をインストール中..."
    cd frontend/
    npm install
    cd ..
fi

# 環境変数ファイルチェック
echo "⚙️ 環境設定をチェック中..."
if [ ! -f "backend/.env" ]; then
    echo "❌ backend/.env が見つかりません。"
    echo "setup_instructions.md を参照してSupabase設定を完了してください。"
    exit 1
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "❌ frontend/.env.local が見つかりません。"
    echo "setup_instructions.md を参照してフロントエンド設定を完了してください。"
    exit 1
fi

# 3つのサーバーを起動
echo "🚀 3つのサーバーを起動中..."

# バックエンドAPIサーバー (Port 8000)
echo "📡 バックエンドAPI起動中 (Port 8000)..."
osascript -e 'tell app "Terminal" to do script "cd \"'$PROJECT_ROOT'/backend\" && source venv/bin/activate && ./run_dev.sh"'

# ユーザー画面フロントエンド (Port 3001)
echo "👤 ユーザー画面起動中 (Port 3001)..."
osascript -e 'tell app "Terminal" to do script "cd \"'$PROJECT_ROOT'/frontend\" && npm run dev"'

# 管理画面フロントエンド (Port 3002)
echo "🔧 管理画面起動中 (Port 3002)..."
osascript -e 'tell app "Terminal" to do script "cd \"'$PROJECT_ROOT'/frontend\" && PORT=3002 npm run dev"'

# 起動完了待機
echo "⏳ サーバー起動完了まで30秒待機中..."
sleep 30

# ブラウザでページを開く
echo "🌐 ブラウザでページを開いています..."
open "http://localhost:3001"
open "http://localhost:3002/admin"
open "http://localhost:8000/docs"

echo ""
echo "✅ 里山ドッグラン開発環境の起動が完了しました！"
echo ""
echo "📱 アクセスURL:"
echo "   ユーザー画面: http://localhost:3001"
echo "   管理画面:     http://localhost:3002/admin"
echo "   API文書:      http://localhost:8000/docs"
echo "   Supabase:     https://hoechpkznbpavyozjqni.supabase.co"
echo ""
echo "🔑 管理者ログイン:"
echo "   Email: kynk.0222@gmail.com"
echo "   Password: setup_instructions.mdを参照"
echo ""
echo "🛑 サーバーを停止するには、各ターミナルでCtrl+Cを押してください。"

# 元のディレクトリに戻る
cd "$ORIGINAL_DIR"
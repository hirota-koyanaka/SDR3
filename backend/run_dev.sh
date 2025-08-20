#!/bin/bash

# 里山ドッグラン管理システム 開発サーバー起動スクリプト

echo "🐕 里山ドッグラン管理システム - 開発サーバー起動"
echo "================================================="

# 仮想環境が存在するかチェック
if [ ! -d "venv" ]; then
    echo "📦 Python仮想環境を作成中..."
    python3 -m venv venv
fi

# 仮想環境を有効化
echo "🔧 仮想環境を有効化中..."
source venv/bin/activate

# 依存関係をインストール
echo "📚 依存パッケージをインストール中..."
pip install -r requirements.txt

# 環境変数チェック
if [ ! -f ".env" ]; then
    echo "❌ .envファイルが見つかりません"
    echo "   .env.exampleをコピーして.envを作成し、Supabaseの設定を入力してください"
    exit 1
fi

# 開発サーバーを起動
echo "🚀 開発サーバーを起動中..."
echo "   API URL: http://localhost:8000"
echo "   API Docs: http://localhost:8000/api/docs"
echo "   停止する場合はCtrl+Cを押してください"
echo ""

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
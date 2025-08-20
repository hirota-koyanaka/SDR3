# 里山ドッグラン管理システム

愛媛県今治市の自然豊かなドッグラン施設の管理システムです。

## 🌟 特徴

- **利用申請管理**: オンラインでの利用申請と承認ワークフロー
- **ユーザー管理**: 会員情報と愛犬情報の管理
- **入場管理**: QRコードによる入退場管理
- **SNS機能**: 利用者同士のコミュニケーション
- **イベント管理**: ドッグラン主催イベントの告知と参加管理
- **リアルタイム通知**: 申請状況やイベント情報の即時通知

## 🛠 技術スタック

### バックエンド
- FastAPI (Python)
- Supabase (PostgreSQL + Auth + Storage + Realtime)
- JWT認証

### フロントエンド
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Radix UI

### デプロイ
- Vercel (フロントエンド・バックエンド)
- Supabase (データベース・認証)

## 🚀 セットアップ

### 前提条件
- Node.js 18+
- Python 3.8+
- Supabaseアカウント

### 環境変数の設定

#### バックエンド (.env)
```bash
cp backend/.env.example backend/.env
# .envファイルを編集してSupabase情報を入力
```

#### フロントエンド (.env.local)
```bash
cp frontend/.env.local.example frontend/.env.local
# .env.localファイルを編集してSupabase情報を入力
```

### 開発環境の起動

```bash
# ワンクリック起動
./start-dev.sh
```

または個別に起動：

```bash
# バックエンド
cd backend
source venv/bin/activate
./run_dev.sh

# フロントエンド（ユーザー画面）
cd frontend
npm install
npm run dev

# フロントエンド（管理画面）
cd frontend
PORT=3002 npm run dev
```

## 📝 ドキュメント

- [統合起動ガイド](./統合起動ガイド.md)
- [要件定義書](./要件定義書.md)
- [実装計画書](./実装計画書.md)

## 🌐 アクセスURL

### ローカル開発環境
- ユーザー画面: http://localhost:3001
- 管理画面: http://localhost:3002/admin
- API: http://localhost:8000
- API文書: http://localhost:8000/docs

## 📄 ライセンス

Private - All rights reserved

## 🤝 開発チーム

- バックエンドエンジニア
- フロントエンドエンジニアA（管理画面）
- フロントエンドエンジニアB（ユーザー画面）
- UI/UXデザイナー

---

**FC今治** × **里山ドッグラン** - 今治市の愛犬家コミュニティのために
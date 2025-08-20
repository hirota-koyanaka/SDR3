# 里山ドッグラン管理システム - バックエンド

FastAPIを使用した里山ドッグラン管理システムのバックエンドAPIです。

## 技術スタック

- **フレームワーク**: FastAPI
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **デプロイ**: Vercel Serverless Functions

## セットアップ

### 1. 環境構築

```bash
# Python仮想環境の作成
python -m venv venv

# 仮想環境の有効化
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 依存パッケージのインストール
pip install -r requirements.txt
```

### 2. 環境変数の設定

`.env.example`をコピーして`.env`を作成し、必要な環境変数を設定します：

```bash
cp .env.example .env
```

以下の環境変数を設定してください：

- `SUPABASE_URL`: SupabaseプロジェクトのURL
- `SUPABASE_ANON_KEY`: Supabaseの匿名キー
- `SUPABASE_SERVICE_KEY`: Supabaseのサービスキー
- `SECRET_KEY`: JWT署名用のシークレットキー

### 3. データベースのセットアップ

`database_schema.sql`をSupabaseのSQLエディタで実行してテーブルを作成します。

### 4. 開発サーバーの起動

```bash
uvicorn app.main:app --reload --port 8000
```

APIドキュメント: http://localhost:8000/api/docs

## プロジェクト構造

```
backend/
├── app/
│   ├── api/           # APIエンドポイント
│   │   └── v1/
│   │       ├── auth.py         # 認証
│   │       └── applications.py # 申請管理
│   ├── core/          # コア機能
│   │   ├── config.py  # 設定
│   │   ├── security.py # セキュリティ
│   │   └── supabase.py # Supabaseクライアント
│   ├── schemas/       # Pydanticスキーマ
│   ├── services/      # ビジネスロジック
│   └── main.py        # アプリケーションエントリーポイント
├── api/
│   └── index.py       # Vercel用エントリーポイント
├── tests/             # テスト
├── database_schema.sql # データベーススキーマ
├── requirements.txt   # 依存パッケージ
└── vercel.json        # Vercelデプロイ設定
```

## 主要なAPIエンドポイント

### 認証
- `POST /api/v1/auth/register` - ユーザー登録
- `POST /api/v1/auth/login` - ログイン
- `POST /api/v1/auth/refresh` - トークンリフレッシュ
- `POST /api/v1/auth/logout` - ログアウト
- `GET /api/v1/auth/me` - 現在のユーザー情報取得

### 申請管理
- `POST /api/v1/applications/` - 申請作成
- `GET /api/v1/applications/{id}` - 申請詳細取得
- `GET /api/v1/applications/status/{email}` - 申請状況確認
- `GET /api/v1/applications/admin/list` - 申請一覧（管理者用）
- `PUT /api/v1/applications/admin/{id}/approve` - 申請承認（管理者用）
- `PUT /api/v1/applications/admin/{id}/reject` - 申請却下（管理者用）

### ユーザー管理
- `GET /api/v1/users/profile` - プロフィール取得
- `PUT /api/v1/users/profile` - プロフィール更新
- `GET /api/v1/users/admin/list` - ユーザー一覧（管理者用）
- `GET /api/v1/users/admin/search` - ユーザー検索（管理者用）

### 犬情報管理
- `POST /api/v1/dogs/` - 犬情報登録
- `GET /api/v1/dogs/my-dogs` - 自分の犬一覧取得
- `GET /api/v1/dogs/{id}` - 犬情報詳細取得
- `PUT /api/v1/dogs/{id}` - 犬情報更新
- `POST /api/v1/dogs/{id}/vaccination` - ワクチン記録追加

### ファイル管理
- `POST /api/v1/files/upload/vaccination-certificate` - ワクチン証明書アップロード
- `POST /api/v1/files/upload/dog-photo/{dog_id}` - 犬の写真アップロード
- `POST /api/v1/files/upload/avatar` - アバター画像アップロード
- `POST /api/v1/files/upload/post-images/{post_id}` - 投稿画像アップロード

### SNS投稿
- `POST /api/v1/posts/` - 投稿作成
- `GET /api/v1/posts/feed` - フィード取得
- `GET /api/v1/posts/{id}` - 投稿詳細取得
- `POST /api/v1/posts/{id}/like` - いいね切り替え
- `POST /api/v1/posts/{id}/comments` - コメント追加

### イベント管理
- `GET /api/v1/events/` - イベント一覧取得
- `GET /api/v1/events/{id}` - イベント詳細取得
- `POST /api/v1/events/{id}/register` - イベント参加登録
- `POST /api/v1/events/admin/` - イベント作成（管理者用）

### 入退場管理
- `POST /api/v1/entries/qr` - QRコード生成
- `POST /api/v1/entries/check-in` - 入場処理（管理者用）
- `POST /api/v1/entries/check-out` - 退場処理（管理者用）
- `GET /api/v1/entries/current-visitors` - 現在の利用者一覧
- `GET /api/v1/entries/statistics` - 利用統計

### お知らせ管理
- `GET /api/v1/announcements/` - お知らせ一覧取得
- `GET /api/v1/announcements/business-hours` - 営業時間取得
- `GET /api/v1/announcements/special-holidays` - 特別休業日取得
- `POST /api/v1/announcements/admin/` - お知らせ作成（管理者用）

## デプロイ

### Vercelへのデプロイ

1. Vercelアカウントを作成
2. プロジェクトをGitHubにプッシュ
3. VercelでGitHubリポジトリを連携
4. 環境変数を設定
5. デプロイ

## 開発ガイドライン

### コード規約

- PEP 8に準拠
- 型ヒントを使用
- 適切なエラーハンドリング
- APIドキュメントの記述

### セキュリティ

- すべてのエンドポイントで入力検証
- 適切な認証・認可
- SQLインジェクション対策（ORMの使用）
- CORS設定の適切な管理

## テスト

```bash
# テストの実行
pytest

# カバレッジレポート付きテスト
pytest --cov=app tests/
```

## ライセンス

[ライセンス情報を記載]
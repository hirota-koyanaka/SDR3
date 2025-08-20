# 里山ドッグラン管理システム - フロントエンド（管理画面）

## 📝 概要

里山ドッグラン管理システムの管理者向けフロントエンドアプリケーションです。
今治市のドッグラン施設の運営管理を効率化するための包括的な管理機能を提供します。

## 🚀 主な機能

### 管理者機能
- **ダッシュボード**: 施設利用状況の概要表示
- **申請管理**: ユーザー登録申請の承認/却下
- **ユーザー管理**: 登録ユーザーの管理、アカウント停止/有効化
- **イベント管理**: イベントの作成、編集、削除
- **投稿管理**: SNS投稿の承認/却下、通報対応
- **入退場管理**: QRコードによる入退場処理、リアルタイム利用者表示
- **お知らせ管理**: 利用者向けお知らせの作成、公開管理
- **システム設定**: 営業時間、特別休業日、各種設定
- **レポート**: 統計分析、利用状況レポート

## 🛠 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: Radix UI
- **状態管理**: React Context API, Zustand
- **データフェッチ**: React Query (TanStack Query)
- **フォーム**: React Hook Form + Zod
- **グラフ**: Recharts
- **認証**: Supabase Auth
- **データベース**: Supabase (PostgreSQL)

## 📁 プロジェクト構造

```
frontend/
├── app/                    # Next.js App Router
│   ├── admin/             # 管理者ページ
│   │   ├── layout.tsx     # 管理者レイアウト
│   │   ├── page.tsx       # ダッシュボード
│   │   ├── login/         # ログイン
│   │   ├── applications/  # 申請管理
│   │   ├── users/         # ユーザー管理
│   │   ├── events/        # イベント管理
│   │   ├── posts/         # 投稿管理
│   │   ├── entries/       # 入退場管理
│   │   ├── announcements/ # お知らせ管理
│   │   ├── settings/      # システム設定
│   │   └── reports/       # レポート
│   ├── unauthorized/      # 権限エラーページ
│   └── not-found.tsx      # 404ページ
├── components/            # Reactコンポーネント
│   ├── ui/               # 共通UIコンポーネント
│   └── admin/            # 管理者専用コンポーネント
├── lib/                   # ユーティリティ
│   ├── api/              # APIクライアント
│   └── supabase/         # Supabase設定
├── types/                 # TypeScript型定義
├── public/                # 静的ファイル
└── middleware.ts          # 認証ミドルウェア
```

## 🔧 セットアップ

### 必要要件

- Node.js 18.0以上
- npm または yarn
- Supabaseアカウント

### インストール手順

1. **リポジトリのクローン**
```bash
git clone [repository-url]
cd frontend
```

2. **依存関係のインストール**
```bash
npm install
```

3. **環境変数の設定**
```bash
cp .env.local.example .env.local
```

`.env.local`ファイルを編集し、必要な環境変数を設定:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

4. **開発サーバーの起動**
```bash
npm run dev
```

http://localhost:3000 でアプリケーションが起動します。

## 📖 使用方法

### 管理者ログイン

1. `/admin/login` にアクセス
2. 管理者アカウントでログイン
3. ダッシュボードにリダイレクト

### 主要機能の操作

#### 申請管理
- 申請一覧から詳細を確認
- 承認/却下の処理
- 却下理由の入力

#### ユーザー管理
- ユーザー検索、フィルタリング
- ユーザー詳細の確認
- アカウントの停止/有効化

#### イベント管理
- 新規イベントの作成
- 既存イベントの編集/削除
- 参加者管理

## 🚀 デプロイ

### Vercelへのデプロイ

1. Vercelアカウントを作成
2. GitHubリポジトリと連携
3. 環境変数を設定
4. デプロイ実行

```bash
npm run build
npm run start
```

## 📝 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm run start

# リント実行
npm run lint

# 型チェック
npm run type-check
```

## 🔒 セキュリティ

- すべての管理者ルートは認証が必要
- JWTトークンによる認証
- CORS設定による不正アクセス防止
- 環境変数による機密情報の管理

## 📚 API連携

バックエンドAPIとの連携は`/lib/api/client.ts`で統一管理されています。

```typescript
import { adminApi } from '@/lib/api/client'

// 例: 申請一覧の取得
const applications = await adminApi.applications.list()
```

## 🤝 貢献

プルリクエストは歓迎します。大きな変更の場合は、まずissueを開いて変更内容を説明してください。

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### Supabase接続エラー
```
Error: Invalid Supabase URL or Anon Key
```
**解決方法**: `.env.local`ファイルのSupabase設定を確認してください。

#### ビルドエラー
```
Error: Cannot find module '@/components/...'
```
**解決方法**: 
```bash
rm -rf node_modules .next
npm install
npm run build
```

#### 認証エラー
管理者としてログインできない場合：
1. Supabaseダッシュボードで`admin_users`テーブルを確認
2. 該当ユーザーのレコードが存在することを確認
3. `auth_id`が正しく設定されていることを確認

## 📄 ライセンス

[ライセンス情報を記載]

## 📞 サポート

問題が発生した場合は、GitHubのissueを作成してください。

## 🙏 謝辞

- Next.js チーム
- Supabase チーム
- Radix UI チーム
- すべてのコントリビューター

---

© 2024 里山ドッグラン管理システム

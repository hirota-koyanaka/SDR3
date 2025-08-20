# デプロイメント手順書

## 前提条件

以下のアカウント・サービスが必要です：

1. **Supabase アカウント**
   - プロジェクトの作成
   - データベースとAuthentication設定

2. **Vercel アカウント**
   - フロントエンドとバックエンドのデプロイ

3. **GitHub アカウント**
   - ソースコード管理
   - Vercelとの連携

## 1. Supabase セットアップ

### 1.1 プロジェクト作成

1. [Supabase](https://supabase.com) にログイン
2. 「New Project」をクリック
3. プロジェクト名: `satoyama-dogrun`
4. データベースパスワードを設定（安全に保管）
5. リージョン: `Northeast Asia (Tokyo)`を選択

### 1.2 データベース初期化

```bash
# Supabase CLIをインストール
npm install -g supabase

# ログイン
supabase login

# プロジェクトをリンク
supabase link --project-ref your-project-ref

# マイグレーション実行
supabase db push
```

### 1.3 環境変数の取得

Supabaseダッシュボードから以下を取得：
- Settings > API > Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- Settings > API > anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Settings > API > service_role → `SUPABASE_SERVICE_KEY`

## 2. バックエンド（FastAPI）デプロイ

### 2.1 Vercel CLIのインストール

```bash
npm install -g vercel
```

### 2.2 バックエンドのデプロイ

```bash
cd backend

# Vercelにログイン
vercel login

# 初回デプロイ
vercel

# 環境変数を設定
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_KEY
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add SMTP_HOST
vercel env add SMTP_PORT
vercel env add SMTP_USER
vercel env add SMTP_PASSWORD
vercel env add EMAIL_FROM

# 本番環境にデプロイ
vercel --prod
```

## 3. フロントエンド（Next.js）デプロイ

### 3.1 環境変数の設定

`.env.production`ファイルを更新：

```env
NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
```

### 3.2 フロントエンドのデプロイ

```bash
cd frontend

# 初回デプロイ
vercel

# 環境変数を設定
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_API_URL

# 本番環境にデプロイ
vercel --prod
```

## 4. GitHub連携（自動デプロイ）

### 4.1 GitHubリポジトリの作成

```bash
# プロジェクトルートで
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/satoyama-dogrun.git
git push -u origin main
```

### 4.2 Vercelとの連携

1. Vercelダッシュボードにアクセス
2. 「Import Git Repository」をクリック
3. GitHubリポジトリを選択
4. 以下の設定を行う：
   - Framework Preset: `Next.js`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

## 5. デプロイ後の確認事項

### 5.1 動作確認チェックリスト

- [ ] トップページが表示される
- [ ] デモログインが機能する
- [ ] 新規会員登録が機能する
- [ ] 管理者ログインが機能する
- [ ] 画像アップロードが機能する
- [ ] QRコード生成が機能する
- [ ] リアルタイム更新が機能する

### 5.2 セキュリティ設定

1. **Supabase Row Level Security (RLS)**
   - すべてのテーブルでRLSを有効化
   - 適切なポリシーを設定

2. **環境変数の確認**
   - 本番環境の環境変数が正しく設定されている
   - シークレットが適切に保護されている

3. **CORS設定**
   - フロントエンドのドメインからのみAPIアクセスを許可

## 6. 監視とメンテナンス

### 6.1 監視ツール

- **Vercel Analytics**: パフォーマンス監視
- **Supabase Dashboard**: データベース監視
- **Sentry** (オプション): エラー監視

### 6.2 バックアップ

```bash
# データベースバックアップ
supabase db dump > backup_$(date +%Y%m%d).sql

# 定期バックアップの設定（Supabaseダッシュボード）
# Settings > Database > Backups
```

## 7. トラブルシューティング

### よくある問題と解決方法

**問題**: デプロイ後、APIが接続できない
**解決**: 
- 環境変数が正しく設定されているか確認
- CORSの設定を確認
- Vercelのログを確認

**問題**: Supabaseの認証が機能しない
**解決**:
- Supabase URLとAnon Keyが正しいか確認
- RLSポリシーが適切に設定されているか確認

**問題**: ビルドエラーが発生する
**解決**:
- Node.jsバージョンを確認（18.x以上）
- 依存関係を最新に更新: `npm update`

## 8. 本番環境のURL

デプロイ完了後、以下のURLでアクセス可能：

- フロントエンド: `https://satoyama-dogrun.vercel.app`
- バックエンドAPI: `https://satoyama-dogrun-api.vercel.app`
- 管理画面: `https://satoyama-dogrun.vercel.app/admin`

## 連絡先

問題が発生した場合は、以下に連絡してください：

- 技術サポート: tech-support@example.com
- 緊急連絡先: 090-XXXX-XXXX
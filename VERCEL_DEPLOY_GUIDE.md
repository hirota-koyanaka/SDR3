# Vercelデプロイガイド

## 📋 前提条件

1. GitHubリポジトリ: https://github.com/hirota-koyanaka/SDR3 ✅
2. Vercelアカウント
3. Supabaseプロジェクト

## 🚀 デプロイ手順

### Step 1: Vercelでプロジェクトをインポート

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. 「New Project」をクリック
3. GitHubアカウントを連携
4. `SDR3`リポジトリを選択してインポート

### Step 2: プロジェクト設定

#### Framework Preset
- **Framework**: Next.js
- **Root Directory**: `frontend` （重要：frontendディレクトリを指定）

#### Build & Output Settings
```
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### Step 3: 環境変数の設定

以下の環境変数を設定してください：

#### 必須の環境変数

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | SupabaseプロジェクトURL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase匿名キー | `eyJxxxxx...` |
| `NEXT_PUBLIC_API_URL` | バックエンドAPI URL（本番用） | `https://sdr3-backend.vercel.app` |

#### オプション（メール送信を使用する場合）

| 変数名 | 説明 |
|--------|------|
| `SMTP_HOST` | SMTPサーバーホスト |
| `SMTP_PORT` | SMTPポート |
| `SMTP_USER` | SMTPユーザー |
| `SMTP_PASSWORD` | SMTPパスワード |
| `EMAIL_FROM` | 送信元メールアドレス |

### Step 4: バックエンドのデプロイ（別プロジェクト）

バックエンドは別のVercelプロジェクトとしてデプロイすることを推奨：

1. 新しいVercelプロジェクトを作成
2. 同じGitHubリポジトリを選択
3. **Root Directory**: `backend`を指定
4. **Framework Preset**: Other

#### バックエンド環境変数

| 変数名 | 説明 |
|--------|------|
| `SUPABASE_URL` | SupabaseプロジェクトURL |
| `SUPABASE_KEY` | Supabaseサービスキー（管理者用） |
| `SUPABASE_JWT_SECRET` | JWT署名用シークレット |
| `FRONTEND_URL` | フロントエンドURL（CORS用） |

### Step 5: デプロイ

1. 「Deploy」ボタンをクリック
2. ビルドログを確認
3. デプロイ完了を待つ

## 🔧 デプロイ後の設定

### カスタムドメイン（オプション）

1. Vercel Dashboard → Settings → Domains
2. カスタムドメインを追加
3. DNSレコードを設定

### 環境別の設定

#### Production
- 本番用のSupabaseプロジェクトを使用
- 環境変数を本番用に設定

#### Preview
- 開発用のSupabaseプロジェクトを使用可能
- プルリクエストごとにプレビュー環境が自動作成

## 🐛 トラブルシューティング

### ビルドエラーが発生する場合

1. **Node.jsバージョン**
   - package.jsonにenginesフィールドを追加：
   ```json
   "engines": {
     "node": ">=18.0.0"
   }
   ```

2. **TypeScriptエラー**
   - `npm run type-check`をローカルで実行
   - エラーを修正してからプッシュ

3. **環境変数の不足**
   - Vercel Dashboardで環境変数を確認
   - 必須の変数がすべて設定されているか確認

### デプロイ後にアクセスできない場合

1. **CORS設定**
   - バックエンドの`FRONTEND_URL`環境変数を確認
   - フロントエンドのURLが含まれているか確認

2. **API接続エラー**
   - `NEXT_PUBLIC_API_URL`が正しく設定されているか確認
   - バックエンドが正常にデプロイされているか確認

## 📝 デプロイチェックリスト

- [ ] GitHubリポジトリにコードがプッシュされている
- [ ] Supabaseプロジェクトが作成されている
- [ ] データベーススキーマが適用されている
- [ ] 環境変数がすべて設定されている
- [ ] フロントエンドが正常にビルドされる
- [ ] バックエンドAPIが応答する
- [ ] 認証機能が動作する
- [ ] データの読み書きができる

## 🔗 重要なURL

- **GitHub**: https://github.com/hirota-koyanaka/SDR3
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com

## 📞 サポート

デプロイに関する問題が発生した場合は、以下を確認してください：

1. Vercelのビルドログ
2. ブラウザの開発者コンソール
3. Supabaseのログ

---

**最終更新**: 2025年8月20日
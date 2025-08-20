# Supabaseセットアップ手順書

## プロジェクト情報
- **Project ID**: `hoechpkznbpavyozjqni`
- **Project URL**: `https://hoechpkznbpavyozjqni.supabase.co`

## 📋 セットアップ手順

### ステップ1: データベーススキーマの作成

1. Supabaseダッシュボードにログイン
2. **SQL Editor** を開く
3. `database_schema.sql` の内容をコピー&ペースト
4. **RUN** ボタンをクリックして実行

### ステップ2: セキュリティポリシーの設定

1. **SQL Editor** で新しいクエリを作成
2. `rls_policies.sql` の内容をコピー&ペースト  
3. **RUN** ボタンをクリックして実行

### ステップ3: 認証設定の確認

1. **Authentication** → **Settings** を開く
2. 以下の設定を確認：
   - **Enable email confirmations**: OFF（開発時）
   - **Enable phone confirmations**: OFF  
   - **Allow signups**: OFF（管理者のみ作成）

### ステップ4: 初期管理者アカウントの作成

#### 4-1. 管理者ユーザーを作成
**Authentication** → **Users** → **Add user** で以下を入力：
- **Email**: `admin@satoyama-dogrun.com`
- **Password**: 強力なパスワード（保存してください）
- **Auto Confirm User**: チェック

#### 4-2. 管理者テーブルに追加
**SQL Editor** で以下を実行（`[AUTH_ID]`は作成したユーザーのIDに置き換え）：

```sql
-- 作成したユーザーのauth_idを確認
SELECT id, email FROM auth.users WHERE email = 'admin@satoyama-dogrun.com';

-- 管理者テーブルに追加（[AUTH_ID]を実際のIDに置き換えてください）
INSERT INTO admin_users (auth_id, name, email, role) 
VALUES ('[AUTH_ID]', '管理者', 'admin@satoyama-dogrun.com', 'super_admin');
```

### ステップ5: API Key の取得

1. **Settings** → **API** を開く
2. 以下の値をコピー：
   - **Project URL**: `https://hoechpkznbpavyozjqni.supabase.co`
   - **anon/public key**: `[ANON_KEY]`

## 🔑 環境変数の設定

### フロントエンドの環境変数設定

`frontend/.env.local` ファイルを作成：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://hoechpkznbpavyozjqni.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[取得したANON_KEY]

# API設定
NEXT_PUBLIC_API_URL=https://hoechpkznbpavyozjqni.supabase.co/rest/v1

# アプリケーション設定
NEXT_PUBLIC_APP_NAME=里山ドッグラン管理システム
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_DEBUG=true
```

## 🧪 動作確認

### 1. フロントエンドの起動
```bash
cd frontend
npm install
npm run dev
```

### 2. 管理者ログインテスト
1. `http://localhost:3000/admin/login` にアクセス
2. 作成した管理者アカウントでログイン
3. ダッシュボードが表示されることを確認

### 3. データベース接続確認
**SQL Editor** で以下を実行：
```sql
-- テーブル作成確認
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 管理者アカウント確認
SELECT * FROM admin_users;

-- ビュー確認
SELECT * FROM current_visitors;
```

## 🔒 セキュリティ確認事項

- [ ] RLSが全テーブルで有効化されている
- [ ] 管理者アカウントが正常に作成されている  
- [ ] 認証設定が適切に設定されている
- [ ] 環境変数が正しく設定されている

## 📊 次のステップ

1. **テストデータの作成** - 開発用のサンプルデータ
2. **バックエンドAPI実装** - FastAPI サーバーの構築
3. **Vercelデプロイ設定** - 本番環境への展開

## 🔧 トラブルシューティング

### よくある問題

#### "Invalid API key" エラー
- **解決方法**: `.env.local`のANON_KEYが正しいか確認

#### "User not authorized" エラー  
- **解決方法**: `admin_users`テーブルにレコードが存在するか確認

#### RLS Policy エラー
- **解決方法**: `rls_policies.sql` が正常に実行されているか確認

## 📞 サポート

問題が発生した場合は以下を確認：
1. Supabaseダッシュボードのログ
2. ブラウザの開発者ツール（Console）
3. フロントエンドの起動ログ

---

**注意**: 本番環境では必ず強力なパスワードと適切なセキュリティ設定を使用してください。
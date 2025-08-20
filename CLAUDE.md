# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 重要なルール

**すべてのやり取りは日本語で行うこと。** ユーザーとのコミュニケーション、コメント、ドキュメント作成はすべて日本語を使用してください。

## 開発進行ルール

### 自律的な開発推進
現在、4名のエンジニア（バックエンド、フロントエンドA、フロントエンドB、UI/UXデザイナー）による並行開発が進行中です。以下のルールに従って開発を進めてください：

### ✅ 確認不要で進めて良い作業
以下の作業は、ユーザーへの確認なしに自律的に進めてください：

1. **各実装計画書に記載された作業**
   - 週次タスクリストに沿った実装
   - 計画書内のコード例の実装
   - 想定される基本機能の実装

2. **技術的な最適化**
   - パフォーマンス改善
   - コードリファクタリング
   - エラーハンドリングの追加
   - テストコードの作成

3. **明らかなバグ修正**
   - 構文エラーの修正
   - 型エラーの解消
   - ロジックエラーの修正

4. **開発環境の整備**
   - 必要なパッケージのインストール
   - 設定ファイルの作成
   - 開発ツールのセットアップ

### ⚠️ 確認が必要な作業
以下の場合は必ずユーザーに確認を取ってください：

1. **仕様の大幅な変更**
   - 要件定義書から逸脱する変更
   - UIフローの根本的な変更
   - データ構造の大規模な変更

2. **外部サービスの追加**
   - 新しい有料サービスの導入
   - 計画にない外部APIの利用
   - セキュリティに関わる変更

3. **コスト影響のある決定**
   - 有料プランへの変更
   - リソース使用量の大幅な増加

### 💡 開発の進め方
1. **実装計画書を基準に作業を進める**
2. **不明点があれば、まず技術的に妥当な判断で進める**
3. **重大なリスクがある場合のみ確認を求める**
4. **完了したタスクは都度報告する**

### 🔄 並行開発での注意点
- 他チームの作業に影響する変更は、変更内容を明確に記録
- APIインターフェースは実装計画書の仕様を厳守
- 共通コンポーネントの変更は影響範囲を考慮

## Project Overview

This is the 里山ドッグラン管理システム (Satoyama Dog Run Management System) - a web application for managing a dog park facility in Imabari City, Ehime Prefecture, Japan.

**Status**: Initial development phase - no code implementation yet, only requirements documentation exists.

## System Architecture (Planned)

### Technology Stack

**Backend**:
- Framework: FastAPI (Python)
- ORM: SQLAlchemy
- Authentication: Supabase Auth + JWT
- Database: Supabase PostgreSQL (development & production)

**Frontend**:
- Framework: Next.js 14 (TypeScript)
- UI Library: Radix UI
- Styling: Tailwind CSS
- State Management: React Context API
- HTTP Client: Supabase Client + Axios

**Deployment**:
- Frontend: Vercel
- Backend: Vercel Serverless Functions
- Database: Supabase (PostgreSQL)
- Storage: Supabase Storage
- Realtime: Supabase Realtime

## Project Structure (To Be Implemented)

Expected directory structure:
```
/
├── backend/           # FastAPI backend application
│   ├── app/          # Main application code
│   │   ├── api/      # API endpoints
│   │   ├── models/   # SQLAlchemy models
│   │   ├── schemas/  # Pydantic schemas
│   │   ├── services/ # Business logic
│   │   └── core/     # Core utilities (auth, config, etc.)
│   └── tests/        # Backend tests
├── frontend/         # Next.js frontend application
│   ├── src/
│   │   ├── app/      # Next.js 14 app router
│   │   ├── components/ # React components
│   │   ├── contexts/ # React contexts
│   │   ├── hooks/    # Custom hooks
│   │   └── lib/      # Utility functions
│   └── tests/        # Frontend tests
└── 要件定義書.md      # Requirements documentation
```

## Development Commands (To Be Configured)

Since the project is not yet initialized, these are the expected commands once set up:

### Backend (FastAPI)
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --port 8000

# Supabase local setup
supabase init
supabase start

# Run tests
pytest

# Format code
black .

# Lint
flake8
```

### Frontend (Next.js)
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Install Supabase CLI
npm install @supabase/supabase-js

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint
npm run lint

# Type check
npm run type-check
```

## Key Features to Implement

1. **User Registration & Application System**
   - Application form with Imabari city resident verification
   - Dog registration with vaccination records
   - Admin approval workflow

2. **Admin Dashboard**
   - User management
   - Application approval/rejection
   - Event management
   - Announcement management
   - Business hours configuration

3. **SNS/Feed Features**
   - Post creation with images and hashtags
   - Like and comment functionality
   - Content moderation

4. **Entry Management**
   - QR code generation for users
   - Check-in/check-out system
   - Real-time facility usage tracking

5. **Event System**
   - Calendar view
   - Event registration
   - Participant management

## Database Schema Overview

Main entities to implement:
- Users (with admin roles)
- Applications (registration requests)
- Dogs (with vaccination records)
- Posts (SNS content)
- Events
- Entry logs
- Announcements
- System settings

## Security Considerations

- JWT authentication for all API endpoints
- Password hashing with bcrypt
- CORS configuration for API
- Input validation and sanitization
- File upload restrictions for vaccination certificates

## Development Timeline

- **Phase 1 (Month 1)**: Requirements finalization, basic setup, development environment
- **Phase 2 (Month 2)**: Core features - authentication, application management, admin functions
- **Phase 3 (Month 3)**: Additional features - SNS, events, entry management, testing, deployment

## Important Notes

1. **Imabari City Focus**: This system is specifically for Imabari city residents, requiring residence verification in the application process.

2. **FC Imabari Brand Guidelines**: There's a brand guideline PDF (★必読 FC今治ブランドガイドライン (3).pdf) that should be referenced for any UI/design work.

3. **MVP Approach**: Start with core functionality (user registration, admin approval, basic dog management) before implementing advanced features like SNS and QR code entry.

4. **Vercel/Supabase Deployment**: The system is designed for Vercel deployment with Supabase as the backend service. Ensure environment variables are properly configured for both platforms.

## Current Status

The project currently only contains:
- 要件定義書.md (Requirements documentation)
- FC今治ブランドガイドライン PDF (Brand guidelines)

Next steps:
1. Initialize backend FastAPI project
2. Initialize frontend Next.js project  
3. Set up Supabase project and local development
4. Configure Vercel project settings
5. Implement authentication system with Supabase Auth
6. Create basic admin and user interfaces
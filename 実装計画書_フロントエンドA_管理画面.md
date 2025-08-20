# 実装計画書 - フロントエンドエンジニアA（管理画面担当）

## 1. 担当範囲概要

### 主要責任
- 管理者ダッシュボードの実装
- 申請管理システムのUI構築
- ユーザー管理画面の開発
- イベント・お知らせ管理機能
- 統計・レポート画面の実装
- 営業時間・システム設定画面

### 技術スタック
- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **UIライブラリ**: Radix UI
- **スタイリング**: Tailwind CSS
- **状態管理**: React Context API / Zustand
- **データ取得**: Supabase Client + React Query
- **フォーム**: React Hook Form + Zod
- **グラフ**: Recharts
- **テーブル**: TanStack Table

## 2. プロジェクト構造

```
frontend/src/
├── app/
│   ├── admin/                      # 管理者ルート
│   │   ├── layout.tsx              # 管理者レイアウト
│   │   ├── page.tsx                # ダッシュボード
│   │   ├── applications/           # 申請管理
│   │   │   ├── page.tsx           # 申請一覧
│   │   │   └── [id]/page.tsx      # 申請詳細
│   │   ├── users/                  # ユーザー管理
│   │   │   ├── page.tsx           # ユーザー一覧
│   │   │   └── [id]/page.tsx      # ユーザー詳細
│   │   ├── posts/                  # 投稿管理
│   │   │   └── page.tsx           # 投稿承認
│   │   ├── events/                 # イベント管理
│   │   │   ├── page.tsx           # イベント一覧
│   │   │   ├── new/page.tsx       # イベント作成
│   │   │   └── [id]/edit/page.tsx # イベント編集
│   │   ├── announcements/          # お知らせ管理
│   │   ├── entries/                # 入退場管理
│   │   ├── settings/               # システム設定
│   │   └── reports/                # レポート
├── components/
│   ├── admin/                      # 管理者専用コンポーネント
│   │   ├── dashboard/              # ダッシュボード関連
│   │   ├── tables/                 # テーブルコンポーネント
│   │   ├── forms/                  # フォームコンポーネント
│   │   ├── charts/                 # グラフコンポーネント
│   │   └── layouts/                # レイアウト
│   └── ui/                         # 共通UIコンポーネント
├── lib/
│   ├── api/                        # API関連
│   │   └── admin/                  # 管理者API
│   └── utils/                      # ユーティリティ
└── hooks/                          # カスタムフック
    └── admin/                      # 管理者用フック
```

## 3. 週次実装計画

### 🚀 Week 0: 環境構築（3日間）

#### Day 1: Next.jsプロジェクトセットアップ
```bash
# プロジェクト作成
npx create-next-app@latest frontend --typescript --tailwind --app

cd frontend

# 必要パッケージインストール
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-tabs @radix-ui/react-toast
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @tanstack/react-query @tanstack/react-table
npm install react-hook-form @hookform/resolvers zod
npm install recharts date-fns
npm install zustand
```

#### Day 2: 基本設定とSupabase連携
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createServerSupabaseClient() {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

#### Day 3: 管理者認証ミドルウェア
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  // 管理者ルートの保護
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    
    // 管理者権限チェック
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('auth_id', session.user.id)
      .single()
    
    if (!adminUser) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }
  
  return res
}

export const config = {
  matcher: ['/admin/:path*']
}
```

### 📅 Week 1: 管理者認証とダッシュボード

#### 月曜日-火曜日: 管理者ログイン画面
```typescript
// app/admin/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上必要です'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function AdminLoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })
  
  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    
    if (error) {
      alert('ログインに失敗しました')
      setIsLoading(false)
      return
    }
    
    // 管理者権限確認
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('*')
      .single()
    
    if (!adminUser) {
      alert('管理者権限がありません')
      await supabase.auth.signOut()
      setIsLoading(false)
      return
    }
    
    router.push('/admin')
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-center">管理者ログイン</h2>
          <p className="mt-2 text-center text-gray-600">
            里山ドッグラン管理システム
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div>
            <Input
              {...register('email')}
              type="email"
              placeholder="メールアドレス"
              className="w-full"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          
          <div>
            <Input
              {...register('password')}
              type="password"
              placeholder="パスワード"
              className="w-full"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </Button>
        </form>
      </div>
    </div>
  )
}
```

#### 水曜日-木曜日: 管理者ダッシュボード
```typescript
// app/admin/page.tsx
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { StatsCards } from '@/components/admin/dashboard/StatsCards'
import { RecentApplications } from '@/components/admin/dashboard/RecentApplications'
import { VisitorChart } from '@/components/admin/dashboard/VisitorChart'

export default async function AdminDashboard() {
  const supabase = createServerSupabaseClient()
  
  // 統計データ取得
  const [users, applications, events, currentVisitors] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact' }),
    supabase.from('applications').select('id, status', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('events').select('id', { count: 'exact' }).gte('event_date', new Date().toISOString()),
    supabase.from('entry_logs').select('id', { count: 'exact' }).is('exit_time', null),
  ])
  
  const stats = {
    totalUsers: users.count || 0,
    pendingApplications: applications.count || 0,
    upcomingEvents: events.count || 0,
    currentVisitors: currentVisitors.count || 0,
  }
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">管理者ダッシュボード</h1>
      
      <StatsCards stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <RecentApplications />
        <VisitorChart />
      </div>
    </div>
  )
}

// components/admin/dashboard/StatsCards.tsx
interface StatsCardsProps {
  stats: {
    totalUsers: number
    pendingApplications: number
    upcomingEvents: number
    currentVisitors: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: '総ユーザー数',
      value: stats.totalUsers,
      icon: '👥',
      change: '+12%',
      color: 'bg-blue-500',
    },
    {
      title: '承認待ち申請',
      value: stats.pendingApplications,
      icon: '📝',
      change: `${stats.pendingApplications}件`,
      color: 'bg-yellow-500',
    },
    {
      title: '今後のイベント',
      value: stats.upcomingEvents,
      icon: '📅',
      change: '今月',
      color: 'bg-green-500',
    },
    {
      title: '現在の利用者',
      value: stats.currentVisitors,
      icon: '🐕',
      change: '入場中',
      color: 'bg-purple-500',
    },
  ]
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold mt-2">{card.value.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">{card.change}</p>
            </div>
            <div className={`${card.color} p-3 rounded-lg text-white text-2xl`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

#### 金曜日: 管理者レイアウト
```typescript
// app/admin/layout.tsx
import { AdminSidebar } from '@/components/admin/layouts/AdminSidebar'
import { AdminHeader } from '@/components/admin/layouts/AdminHeader'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

// components/admin/layouts/AdminSidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const menuItems = [
  { href: '/admin', label: 'ダッシュボード', icon: '📊' },
  { href: '/admin/applications', label: '申請管理', icon: '📝' },
  { href: '/admin/users', label: 'ユーザー管理', icon: '👥' },
  { href: '/admin/posts', label: '投稿管理', icon: '📰' },
  { href: '/admin/events', label: 'イベント管理', icon: '📅' },
  { href: '/admin/announcements', label: 'お知らせ', icon: '📢' },
  { href: '/admin/entries', label: '入退場管理', icon: '🚪' },
  { href: '/admin/settings', label: '設定', icon: '⚙️' },
  { href: '/admin/reports', label: 'レポート', icon: '📈' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  
  return (
    <aside className="w-64 bg-white shadow-md">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors',
                  pathname === item.href
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-gray-100'
                )}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
```

### 📅 Week 2-3: 申請管理システム

#### 申請一覧画面
```typescript
// app/admin/applications/page.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ApplicationsTable } from '@/components/admin/tables/ApplicationsTable'
import { ApplicationFilters } from '@/components/admin/forms/ApplicationFilters'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ApplicationsPage() {
  const [status, setStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications', status, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (status !== 'all') params.append('status', status)
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`/api/v1/admin/applications?${params}`)
      return response.json()
    },
  })
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">申請管理</h1>
        <div className="flex gap-2">
          <Input
            placeholder="検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>
      
      <Tabs value={status} onValueChange={setStatus}>
        <TabsList>
          <TabsTrigger value="all">すべて</TabsTrigger>
          <TabsTrigger value="pending">承認待ち</TabsTrigger>
          <TabsTrigger value="approved">承認済み</TabsTrigger>
          <TabsTrigger value="rejected">却下</TabsTrigger>
        </TabsList>
        
        <TabsContent value={status} className="mt-4">
          {isLoading ? (
            <div>読み込み中...</div>
          ) : (
            <ApplicationsTable 
              applications={applications} 
              onStatusChange={refetch}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// components/admin/tables/ApplicationsTable.tsx
import { useState } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { ApplicationDetailModal } from '../modals/ApplicationDetailModal'

const columnHelper = createColumnHelper<Application>()

const columns = [
  columnHelper.accessor('created_at', {
    header: '申請日',
    cell: (info) => format(new Date(info.getValue()), 'yyyy/MM/dd HH:mm', { locale: ja }),
  }),
  columnHelper.accessor('name', {
    header: '申請者名',
  }),
  columnHelper.accessor('email', {
    header: 'メールアドレス',
  }),
  columnHelper.accessor('is_imabari_resident', {
    header: '今治市民',
    cell: (info) => info.getValue() ? '○' : '×',
  }),
  columnHelper.accessor('status', {
    header: 'ステータス',
    cell: (info) => {
      const status = info.getValue()
      const statusMap = {
        pending: { label: '承認待ち', color: 'bg-yellow-100 text-yellow-800' },
        approved: { label: '承認済み', color: 'bg-green-100 text-green-800' },
        rejected: { label: '却下', color: 'bg-red-100 text-red-800' },
      }
      const { label, color } = statusMap[status] || {}
      
      return (
        <span className={`px-2 py-1 rounded-full text-xs ${color}`}>
          {label}
        </span>
      )
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: '操作',
    cell: (props) => {
      const [isModalOpen, setIsModalOpen] = useState(false)
      
      return (
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsModalOpen(true)}
          >
            詳細
          </Button>
          <ApplicationDetailModal
            application={props.row.original}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onStatusChange={props.table.options.meta?.onStatusChange}
          />
        </>
      )
    },
  }),
]

export function ApplicationsTable({ applications, onStatusChange }) {
  const table = useReactTable({
    data: applications,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      onStatusChange,
    },
  })
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

#### 申請詳細・承認モーダル
```typescript
// components/admin/modals/ApplicationDetailModal.tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface ApplicationDetailModalProps {
  application: Application
  isOpen: boolean
  onClose: () => void
  onStatusChange: () => void
}

export function ApplicationDetailModal({
  application,
  isOpen,
  onClose,
  onStatusChange,
}: ApplicationDetailModalProps) {
  const [adminMemo, setAdminMemo] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const handleApprove = async () => {
    setIsProcessing(true)
    
    const response = await fetch(`/api/v1/admin/applications/${application.id}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_memo: adminMemo }),
    })
    
    if (response.ok) {
      alert('申請を承認しました')
      onStatusChange()
      onClose()
    } else {
      alert('承認処理に失敗しました')
    }
    
    setIsProcessing(false)
  }
  
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('却下理由を入力してください')
      return
    }
    
    setIsProcessing(true)
    
    const response = await fetch(`/api/v1/admin/applications/${application.id}/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: rejectReason }),
    })
    
    if (response.ok) {
      alert('申請を却下しました')
      onStatusChange()
      onClose()
    } else {
      alert('却下処理に失敗しました')
    }
    
    setIsProcessing(false)
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>申請詳細</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="mt-4">
          <TabsList>
            <TabsTrigger value="basic">基本情報</TabsTrigger>
            <TabsTrigger value="dog">犬情報</TabsTrigger>
            <TabsTrigger value="documents">提出書類</TabsTrigger>
            <TabsTrigger value="action">処理</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">申請日</label>
                <p>{format(new Date(application.created_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">ステータス</label>
                <p>{application.status}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">氏名</label>
                <p>{application.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">メールアドレス</label>
                <p>{application.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">電話番号</label>
                <p>{application.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">今治市民</label>
                <p>{application.is_imabari_resident ? '○' : '×'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-500">住所</label>
                <p>{application.address}</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="dog" className="space-y-4">
            {application.dogs?.map((dog, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">犬 {index + 1}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">名前</label>
                    <p>{dog.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">犬種</label>
                    <p>{dog.breed}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">体重</label>
                    <p>{dog.weight}kg</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">性別</label>
                    <p>{dog.gender}</p>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="documents" className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">ワクチン接種証明書</h4>
              {application.vaccination_certificates?.map((cert, index) => (
                <div key={index} className="flex items-center gap-2">
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    証明書 {index + 1}
                  </a>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="action" className="space-y-4">
            {application.status === 'pending' && (
              <>
                <div>
                  <label className="text-sm font-medium">管理者メモ</label>
                  <Textarea
                    value={adminMemo}
                    onChange={(e) => setAdminMemo(e.target.value)}
                    placeholder="管理者用のメモ（任意）"
                    className="mt-1"
                  />
                </div>
                
                <div className="flex gap-4">
                  <Button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    承認する
                  </Button>
                  
                  <div className="flex-1">
                    <Textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="却下理由を入力"
                      className="mb-2"
                    />
                    <Button
                      onClick={handleReject}
                      disabled={isProcessing}
                      variant="destructive"
                      className="w-full"
                    >
                      却下する
                    </Button>
                  </div>
                </div>
              </>
            )}
            
            {application.status === 'approved' && (
              <div className="text-green-600">
                この申請は承認済みです
              </div>
            )}
            
            {application.status === 'rejected' && (
              <div className="text-red-600">
                <p>この申請は却下されました</p>
                <p className="mt-2">理由: {application.rejected_reason}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
```

### 📅 Week 4-5: ユーザー管理とイベント管理

#### ユーザー管理画面
```typescript
// app/admin/users/page.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { UsersTable } from '@/components/admin/tables/UsersTable'
import { UserStatsCards } from '@/components/admin/dashboard/UserStatsCards'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

export default function UsersPage() {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    hasdog: 'all',
  })
  
  const { data: users, isLoading } = useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') params.append(key, value)
      })
      
      const response = await fetch(`/api/v1/admin/users?${params}`)
      return response.json()
    },
  })
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ユーザー管理</h1>
      
      <UserStatsCards />
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="名前、メールで検索..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="max-w-sm"
          />
          
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <option value="all">すべて</option>
            <option value="active">アクティブ</option>
            <option value="suspended">停止中</option>
          </Select>
          
          <Select
            value={filters.hasdog}
            onValueChange={(value) => setFilters({ ...filters, hasdog: value })}
          >
            <option value="all">すべて</option>
            <option value="yes">犬登録あり</option>
            <option value="no">犬登録なし</option>
          </Select>
        </div>
        
        {isLoading ? (
          <div>読み込み中...</div>
        ) : (
          <UsersTable users={users} />
        )}
      </div>
    </div>
  )
}

// app/admin/users/[id]/page.tsx
export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  
  const { data: user } = await supabase
    .from('users')
    .select(`
      *,
      dogs(*),
      entry_logs(*)
    `)
    .eq('id', params.id)
    .single()
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">ユーザー詳細</h1>
        <UserActions user={user} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <UserBasicInfo user={user} />
          <DogsInfo dogs={user.dogs} />
          <EntryHistory entries={user.entry_logs} />
        </div>
        
        <div className="space-y-6">
          <UserActivity user={user} />
          <UserNotes userId={user.id} />
        </div>
      </div>
    </div>
  )
}
```

#### イベント管理画面
```typescript
// app/admin/events/page.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar } from '@/components/ui/calendar'
import { EventsList } from '@/components/admin/events/EventsList'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function EventsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  
  const { data: events } = useQuery({
    queryKey: ['events', selectedDate],
    queryFn: async () => {
      const response = await fetch('/api/v1/admin/events')
      return response.json()
    },
  })
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">イベント管理</h1>
        <Link href="/admin/events/new">
          <Button>新規イベント作成</Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EventsList events={events} />
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">カレンダー</h2>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
        </div>
      </div>
    </div>
  )
}

// app/admin/events/new/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'

const eventSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  description: z.string().min(1, '説明は必須です'),
  event_date: z.date(),
  start_time: z.string(),
  end_time: z.string(),
  location: z.string(),
  max_participants: z.number().min(1),
  fee: z.number().min(0),
})

type EventForm = z.infer<typeof eventSchema>

export default function NewEventPage() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
  })
  
  const onSubmit = async (data: EventForm) => {
    const response = await fetch('/api/v1/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    
    if (response.ok) {
      router.push('/admin/events')
    }
  }
  
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">新規イベント作成</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            イベント名 <span className="text-red-500">*</span>
          </label>
          <Input {...register('title')} />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            説明 <span className="text-red-500">*</span>
          </label>
          <Textarea {...register('description')} rows={4} />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              開催日 <span className="text-red-500">*</span>
            </label>
            <DatePicker control={control} name="event_date" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              開始時間 <span className="text-red-500">*</span>
            </label>
            <Input type="time" {...register('start_time')} />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              終了時間 <span className="text-red-500">*</span>
            </label>
            <Input type="time" {...register('end_time')} />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">場所</label>
          <Input {...register('location')} />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              定員 <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              {...register('max_participants', { valueAsNumber: true })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">参加費</label>
            <Input
              type="number"
              {...register('fee', { valueAsNumber: true })}
              placeholder="0"
            />
          </div>
        </div>
        
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '作成中...' : 'イベントを作成'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  )
}
```

### 📅 Week 6-7: 投稿管理・入退場管理

#### 投稿承認画面
```typescript
// app/admin/posts/page.tsx
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PostCard } from '@/components/admin/posts/PostCard'
import { PostDetailModal } from '@/components/admin/modals/PostDetailModal'

export default function PostsPage() {
  const [status, setStatus] = useState('pending')
  const [selectedPost, setSelectedPost] = useState(null)
  const queryClient = useQueryClient()
  
  const { data: posts } = useQuery({
    queryKey: ['posts', status],
    queryFn: async () => {
      const response = await fetch(`/api/v1/admin/posts?status=${status}`)
      return response.json()
    },
  })
  
  const approveMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/v1/admin/posts/${postId}/approve`, {
        method: 'PUT',
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['posts'])
    },
  })
  
  const rejectMutation = useMutation({
    mutationFn: async ({ postId, reason }: { postId: string; reason: string }) => {
      const response = await fetch(`/api/v1/admin/posts/${postId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['posts'])
    },
  })
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">投稿管理</h1>
      
      <Tabs value={status} onValueChange={setStatus}>
        <TabsList>
          <TabsTrigger value="pending">承認待ち</TabsTrigger>
          <TabsTrigger value="approved">承認済み</TabsTrigger>
          <TabsTrigger value="rejected">却下</TabsTrigger>
          <TabsTrigger value="reported">通報あり</TabsTrigger>
        </TabsList>
        
        <TabsContent value={status} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts?.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onApprove={() => approveMutation.mutate(post.id)}
                onReject={(reason) => rejectMutation.mutate({ postId: post.id, reason })}
                onDetail={() => setSelectedPost(post)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  )
}
```

#### 入退場管理画面
```typescript
// app/admin/entries/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { QrScanner } from '@yudiel/react-qr-scanner'
import { CurrentVisitorsList } from '@/components/admin/entries/CurrentVisitorsList'
import { EntryHistory } from '@/components/admin/entries/EntryHistory'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'

export default function EntriesPage() {
  const [currentVisitors, setCurrentVisitors] = useState([])
  const [scanMode, setScanMode] = useState(false)
  const supabase = createClient()
  
  // リアルタイム更新の設定
  useEffect(() => {
    const channel = supabase
      .channel('entry-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'entry_logs',
        },
        (payload) => {
          fetchCurrentVisitors()
        }
      )
      .subscribe()
    
    fetchCurrentVisitors()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
  
  const fetchCurrentVisitors = async () => {
    const { data } = await supabase
      .from('entry_logs')
      .select('*, users(*), dogs(*)')
      .is('exit_time', null)
    
    setCurrentVisitors(data || [])
  }
  
  const handleQrScan = async (result: string) => {
    try {
      const response = await fetch('/api/v1/admin/entries/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_token: result }),
      })
      
      if (response.ok) {
        alert('入場処理が完了しました')
        setScanMode(false)
      } else {
        const error = await response.json()
        alert(error.detail)
      }
    } catch (error) {
      alert('QRコードの処理に失敗しました')
    }
  }
  
  const handleCheckOut = async (entryId: string) => {
    const response = await fetch(`/api/v1/admin/entries/${entryId}/check-out`, {
      method: 'PUT',
    })
    
    if (response.ok) {
      alert('退場処理が完了しました')
      fetchCurrentVisitors()
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">入退場管理</h1>
        <div className="flex items-center gap-4">
          <div className="text-lg">
            現在の利用者: <span className="font-bold text-2xl">{currentVisitors.length}</span>組
          </div>
          <Button
            onClick={() => setScanMode(!scanMode)}
            variant={scanMode ? 'destructive' : 'default'}
          >
            {scanMode ? 'スキャン停止' : 'QRスキャン開始'}
          </Button>
        </div>
      </div>
      
      {scanMode && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">QRコードをスキャン</h2>
          <div className="max-w-md mx-auto">
            <QrScanner
              onDecode={handleQrScan}
              onError={(error) => console.error(error)}
            />
          </div>
        </div>
      )}
      
      <Tabs defaultValue="current">
        <TabsList>
          <TabsTrigger value="current">現在の利用者</TabsTrigger>
          <TabsTrigger value="history">入退場履歴</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current">
          <CurrentVisitorsList
            visitors={currentVisitors}
            onCheckOut={handleCheckOut}
          />
        </TabsContent>
        
        <TabsContent value="history">
          <EntryHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

### 📅 Week 8-9: お知らせ管理・営業時間設定

#### お知らせ管理
```typescript
// app/admin/announcements/page.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AnnouncementsList } from '@/components/admin/announcements/AnnouncementsList'
import { AnnouncementForm } from '@/components/admin/forms/AnnouncementForm'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function AnnouncementsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState(null)
  
  const { data: announcements, refetch } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const response = await fetch('/api/v1/admin/announcements')
      return response.json()
    },
  })
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">お知らせ管理</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          新規お知らせ作成
        </Button>
      </div>
      
      <AnnouncementsList
        announcements={announcements}
        onEdit={setEditingAnnouncement}
        onDelete={refetch}
      />
      
      <Dialog open={isFormOpen || !!editingAnnouncement} onOpenChange={() => {
        setIsFormOpen(false)
        setEditingAnnouncement(null)
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAnnouncement ? 'お知らせ編集' : '新規お知らせ作成'}
            </DialogTitle>
          </DialogHeader>
          <AnnouncementForm
            announcement={editingAnnouncement}
            onSuccess={() => {
              setIsFormOpen(false)
              setEditingAnnouncement(null)
              refetch()
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

#### システム設定・営業時間
```typescript
// app/admin/settings/page.tsx
'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BusinessHoursSettings } from '@/components/admin/settings/BusinessHoursSettings'
import { SystemSettings } from '@/components/admin/settings/SystemSettings'
import { SpecialHolidaysSettings } from '@/components/admin/settings/SpecialHolidaysSettings'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">システム設定</h1>
      
      <Tabs defaultValue="business-hours">
        <TabsList>
          <TabsTrigger value="business-hours">営業時間</TabsTrigger>
          <TabsTrigger value="holidays">特別休業日</TabsTrigger>
          <TabsTrigger value="system">システム設定</TabsTrigger>
        </TabsList>
        
        <TabsContent value="business-hours">
          <BusinessHoursSettings />
        </TabsContent>
        
        <TabsContent value="holidays">
          <SpecialHolidaysSettings />
        </TabsContent>
        
        <TabsContent value="system">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// components/admin/settings/BusinessHoursSettings.tsx
export function BusinessHoursSettings() {
  const [hours, setHours] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  
  const daysOfWeek = [
    { key: 'monday', label: '月曜日' },
    { key: 'tuesday', label: '火曜日' },
    { key: 'wednesday', label: '水曜日' },
    { key: 'thursday', label: '木曜日' },
    { key: 'friday', label: '金曜日' },
    { key: 'saturday', label: '土曜日' },
    { key: 'sunday', label: '日曜日' },
  ]
  
  useEffect(() => {
    fetchBusinessHours()
  }, [])
  
  const fetchBusinessHours = async () => {
    const response = await fetch('/api/v1/admin/business-hours')
    const data = await response.json()
    setHours(data)
  }
  
  const handleSave = async () => {
    setIsLoading(true)
    
    const response = await fetch('/api/v1/admin/business-hours', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hours),
    })
    
    if (response.ok) {
      alert('営業時間を更新しました')
    }
    
    setIsLoading(false)
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">営業時間設定</h2>
      
      <div className="space-y-4">
        {daysOfWeek.map((day) => (
          <div key={day.key} className="flex items-center gap-4">
            <div className="w-24">{day.label}</div>
            
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={hours[day.key]?.open || '09:00'}
                onChange={(e) => setHours({
                  ...hours,
                  [day.key]: { ...hours[day.key], open: e.target.value }
                })}
              />
              <span>〜</span>
              <Input
                type="time"
                value={hours[day.key]?.close || '17:00'}
                onChange={(e) => setHours({
                  ...hours,
                  [day.key]: { ...hours[day.key], close: e.target.value }
                })}
              />
            </div>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={hours[day.key]?.is_closed || false}
                onChange={(e) => setHours({
                  ...hours,
                  [day.key]: { ...hours[day.key], is_closed: e.target.checked }
                })}
              />
              休業
            </label>
          </div>
        ))}
      </div>
      
      <Button
        onClick={handleSave}
        disabled={isLoading}
        className="mt-6"
      >
        {isLoading ? '保存中...' : '設定を保存'}
      </Button>
    </div>
  )
}
```

### 📅 Week 10-11: レポート・統計画面

#### レポート画面
```typescript
// app/admin/reports/page.tsx
'use client'

import { useState } from 'react'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  })
  const [reportType, setReportType] = useState('overview')
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">レポート・統計</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex gap-4 mb-6">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          
          <Select
            value={reportType}
            onValueChange={setReportType}
          >
            <option value="overview">概要</option>
            <option value="users">ユーザー分析</option>
            <option value="entries">入場分析</option>
            <option value="events">イベント分析</option>
          </Select>
          
          <Button>レポート生成</Button>
          <Button variant="outline">CSVエクスポート</Button>
        </div>
        
        {reportType === 'overview' && <OverviewReport dateRange={dateRange} />}
        {reportType === 'users' && <UserAnalytics dateRange={dateRange} />}
        {reportType === 'entries' && <EntryAnalytics dateRange={dateRange} />}
        {reportType === 'events' && <EventAnalytics dateRange={dateRange} />}
      </div>
    </div>
  )
}

function OverviewReport({ dateRange }) {
  // データ取得とグラフ表示
  const data = [
    { date: '2024-01-01', users: 120, entries: 45, events: 3 },
    { date: '2024-01-02', users: 125, entries: 52, events: 2 },
    // ...
  ]
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">利用者数推移</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="users" stroke="#8884d8" />
            <Line type="monotone" dataKey="entries" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">イベント参加率</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="events" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
```

### 📅 Week 12: テスト・最適化・デプロイ

#### パフォーマンス最適化
```typescript
// 遅延ローディングの実装
const AdminApplications = dynamic(
  () => import('@/components/admin/pages/AdminApplications'),
  { loading: () => <p>Loading...</p> }
)

// データキャッシュの実装
export function useAdminData() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: fetchAdminData,
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    cacheTime: 10 * 60 * 1000,
  })
}
```

#### Vercelデプロイ設定
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key"
  }
}
```

## 4. バックエンドとの連携ポイント

### 必要なAPIエンドポイント

| エンドポイント | メソッド | 用途 |
|---------------|---------|------|
| `/api/v1/admin/dashboard/stats` | GET | ダッシュボード統計 |
| `/api/v1/admin/applications` | GET | 申請一覧 |
| `/api/v1/admin/applications/{id}/approve` | PUT | 申請承認 |
| `/api/v1/admin/applications/{id}/reject` | PUT | 申請却下 |
| `/api/v1/admin/users` | GET | ユーザー一覧 |
| `/api/v1/admin/users/{id}` | GET/PUT | ユーザー詳細・更新 |
| `/api/v1/admin/posts` | GET | 投稿一覧 |
| `/api/v1/admin/events` | GET/POST | イベント管理 |
| `/api/v1/admin/entries/check-in` | POST | 入場処理 |
| `/api/v1/admin/announcements` | GET/POST | お知らせ管理 |
| `/api/v1/admin/reports` | GET | レポートデータ |

## 5. 成果物チェックリスト

### Week 1-2
- [ ] 管理者認証システム
- [ ] ダッシュボード画面
- [ ] 管理者レイアウト

### Week 3-4
- [ ] 申請管理機能（一覧・詳細・承認/却下）
- [ ] ユーザー管理機能

### Week 5-6
- [ ] イベント管理機能
- [ ] 投稿承認機能

### Week 7-8
- [ ] 入退場管理（QRスキャン）
- [ ] お知らせ管理

### Week 9-10
- [ ] 営業時間設定
- [ ] レポート・統計画面

### Week 11-12
- [ ] パフォーマンス最適化
- [ ] テスト実装
- [ ] Vercelデプロイ

## 6. 注意事項

1. **認証・認可**
   - すべての管理画面で権限チェック
   - セッション管理の適切な実装

2. **UX設計**
   - 大量データの表示（ページネーション、仮想スクロール）
   - リアルタイム更新（入退場状況）
   - 操作の確認ダイアログ

3. **エラーハンドリング**
   - APIエラーの適切な表示
   - ネットワークエラー対策
   - フォームバリデーション
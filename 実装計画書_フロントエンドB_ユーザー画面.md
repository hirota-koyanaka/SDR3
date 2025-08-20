# 実装計画書 - フロントエンドエンジニアB（ユーザー画面担当）

## 1. 担当範囲概要

### 主要責任
- 一般利用者向け画面の実装
- ユーザー認証・登録システムのUI
- 申請フォームの構築
- マイページ機能
- SNSフィード機能
- イベントカレンダー
- QRコード表示・入退場機能
- モバイルファースト設計

### 技術スタック
- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **UIライブラリ**: Radix UI
- **スタイリング**: Tailwind CSS
- **状態管理**: Zustand
- **データ取得**: Supabase Client + React Query
- **フォーム**: React Hook Form + Zod
- **カレンダー**: FullCalendar
- **QRコード**: qrcode.js
- **画像処理**: react-image-crop

## 2. プロジェクト構造

```
frontend/src/
├── app/
│   ├── (public)/                  # 認証不要ページ
│   │   ├── page.tsx               # ホームページ
│   │   ├── about/page.tsx         # 施設紹介
│   │   ├── application/           # 利用申請
│   │   │   ├── page.tsx          # 申請フォーム
│   │   │   └── status/page.tsx   # 申請状況確認
│   │   └── terms/page.tsx         # 利用規約
│   ├── (auth)/                    # 認証関連
│   │   ├── login/page.tsx         # ログイン
│   │   ├── register/page.tsx      # 新規登録
│   │   └── reset-password/page.tsx # パスワードリセット
│   ├── (user)/                    # 認証必須ページ
│   │   ├── dashboard/page.tsx     # ユーザーダッシュボード
│   │   ├── profile/               # プロフィール
│   │   │   ├── page.tsx          # プロフィール表示
│   │   │   └── edit/page.tsx     # プロフィール編集
│   │   ├── dogs/                  # 犬情報管理
│   │   │   ├── page.tsx          # 犬一覧
│   │   │   ├── new/page.tsx      # 犬登録
│   │   │   └── [id]/edit/page.tsx # 犬情報編集
│   │   ├── feed/                  # SNSフィード
│   │   │   ├── page.tsx          # フィード表示
│   │   │   └── new/page.tsx      # 新規投稿
│   │   ├── events/                # イベント
│   │   │   ├── page.tsx          # イベント一覧
│   │   │   └── [id]/page.tsx     # イベント詳細
│   │   ├── entry/                 # 入退場
│   │   │   └── qr/page.tsx       # QRコード表示
│   │   └── notifications/page.tsx # お知らせ
├── components/
│   ├── user/                      # ユーザー専用コンポーネント
│   │   ├── forms/                 # フォーム関連
│   │   ├── feed/                  # フィード関連
│   │   ├── events/                # イベント関連
│   │   └── profile/               # プロフィール関連
│   ├── common/                    # 共通コンポーネント
│   └── ui/                        # UIコンポーネント
├── lib/
│   ├── api/                       # API関連
│   │   └── user/                  # ユーザーAPI
│   └── utils/                     # ユーティリティ
└── hooks/                         # カスタムフック
    └── user/                      # ユーザー用フック
```

## 3. 週次実装計画

### 🚀 Week 0: 環境構築（3日間）

#### Day 1: プロジェクトセットアップ
```bash
# 必要パッケージインストール（フロントエンドAと共通のものは除く）
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/interaction
npm install qrcode react-qr-reader
npm install react-image-crop react-dropzone
npm install framer-motion
npm install react-intersection-observer
npm install react-hot-toast
```

#### Day 2: モバイルファースト設定
```typescript
// tailwind.config.js の設定
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
}

// lib/hooks/useMediaQuery.ts
import { useState, useEffect } from 'react'

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)
  
  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    
    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    
    return () => media.removeEventListener('change', listener)
  }, [matches, query])
  
  return matches
}
```

#### Day 3: 共通コンポーネント作成
```typescript
// components/common/MobileNavigation.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, PlusCircle, User, Bell } from 'lucide-react'

export function MobileNavigation() {
  const pathname = usePathname()
  
  const navItems = [
    { href: '/dashboard', icon: Home, label: 'ホーム' },
    { href: '/events', icon: Calendar, label: 'イベント' },
    { href: '/feed/new', icon: PlusCircle, label: '投稿' },
    { href: '/notifications', icon: Bell, label: 'お知らせ' },
    { href: '/profile', icon: User, label: 'マイページ' },
  ]
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center p-2 ${
                isActive ? 'text-blue-500' : 'text-gray-500'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

### 📅 Week 1: ホームページと認証システム

#### 月曜日-火曜日: ホームページ実装
```typescript
// app/(public)/page.tsx
import { Hero } from '@/components/user/home/Hero'
import { Features } from '@/components/user/home/Features'
import { ApplicationCTA } from '@/components/user/home/ApplicationCTA'
import { Announcements } from '@/components/user/home/Announcements'
import { BusinessHours } from '@/components/user/home/BusinessHours'

export default async function HomePage() {
  // 最新のお知らせを取得
  const announcements = await fetch('/api/v1/announcements?limit=3').then(r => r.json())
  
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <Announcements announcements={announcements} />
      <BusinessHours />
      <ApplicationCTA />
    </div>
  )
}

// components/user/home/Hero.tsx
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
      <Image
        src="/images/hero-dog-park.jpg"
        alt="里山ドッグラン"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/40" />
      
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-white max-w-2xl"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            里山ドッグラン
          </h1>
          <p className="text-lg md:text-xl mb-8">
            愛媛県今治市の自然豊かなドッグラン施設
            <br />
            愛犬と一緒に楽しい時間を過ごしませんか？
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/application">
              <Button size="lg" className="w-full sm:w-auto">
                利用申請はこちら
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 text-white border-white">
                施設について
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// components/user/home/Features.tsx
export function Features() {
  const features = [
    {
      icon: '🌳',
      title: '自然豊かな環境',
      description: '里山の自然に囲まれた広々とした空間で、愛犬が自由に走り回れます。',
    },
    {
      icon: '🛡️',
      title: '安全・安心',
      description: 'フェンスで囲まれた安全な環境。ワクチン接種確認で病気の心配もありません。',
    },
    {
      icon: '👥',
      title: 'コミュニティ',
      description: '同じ犬好きの仲間と交流。イベントも定期的に開催しています。',
    },
    {
      icon: '📱',
      title: 'スマート管理',
      description: 'QRコードで簡単入退場。アプリで混雑状況も確認できます。',
    },
  ]
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          里山ドッグランの特徴
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

#### 水曜日-木曜日: ログイン・新規登録画面
```typescript
// app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上必要です'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
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
      toast.error('ログインに失敗しました')
      setIsLoading(false)
      return
    }
    
    toast.success('ログインしました')
    router.push('/dashboard')
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">ログイン</h1>
            <p className="text-gray-600 mt-2">
              里山ドッグランへようこそ
            </p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <Input
                {...register('email')}
                type="email"
                placeholder="your@email.com"
                className="w-full"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <Input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-600">ログイン状態を保持</span>
              </label>
              <Link
                href="/reset-password"
                className="text-sm text-blue-600 hover:underline"
              >
                パスワードを忘れた方
              </Link>
            </div>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              アカウントをお持ちでない方は
              <Link href="/register" className="text-blue-600 hover:underline ml-1">
                新規登録
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// app/(auth)/register/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'react-hot-toast'

const registerSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上必要です'),
  confirmPassword: z.string(),
  name: z.string().min(1, '名前を入力してください'),
  phone: z.string().regex(/^0\d{9,10}$/, '有効な電話番号を入力してください'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })
  
  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    
    // Supabase Authでユーザー作成
    const { error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          phone: data.phone,
        },
      },
    })
    
    if (authError) {
      toast.error('登録に失敗しました')
      setIsLoading(false)
      return
    }
    
    toast.success('確認メールを送信しました。メールをご確認ください。')
    router.push('/login')
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">新規登録</h1>
            <p className="text-gray-600 mt-2">
              アカウントを作成して利用を開始しましょう
            </p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                お名前 <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('name')}
                placeholder="山田 太郎"
                className="w-full"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('email')}
                type="email"
                placeholder="your@email.com"
                className="w-full"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号 <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('phone')}
                type="tel"
                placeholder="09012345678"
                className="w-full"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('password')}
                type="password"
                placeholder="8文字以上"
                className="w-full"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード（確認） <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('confirmPassword')}
                type="password"
                placeholder="パスワードを再入力"
                className="w-full"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
            
            <div className="flex items-start">
              <input type="checkbox" className="mt-1 mr-2" required />
              <label className="text-sm text-gray-600">
                <Link href="/terms" className="text-blue-600 hover:underline">
                  利用規約
                </Link>
                および
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  プライバシーポリシー
                </Link>
                に同意します
              </label>
            </div>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? '登録中...' : '登録する'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              すでにアカウントをお持ちの方は
              <Link href="/login" className="text-blue-600 hover:underline ml-1">
                ログイン
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### 金曜日: 認証ガードとレイアウト
```typescript
// app/(user)/layout.tsx
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { UserHeader } from '@/components/user/layouts/UserHeader'
import { MobileNavigation } from '@/components/common/MobileNavigation'

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader user={session.user} />
      <main className="pb-16 md:pb-0">{children}</main>
      <MobileNavigation />
    </div>
  )
}
```

### 📅 Week 2-3: 利用申請システム

#### 申請フォーム（多段階）
```typescript
// app/(public)/application/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ApplicationStep1 } from '@/components/user/application/Step1Basic'
import { ApplicationStep2 } from '@/components/user/application/Step2Address'
import { ApplicationStep3 } from '@/components/user/application/Step3Dogs'
import { ApplicationStep4 } from '@/components/user/application/Step4Documents'
import { ApplicationStep5 } from '@/components/user/application/Step5Confirm'
import { ProgressBar } from '@/components/common/ProgressBar'

export default function ApplicationPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // 基本情報
    name: '',
    email: '',
    phone: '',
    // 住所情報
    address: '',
    is_imabari_resident: false,
    residence_years: 0,
    // 犬情報
    dogs: [],
    // 書類
    vaccination_certificates: [],
  })
  
  const steps = [
    { number: 1, title: '基本情報' },
    { number: 2, title: '住所確認' },
    { number: 3, title: '犬情報' },
    { number: 4, title: '必要書類' },
    { number: 5, title: '確認' },
  ]
  
  const handleNext = (stepData: any) => {
    setFormData({ ...formData, ...stepData })
    setCurrentStep(currentStep + 1)
  }
  
  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }
  
  const handleSubmit = async () => {
    const response = await fetch('/api/v1/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    
    if (response.ok) {
      const data = await response.json()
      router.push(`/application/status?id=${data.id}`)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8">
          里山ドッグラン利用申請
        </h1>
        
        <ProgressBar steps={steps} currentStep={currentStep} />
        
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mt-8">
          {currentStep === 1 && (
            <ApplicationStep1
              data={formData}
              onNext={handleNext}
            />
          )}
          {currentStep === 2 && (
            <ApplicationStep2
              data={formData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <ApplicationStep3
              data={formData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 4 && (
            <ApplicationStep4
              data={formData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 5 && (
            <ApplicationStep5
              data={formData}
              onSubmit={handleSubmit}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// components/user/application/Step3Dogs.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'

export function ApplicationStep3({ data, onNext, onBack }) {
  const [dogs, setDogs] = useState(data.dogs || [])
  const [showAddForm, setShowAddForm] = useState(dogs.length === 0)
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  
  const addDog = (dogData: any) => {
    setDogs([...dogs, dogData])
    reset()
    setShowAddForm(false)
  }
  
  const removeDog = (index: number) => {
    setDogs(dogs.filter((_, i) => i !== index))
  }
  
  const handleNext = () => {
    if (dogs.length === 0) {
      alert('少なくとも1頭の犬を登録してください')
      return
    }
    onNext({ dogs })
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">犬情報の登録</h2>
      
      <div className="space-y-4">
        {dogs.map((dog, index) => (
          <div key={index} className="border rounded-lg p-4 relative">
            <button
              onClick={() => removeDog(index)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              <Trash2 size={20} />
            </button>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-sm text-gray-500">名前:</span>
                <p className="font-medium">{dog.name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">犬種:</span>
                <p className="font-medium">{dog.breed}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">体重:</span>
                <p className="font-medium">{dog.weight}kg</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">性別:</span>
                <p className="font-medium">{dog.gender === 'male' ? 'オス' : 'メス'}</p>
              </div>
            </div>
          </div>
        ))}
        
        {showAddForm ? (
          <form onSubmit={handleSubmit(addDog)} className="border-2 border-dashed rounded-lg p-4">
            <h3 className="font-semibold mb-4">新しい犬を追加</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  名前 <span className="text-red-500">*</span>
                </label>
                <Input {...register('name', { required: true })} />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  犬種 <span className="text-red-500">*</span>
                </label>
                <Input {...register('breed', { required: true })} />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  体重（kg） <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.1"
                  {...register('weight', { required: true, min: 0 })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  性別 <span className="text-red-500">*</span>
                </label>
                <Select {...register('gender', { required: true })}>
                  <option value="">選択してください</option>
                  <option value="male">オス</option>
                  <option value="female">メス</option>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  生年月日
                </label>
                <Input type="date" {...register('birth_date')} />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  去勢・避妊
                </label>
                <Select {...register('is_neutered')}>
                  <option value="">選択してください</option>
                  <option value="true">済み</option>
                  <option value="false">未実施</option>
                </Select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  性格・特記事項
                </label>
                <Textarea
                  {...register('personality')}
                  rows={3}
                  placeholder="例：人懐っこい、他の犬が苦手、など"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button type="submit">追加</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                キャンセル
              </Button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full border-2 border-dashed rounded-lg p-4 text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
          >
            <Plus className="mx-auto mb-2" />
            犬を追加
          </button>
        )}
      </div>
      
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack}>
          戻る
        </Button>
        <Button onClick={handleNext}>
          次へ
        </Button>
      </div>
    </div>
  )
}
```

### 📅 Week 4-5: マイページと犬情報管理

#### ユーザーダッシュボード
```typescript
// app/(user)/dashboard/page.tsx
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { WelcomeCard } from '@/components/user/dashboard/WelcomeCard'
import { QuickActions } from '@/components/user/dashboard/QuickActions'
import { RecentActivities } from '@/components/user/dashboard/RecentActivities'
import { UpcomingEvents } from '@/components/user/dashboard/UpcomingEvents'
import { CurrentWeather } from '@/components/user/dashboard/CurrentWeather'

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // ユーザー情報と関連データを取得
  const [userData, events, activities] = await Promise.all([
    supabase.from('users').select('*, dogs(*)').eq('auth_id', user.id).single(),
    supabase.from('events').select('*').gte('event_date', new Date().toISOString()).limit(3),
    supabase.from('entry_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
  ])
  
  return (
    <div className="container mx-auto px-4 py-6">
      <WelcomeCard user={userData.data} />
      
      <QuickActions />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <UpcomingEvents events={events.data} />
          <RecentActivities activities={activities.data} />
        </div>
        
        <div className="space-y-6">
          <CurrentWeather />
          <MyDogsCard dogs={userData.data.dogs} />
        </div>
      </div>
    </div>
  )
}

// components/user/dashboard/QuickActions.tsx
'use client'

import Link from 'next/link'
import { QrCode, Calendar, PlusCircle, Dog } from 'lucide-react'

export function QuickActions() {
  const actions = [
    {
      href: '/entry/qr',
      icon: QrCode,
      label: 'QRコード',
      color: 'bg-blue-500',
    },
    {
      href: '/events',
      icon: Calendar,
      label: 'イベント',
      color: 'bg-green-500',
    },
    {
      href: '/feed/new',
      icon: PlusCircle,
      label: '投稿する',
      color: 'bg-purple-500',
    },
    {
      href: '/dogs',
      icon: Dog,
      label: '犬情報',
      color: 'bg-orange-500',
    },
  ]
  
  return (
    <div className="grid grid-cols-4 gap-4 mt-6">
      {actions.map((action) => {
        const Icon = action.icon
        
        return (
          <Link
            key={action.href}
            href={action.href}
            className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className={`${action.color} p-3 rounded-full text-white mb-2`}>
              <Icon size={24} />
            </div>
            <span className="text-sm text-gray-700">{action.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
```

#### 犬情報管理
```typescript
// app/(user)/dogs/page.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { DogCard } from '@/components/user/dogs/DogCard'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function DogsPage() {
  const { data: dogs, isLoading } = useQuery({
    queryKey: ['my-dogs'],
    queryFn: async () => {
      const response = await fetch('/api/v1/dogs/my-dogs')
      return response.json()
    },
  })
  
  if (isLoading) {
    return <div>読み込み中...</div>
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">登録犬情報</h1>
        <Link href="/dogs/new">
          <Button>
            <Plus className="mr-2" size={20} />
            犬を追加
          </Button>
        </Link>
      </div>
      
      {dogs?.length === 0 ? (
        <div className="text-center py-12">
          <Dog className="mx-auto text-gray-400 mb-4" size={64} />
          <p className="text-gray-600 mb-4">まだ犬が登録されていません</p>
          <Link href="/dogs/new">
            <Button>最初の犬を登録</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dogs?.map((dog) => (
            <DogCard key={dog.id} dog={dog} />
          ))}
        </div>
      )}
    </div>
  )
}

// components/user/dogs/DogCard.tsx
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Weight, Syringe } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export function DogCard({ dog }) {
  const latestVaccination = dog.vaccination_records?.[0]
  const age = dog.birth_date
    ? Math.floor((Date.now() - new Date(dog.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="aspect-square relative mb-4 rounded-lg overflow-hidden bg-gray-100">
          {dog.photo_url ? (
            <Image
              src={dog.photo_url}
              alt={dog.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Dog className="text-gray-400" size={64} />
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold">{dog.name}</h3>
            <p className="text-gray-600">{dog.breed}</p>
          </div>
          <Badge variant={dog.gender === 'male' ? 'blue' : 'pink'}>
            {dog.gender === 'male' ? 'オス' : 'メス'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {age !== null && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="mr-2" size={16} />
            {age}歳
          </div>
        )}
        
        {dog.weight && (
          <div className="flex items-center text-sm text-gray-600">
            <Weight className="mr-2" size={16} />
            {dog.weight}kg
          </div>
        )}
        
        {latestVaccination && (
          <div className="flex items-center text-sm">
            <Syringe className="mr-2" size={16} />
            <span className="text-gray-600">ワクチン:</span>
            <span className="ml-1">
              {format(new Date(latestVaccination.vaccination_date), 'yyyy/MM/dd', { locale: ja })}
            </span>
          </div>
        )}
        
        <Link href={`/dogs/${dog.id}/edit`}>
          <Button variant="outline" className="w-full mt-4">
            編集
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
```

### 📅 Week 6-7: SNSフィード機能

#### フィード画面
```typescript
// app/(user)/feed/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { PostCard } from '@/components/user/feed/PostCard'
import { CategoryFilter } from '@/components/user/feed/CategoryFilter'
import { CreatePostButton } from '@/components/user/feed/CreatePostButton'
import { useInfiniteQuery } from '@tanstack/react-query'

export default function FeedPage() {
  const [category, setCategory] = useState('all')
  const { ref, inView } = useInView()
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['feed', category],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams({
        limit: '10',
        offset: String(pageParam),
      })
      if (category !== 'all') params.append('category', category)
      
      const response = await fetch(`/api/v1/posts/feed?${params}`)
      return response.json()
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === 10 ? pages.length * 10 : undefined
    },
  })
  
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, fetchNextPage, hasNextPage])
  
  const posts = data?.pages.flatMap((page) => page) ?? []
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">フィード</h1>
        <CreatePostButton />
      </div>
      
      <CategoryFilter
        selected={category}
        onChange={setCategory}
      />
      
      <div className="space-y-4 mt-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        
        {hasNextPage && (
          <div ref={ref} className="py-4 text-center">
            {isFetchingNextPage ? '読み込み中...' : ''}
          </div>
        )}
      </div>
    </div>
  )
}

// components/user/feed/PostCard.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Heart, MessageCircle, Share } from 'lucide-react'
import { CommentSection } from './CommentSection'
import { ImageGallery } from './ImageGallery'

export function PostCard({ post }) {
  const [isLiked, setIsLiked] = useState(post.is_liked)
  const [likeCount, setLikeCount] = useState(post.likes_count)
  const [showComments, setShowComments] = useState(false)
  
  const handleLike = async () => {
    const response = await fetch(`/api/v1/posts/${post.id}/like`, {
      method: 'POST',
    })
    
    if (response.ok) {
      const data = await response.json()
      setIsLiked(data.liked)
      setLikeCount(data.liked ? likeCount + 1 : likeCount - 1)
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow">
      {/* ヘッダー */}
      <div className="p-4 flex items-center">
        <div className="w-10 h-10 rounded-full bg-gray-200 mr-3">
          {post.user.avatar_url && (
            <Image
              src={post.user.avatar_url}
              alt={post.user.name}
              width={40}
              height={40}
              className="rounded-full"
            />
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold">{post.user.name}</p>
          <p className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(post.created_at), {
              addSuffix: true,
              locale: ja,
            })}
          </p>
        </div>
      </div>
      
      {/* コンテンツ */}
      <div className="px-4 pb-2">
        <p className="whitespace-pre-wrap">{post.content}</p>
        
        {post.hashtags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {post.hashtags.map((tag) => (
              <span
                key={tag}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* 画像 */}
      {post.images?.length > 0 && (
        <ImageGallery images={post.images} />
      )}
      
      {/* アクション */}
      <div className="px-4 py-2 border-t">
        <div className="flex items-center justify-between">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-100 ${
              isLiked ? 'text-red-500' : 'text-gray-600'
            }`}
          >
            <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
            <span className="text-sm">{likeCount}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 text-gray-600"
          >
            <MessageCircle size={20} />
            <span className="text-sm">{post.comments_count}</span>
          </button>
          
          <button className="p-2 rounded hover:bg-gray-100 text-gray-600">
            <Share size={20} />
          </button>
        </div>
      </div>
      
      {/* コメント */}
      {showComments && (
        <CommentSection postId={post.id} />
      )}
    </div>
  )
}
```

#### 新規投稿画面
```typescript
// app/(user)/feed/new/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ImageUploader } from '@/components/user/feed/ImageUploader'
import { HashtagInput } from '@/components/user/feed/HashtagInput'
import { CategorySelect } from '@/components/user/feed/CategorySelect'
import { toast } from 'react-hot-toast'

export default function NewPostPage() {
  const router = useRouter()
  const [images, setImages] = useState<string[]>([])
  const [hashtags, setHashtags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { register, handleSubmit, watch } = useForm()
  const contentLength = watch('content')?.length || 0
  
  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    
    const response = await fetch('/api/v1/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        images,
        hashtags,
      }),
    })
    
    if (response.ok) {
      toast.success('投稿しました')
      router.push('/feed')
    } else {
      toast.error('投稿に失敗しました')
    }
    
    setIsSubmitting(false)
  }
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">新規投稿</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Textarea
              {...register('content', { required: true, maxLength: 500 })}
              placeholder="今日の出来事を共有しましょう..."
              rows={6}
              className="w-full"
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {contentLength} / 500
            </div>
          </div>
          
          <CategorySelect {...register('category')} />
          
          <HashtagInput
            hashtags={hashtags}
            onChange={setHashtags}
          />
          
          <ImageUploader
            images={images}
            onChange={setImages}
            maxImages={4}
          />
          
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting || contentLength === 0}
              className="flex-1"
            >
              {isSubmitting ? '投稿中...' : '投稿する'}
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
    </div>
  )
}
```

### 📅 Week 8-9: イベント・QRコード機能

#### イベントカレンダー
```typescript
// app/(user)/events/page.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { EventDetailModal } from '@/components/user/events/EventDetailModal'
import { EventsList } from '@/components/user/events/EventsList'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function EventsPage() {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [view, setView] = useState('calendar')
  
  const { data: events } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await fetch('/api/v1/events')
      return response.json()
    },
  })
  
  const calendarEvents = events?.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.event_date,
    extendedProps: event,
  }))
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">イベント</h1>
      
      <Tabs value={view} onValueChange={setView}>
        <TabsList className="mb-6">
          <TabsTrigger value="calendar">カレンダー</TabsTrigger>
          <TabsTrigger value="list">リスト</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar">
          <div className="bg-white rounded-lg shadow p-4">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={calendarEvents}
              eventClick={(info) => setSelectedEvent(info.event.extendedProps)}
              locale="ja"
              height="auto"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek',
              }}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="list">
          <EventsList events={events} onSelect={setSelectedEvent} />
        </TabsContent>
      </Tabs>
      
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  )
}
```

#### QRコード表示
```typescript
// app/(user)/entry/qr/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import QRCode from 'qrcode'
import { DogSelector } from '@/components/user/entry/DogSelector'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export default function QRCodePage() {
  const [selectedDogs, setSelectedDogs] = useState<string[]>([])
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  
  const { data: dogs } = useQuery({
    queryKey: ['my-dogs'],
    queryFn: async () => {
      const response = await fetch('/api/v1/dogs/my-dogs')
      return response.json()
    },
  })
  
  const generateQR = async () => {
    if (selectedDogs.length === 0) {
      alert('入場する犬を選択してください')
      return
    }
    
    const response = await fetch('/api/v1/entries/qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dog_ids: selectedDogs }),
    })
    
    if (response.ok) {
      const { qr_data } = await response.json()
      const url = await QRCode.toDataURL(qr_data, {
        width: 300,
        margin: 2,
      })
      setQrCodeUrl(url)
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">入場QRコード</h1>
        
        {!qrCodeUrl ? (
          <>
            <DogSelector
              dogs={dogs}
              selected={selectedDogs}
              onChange={setSelectedDogs}
            />
            
            <Button
              onClick={generateQR}
              disabled={selectedDogs.length === 0}
              className="w-full mt-6"
              size="lg"
            >
              QRコード生成
            </Button>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <img src={qrCodeUrl} alt="QR Code" />
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                このQRコードを入口でスタッフに提示してください。
                有効期限：24時間
              </p>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={generateQR}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="mr-2" size={20} />
                再生成
              </Button>
              
              <Button
                onClick={() => {
                  setQrCodeUrl('')
                  setSelectedDogs([])
                }}
                variant="outline"
                className="w-full"
              >
                犬を選び直す
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
```

### 📅 Week 10-11: 通知・お知らせ機能

#### お知らせ一覧
```typescript
// app/(user)/notifications/page.tsx
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { NotificationCard } from '@/components/user/notifications/NotificationCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { CheckCheck } from 'lucide-react'

export default function NotificationsPage() {
  const [filter, setFilter] = useState('all')
  const queryClient = useQueryClient()
  
  const { data: notifications } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('status', filter)
      
      const response = await fetch(`/api/v1/notifications?${params}`)
      return response.json()
    },
  })
  
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/v1/notifications/read-all', {
        method: 'PUT',
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
    },
  })
  
  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          お知らせ
          {unreadCount > 0 && (
            <span className="ml-2 text-sm bg-red-500 text-white px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </h1>
        
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsReadMutation.mutate()}
          >
            <CheckCheck className="mr-2" size={16} />
            すべて既読にする
          </Button>
        )}
      </div>
      
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">すべて</TabsTrigger>
          <TabsTrigger value="unread">未読</TabsTrigger>
          <TabsTrigger value="announcements">お知らせ</TabsTrigger>
          <TabsTrigger value="events">イベント</TabsTrigger>
        </TabsList>
        
        <TabsContent value={filter}>
          {notifications?.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">お知らせはありません</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications?.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

### 📅 Week 12: パフォーマンス最適化とテスト

#### PWA対応
```typescript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
})

module.exports = withPWA({
  // 他の設定
})

// public/manifest.json
{
  "name": "里山ドッグラン",
  "short_name": "里山ドッグラン",
  "description": "愛媛県今治市のドッグラン施設",
  "theme_color": "#3B82F6",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 4. バックエンドとの連携ポイント

### 必要なAPIエンドポイント

| エンドポイント | メソッド | 用途 |
|---------------|---------|------|
| `/api/v1/auth/register` | POST | 新規登録 |
| `/api/v1/auth/login` | POST | ログイン |
| `/api/v1/applications` | POST | 申請作成 |
| `/api/v1/users/profile` | GET/PUT | プロフィール |
| `/api/v1/dogs` | GET/POST/PUT/DELETE | 犬情報CRUD |
| `/api/v1/posts/feed` | GET | フィード取得 |
| `/api/v1/posts/{id}/like` | POST | いいね |
| `/api/v1/events` | GET | イベント一覧 |
| `/api/v1/entries/qr` | POST | QRコード生成 |
| `/api/v1/notifications` | GET | 通知一覧 |

## 5. 成果物チェックリスト

### Week 1-2
- [ ] ホームページ
- [ ] 認証システム（ログイン/新規登録）
- [ ] レスポンシブ対応

### Week 3-4
- [ ] 利用申請フォーム（多段階）
- [ ] 申請状況確認
- [ ] ユーザーダッシュボード

### Week 5-6
- [ ] マイページ
- [ ] 犬情報管理
- [ ] プロフィール編集

### Week 7-8
- [ ] SNSフィード
- [ ] 投稿作成
- [ ] いいね・コメント機能

### Week 9-10
- [ ] イベントカレンダー
- [ ] QRコード表示
- [ ] 入退場機能

### Week 11-12
- [ ] 通知・お知らせ
- [ ] PWA対応
- [ ] パフォーマンス最適化

## 6. 注意事項

1. **モバイルファースト**
   - すべての画面でモバイル対応必須
   - タッチ操作の最適化
   - オフライン対応

2. **UX最適化**
   - ローディング状態の表示
   - エラーハンドリング
   - スムーズなアニメーション

3. **パフォーマンス**
   - 画像の最適化
   - 遅延ローディング
   - キャッシュ戦略
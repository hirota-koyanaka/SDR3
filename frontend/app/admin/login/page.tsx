'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { DemoLoginButton } from './demo-button'

const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上必要です'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function AdminLoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })
  
  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setError(null)
    
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    
    if (authError) {
      setError('ログインに失敗しました。メールアドレスとパスワードを確認してください。')
      setIsLoading(false)
      return
    }
    
    // 管理者権限確認
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('ユーザー情報の取得に失敗しました')
      setIsLoading(false)
      return
    }
    
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('auth_id', user.id)
      .single()
    
    if (adminError || !adminUser) {
      setError('管理者権限がありません')
      await supabase.auth.signOut()
      setIsLoading(false)
      return
    }
    
    router.push('/admin')
    router.refresh()
  }
  
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">管理者ログイン</h1>
            <p className="mt-2 text-gray-600">里山ドッグラン管理システム</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                {...register('email')}
                id="email"
                type="email"
                placeholder="admin@example.com"
                className="mt-1"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="password">パスワード</Label>
              <Input
                {...register('password')}
                id="password"
                type="password"
                placeholder="••••••••"
                className="mt-1"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>
          
          {/* デモ用ワンクリックログインセクション */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-600 mb-4">
              開発デモ用
            </div>
            <DemoLoginButton />
            <p className="text-xs text-gray-500 text-center mt-2">
              ※ 開発版のため認証なしでアクセスできます
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
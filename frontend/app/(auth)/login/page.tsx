'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import { DemoUserLoginButton } from './demo-button'

const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上必要です'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { signIn } = useAuth()
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
    
    const { error } = await signIn(data.email, data.password)
    
    if (error) {
      toast.error('ログインに失敗しました: ' + error.message)
      setIsLoading(false)
      return
    }
    
    toast.success('ログインしました')
  }
  
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
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
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                {...register('email')}
                id="email"
                type="email"
                placeholder="your@email.com"
                className="w-full mt-1"
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
                className="w-full mt-1"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2 rounded" />
                <span className="text-sm text-gray-600">ログイン状態を保持</span>
              </label>
              <Link
                href="/reset-password"
                className="text-sm text-primary hover:underline"
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
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ログイン中...
                </>
              ) : (
                'ログイン'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              アカウントをお持ちでない方は
              <Link href="/register" className="text-primary hover:underline ml-1">
                新規登録
              </Link>
            </p>
          </div>
          
          {/* デモ用ワンクリックログインセクション */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-600 mb-4">
              開発デモ用
            </div>
            <DemoUserLoginButton />
            <p className="text-xs text-gray-500 text-center mt-2">
              ※ 開発版のため認証なしでアクセスできます
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
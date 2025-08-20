'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QuickActions } from '@/components/user/dashboard/QuickActions'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [userName, setUserName] = useState('ユーザー')
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const checkAuth = async () => {
      // デモモードチェック
      const isDemo = localStorage.getItem('demo_user')
      
      if (isDemo) {
        setUserName('デモユーザー')
        setIsLoading(false)
        return
      }
      
      // 通常の認証チェック
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }
      
      setUserName(user.user_metadata?.name || user.email?.split('@')[0] || 'ユーザー')
      setIsLoading(false)
    }
    
    checkAuth()
  }, [router, supabase])
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          ようこそ、{userName}さん
        </h1>
        <p className="text-gray-600 mt-2">
          里山ドッグランで愛犬と素敵な時間をお過ごしください
        </p>
      </div>
      
      <QuickActions />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">最近のアクティビティ</h2>
            <p className="text-gray-500">アクティビティがありません</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">お知らせ</h3>
            <div className="space-y-3">
              <div className="pb-3 border-b">
                <p className="text-sm font-medium">年末年始の営業について</p>
                <p className="text-xs text-gray-600 mt-1">2024年12月20日</p>
              </div>
              <div className="pb-3">
                <p className="text-sm font-medium">新年イベント開催</p>
                <p className="text-xs text-gray-600 mt-1">2024年12月18日</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">今月の利用状況</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">利用回数</span>
                <span className="font-semibold">0回</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">合計時間</span>
                <span className="font-semibold">0時間</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
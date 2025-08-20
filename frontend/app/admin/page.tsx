'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { StatsCards } from '@/components/admin/dashboard/StatsCards'
import { RecentApplications } from '@/components/admin/dashboard/RecentApplications'
import { VisitorChart } from '@/components/admin/dashboard/VisitorChart'

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [adminName, setAdminName] = useState('管理者')
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApplications: 0,
    upcomingEvents: 0,
    currentVisitors: 0,
  })
  
  useEffect(() => {
    const checkAuth = async () => {
      // デモモードチェック
      const isDemo = localStorage.getItem('demo_admin')
      
      if (isDemo) {
        setAdminName('デモ管理者')
        // デモ用のダミーデータ
        setStats({
          totalUsers: 128,
          pendingApplications: 5,
          upcomingEvents: 3,
          currentVisitors: 12,
        })
        setIsLoading(false)
        return
      }
      
      // 通常の認証チェック
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/admin/login')
        return
      }
      
      // 実際のデータ取得
      const [users, applications, events, currentVisitors] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('events').select('id', { count: 'exact', head: true }).gte('event_date', new Date().toISOString()),
        supabase.from('entry_logs').select('id', { count: 'exact', head: true }).is('exit_time', null),
      ])
      
      setStats({
        totalUsers: users.count || 0,
        pendingApplications: applications.count || 0,
        upcomingEvents: events.count || 0,
        currentVisitors: currentVisitors.count || 0,
      })
      
      setAdminName(user.user_metadata?.name || user.email?.split('@')[0] || '管理者')
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-gray-600 mt-1">ようこそ、{adminName}さん - システムの概要と統計情報</p>
      </div>
      
      <StatsCards stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentApplications applications={[]} />
        <VisitorChart />
      </div>
    </div>
  )
}
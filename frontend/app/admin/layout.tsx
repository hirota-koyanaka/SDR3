'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AdminSidebar } from '@/components/admin/layouts/AdminSidebar'
import { AdminHeader } from '@/components/admin/layouts/AdminHeader'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const supabase = createClient()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const checkAuth = async () => {
      // デモモードチェック
      const isDemo = localStorage.getItem('demo_admin')
      console.log('Admin layout - checking auth, demo mode:', isDemo)
      
      if (isDemo === 'true') {
        console.log('Admin layout - demo mode detected, authorizing...')
        setIsAuthorized(true)
        setIsLoading(false)
        return
      }
      
      // 通常の認証チェック
      console.log('Admin layout - checking normal auth...')
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.log('Admin layout - no session, redirecting to login')
        router.push('/admin/login')
        return
      }
      
      console.log('Admin layout - session found, authorizing...')
      setIsAuthorized(true)
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
  
  if (!isAuthorized) {
    return null
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
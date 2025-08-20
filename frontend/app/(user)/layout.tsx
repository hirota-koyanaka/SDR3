'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserHeader } from '@/components/user/layouts/UserHeader'
import { MobileNavigation } from '@/components/common/MobileNavigation'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const checkAuth = async () => {
      // デモモードチェック
      const isDemo = localStorage.getItem('demo_user')
      
      if (isDemo) {
        setUser({
          id: 'demo',
          email: 'demo@example.com',
          user_metadata: { name: 'デモユーザー' }
        })
        setIsLoading(false)
        return
      }
      
      // 通常の認証チェック
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }
      
      setUser(session.user)
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
  
  if (!user) {
    return null
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader user={user} />
      <main className="pb-16 md:pb-0">{children}</main>
      <MobileNavigation />
    </div>
  )
}
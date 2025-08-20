'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { NotificationBell } from '@/components/common/NotificationBell'
import { Button } from '@/components/ui/button'
import { User, LogOut } from 'lucide-react'

export function AdminHeader() {
  const { signOut, user } = useAuth()
  const supabase = createClient()
  const [adminName, setAdminName] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchAdminInfo = async () => {
      if (user) {
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('name')
          .eq('auth_id', user.id)
          .single()
        
        if (adminUser) {
          setAdminName(adminUser.name || user.email || '')
        }
      }
    }
    
    fetchAdminInfo()
  }, [user, supabase])

  const handleLogout = async () => {
    setIsLoading(true)
    await signOut()
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            里山ドッグラン管理システム
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <NotificationBell />
          <div className="flex items-center text-sm text-gray-700">
            <User className="h-4 w-4 mr-2" />
            <span>{adminName || 'Admin'}</span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={isLoading}
          >
            <LogOut className="h-4 w-4 mr-2" />
            ログアウト
          </Button>
        </div>
      </div>
    </header>
  )
}
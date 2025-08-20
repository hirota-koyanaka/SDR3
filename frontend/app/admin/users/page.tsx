'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UsersTable } from '@/components/admin/tables/UsersTable'
import { UserStatsCards } from '@/components/admin/dashboard/UserStatsCards'
import { Input } from '@/components/ui/input'
import { Search, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    newUsersThisMonth: 0,
  })
  const supabase = createClient()

  const fetchUsers = async () => {
    setIsLoading(true)
    let query = supabase.from('users').select('*, dogs(count)')
    
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    }
    
    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (!error && data) {
      setUsers(data)
    }
    setIsLoading(false)
  }

  const fetchStats = async () => {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const [total, active, suspended, newThisMonth] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('status', 'suspended'),
      supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', firstDayOfMonth.toISOString()),
    ])
    
    setStats({
      totalUsers: total.count || 0,
      activeUsers: active.count || 0,
      suspendedUsers: suspended.count || 0,
      newUsersThisMonth: newThisMonth.count || 0,
    })
  }

  useEffect(() => {
    fetchUsers()
    fetchStats()
  }, [searchTerm, filterStatus])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ユーザー管理</h1>
          <p className="text-gray-600 mt-1">登録ユーザーの管理と詳細確認</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="名前やメールで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">すべて</option>
            <option value="active">アクティブ</option>
            <option value="suspended">停止中</option>
          </select>
        </div>
      </div>
      
      <UserStatsCards stats={stats} />
      
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            読み込み中...
          </div>
        ) : (
          <UsersTable users={users} onUpdate={fetchUsers} />
        )}
      </div>
    </div>
  )
}
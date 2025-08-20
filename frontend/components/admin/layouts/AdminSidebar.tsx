'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  MessageSquare, 
  Calendar, 
  Bell, 
  DoorOpen, 
  Settings, 
  BarChart3 
} from 'lucide-react'

const menuItems = [
  { href: '/admin', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/admin/applications', label: '申請管理', icon: FileText },
  { href: '/admin/users', label: 'ユーザー管理', icon: Users },
  { href: '/admin/posts', label: '投稿管理', icon: MessageSquare },
  { href: '/admin/events', label: 'イベント管理', icon: Calendar },
  { href: '/admin/announcements', label: 'お知らせ', icon: Bell },
  { href: '/admin/entries', label: '入退場管理', icon: DoorOpen },
  { href: '/admin/settings', label: '設定', icon: Settings },
  { href: '/admin/reports', label: 'レポート', icon: BarChart3 },
]

export function AdminSidebar() {
  const pathname = usePathname()
  
  return (
    <aside className="w-64 bg-white shadow-md min-h-[calc(100vh-64px)]">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href))
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
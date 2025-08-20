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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-50">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center p-2 transition-colors ${
                isActive ? 'text-primary' : 'text-gray-500'
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
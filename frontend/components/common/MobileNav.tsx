'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Users, MessageSquare, Menu, X, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface MobileNavProps {
  isAdmin?: boolean
  className?: string
}

export function MobileNav({ isAdmin = false, className }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  
  const userNavItems = [
    { href: '/dashboard', icon: Home, label: 'ホーム' },
    { href: '/events', icon: Calendar, label: 'イベント' },
    { href: '/sns', icon: MessageSquare, label: 'SNS' },
    { href: '/profile', icon: User, label: 'プロフィール' },
  ]
  
  const adminNavItems = [
    { href: '/admin', icon: Home, label: 'ダッシュボード' },
    { href: '/admin/applications', icon: Users, label: '申請管理' },
    { href: '/admin/events', icon: Calendar, label: 'イベント管理' },
    { href: '/admin/announcements', icon: MessageSquare, label: 'お知らせ管理' },
    { href: '/admin/reports', icon: Users, label: 'レポート' },
  ]
  
  const navItems = isAdmin ? adminNavItems : userNavItems
  
  return (
    <>
      {/* モバイル用ボトムナビゲーション */}
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-white border-t md:hidden",
        className
      )}>
        <div className="flex justify-around items-center h-16">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center px-3 py-2 text-xs transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-gray-500 hover:text-primary"
                )}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span>{item.label}</span>
              </Link>
            )
          })}
          
          {/* ハンバーガーメニュー */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center px-3 py-2 text-xs text-gray-500 hover:text-primary transition-colors">
                <Menu className="w-5 h-5 mb-1" />
                <span>メニュー</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>メニュー</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-6">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
                
                <div className="border-t pt-4 mt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      // ログアウト処理
                      setIsOpen(false)
                    }}
                  >
                    ログアウト
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
      
      {/* ボトムナビゲーション分のスペース確保 */}
      <div className="h-16 md:hidden" />
    </>
  )
}

// モバイル用ヘッダー
export function MobileHeader({ title, className }: { title: string; className?: string }) {
  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-40 bg-white border-b md:hidden",
      className
    )}>
      <div className="flex items-center justify-between h-14 px-4">
        <h1 className="text-lg font-semibold truncate">{title}</h1>
      </div>
    </header>
  )
}
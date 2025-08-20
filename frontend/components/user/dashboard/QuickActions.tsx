'use client'

import Link from 'next/link'
import { QrCode, Calendar, PlusCircle, Dog } from 'lucide-react'

export function QuickActions() {
  const actions = [
    {
      href: '/entry/qr',
      icon: QrCode,
      label: 'QRコード',
      color: 'bg-blue-500',
    },
    {
      href: '/events',
      icon: Calendar,
      label: 'イベント',
      color: 'bg-green-500',
    },
    {
      href: '/feed/new',
      icon: PlusCircle,
      label: '投稿する',
      color: 'bg-purple-500',
    },
    {
      href: '/dogs',
      icon: Dog,
      label: '犬情報',
      color: 'bg-orange-500',
    },
  ]
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action) => {
        const Icon = action.icon
        
        return (
          <Link
            key={action.href}
            href={action.href}
            className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className={`${action.color} p-3 rounded-full text-white mb-2`}>
              <Icon size={24} />
            </div>
            <span className="text-sm text-gray-700">{action.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
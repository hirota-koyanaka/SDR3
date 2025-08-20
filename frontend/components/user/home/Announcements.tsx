'use client'

import Link from 'next/link'
import { Calendar, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Announcement {
  id: string
  title: string
  content: string
  created_at: string
  category: string
}

interface AnnouncementsProps {
  announcements: Announcement[]
}

export function Announcements({ announcements }: AnnouncementsProps) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">最新のお知らせ</h2>
          <Link href="/notifications" className="text-primary hover:underline flex items-center">
            すべて見る
            <ChevronRight size={20} />
          </Link>
        </div>
        
        <div className="grid gap-4">
          {announcements.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500">現在お知らせはありません</p>
            </div>
          ) : (
            announcements.map((announcement) => (
              <div key={announcement.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold">{announcement.title}</h3>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {announcement.category}
                  </span>
                </div>
                <p className="text-gray-600 mb-2 line-clamp-2">{announcement.content}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar size={14} className="mr-1" />
                  {format(new Date(announcement.created_at), 'yyyy年MM月dd日', { locale: ja })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
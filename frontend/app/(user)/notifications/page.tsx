'use client'

import { useState } from 'react'
import { NotificationCard } from '@/components/user/notifications/NotificationCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { CheckCheck, Bell } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function NotificationsPage() {
  const [filter, setFilter] = useState('all')
  
  // TODO: 実際のAPIから取得
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: '新年イベントのお知らせ',
      content: '1月14日（日）に新年イベントを開催します。ドッグランレースや撮影会など楽しいイベントが盛りだくさん！',
      type: 'event',
      is_read: false,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '2',
      title: '申請が承認されました',
      content: 'おめでとうございます！利用申請が承認されました。ドッグランをご利用いただけるようになりました。',
      type: 'application',
      is_read: false,
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: '3',
      title: 'メンテナンス完了のお知らせ',
      content: '本日のメンテナンスが完了しました。ご不便をおかけして申し訳ございませんでした。',
      type: 'maintenance',
      is_read: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '4',
      title: '春の健康診断イベント',
      content: '3月15日に愛犬の健康診断を行います。獣医師が無料で診断しますので、ぜひご参加ください。',
      type: 'event',
      is_read: true,
      created_at: new Date(Date.now() - 172800000).toISOString(),
    }
  ])
  
  const markAllAsRead = async () => {
    try {
      // TODO: 実際のAPI呼び出し
      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
      toast.success('すべてのお知らせを既読にしました')
    } catch (error) {
      toast.error('既読処理に失敗しました')
    }
  }
  
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, is_read: true } : n
    ))
  }
  
  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.is_read)
      case 'announcements':
        return notifications.filter(n => n.type === 'announcement' || n.type === 'maintenance')
      case 'events':
        return notifications.filter(n => n.type === 'event')
      case 'applications':
        return notifications.filter(n => n.type === 'application')
      default:
        return notifications
    }
  }
  
  const filteredNotifications = getFilteredNotifications()
  const unreadCount = notifications.filter(n => !n.is_read).length
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Bell className="mr-2" />
          お知らせ
          {unreadCount > 0 && (
            <span className="ml-2 text-sm bg-red-500 text-white px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </h1>
        
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
          >
            <CheckCheck className="mr-2" size={16} />
            すべて既読
          </Button>
        )}
      </div>
      
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="all" className="flex-1">すべて</TabsTrigger>
          <TabsTrigger value="unread" className="flex-1">
            未読 {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
          <TabsTrigger value="events" className="flex-1">イベント</TabsTrigger>
          <TabsTrigger value="announcements" className="flex-1">お知らせ</TabsTrigger>
        </TabsList>
        
        <TabsContent value={filter}>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <Bell className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-gray-500">
                {filter === 'unread' ? '未読のお知らせはありません' : 'お知らせはありません'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AnnouncementsList } from '@/components/admin/announcements/AnnouncementsList'
import { AnnouncementFormModal } from '@/components/admin/modals/AnnouncementFormModal'
import { Button } from '@/components/ui/button'
import { Plus, Bell } from 'lucide-react'

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null)
  const supabase = createClient()

  const fetchAnnouncements = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setAnnouncements(data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const handleEdit = (announcement: any) => {
    setEditingAnnouncement(announcement)
    setIsFormOpen(true)
  }

  const handleDelete = async (announcementId: string) => {
    if (!confirm('このお知らせを削除しますか？')) return
    
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', announcementId)
    
    if (!error) {
      fetchAnnouncements()
      alert('お知らせを削除しました')
    } else {
      alert('削除に失敗しました')
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingAnnouncement(null)
    fetchAnnouncements()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">お知らせ管理</h1>
          <p className="text-gray-600 mt-1">利用者へのお知らせを管理します</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          新規お知らせ作成
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              読み込み中...
            </div>
          ) : (
            <AnnouncementsList
              announcements={announcements}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Bell className="h-5 w-5 mr-2 text-gray-600" />
              <h2 className="font-semibold">お知らせ統計</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">総お知らせ数</span>
                <span className="font-medium">{announcements.length}件</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">公開中</span>
                <span className="font-medium">
                  {announcements.filter(a => a.is_published).length}件
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">下書き</span>
                <span className="font-medium">
                  {announcements.filter(a => !a.is_published).length}件
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">重要</span>
                <span className="font-medium">
                  {announcements.filter(a => a.priority === 'high').length}件
                </span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-900 mb-2">お知らせ作成のポイント</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• 簡潔で分かりやすい文章を心がける</li>
              <li>• 重要度に応じて優先度を設定</li>
              <li>• 必要に応じて画像を添付</li>
              <li>• 公開前に内容を再確認</li>
              <li>• 定期的に古いお知らせを整理</li>
            </ul>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <AnnouncementFormModal
          announcement={editingAnnouncement}
          isOpen={isFormOpen}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}
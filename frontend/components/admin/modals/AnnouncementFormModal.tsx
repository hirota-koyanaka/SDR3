'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const announcementSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  content: z.string().min(1, '内容は必須です'),
  priority: z.enum(['high', 'medium', 'low']),
  is_published: z.boolean(),
})

type AnnouncementForm = z.infer<typeof announcementSchema>

interface AnnouncementFormModalProps {
  announcement?: any
  isOpen: boolean
  onClose: () => void
}

export function AnnouncementFormModal({ announcement, isOpen, onClose }: AnnouncementFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()
  const isEditing = !!announcement

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<AnnouncementForm>({
    resolver: zodResolver(announcementSchema),
    defaultValues: announcement ? {
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      is_published: announcement.is_published,
    } : {
      priority: 'medium',
      is_published: false,
    }
  })

  const isPublished = watch('is_published')

  useEffect(() => {
    if (!isOpen) {
      reset()
    }
  }, [isOpen, reset])

  const onSubmit = async (data: AnnouncementForm) => {
    setIsSubmitting(true)

    const payload = {
      ...data,
      published_at: data.is_published ? new Date().toISOString() : null,
    }

    if (isEditing) {
      const { error } = await supabase
        .from('announcements')
        .update(payload)
        .eq('id', announcement.id)
      
      if (!error) {
        alert('お知らせを更新しました')
        onClose()
      } else {
        alert('更新に失敗しました')
      }
    } else {
      const { error } = await supabase
        .from('announcements')
        .insert([payload])
      
      if (!error) {
        alert('お知らせを作成しました')
        onClose()
      } else {
        alert('作成に失敗しました')
      }
    }

    setIsSubmitting(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'お知らせ編集' : '新規お知らせ作成'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">
              タイトル <span className="text-red-500">*</span>
            </Label>
            <Input
              {...register('title')}
              id="title"
              placeholder="例: 営業時間変更のお知らせ"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="content">
              内容 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              {...register('content')}
              id="content"
              rows={6}
              placeholder="お知らせの内容を入力してください"
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="priority">優先度</Label>
            <select
              {...register('priority')}
              id="priority"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="low">低</option>
              <option value="medium">通常</option>
              <option value="high">重要</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              {...register('is_published')}
              id="is_published"
              type="checkbox"
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <Label htmlFor="is_published" className="font-normal">
              すぐに公開する
            </Label>
          </div>

          {isPublished && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                このお知らせは保存後すぐに公開され、利用者に表示されます。
              </p>
            </div>
          )}

          {!isPublished && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600">
                このお知らせは下書きとして保存されます。後から公開できます。
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '処理中...' : (isEditing ? '更新' : '作成')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
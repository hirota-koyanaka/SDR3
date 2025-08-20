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
import { format } from 'date-fns'

const eventSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  description: z.string().min(1, '説明は必須です'),
  event_date: z.string().min(1, '開催日は必須です'),
  start_time: z.string().min(1, '開始時間は必須です'),
  end_time: z.string().min(1, '終了時間は必須です'),
  location: z.string().optional(),
  max_participants: z.number().min(1).optional(),
  fee: z.number().min(0).optional(),
})

type EventForm = z.infer<typeof eventSchema>

interface EventFormModalProps {
  event?: any
  isOpen: boolean
  onClose: () => void
}

export function EventFormModal({ event, isOpen, onClose }: EventFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()
  const isEditing = !!event

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: event ? {
      title: event.title,
      description: event.description,
      event_date: format(new Date(event.event_date), 'yyyy-MM-dd'),
      start_time: event.start_time,
      end_time: event.end_time,
      location: event.location || '',
      max_participants: event.max_participants || undefined,
      fee: event.fee || 0,
    } : {}
  })

  useEffect(() => {
    if (!isOpen) {
      reset()
    }
  }, [isOpen, reset])

  const onSubmit = async (data: EventForm) => {
    setIsSubmitting(true)

    if (isEditing) {
      const { error } = await supabase
        .from('events')
        .update(data)
        .eq('id', event.id)
      
      if (!error) {
        alert('イベントを更新しました')
        onClose()
      } else {
        alert('更新に失敗しました')
      }
    } else {
      const { error } = await supabase
        .from('events')
        .insert([data])
      
      if (!error) {
        alert('イベントを作成しました')
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
            {isEditing ? 'イベント編集' : '新規イベント作成'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">
              イベント名 <span className="text-red-500">*</span>
            </Label>
            <Input
              {...register('title')}
              id="title"
              placeholder="例: 愛犬と楽しむ運動会"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">
              説明 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              {...register('description')}
              id="description"
              rows={3}
              placeholder="イベントの詳細を入力してください"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="event_date">
                開催日 <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register('event_date')}
                id="event_date"
                type="date"
              />
              {errors.event_date && (
                <p className="text-red-500 text-sm mt-1">{errors.event_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="start_time">
                開始時間 <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register('start_time')}
                id="start_time"
                type="time"
              />
              {errors.start_time && (
                <p className="text-red-500 text-sm mt-1">{errors.start_time.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="end_time">
                終了時間 <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register('end_time')}
                id="end_time"
                type="time"
              />
              {errors.end_time && (
                <p className="text-red-500 text-sm mt-1">{errors.end_time.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="location">場所</Label>
            <Input
              {...register('location')}
              id="location"
              placeholder="例: ドッグラン内イベント広場"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max_participants">定員</Label>
              <Input
                {...register('max_participants', { valueAsNumber: true })}
                id="max_participants"
                type="number"
                placeholder="例: 20"
              />
            </div>

            <div>
              <Label htmlFor="fee">参加費（円）</Label>
              <Input
                {...register('fee', { valueAsNumber: true })}
                id="fee"
                type="number"
                placeholder="0"
              />
            </div>
          </div>

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
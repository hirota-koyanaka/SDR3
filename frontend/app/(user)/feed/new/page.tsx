'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ImageUploader } from '@/components/user/feed/ImageUploader'
import { HashtagInput } from '@/components/user/feed/HashtagInput'
import { CategorySelect } from '@/components/user/feed/CategorySelect'
import { toast } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

export default function NewPostPage() {
  const router = useRouter()
  const [images, setImages] = useState<File[]>([])
  const [hashtags, setHashtags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      content: '',
      category: 'diary',
    }
  })
  
  const contentLength = watch('content')?.length || 0
  
  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      formData.append('content', data.content)
      formData.append('category', data.category)
      formData.append('hashtags', JSON.stringify(hashtags))
      
      images.forEach((image, index) => {
        formData.append(`images`, image)
      })
      
      const response = await fetch('/api/v1/posts', {
        method: 'POST',
        body: formData,
      })
      
      if (response.ok) {
        toast.success('投稿しました')
        router.push('/feed')
      } else {
        throw new Error('投稿に失敗しました')
      }
    } catch (error) {
      toast.error('投稿に失敗しました')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">新規投稿</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Textarea
              {...register('content', { required: true, maxLength: 500 })}
              placeholder="今日の出来事を共有しましょう..."
              rows={6}
              className="w-full"
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {contentLength} / 500
            </div>
          </div>
          
          <CategorySelect 
            value={watch('category')}
            onChange={(value) => setValue('category', value)}
          />
          
          <HashtagInput
            hashtags={hashtags}
            onChange={setHashtags}
          />
          
          <ImageUploader
            images={images}
            onChange={setImages}
            maxImages={4}
          />
          
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting || contentLength === 0}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  投稿中...
                </>
              ) : (
                '投稿する'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
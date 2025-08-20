'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { MultiImageUpload } from '@/components/common/ImageUpload'
import { uploadMultipleFiles } from '@/lib/supabase/storage'
import { createClient } from '@/lib/supabase/client'
import { Send, Hash, Image as ImageIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface CreatePostProps {
  onPostCreated?: () => void
  userId: string
  userName: string
}

export function CreatePost({ onPostCreated, userId, userName }: CreatePostProps) {
  const [content, setContent] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()
  
  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('投稿内容を入力してください')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // 画像をアップロード
      let imageUrls: string[] = []
      if (images.length > 0) {
        const { urls, errors } = await uploadMultipleFiles(images, 'post')
        if (errors.length > 0) {
          console.error('Image upload errors:', errors)
          toast.error('一部の画像のアップロードに失敗しました')
        }
        imageUrls = urls
      }
      
      // ハッシュタグを配列に変換
      const hashtagArray = hashtags
        .split(/[#＃\s]+/)
        .filter(tag => tag.length > 0)
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
      
      // 投稿を作成
      const { error } = await supabase
        .from('posts')
        .insert({
          author_id: userId,
          content,
          image_urls: imageUrls,
          hashtags: hashtagArray,
          is_published: true
        })
      
      if (error) {
        console.error('Post creation error:', error)
        toast.error('投稿の作成に失敗しました')
        return
      }
      
      toast.success('投稿しました！')
      
      // フォームをリセット
      setContent('')
      setHashtags('')
      setImages([])
      
      // 親コンポーネントに通知
      if (onPostCreated) {
        onPostCreated()
      }
    } catch (error) {
      console.error('Post creation error:', error)
      toast.error('投稿中にエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg">🐕</span>
          </div>
          <div>
            <p className="font-semibold">{userName}</p>
            <p className="text-xs text-gray-500">今なにしてる？</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="愛犬との楽しい思い出をシェアしよう..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] resize-none"
        />
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-gray-500" />
            <Input
              placeholder="ハッシュタグ（スペース区切り）"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              className="flex-1"
            />
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">写真を追加</span>
            </div>
            <MultiImageUpload
              onImagesSelect={setImages}
              maxImages={4}
              maxSizeMB={5}
              label="写真を追加"
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-2">
          <div className="flex gap-2">
            {content.length > 0 && (
              <span className={`text-xs ${content.length > 280 ? 'text-red-500' : 'text-gray-500'}`}>
                {content.length} / 280
              </span>
            )}
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || content.trim().length === 0 || content.length > 280}
            size="sm"
          >
            {isSubmitting ? (
              <>投稿中...</>
            ) : (
              <>
                <Send className="w-4 h-4 mr-1" />
                投稿する
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
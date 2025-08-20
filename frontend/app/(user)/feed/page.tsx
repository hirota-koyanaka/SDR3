'use client'

import { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { PostCard } from '@/components/user/feed/PostCard'
import { CategoryFilter } from '@/components/user/feed/CategoryFilter'
import { CreatePostButton } from '@/components/user/feed/CreatePostButton'

export default function FeedPage() {
  const [category, setCategory] = useState('all')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const { ref, inView } = useInView()
  
  // TODO: 実際のデータに置き換え
  const mockPosts = [
    {
      id: '1',
      content: '今日は天気が良くて、ポチが元気に走り回っています！',
      created_at: new Date().toISOString(),
      user: {
        id: '1',
        name: '山田太郎',
        avatar_url: null,
      },
      images: [],
      hashtags: ['天気', 'ポチ', '元気'],
      likes_count: 5,
      comments_count: 2,
      is_liked: false,
      category: 'diary',
    },
    {
      id: '2',
      content: 'ドッグランで新しいお友達ができました🐕',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      user: {
        id: '2',
        name: '佐藤花子',
        avatar_url: null,
      },
      images: [],
      hashtags: ['友達', 'ドッグラン'],
      likes_count: 8,
      comments_count: 4,
      is_liked: true,
      category: 'photo',
    }
  ]
  
  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMorePosts()
    }
  }, [inView])
  
  const loadMorePosts = async () => {
    setLoading(true)
    // TODO: 実際のAPI呼び出し
    setTimeout(() => {
      setPosts(prev => [...prev, ...mockPosts])
      setPage(prev => prev + 1)
      setLoading(false)
      if (page >= 2) setHasMore(false) // デモ用
    }, 1000)
  }
  
  useEffect(() => {
    // カテゴリ変更時にリセット
    setPosts([])
    setPage(0)
    setHasMore(true)
    loadMorePosts()
  }, [category])
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">フィード</h1>
        <CreatePostButton />
      </div>
      
      <CategoryFilter
        selected={category}
        onChange={setCategory}
      />
      
      <div className="space-y-4 mt-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        
        {hasMore && (
          <div ref={ref} className="py-4 text-center">
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">読み込み中...</span>
              </div>
            ) : (
              <span className="text-gray-500">スクロールして続きを読み込み</span>
            )}
          </div>
        )}
        
        {!hasMore && posts.length > 0 && (
          <div className="text-center py-4 text-gray-500">
            すべての投稿を読み込みました
          </div>
        )}
      </div>
    </div>
  )
}
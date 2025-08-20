'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PostCard } from '@/components/admin/posts/PostCard'
import { PostDetailModal } from '@/components/admin/modals/PostDetailModal'
import { AlertCircle, CheckCircle, XCircle, Flag } from 'lucide-react'

export default function PostsPage() {
  const [status, setStatus] = useState('pending')
  const [posts, setPosts] = useState<any[]>([])
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    reported: 0,
  })
  const supabase = createClient()

  const fetchPosts = async () => {
    setIsLoading(true)
    let query = supabase.from('posts').select('*, users(name, email)')
    
    if (status !== 'all') {
      if (status === 'reported') {
        query = query.gt('report_count', 0)
      } else {
        query = query.eq('status', status)
      }
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (!error && data) {
      setPosts(data)
    }
    setIsLoading(false)
  }

  const fetchStats = async () => {
    const [pending, approved, rejected, reported] = await Promise.all([
      supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
      supabase.from('posts').select('id', { count: 'exact', head: true }).gt('report_count', 0),
    ])
    
    setStats({
      pending: pending.count || 0,
      approved: approved.count || 0,
      rejected: rejected.count || 0,
      reported: reported.count || 0,
    })
  }

  useEffect(() => {
    fetchPosts()
    fetchStats()
  }, [status])

  const handleApprove = async (postId: string) => {
    const { error } = await supabase
      .from('posts')
      .update({ 
        status: 'approved',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', postId)
    
    if (!error) {
      alert('投稿を承認しました')
      fetchPosts()
      fetchStats()
    } else {
      alert('承認に失敗しました')
    }
  }

  const handleReject = async (postId: string, reason: string) => {
    const { error } = await supabase
      .from('posts')
      .update({ 
        status: 'rejected',
        rejection_reason: reason,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', postId)
    
    if (!error) {
      alert('投稿を却下しました')
      fetchPosts()
      fetchStats()
    } else {
      alert('却下に失敗しました')
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('この投稿を削除しますか？')) return
    
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
    
    if (!error) {
      alert('投稿を削除しました')
      fetchPosts()
      fetchStats()
    } else {
      alert('削除に失敗しました')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">投稿管理</h1>
        <p className="text-gray-600 mt-1">ユーザーの投稿を確認・承認します</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">承認待ち</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">承認済み</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">却下</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">通報あり</p>
              <p className="text-2xl font-bold text-orange-600">{stats.reported}</p>
            </div>
            <Flag className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>
      
      <Tabs value={status} onValueChange={setStatus}>
        <TabsList>
          <TabsTrigger value="pending">承認待ち</TabsTrigger>
          <TabsTrigger value="approved">承認済み</TabsTrigger>
          <TabsTrigger value="rejected">却下</TabsTrigger>
          <TabsTrigger value="reported">通報あり</TabsTrigger>
          <TabsTrigger value="all">すべて</TabsTrigger>
        </TabsList>
        
        <TabsContent value={status} className="mt-6">
          {isLoading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              読み込み中...
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              投稿がありません
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onApprove={() => handleApprove(post.id)}
                  onReject={(reason) => handleReject(post.id, reason)}
                  onDelete={() => handleDelete(post.id)}
                  onDetail={() => setSelectedPost(post)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          onApprove={() => {
            handleApprove(selectedPost.id)
            setSelectedPost(null)
          }}
          onReject={(reason) => {
            handleReject(selectedPost.id, reason)
            setSelectedPost(null)
          }}
          onDelete={() => {
            handleDelete(selectedPost.id)
            setSelectedPost(null)
          }}
        />
      )}
    </div>
  )
}
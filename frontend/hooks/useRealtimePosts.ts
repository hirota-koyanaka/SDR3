import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

interface Post {
  id: string
  author_id: string
  content: string
  image_urls?: string[]
  hashtags?: string[]
  likes_count: number
  comments_count: number
  created_at: string
  author?: {
    name: string
    avatar_url?: string
  }
}

export function useRealtimePosts(initialPosts: Post[] = []) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const supabase = createClient()
  
  useEffect(() => {
    // 初期投稿を設定
    setPosts(initialPosts)
    
    // リアルタイムサブスクリプションを設定
    const postsChannel = supabase
      .channel('posts-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        async (payload) => {
          console.log('New post received:', payload)
          
          // 新しい投稿の作者情報を取得
          const { data: authorData } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('id', payload.new.author_id)
            .single()
          
          const newPost: Post = {
            ...payload.new as Post,
            author: authorData || undefined
          }
          
          // 新しい投稿を先頭に追加
          setPosts(current => [newPost, ...current])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('Post updated:', payload)
          
          // 投稿を更新
          setPosts(current =>
            current.map(post =>
              post.id === payload.new.id
                ? { ...post, ...payload.new as Post }
                : post
            )
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('Post deleted:', payload)
          
          // 投稿を削除
          setPosts(current =>
            current.filter(post => post.id !== payload.old.id)
          )
        }
      )
      .subscribe()
    
    setChannel(postsChannel)
    
    // クリーンアップ
    return () => {
      if (postsChannel) {
        supabase.removeChannel(postsChannel)
      }
    }
  }, [])
  
  return { posts, channel }
}

// 入退場のリアルタイム監視
export function useRealtimeEntryLogs() {
  const [currentVisitors, setCurrentVisitors] = useState(0)
  const [recentEntries, setRecentEntries] = useState<any[]>([])
  const supabase = createClient()
  
  useEffect(() => {
    // 現在の来場者数を取得
    const fetchCurrentVisitors = async () => {
      const { data, count } = await supabase
        .from('entry_logs')
        .select('*', { count: 'exact' })
        .is('exit_time', null)
      
      setCurrentVisitors(count || 0)
    }
    
    fetchCurrentVisitors()
    
    // リアルタイムサブスクリプション
    const channel = supabase
      .channel('entry-logs-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'entry_logs'
        },
        async (payload) => {
          console.log('Entry log change:', payload)
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const log = payload.new
            
            // ユーザー情報を取得
            const { data: userData } = await supabase
              .from('profiles')
              .select('name, dogs(*)')
              .eq('id', log.user_id)
              .single()
            
            // 最近の入場リストに追加
            setRecentEntries(current => [
              {
                ...log,
                user: userData
              },
              ...current.slice(0, 9) // 最新10件を保持
            ])
            
            // 来場者数を更新
            if (log.entry_time && !log.exit_time) {
              setCurrentVisitors(prev => prev + 1)
            } else if (log.exit_time) {
              setCurrentVisitors(prev => Math.max(0, prev - 1))
            }
          }
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
  
  return { currentVisitors, recentEntries }
}

// お知らせのリアルタイム監視
export function useRealtimeAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [hasNewAnnouncement, setHasNewAnnouncement] = useState(false)
  const supabase = createClient()
  
  useEffect(() => {
    // 初期データを取得
    const fetchAnnouncements = async () => {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (data) {
        setAnnouncements(data)
      }
    }
    
    fetchAnnouncements()
    
    // リアルタイムサブスクリプション
    const channel = supabase
      .channel('announcements-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'announcements',
          filter: 'is_published=eq.true'
        },
        (payload) => {
          console.log('New announcement:', payload)
          
          setAnnouncements(current => [payload.new, ...current])
          setHasNewAnnouncement(true)
          
          // 5秒後に新着フラグをリセット
          setTimeout(() => {
            setHasNewAnnouncement(false)
          }, 5000)
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
  
  return { announcements, hasNewAnnouncement }
}
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // 初回認証状態チェック
    checkUser()

    // 認証状態の変更を監視
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          setUser(session?.user ?? null)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        } else if (event === 'USER_UPDATED') {
          setUser(session?.user ?? null)
        } else if (event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null)
        }
      }
    )

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      setUser(data.user)
      
      // 管理者チェック
      if (data.user) {
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('*')
          .eq('auth_id', data.user.id)
          .single()

        if (adminUser) {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  async function signUp(email: string, password: string, metadata?: any) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })

      if (error) throw error

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  async function signOut() {
    try {
      // デモモードのCookieもクリア
      document.cookie = 'demo_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'demo_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      toast.success('ログアウトしました')
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('ログアウトに失敗しました')
    }
  }

  async function refreshSession() {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()
      if (error) throw error
      
      setUser(session?.user ?? null)
    } catch (error) {
      console.error('Error refreshing session:', error)
      // セッションの更新に失敗した場合はログアウト
      await signOut()
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
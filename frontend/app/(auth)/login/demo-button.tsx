'use client'

import { toast } from 'react-hot-toast'

export function DemoUserLoginButton() {
  const handleClick = () => {
    console.log('Demo user login clicked')
    if (typeof window !== 'undefined') {
      localStorage.setItem('demo_user', 'true')
      // Cookieも設定（middlewareで認証チェックするため）
      document.cookie = 'demo_user=true; path=/; max-age=86400' // 24時間有効
      toast.success('デモユーザーとしてログインしました')
      // 完全なURLで遷移（ポート3002を明示的に指定）
      window.location.href = 'http://localhost:3002/dashboard'
    }
  }
  
  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full px-4 py-2 rounded-md bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 transition-all font-medium"
    >
      🐕 デモユーザーとして今すぐログイン
    </button>
  )
}
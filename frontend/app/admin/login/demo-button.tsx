'use client'

export function DemoLoginButton() {
  const handleClick = () => {
    console.log('Demo login clicked')
    try {
      if (typeof window !== 'undefined') {
        console.log('Setting localStorage and cookie...')
        localStorage.setItem('demo_admin', 'true')
        // Cookieも設定（middlewareで認証チェックするため）
        document.cookie = 'demo_admin=true; path=/; max-age=86400' // 24時間有効
        console.log('localStorage set:', localStorage.getItem('demo_admin'))
        console.log('Navigating to admin...')
        // 完全なURLで遷移（ポート3003を明示的に指定）
        window.location.href = 'http://localhost:3003/admin'
      }
    } catch (error) {
      console.error('Error during demo login:', error)
    }
  }
  
  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600 transition-all font-medium"
    >
      🚀 デモ管理者として今すぐログイン
    </button>
  )
}
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // デモモードのチェック - Cookieで判定
  const demoAdmin = request.cookies.get('demo_admin')
  const demoUser = request.cookies.get('demo_user')
  
  // デモモードでのアクセス許可
  if (demoAdmin?.value === 'true' && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next()
  }
  if (demoUser?.value === 'true' && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 管理者ルートの保護
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // ログインページは除外
    if (request.nextUrl.pathname === '/admin/login') {
      // 既にログイン済みの場合はダッシュボードへリダイレクト
      if (user) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin'
        return NextResponse.redirect(url)
      }
      return supabaseResponse
    }

    // 未ログインの場合はログインページへリダイレクト
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }

    // 管理者権限チェック
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('auth_id', user.id)
      .single()

    if (!adminUser) {
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 一時的にミドルウェアを簡略化（Edge Runtime対応）
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

  // 認証チェックは一時的に無効化（クライアントサイドで処理）
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  
  useEffect(() => {
    const media = window.matchMedia(query)
    
    // 初期値を設定
    setMatches(media.matches)
    
    // リスナーを設定
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }
    
    // addEventListenerを使用（新しいAPI）
    if (media.addEventListener) {
      media.addEventListener('change', listener)
    } else {
      // 古いブラウザのサポート
      media.addListener(listener)
    }
    
    // クリーンアップ
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener)
      } else {
        media.removeListener(listener)
      }
    }
  }, [query])
  
  return matches
}

// 便利なフック
export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)')
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 768px) and (max-width: 1024px)')
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)')
}
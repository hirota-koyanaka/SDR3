'use client'

import { useState, useEffect } from 'react'
import QRCode from 'react-qr-code'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

interface QRCodeDisplayProps {
  userId: string
  userName?: string
}

export function QRCodeDisplay({ userId, userName }: QRCodeDisplayProps) {
  const [qrData, setQrData] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  
  useEffect(() => {
    generateQRCode()
  }, [userId])
  
  const generateQRCode = async () => {
    setIsLoading(true)
    try {
      // QRコード用の一意のトークンを生成
      const token = `${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}`
      
      // トークンをデータベースに保存
      const { error } = await supabase
        .from('entry_logs')
        .insert({
          user_id: userId,
          qr_code: token,
          entry_time: null // まだ入場していない
        })
      
      if (error) {
        console.error('QR code save error:', error)
        toast.error('QRコードの生成に失敗しました')
        return
      }
      
      // QRコードデータを設定
      const qrCodeData = JSON.stringify({
        token,
        userId,
        timestamp: Date.now()
      })
      
      setQrData(qrCodeData)
    } catch (error) {
      console.error('QR code generation error:', error)
      toast.error('QRコードの生成に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }
  
  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg')
    if (!svg) return
    
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `qrcode_${userId}_${Date.now()}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>入場用QRコード</CardTitle>
        <CardDescription>
          このQRコードを入口でスキャンしてください
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : qrData ? (
          <>
            <div className="bg-white p-4 rounded-lg flex items-center justify-center">
              <QRCode
                id="qr-code-svg"
                value={qrData}
                size={256}
                level="H"
                includeMargin
              />
            </div>
            
            {userName && (
              <div className="text-center">
                <p className="text-sm text-gray-600">利用者</p>
                <p className="font-semibold">{userName}</p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                onClick={generateQRCode}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                再生成
              </Button>
              <Button
                onClick={downloadQRCode}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                ダウンロード
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 text-center">
              ※ QRコードは1回の入場のみ有効です
            </p>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">QRコードを生成できませんでした</p>
            <Button
              onClick={generateQRCode}
              variant="outline"
              className="mt-4"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              再試行
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
'use client'

import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Camera, CheckCircle, XCircle, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

interface ScanResult {
  success: boolean
  message: string
  userData?: {
    name: string
    dogName: string
    dogBreed: string
  }
}

export function QRCodeScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const supabase = createClient()
  
  const startScanning = async () => {
    setIsScanning(true)
    setScanResult(null)
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Camera access error:', error)
      toast.error('カメラへのアクセスが拒否されました')
      setIsScanning(false)
    }
  }
  
  const stopScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }
  
  const processQRCode = async (qrData: string) => {
    if (isProcessing) return
    setIsProcessing(true)
    
    try {
      let data
      try {
        data = JSON.parse(qrData)
      } catch {
        // JSON形式でない場合は、トークンとして扱う
        data = { token: qrData }
      }
      
      const { token, userId } = data
      
      // QRコードの検証
      const { data: entryLog, error: logError } = await supabase
        .from('entry_logs')
        .select('*')
        .eq('qr_code', token)
        .single()
      
      if (logError || !entryLog) {
        setScanResult({
          success: false,
          message: '無効なQRコードです'
        })
        toast.error('無効なQRコードです')
        return
      }
      
      // すでに使用済みかチェック
      if (entryLog.entry_time) {
        setScanResult({
          success: false,
          message: 'このQRコードは既に使用されています'
        })
        toast.error('このQRコードは既に使用されています')
        return
      }
      
      // ユーザー情報を取得
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*, dogs(*)')
        .eq('id', entryLog.user_id)
        .single()
      
      if (userError || !userData) {
        setScanResult({
          success: false,
          message: 'ユーザー情報が見つかりません'
        })
        toast.error('ユーザー情報が見つかりません')
        return
      }
      
      // 入場時刻を記録
      const { error: updateError } = await supabase
        .from('entry_logs')
        .update({ entry_time: new Date().toISOString() })
        .eq('id', entryLog.id)
      
      if (updateError) {
        setScanResult({
          success: false,
          message: '入場処理に失敗しました'
        })
        toast.error('入場処理に失敗しました')
        return
      }
      
      // 成功
      const dog = userData.dogs?.[0]
      setScanResult({
        success: true,
        message: '入場を確認しました',
        userData: {
          name: userData.name,
          dogName: dog?.name || '未登録',
          dogBreed: dog?.breed || '未登録'
        }
      })
      toast.success('入場を確認しました')
      
      // 自動的にスキャンを停止
      stopScanning()
    } catch (error) {
      console.error('QR code processing error:', error)
      setScanResult({
        success: false,
        message: 'QRコードの処理中にエラーが発生しました'
      })
      toast.error('QRコードの処理中にエラーが発生しました')
    } finally {
      setIsProcessing(false)
    }
  }
  
  const handleManualEntry = () => {
    if (manualCode.trim()) {
      processQRCode(manualCode.trim())
      setManualCode('')
    }
  }
  
  // 実際のQRコードスキャン機能は、別途QRコードスキャナーライブラリを使用して実装
  // ここでは手動入力のみをサポート
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>QRコード入場管理</CardTitle>
        <CardDescription>
          QRコードをスキャンまたは手動でコードを入力してください
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isScanning ? (
          <div className="space-y-4">
            <Button
              onClick={startScanning}
              className="w-full"
              size="lg"
            >
              <Camera className="w-5 h-5 mr-2" />
              QRコードをスキャン
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  または
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="QRコードを手動入力"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleManualEntry()
                  }
                }}
              />
              <Button
                onClick={handleManualEntry}
                disabled={!manualCode.trim() || isProcessing}
              >
                確認
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-black rounded-lg overflow-hidden aspect-video relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-white rounded-lg"></div>
              </div>
            </div>
            
            <Button
              onClick={stopScanning}
              variant="outline"
              className="w-full"
            >
              スキャンを停止
            </Button>
          </div>
        )}
        
        {scanResult && (
          <div className={`p-4 rounded-lg ${
            scanResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              {scanResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`font-semibold ${
                  scanResult.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {scanResult.message}
                </p>
                
                {scanResult.userData && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        利用者: {scanResult.userData.name}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      愛犬: {scanResult.userData.dogName} ({scanResult.userData.dogBreed})
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
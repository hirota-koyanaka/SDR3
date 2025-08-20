'use client'

import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { DogSelector } from '@/components/user/entry/DogSelector'
import { Button } from '@/components/ui/button'
import { RefreshCw, Download, Share, Clock } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function QRCodePage() {
  const [selectedDogs, setSelectedDogs] = useState<string[]>([])
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [qrData, setQrData] = useState<any>(null)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  
  // TODO: 実際のAPIから取得
  const dogs = [
    {
      id: '1',
      name: 'ポチ',
      breed: '柴犬',
      photo_url: null,
    },
    {
      id: '2',
      name: 'チロ',
      breed: 'トイプードル',
      photo_url: null,
    }
  ]
  
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (qrData && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setQrCodeUrl('')
            setQrData(null)
            toast.error('QRコードの有効期限が切れました')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [qrData, timeLeft])
  
  const generateQR = async () => {
    if (selectedDogs.length === 0) {
      toast.error('入場する犬を選択してください')
      return
    }
    
    try {
      const response = await fetch('/api/v1/entries/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dog_ids: selectedDogs }),
      })
      
      if (response.ok) {
        const data = await response.json()
        const url = await QRCode.toDataURL(data.qr_data, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        })
        setQrCodeUrl(url)
        setQrData(data)
        setTimeLeft(24 * 60 * 60) // 24時間
        toast.success('QRコードを生成しました')
      } else {
        throw new Error('QRコード生成に失敗しました')
      }
    } catch (error) {
      toast.error('QRコード生成に失敗しました')
    }
  }
  
  const downloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a')
      link.download = 'dogrun-qr.png'
      link.href = qrCodeUrl
      link.click()
    }
  }
  
  const shareQR = async () => {
    if (navigator.share && qrCodeUrl) {
      try {
        // dataURLをBlobに変換
        const response = await fetch(qrCodeUrl)
        const blob = await response.blob()
        const file = new File([blob], 'dogrun-qr.png', { type: 'image/png' })
        
        await navigator.share({
          title: '里山ドッグラン入場QRコード',
          files: [file],
        })
      } catch (error) {
        console.log('シェアがキャンセルされました')
      }
    } else {
      toast.error('シェア機能がサポートされていません')
    }
  }
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">入場QRコード</h1>
        
        {!qrCodeUrl ? (
          <>
            <div className="mb-6">
              <p className="text-gray-600 text-center mb-4">
                入場する犬を選択してQRコードを生成してください
              </p>
              <DogSelector
                dogs={dogs}
                selected={selectedDogs}
                onChange={setSelectedDogs}
              />
            </div>
            
            <Button
              onClick={generateQR}
              disabled={selectedDogs.length === 0}
              className="w-full"
              size="lg"
            >
              QRコード生成
            </Button>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white rounded-lg shadow-inner">
                <img src={qrCodeUrl} alt="QR Code" className="block" />
              </div>
            </div>
            
            {/* 有効期限 */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <Clock className="mr-2 text-blue-600" size={20} />
                <span className="text-blue-900 font-semibold">有効期限</span>
              </div>
              <p className="text-center text-2xl font-mono font-bold text-blue-900">
                {formatTime(timeLeft)}
              </p>
            </div>
            
            {/* 選択された犬一覧 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-2">入場予定の犬</h3>
              <div className="space-y-1">
                {selectedDogs.map(dogId => {
                  const dog = dogs.find(d => d.id === dogId)
                  return dog ? (
                    <div key={dogId} className="text-sm">
                      • {dog.name} ({dog.breed})
                    </div>
                  ) : null
                })}
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                <strong>使用方法:</strong><br />
                このQRコードを入口でスタッフに提示してください。<br />
                有効期限は24時間です。
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  onClick={downloadQR}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="mr-2" size={16} />
                  保存
                </Button>
                
                <Button
                  onClick={shareQR}
                  variant="outline"
                  className="flex-1"
                >
                  <Share className="mr-2" size={16} />
                  シェア
                </Button>
              </div>
              
              <Button
                onClick={generateQR}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="mr-2" size={20} />
                再生成
              </Button>
              
              <Button
                onClick={() => {
                  setQrCodeUrl('')
                  setQrData(null)
                  setSelectedDogs([])
                  setTimeLeft(0)
                }}
                variant="outline"
                className="w-full"
              >
                犬を選び直す
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
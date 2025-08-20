'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { validateFile } from '@/lib/supabase/storage'
import { toast } from 'react-hot-toast'

interface ImageUploadProps {
  onImageSelect: (file: File) => void
  onImageRemove?: () => void
  currentImageUrl?: string | null
  maxSizeMB?: number
  acceptedTypes?: string[]
  className?: string
  label?: string
}

export function ImageUpload({
  onImageSelect,
  onImageRemove,
  currentImageUrl,
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif'],
  className = '',
  label = 'プロフィール画像をアップロード'
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleFileSelect = (file: File) => {
    const validation = validateFile(file, maxSizeMB, acceptedTypes)
    if (!validation.valid) {
      toast.error(validation.error || 'ファイルの検証に失敗しました')
      return
    }
    
    // プレビューを作成
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
    
    onImageSelect(file)
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }
  
  const handleRemove = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (onImageRemove) {
      onImageRemove()
    }
  }
  
  return (
    <div className={`relative ${className}`}>
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-colors
            ${isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-xs text-gray-500">
            クリックまたはドラッグ&ドロップ
          </p>
          <p className="text-xs text-gray-400 mt-1">
            最大{maxSizeMB}MB (JPEG, PNG, GIF)
          </p>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}

// 複数画像アップロード用コンポーネント
interface MultiImageUploadProps {
  onImagesSelect: (files: File[]) => void
  maxImages?: number
  maxSizeMB?: number
  acceptedTypes?: string[]
  className?: string
  label?: string
}

export function MultiImageUpload({
  onImagesSelect,
  maxImages = 5,
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif'],
  className = '',
  label = '画像を追加'
}: MultiImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleFilesSelect = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    const remainingSlots = maxImages - files.length
    
    if (remainingSlots <= 0) {
      toast.error(`最大${maxImages}枚まで追加できます`)
      return
    }
    
    const filesToAdd = fileArray.slice(0, remainingSlots)
    const validFiles: File[] = []
    const newPreviews: string[] = []
    
    filesToAdd.forEach(file => {
      const validation = validateFile(file, maxSizeMB, acceptedTypes)
      if (validation.valid) {
        validFiles.push(file)
        
        const reader = new FileReader()
        reader.onloadend = () => {
          newPreviews.push(reader.result as string)
          if (newPreviews.length === validFiles.length) {
            setPreviews([...previews, ...newPreviews])
            const updatedFiles = [...files, ...validFiles]
            setFiles(updatedFiles)
            onImagesSelect(updatedFiles)
          }
        }
        reader.readAsDataURL(file)
      } else {
        toast.error(`${file.name}: ${validation.error}`)
      }
    })
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFilesSelect(e.target.files)
    }
  }
  
  const handleRemove = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index)
    const newFiles = files.filter((_, i) => i !== index)
    setPreviews(newPreviews)
    setFiles(newFiles)
    onImagesSelect(newFiles)
  }
  
  return (
    <div className={className}>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {previews.map((preview, index) => (
          <div key={index} className="relative">
            <img
              src={preview}
              alt={`Preview ${index + 1}`}
              className="w-full h-24 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        
        {files.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
          >
            <Upload className="w-6 h-6 text-gray-400 mb-1" />
            <span className="text-xs text-gray-500">{label}</span>
            <span className="text-xs text-gray-400">
              ({files.length}/{maxImages})
            </span>
          </button>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileChange}
        multiple
        className="hidden"
      />
    </div>
  )
}
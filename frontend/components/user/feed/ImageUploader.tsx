'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface ImageUploaderProps {
  images: File[]
  onChange: (images: File[]) => void
  maxImages: number
}

export function ImageUploader({ images, onChange, maxImages }: ImageUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = [...images, ...acceptedFiles].slice(0, maxImages)
    onChange(newImages)
  }, [images, onChange, maxImages])
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true,
    disabled: images.length >= maxImages,
  })
  
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }
  
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        画像 ({images.length}/{maxImages})
      </label>
      
      {/* アップロード済み画像 */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={URL.createObjectURL(image)}
                alt={`アップロード画像 ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* ドロップゾーン */}
      {images.length < maxImages && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-colors
            ${isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center">
            {isDragActive ? (
              <Upload className="mb-3 text-primary" size={32} />
            ) : (
              <ImageIcon className="mb-3 text-gray-400" size={32} />
            )}
            <p className="text-gray-600">
              {isDragActive
                ? 'ここにドロップしてください'
                : 'クリックまたはドラッグ&ドロップで画像を選択'
              }
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG, GIF (最大5MB、{maxImages}枚まで)
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
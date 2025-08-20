'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'

interface ImageGalleryProps {
  images: string[]
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  
  if (!images || images.length === 0) return null
  
  const closeModal = () => setSelectedImage(null)
  
  return (
    <>
      <div className="mt-3">
        {images.length === 1 ? (
          <div 
            className="relative aspect-video rounded-lg overflow-hidden cursor-pointer"
            onClick={() => setSelectedImage(images[0])}
          >
            <Image
              src={images[0]}
              alt="投稿画像"
              fill
              className="object-cover hover:scale-105 transition-transform"
            />
          </div>
        ) : (
          <div className={`grid gap-1 rounded-lg overflow-hidden ${
            images.length === 2 ? 'grid-cols-2' : 
            images.length === 3 ? 'grid-cols-2' :
            'grid-cols-2'
          }`}>
            {images.slice(0, 4).map((image, index) => (
              <div
                key={index}
                className={`relative cursor-pointer ${
                  images.length === 3 && index === 0 ? 'row-span-2' : 'aspect-square'
                }`}
                onClick={() => setSelectedImage(image)}
              >
                <Image
                  src={image}
                  alt={`投稿画像 ${index + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform"
                />
                {images.length > 4 && index === 3 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">
                      +{images.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 画像モーダル */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <X size={32} />
            </button>
            <Image
              src={selectedImage}
              alt="拡大画像"
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </>
  )
}
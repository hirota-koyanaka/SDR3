'use client'

import Image from 'next/image'
import { Dog, Check } from 'lucide-react'

interface DogData {
  id: string
  name: string
  breed: string
  photo_url?: string | null
}

interface DogSelectorProps {
  dogs: DogData[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export function DogSelector({ dogs, selected, onChange }: DogSelectorProps) {
  const toggleDog = (dogId: string) => {
    if (selected.includes(dogId)) {
      onChange(selected.filter(id => id !== dogId))
    } else {
      onChange([...selected, dogId])
    }
  }
  
  if (dogs.length === 0) {
    return (
      <div className="text-center py-8">
        <Dog className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-500 mb-2">登録された犬がありません</p>
        <p className="text-sm text-gray-400">
          先に犬情報を登録してください
        </p>
      </div>
    )
  }
  
  return (
    <div>
      <h3 className="font-semibold mb-3">入場する犬を選択</h3>
      <div className="space-y-2">
        {dogs.map((dog) => (
          <button
            key={dog.id}
            type="button"
            onClick={() => toggleDog(dog.id)}
            className={`
              w-full p-4 rounded-lg border-2 transition-all
              ${selected.includes(dog.id)
                ? 'border-primary bg-primary/5' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gray-200 mr-3 overflow-hidden flex-shrink-0">
                {dog.photo_url ? (
                  <Image
                    src={dog.photo_url}
                    alt={dog.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Dog size={24} className="text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 text-left">
                <p className="font-medium">{dog.name}</p>
                <p className="text-sm text-gray-500">{dog.breed}</p>
              </div>
              
              {selected.includes(dog.id) && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check size={16} className="text-white" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
      
      {selected.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            選択中: {selected.length}頭
          </p>
        </div>
      )}
    </div>
  )
}
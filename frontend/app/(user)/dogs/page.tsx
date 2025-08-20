'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DogCard } from '@/components/user/dogs/DogCard'
import { Button } from '@/components/ui/button'
import { Plus, Dog } from 'lucide-react'

export default function DogsPage() {
  // TODO: 実際のAPIから取得
  const [dogs] = useState([
    {
      id: '1',
      name: 'ポチ',
      breed: '柴犬',
      weight: 12.5,
      gender: 'male',
      birth_date: '2020-05-15',
      is_neutered: true,
      personality: '人懐っこくて元気いっぱい',
      photo_url: null,
      vaccination_records: [
        {
          id: '1',
          vaccination_date: '2024-03-15',
          vaccine_type: '狂犬病',
        }
      ]
    },
    {
      id: '2',
      name: 'チロ',
      breed: 'トイプードル',
      weight: 3.2,
      gender: 'female',
      birth_date: '2022-02-10',
      is_neutered: false,
      personality: 'おとなしい性格',
      photo_url: null,
      vaccination_records: []
    }
  ])
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">登録犬情報</h1>
        <Link href="/dogs/new">
          <Button>
            <Plus className="mr-2" size={20} />
            犬を追加
          </Button>
        </Link>
      </div>
      
      {dogs.length === 0 ? (
        <div className="text-center py-12">
          <Dog className="mx-auto text-gray-400 mb-4" size={64} />
          <p className="text-gray-600 mb-4">まだ犬が登録されていません</p>
          <Link href="/dogs/new">
            <Button>最初の犬を登録</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dogs.map((dog) => (
            <DogCard key={dog.id} dog={dog} />
          ))}
        </div>
      )}
    </div>
  )
}
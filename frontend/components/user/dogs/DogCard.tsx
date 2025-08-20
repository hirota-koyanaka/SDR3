'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Weight, Syringe, Dog } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface DogData {
  id: string
  name: string
  breed: string
  weight: number
  gender: 'male' | 'female'
  birth_date?: string
  is_neutered?: boolean
  personality?: string
  photo_url?: string | null
  vaccination_records?: Array<{
    id: string
    vaccination_date: string
    vaccine_type: string
  }>
}

interface DogCardProps {
  dog: DogData
}

export function DogCard({ dog }: DogCardProps) {
  const latestVaccination = dog.vaccination_records?.[0]
  const age = dog.birth_date
    ? Math.floor((Date.now() - new Date(dog.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="aspect-square relative mb-4 rounded-lg overflow-hidden bg-gray-100">
          {dog.photo_url ? (
            <Image
              src={dog.photo_url}
              alt={dog.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Dog className="text-gray-400" size={64} />
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold">{dog.name}</h3>
            <p className="text-gray-600">{dog.breed}</p>
          </div>
          <Badge variant={dog.gender === 'male' ? 'default' : 'secondary'}>
            {dog.gender === 'male' ? 'オス' : 'メス'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {age !== null && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="mr-2" size={16} />
            {age}歳
          </div>
        )}
        
        <div className="flex items-center text-sm text-gray-600">
          <Weight className="mr-2" size={16} />
          {dog.weight}kg
        </div>
        
        {dog.is_neutered !== undefined && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">去勢・避妊:</span>
            <Badge variant={dog.is_neutered ? 'default' : 'outline'} className="text-xs">
              {dog.is_neutered ? '済み' : '未実施'}
            </Badge>
          </div>
        )}
        
        {latestVaccination && (
          <div className="flex items-center text-sm">
            <Syringe className="mr-2" size={16} />
            <span className="text-gray-600">ワクチン:</span>
            <span className="ml-1">
              {format(new Date(latestVaccination.vaccination_date), 'yyyy/MM/dd', { locale: ja })}
            </span>
          </div>
        )}
        
        {dog.personality && (
          <div className="text-sm">
            <span className="text-gray-600">性格:</span>
            <p className="mt-1 text-gray-800">{dog.personality}</p>
          </div>
        )}
        
        <Link href={`/dogs/${dog.id}/edit`}>
          <Button variant="outline" className="w-full mt-4">
            編集
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
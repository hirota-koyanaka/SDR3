'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Dog {
  name: string
  breed: string
  weight: number
  gender: 'male' | 'female'
  birth_date?: string
  is_neutered?: boolean
  personality?: string
}

interface Step3Props {
  data: any
  onNext: (data: any) => void
  onBack: () => void
}

export function ApplicationStep3({ data, onNext, onBack }: Step3Props) {
  const [dogs, setDogs] = useState<Dog[]>(data.dogs || [])
  const [showAddForm, setShowAddForm] = useState(dogs.length === 0)
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Dog>()
  
  const addDog = (dogData: Dog) => {
    setDogs([...dogs, dogData])
    reset()
    setShowAddForm(false)
  }
  
  const removeDog = (index: number) => {
    setDogs(dogs.filter((_, i) => i !== index))
    if (dogs.length === 1) {
      setShowAddForm(true)
    }
  }
  
  const handleNext = () => {
    if (dogs.length === 0) {
      alert('少なくとも1頭の犬を登録してください')
      return
    }
    onNext({ dogs })
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">犬情報の登録</h2>
      <p className="text-gray-600 mb-6">
        ドッグランを利用する犬の情報を登録してください。
      </p>
      
      <div className="space-y-4">
        {dogs.map((dog, index) => (
          <div key={index} className="border rounded-lg p-4 relative">
            <button
              onClick={() => removeDog(index)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              type="button"
            >
              <Trash2 size={20} />
            </button>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-sm text-gray-500">名前:</span>
                <p className="font-medium">{dog.name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">犬種:</span>
                <p className="font-medium">{dog.breed}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">体重:</span>
                <p className="font-medium">{dog.weight}kg</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">性別:</span>
                <p className="font-medium">{dog.gender === 'male' ? 'オス' : 'メス'}</p>
              </div>
            </div>
            {dog.personality && (
              <div className="mt-2">
                <span className="text-sm text-gray-500">性格・特記事項:</span>
                <p className="text-sm mt-1">{dog.personality}</p>
              </div>
            )}
          </div>
        ))}
        
        {showAddForm ? (
          <form onSubmit={handleSubmit(addDog)} className="border-2 border-dashed rounded-lg p-4">
            <h3 className="font-semibold mb-4">新しい犬を追加</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">
                  名前 <span className="text-red-500">*</span>
                </Label>
                <Input {...register('name', { required: true })} id="name" />
              </div>
              
              <div>
                <Label htmlFor="breed">
                  犬種 <span className="text-red-500">*</span>
                </Label>
                <Input {...register('breed', { required: true })} id="breed" />
              </div>
              
              <div>
                <Label htmlFor="weight">
                  体重（kg） <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  {...register('weight', { required: true, min: 0 })}
                  id="weight"
                />
              </div>
              
              <div>
                <Label htmlFor="gender">
                  性別 <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={(value) => setValue('gender', value as 'male' | 'female')}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">オス</SelectItem>
                    <SelectItem value="female">メス</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="birth_date">生年月日</Label>
                <Input type="date" {...register('birth_date')} id="birth_date" />
              </div>
              
              <div>
                <Label htmlFor="is_neutered">去勢・避妊</Label>
                <Select onValueChange={(value) => setValue('is_neutered', value === 'true')}>
                  <SelectTrigger id="is_neutered">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">済み</SelectItem>
                    <SelectItem value="false">未実施</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="personality">性格・特記事項</Label>
                <Textarea
                  {...register('personality')}
                  id="personality"
                  rows={3}
                  placeholder="例：人懐っこい、他の犬が苦手、など"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button type="submit">追加</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false)
                  reset()
                }}
                disabled={dogs.length === 0}
              >
                キャンセル
              </Button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full border-2 border-dashed rounded-lg p-4 text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center"
            type="button"
          >
            <Plus className="mr-2" />
            犬を追加
          </button>
        )}
      </div>
      
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack} size="lg" type="button">
          戻る
        </Button>
        <Button onClick={handleNext} size="lg" type="button">
          次へ
        </Button>
      </div>
    </div>
  )
}
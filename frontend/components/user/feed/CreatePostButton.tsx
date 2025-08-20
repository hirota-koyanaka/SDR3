'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'

export function CreatePostButton() {
  return (
    <Link href="/feed/new">
      <Button>
        <PlusCircle className="mr-2" size={16} />
        投稿する
      </Button>
    </Link>
  )
}
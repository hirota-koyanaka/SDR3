'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function ApplicationCTA() {
  return (
    <section className="py-16 bg-gradient-to-r from-primary to-secondary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          今すぐ利用申請をしよう
        </h2>
        <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
          今治市在住の方なら誰でも無料でご利用いただけます。
          まずは利用申請から始めましょう。
        </p>
        <Link href="/application">
          <Button size="lg" variant="secondary" className="group">
            利用申請を開始する
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </section>
  )
}
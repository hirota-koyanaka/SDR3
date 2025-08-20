'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-600 to-green-400" />
      
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-white max-w-2xl"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            里山ドッグラン
          </h1>
          <p className="text-lg md:text-xl mb-8">
            愛媛県今治市の自然豊かなドッグラン施設
            <br />
            愛犬と一緒に楽しい時間を過ごしませんか？
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/application">
              <Button size="lg" className="w-full sm:w-auto">
                利用申請はこちら
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 text-white border-white hover:bg-white/20">
                施設について
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
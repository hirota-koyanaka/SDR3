'use client'

import { motion } from 'framer-motion'

export function Features() {
  const features = [
    {
      icon: '🌳',
      title: '自然豊かな環境',
      description: '里山の自然に囲まれた広々とした空間で、愛犬が自由に走り回れます。',
    },
    {
      icon: '🛡️',
      title: '安全・安心',
      description: 'フェンスで囲まれた安全な環境。ワクチン接種確認で病気の心配もありません。',
    },
    {
      icon: '👥',
      title: 'コミュニティ',
      description: '同じ犬好きの仲間と交流。イベントも定期的に開催しています。',
    },
    {
      icon: '📱',
      title: 'スマート管理',
      description: 'QRコードで簡単入退場。アプリで混雑状況も確認できます。',
    },
  ]
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          里山ドッグランの特徴
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
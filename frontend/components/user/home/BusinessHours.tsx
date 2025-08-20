'use client'

import { Clock, MapPin, Phone, Mail } from 'lucide-react'

export function BusinessHours() {
  const hours = [
    { day: '月曜日', time: '定休日' },
    { day: '火曜日', time: '9:00 - 17:00' },
    { day: '水曜日', time: '9:00 - 17:00' },
    { day: '木曜日', time: '9:00 - 17:00' },
    { day: '金曜日', time: '9:00 - 17:00' },
    { day: '土曜日', time: '9:00 - 18:00' },
    { day: '日曜日', time: '9:00 - 18:00' },
  ]
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          施設情報
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Clock className="mr-2 text-primary" />
              営業時間
            </h3>
            <div className="space-y-2">
              {hours.map((item) => (
                <div key={item.day} className="flex justify-between py-2 border-b last:border-b-0">
                  <span className="font-medium">{item.day}</span>
                  <span className={item.time === '定休日' ? 'text-red-500' : ''}>
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-4">
              ※祝日は日曜日と同じ営業時間です
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">アクセス</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="mr-3 text-primary mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="font-medium">住所</p>
                  <p className="text-gray-600">
                    〒794-0000<br />
                    愛媛県今治市○○町1234
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="mr-3 text-primary mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="font-medium">電話番号</p>
                  <p className="text-gray-600">0898-XX-XXXX</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Mail className="mr-3 text-primary mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="font-medium">メールアドレス</p>
                  <p className="text-gray-600">info@satoyama-dogrun.jp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
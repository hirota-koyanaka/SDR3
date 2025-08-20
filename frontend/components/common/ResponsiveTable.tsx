'use client'

import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

interface ResponsiveTableProps {
  headers: string[]
  data: any[]
  renderRow: (item: any, index: number) => ReactNode
  renderCard?: (item: any, index: number) => ReactNode
  className?: string
}

export function ResponsiveTable({
  headers,
  data,
  renderRow,
  renderCard,
  className
}: ResponsiveTableProps) {
  const isMobile = useIsMobile()
  
  if (isMobile && renderCard) {
    return (
      <div className={cn("space-y-4", className)}>
        {data.map((item, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              {renderCard(item, index)}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            {headers.map((header, index) => (
              <th
                key={index}
                className="text-left p-3 font-medium text-gray-700"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="border-b hover:bg-gray-50">
              {renderRow(item, index)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// 汎用的なレスポンシブグリッド
export function ResponsiveGrid({
  children,
  cols = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 4,
  className
}: {
  children: ReactNode
  cols?: { xs?: number; sm?: number; md?: number; lg?: number; xl?: number }
  gap?: number
  className?: string
}) {
  const gridCols = cn(
    `grid gap-${gap}`,
    cols.xs && `grid-cols-${cols.xs}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    className
  )
  
  return <div className={gridCols}>{children}</div>
}

// モバイル用スワイプ可能なカード
export function SwipeableCards({
  children,
  className
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn(
      "flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4",
      className
    )}>
      <div className="flex gap-4">
        {children}
      </div>
    </div>
  )
}

// モバイル用カードアイテム
export function SwipeableCard({
  children,
  className
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn(
      "flex-shrink-0 w-[280px] snap-start",
      className
    )}>
      {children}
    </div>
  )
}
'use client'

import Header from '@/components/Header'
import { useState } from 'react'
import Statistics from '@/components/Statistics'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showStats, setShowStats] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onShowStats={() => setShowStats(!showStats)} />
      
      {showStats ? (
        <Statistics onClose={() => setShowStats(false)} />
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      )}
    </div>
  )
}

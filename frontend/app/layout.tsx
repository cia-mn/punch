'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../components/Sidebar'
import { getCurrentUser } from '../../lib/api'
import type { User } from '../../lib/types'

// Sidebar-г ЭНД, ЗӨВХӨН НЭГ УДАА зурна. /dashboard, /card, /design,
// /analytics, /admin хуудаснуудын хооронд шилжихэд ЗӨВХӨН баруун талын
// агуулгын хэсэг (children) солигдоно — Sidebar unmount/remount хийгдэхгvй,
// тиймээс "давхарлаад, дахин ачаалаад байгаа юм шиг" мэдрэгдэхгvй болно.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      router.push('/login')
      return
    }
    getCurrentUser()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
      })
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="w-64 hidden md:block">
        <Sidebar user={user} />
      </div>
      <div className="flex-1 p-6 overflow-auto">{children}</div>
    </div>
  )
}

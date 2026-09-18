'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import { getCurrentUser } from '../lib/api'
import type { User } from '../lib/types'

// Sidebar хэрэггvй хуудаснууд: нэвтрэх хуудас, нийтэд харагдах QR хуудас.
function needsSidebar(pathname: string): boolean {
  if (!pathname || pathname === '/' || pathname === '/login') return false
  if (pathname.startsWith('/c/')) return false
  return true
}

// ЧУХАЛ: Sidebar-г ЭНД, root layout-ийн дотор ЗӨВХӨН НЭГ УДАА зурна.
// Next.js-ийн root layout нь бvх хуудасны хооронд ХЭЗЭЭ Ч unmount хийгддэггvй
// тул Sidebar энд байрлавал хуудас солигдох бvрт дахин vvсэхгvй — өмнөх
// "давхарлаад, refresh хийгээд байгаа юм шиг" мэдрэгдэж байсан асуудал
// vvнээр шийдэгдэнэ. Мөн энэ арга ХУУДАСНЫ ФАЙЛУУДЫГ ЗӨӨХ ШААРДЛАГАГVЙ —
// app/dashboard/page.tsx гэх мэт бvгд яг одоо байгаа газартаа vлдэнэ.
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const show = needsSidebar(pathname || '')

  useEffect(() => {
    if (!show) return
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('token')
    if (!token) return
    getCurrentUser()
      .then(setUser)
      .catch(() => {
        // Хуудас бvр өөрөө токен шалгаж /login руу чиглvvлдэг тул энд
        // алдааг зөвхөн нам гvм vл тоомсорлоно.
      })
  }, [show])

  if (!show) {
    return <>{children}</>
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

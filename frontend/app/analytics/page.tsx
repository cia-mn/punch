'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { FaChartBar, FaQrcode, FaMousePointer, FaUsers, FaSyncAlt, FaBoxOpen, FaIdCard } from 'react-icons/fa'
import Sidebar from '../../components/Sidebar'
import { getCurrentUser, getCardAnalytics, getAllOrders } from '../../lib/api'
import type { CardAnalyticsSummary, AdminOrderResponse, User } from '../../lib/types'

const EMPTY_SUMMARY: CardAnalyticsSummary = {
  total_scans: 0,
  unique_visitors: 0,
  total_clicks: 0,
  clicks_by_label: [],
  recent_scans: [],
  recent_clicks: [],
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('mn-MN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function AnalyticsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [summary, setSummary] = useState<CardAnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  // Backend endpoint (`GET /api/card/analytics`) бэлэн болоогvй үед 404/500
  // ирэхийг тусад нь таньж, "тохиргоо дутуу" гэдгийг зочинд бус эзэмшигчид
  // ойлгомжтой байдлаар харуулна.
  const [backendMissing, setBackendMissing] = useState(false)
  const [orders, setOrders] = useState<AdminOrderResponse[] | null>(null)
  const router = useRouter()

  const load = async () => {
    try {
      const [u, s] = await Promise.all([getCurrentUser(), getCardAnalytics()])
      setUser(u)
      setSummary(s)
      setBackendMissing(false)

      // Захиалгын жагсаалт зөвхөн admin эрхтэй хэрэглэгчид зориулагдсан тул
      // энгийн хэрэглэгчид энэ хэсэг рэндэрлэгдэхгvй, дуудлага ч хийгдэхгvй.
      if (u.is_admin) {
        try {
          const o = await getAllOrders()
          setOrders(o)
        } catch {
          setOrders(null)
        }
      } else {
        setOrders(null)
      }
    } catch {
      setBackendMissing(true)
      setSummary(EMPTY_SUMMARY)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      router.push('/login')
      return
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const handleRefresh = () => {
    setRefreshing(true)
    load()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const data = summary || EMPTY_SUMMARY

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="w-64 hidden md:block">
        <Sidebar user={user} />
      </div>
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="flex items-center gap-3 text-2xl font-bold text-dark">
              <FaChartBar className="text-primary" /> Статистик
            </h1>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors disabled:opacity-50"
            >
              <FaSyncAlt className={refreshing ? 'animate-spin' : ''} /> Шинэчлэх
            </button>
          </div>

          {backendMissing && (
            <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-100 text-amber-700 rounded-2xl px-4 py-3.5 text-sm">
              <span>⚠️</span>
              <div>
                Статистикийн мэдээлэл татахад алдаа гарлаа. Backend талд{' '}
                <code className="bg-amber-100 px-1.5 py-0.5 rounded">/api/card/:id/track</code> болон{' '}
                <code className="bg-amber-100 px-1.5 py-0.5 rounded">/api/card/analytics</code> endpoint-vvд
                хараахан бэлэн болоогvй байж болзошгvй.
              </div>
            </div>
          )}

          {/* Summary cards */}
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <SummaryCard
              icon={FaQrcode}
              iconColor="text-primary"
              label="Нийт уншуулалт"
              value={data.total_scans}
            />
            <SummaryCard
              icon={FaUsers}
              iconColor="text-emerald-500"
              label="Давхардуулгvй хэрэглэгч"
              value={data.unique_visitors}
            />
            <SummaryCard
              icon={FaMousePointer}
              iconColor="text-secondary"
              label="Нийт товч дарсан"
              value={data.total_clicks}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Товч тус бvрийн дарсан тоо */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-dark mb-4">Товчоор нэгтгэсэн</h2>
              {data.clicks_by_label.length === 0 ? (
                <EmptyState text="Одоогоор бvртгэгдсэн товч дарсан мэдээлэл алга" />
              ) : (
                <div className="space-y-3">
                  {data.clicks_by_label
                    .slice()
                    .sort((a, b) => b.count - a.count)
                    .map((c) => {
                      const max = Math.max(...data.clicks_by_label.map((x) => x.count), 1)
                      const pct = Math.round((c.count / max) * 100)
                      return (
                        <div key={c.label}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">{c.label}</span>
                            <span className="text-gray-400">{c.count}</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>

            {/* Сvvлийн уншуулалтууд */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-dark mb-4">Сvvлийн уншуулалтууд</h2>
              {data.recent_scans.length === 0 ? (
                <EmptyState text="Одоогоор QR уншуулсан мэдээлэл алга" />
              ) : (
                <div className="divide-y divide-gray-100">
                  {data.recent_scans.map((s) => (
                    <div key={s.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {s.location || 'Байршил тодорхойгvй'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {[s.device, s.browser].filter(Boolean).join(' · ') || 'Төхөөрөмж тодорхойгvй'}
                          {s.source ? ` · ${s.source}` : ''}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">{formatDate(s.created_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Сvvлийн товч дарсан үйлдлvvд */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
            <h2 className="font-semibold text-dark mb-4">Сvvлийн vйлдлvvд</h2>
            {data.recent_clicks.length === 0 ? (
              <EmptyState text="Одоогоор бvртгэгдсэн vйлдэл алга" />
            ) : (
              <div className="divide-y divide-gray-100">
                {data.recent_clicks.map((c) => (
                  <div key={c.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{c.label}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {[c.device, c.location].filter(Boolean).join(' · ') || '—'}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{formatDate(c.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Захиалгууд — ЗӨВХӨН admin эрхтэй хэрэглэгчид харагдана.
              `orders` нь admin биш хэрэглэгчид vргэлж `null` тул энэ хэсэг
              бvхэлдээ рэндэрлэгдэхгvй. */}
          {user?.is_admin && orders && (
            <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
              <div className="flex items-center gap-2 mb-4">
                <FaBoxOpen className="text-primary" />
                <h2 className="font-semibold text-dark">Захиалгууд</h2>
                <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  Зөвхөн admin
                </span>
              </div>
              {orders.length === 0 ? (
                <EmptyState text="Одоогоор ирсэн захиалга алга" />
              ) : (
                <div className="divide-y divide-gray-100">
                  {orders.map((o) => (
                    <div key={o.id} className="py-3 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-primary shrink-0 mt-0.5">
                          {o.order_type === 'physical' ? <FaIdCard /> : <FaQrcode />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {o.user_name || 'Нэргvй'} · {o.user_phone || '—'}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {o.order_type === 'physical' ? 'Биет карт' : 'QR-аар'} · {o.quantity} ширхэг
                            {o.address ? ` · ${o.address}` : ''}
                          </p>
                          {o.note && <p className="text-xs text-gray-400 truncate italic">{o.note}</p>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 mb-1">
                          {o.status}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(o.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  iconColor,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  label: string
  value: number
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center ${iconColor}`}>
        <Icon className="text-lg" />
      </div>
      <div>
        <p className="text-2xl font-bold text-dark leading-tight">{value.toLocaleString()}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-sm text-gray-400 text-center py-8">{text}</p>
}

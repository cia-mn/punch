'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { FaShieldAlt, FaSyncAlt, FaQrcode, FaIdCard, FaCopy, FaBoxOpen } from 'react-icons/fa'
import Sidebar from '../../components/Sidebar'
import CardPreview from '../../components/CardPreview'
import QRCode from '../../components/QRCode'
import { getCurrentUser, getAllOrders, updateOrderStatus } from '../../lib/api'
import type { AdminOrderResponse, User } from '../../lib/types'

const STATUS_OPTIONS = ['pending', 'paid', 'confirmed', 'shipped', 'done'] as const

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

function statusColor(status: string) {
  switch (status) {
    case 'paid':
    case 'confirmed':
      return 'bg-blue-50 text-blue-600'
    case 'shipped':
      return 'bg-amber-50 text-amber-600'
    case 'done':
      return 'bg-emerald-50 text-emerald-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Хvлээгдэж буй',
  paid: 'Төлбөр орсон',
  confirmed: 'Баталгаажсан',
  shipped: 'Илгээгдсэн',
  done: 'Дууссан',
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<AdminOrderResponse[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [forbidden, setForbidden] = useState(false)
  const router = useRouter()

  const load = async () => {
    try {
      const u = await getCurrentUser()
      setUser(u)
      if (!u.is_admin) {
        setForbidden(true)
        setLoading(false)
        setRefreshing(false)
        return
      }
      const o = await getAllOrders()
      setOrders(o)
      setForbidden(false)
    } catch {
      setForbidden(true)
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

  const handleStatusChange = async (orderId: number, status: string) => {
    try {
      await updateOrderStatus(orderId, status)
      setOrders((prev) =>
        prev ? prev.map((o) => (o.id === orderId ? { ...o, status } : o)) : prev
      )
      toast.success('Статус шинэчлэгдлээ')
    } catch {
      toast.error('Шинэчлэхэд алдаа гарлаа')
    }
  }

  const handleCopyLink = async (userId: string | number) => {
    const url = `${window.location.origin}/c/${userId}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Холбоос хуулагдлаа')
    } catch {
      toast.error('Хуулахад алдаа гарлаа')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (forbidden) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <div className="w-64 hidden md:block">
          <Sidebar user={user} />
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center max-w-sm">
            <FaShieldAlt className="text-3xl text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Энэ хуудсанд хандах эрхгvй байна.</p>
          </div>
        </div>
      </div>
    )
  }

  const list = orders || []

  const summary = useMemo(() => {
    const byStatus: Record<string, number> = {}
    for (const s of STATUS_OPTIONS) byStatus[s] = 0
    let qrCount = 0
    let physicalCount = 0
    for (const o of list) {
      byStatus[o.status] = (byStatus[o.status] || 0) + 1
      if (o.order_type === 'physical') physicalCount += 1
      else qrCount += 1
    }
    return { total: list.length, byStatus, qrCount, physicalCount }
  }, [list])

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="w-64 hidden md:block">
        <Sidebar user={user} />
      </div>
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="flex items-center gap-3 text-2xl font-bold text-dark">
              <FaShieldAlt className="text-primary" /> Admin — Захиалгууд
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

          {/* Хураангуй — нийт захиалга болон статусаар нь тоолсон vзvvлэлт */}
          {list.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-2xl font-bold text-dark flex items-center gap-2">
                  <FaBoxOpen className="text-primary text-lg" /> {summary.total}
                </p>
                <p className="text-xs text-gray-400 mt-1">Нийт захиалга</p>
                <p className="text-[11px] text-gray-300 mt-0.5">
                  QR {summary.qrCount} · Биет {summary.physicalCount}
                </p>
              </div>
              {STATUS_OPTIONS.map((s) => (
                <div key={s} className="bg-white rounded-2xl p-4 shadow-sm">
                  <p className="text-2xl font-bold text-dark">{summary.byStatus[s] || 0}</p>
                  <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full mt-1 ${statusColor(s)}`}>
                    {STATUS_LABELS[s] || s}
                  </span>
                </div>
              ))}
            </div>
          )}

          {list.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 shadow-sm text-center text-gray-400 text-sm">
              Одоогоор ирсэн захиалга алга
            </div>
          ) : (
            <div className="space-y-5">
              {list.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="font-semibold text-dark">
                        {order.user.name || 'Нэргvй'} · {order.user.phone}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {order.order_type === 'physical' ? 'Биет карт' : 'QR-аар'} · {order.quantity} ширхэг
                        {order.address ? ` · ${order.address}` : ''}
                      </p>
                      {order.note && (
                        <p className="text-xs text-gray-400 italic mt-0.5">{order.note}</p>
                      )}
                      <p className="text-[11px] text-gray-300 mt-1">{formatDate(order.created_at)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${statusColor(order.status)}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s] || s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Захиалагчийн БОДИТ карт болон QR — /card дээрх адилхан харагдана */}
                  <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start border-t border-gray-100 pt-4">
                    <div className="max-w-[340px]">
                      <CardPreview
                        user={order.user}
                        showQr={false}
                        design={order.user.card_design}
                      />
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <div className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
                        <QRCode
                          value={`${typeof window !== 'undefined' ? window.location.origin : ''}/c/${order.user.id}`}
                          design={order.qr_design}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyLink(order.user.id)}
                        className="flex items-center gap-2 text-xs font-medium text-primary hover:underline"
                      >
                        <FaCopy /> QR холбоос хуулах
                      </button>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        {order.order_type === 'physical' ? <FaIdCard /> : <FaQrcode />}
                        /c/{order.user.id}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { FaThLarge } from 'react-icons/fa'
import Sidebar from '../../components/Sidebar'
import CardPreview, { CARD_DESIGNS, type CardDesign } from '../../components/CardPreview'
import QRCode from '../../components/QRCode'
import { getCardData, updateCardDesign } from '../../lib/api'
import type { CardData } from '../../lib/types'

const DESIGN_STORAGE_KEY = 'card_design'

export default function CardPage() {
  const [data, setData] = useState<CardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showQr, setShowQr] = useState(true)
  const [design, setDesign] = useState<CardDesign>('neumorphic')
  const [savedDesign, setSavedDesign] = useState<CardDesign | null>(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      router.push('/login')
      return
    }

    // Хэрэглэгчийн сүүлд хадгалсан загварыг browser-с түр сэргээнэ (сервэрийн
    // хариу ирэх хvртэлх богино зуурын анхны утга) — сервэрээс `card_design`
    // ирмэгц доор дахин давхар шинэчлэгдэнэ.
    const localDesign =
      typeof window !== 'undefined' ? (localStorage.getItem(DESIGN_STORAGE_KEY) as CardDesign | null) : null
    if (localDesign && CARD_DESIGNS.some((d) => d.id === localDesign)) {
      setDesign(localDesign)
      setSavedDesign(localDesign)
    }

    getCardData()
      .then((d) => {
        setData(d)
        // Сервэрт хадгалагдсан загвар байвал (өмнө нь "Хадгалах" дарсан бол)
        // тэрийг эх сурвалж болгоно — localStorage-с давуу эрхтэй.
        const serverDesign = d.user?.card_design
        if (serverDesign && CARD_DESIGNS.some((x) => x.id === serverDesign)) {
          setDesign(serverDesign)
          setSavedDesign(serverDesign)
        }
      })
      .catch(() => {
        toast.error('Мэдээлэл авахад алдаа гарлаа')
      })
      .finally(() => setLoading(false))
  }, [router])

  const shareUrl =
    typeof window !== 'undefined' && data
      ? `${window.location.origin}/c/${data.user.id}`
      : ''

  // Товч дарахад ЗӨВХӨН preview дээр шууд солигдоно — сервэрт хадгалагдахгvй.
  // Сервэрт хадгалж, /c/[id] дээр бусдад харагдахын тулд "Хадгалах" товч
  // дарах шаардлагатай (доор handleSaveDesign).
  const handleSelectDesign = (id: CardDesign) => {
    setDesign(id)
  }

  const handleSaveDesign = async () => {
    if (!data) return
    setSaving(true)
    try {
      await updateCardDesign(design)
      if (typeof window !== 'undefined') {
        localStorage.setItem(DESIGN_STORAGE_KEY, design)
      }
      setSavedDesign(design)
      toast.success('Загвар хадгалагдлаа')
      // Хадгалсны дараа шинэ загвар бодитоор /c/[id] дээр харагдаж байгааг
      // шууд шалгаж болохоор шинэ таб-д нээнэ ("шууд холбогдоод очно").
      if (typeof window !== 'undefined') {
        window.open(`${window.location.origin}/c/${data.user.id}`, '_blank', 'noopener,noreferrer')
      }
    } catch {
      toast.error('Загвар хадгалахад алдаа гарлаа')
    } finally {
      setSaving(false)
    }
  }

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
        <Sidebar user={data?.user} />
      </div>
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="flex items-center gap-3 text-2xl font-bold text-dark mb-6">
            <FaThLarge className="text-primary" /> Миний Карт &amp; QR
          </h1>

          <div className="max-w-[400px] mx-auto">
            <div>
              {/* Template selector — сонгосон даруйд баруун талын preview шууд шинэчлэгдэнэ,
                  гэхдээ "Хадгалах" дарж байж бусдад (/c/[id]) харагдана */}
              <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-dark">Загвар сонгох</h2>
                  {design !== savedDesign && (
                    <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      Хадгалагдаагvй өөрчлөлт
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2.5 mb-3">
                  {CARD_DESIGNS.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleSelectDesign(d.id)}
                      aria-pressed={design === d.id}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        design === d.id
                          ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/30'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleSaveDesign}
                  disabled={saving || design === savedDesign}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-full font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {saving ? 'Хадгалж байна…' : 'Хадгалах'}
                </button>
                <p className="text-[11px] text-gray-400 mt-2 text-center">
                  Хадгалсны дараа таны QR код/линк (/c/{data?.user.id}) дээр энэ загвар шууд харагдана.
                </p>
              </div>

              <CardPreview
                user={data?.user || null}
                showQr={showQr}
                design={design}
                qrChildren={
                  data ? (
                    <QRCode
                      id="card-qr-svg"
                      value={shareUrl || data.user.phone}
                      design={data.qr_design}
                    />
                  ) : undefined
                }
              />
              <div className="mt-4 flex items-center justify-center gap-3 bg-white/0">
                <span className={!showQr ? 'text-gray-400 text-sm' : 'text-sm'}>Нуух</span>
                <button
                  type="button"
                  onClick={() => setShowQr((v) => !v)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    showQr ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${
                      showQr ? 'left-6' : 'left-0.5'
                    }`}
                  />
                </button>
                <span className={showQr ? 'text-gray-400 text-sm' : 'text-sm'}>Харуулах</span>
              </div>
              <p className="text-center text-xs text-gray-400 mt-1">QR кодыг нуух / харуулах</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

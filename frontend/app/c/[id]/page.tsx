'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import CardPreview from '../../../components/CardPreview'
import { getPublicCard } from '../../../lib/api'
import { CARD_DESIGNS, type CardDesign, type User } from '../../../lib/types'

const NEU_BG = 'bg-[#e2e8f0]'
const NEU_FLAT = `${NEU_BG} shadow-[6px_6px_14px_#bec9d8,-6px_-6px_14px_#ffffff]`
const NEU_PRESSED = `${NEU_BG} shadow-[inset_4px_4px_8px_#bec9d8,inset_-4px_-4px_8px_#ffffff]`

export default function PublicCardPage() {
  const params = useParams()
  const id = params?.id as string
  const [user, setUser] = useState<User | null>(null)
  const [vcf, setVcf] = useState('')
  const [design, setDesign] = useState<CardDesign>('neumorphic')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) {
      // id ирээгvй бол spinner мөнхөд эргэлдэхээс сэргийлж шууд алдаа харуулна
      setError('ID олдсонгүй')
      setLoading(false)
      return
    }
    getPublicCard(id)
      .then((data) => {
        setUser(data.user)
        setVcf(data.vcf_content)
        // Эзэмшигчийн /card хуудсан дээр сонгосон загварыг backend-ээс ирсэн
        // `card_design` талбараар харуулна — иймд QR-аар орж ирсэн хэн ч
        // яг ижил загварыг харна.
        const savedDesign = data.user.card_design
        if (savedDesign && CARD_DESIGNS.some((d) => d.id === savedDesign)) {
          setDesign(savedDesign)
        }
      })
      .catch(() => setError('Карт олдсонгүй'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddContact = () => {
    if (!vcf) return
    const blob = new Blob([vcf], { type: 'text/vcard' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${user?.name || 'contact'}.vcf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Харилцагч татагдлаа')
  }

  const handleCopyVcfText = async () => {
    if (!vcf) return
    try {
      await navigator.clipboard.writeText(vcf)
      toast.success('Текст хуулагдлаа — Notepad-д буулгаж болно')
    } catch {
      toast.error('Хуулахад алдаа гарлаа')
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${NEU_BG}`}>
        <div className={`w-12 h-12 rounded-full ${NEU_PRESSED} border-4 border-transparent border-t-blue-500 animate-spin`} />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${NEU_BG}`}>
        <div className={`${NEU_FLAT} text-slate-600 p-4 rounded-2xl`}>{error || 'Карт олдсонгүй'}</div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center py-10 px-4 ${NEU_BG} gap-3`}>
      {/* Загвар бүрийн доод хэсэгт "Add Contact" / "VCF Contact" товч аль хэдийн
          байгаа тул энд давхардуулж дахин зурахгvй — харин зочны хуудсанд зөв
          (getPublicCard-аас ирсэн) vcf өгөгдлийг ашиглахын тулд handler-уудыг
          шууд дамжуулна. */}
      <CardPreview
        user={user}
        showQr={false}
        design={design}
        onAddContact={handleAddContact}
        onVcfContact={handleCopyVcfText}
      />
      <p className="text-center text-[10px] text-slate-400 mt-1">
        &quot;VCF Contact&quot; товч нь мэдээллийг текст хэлбэрээр хуулж, Notepad зэрэгт буулгах боломжтой
      </p>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { FaUserPlus, FaDownload } from 'react-icons/fa'
import CardPreview, { type CardDesign, CARD_DESIGNS } from '../../../components/CardPreview'
import { getPublicCard } from '../../../lib/api'
import type { User } from '../../../lib/types'

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
        // Эзэмшигчийн сонгосон загварыг backend-ээс ирсэн утгаар харуулна.
        // `card_design` талбарыг backend/lib/types.ts дээр нэмж, /card хуудсан дээрх
        // сонголтыг хадгалахдаа энэ талбарт бас бичих шаардлагатай (одоогоор зөвхөн
        // localStorage-д хадгалагдаж байгаа тул олон төхөөрөмж/зочдод харагдахгүй).
        const savedDesign = (data.user as { card_design?: CardDesign }).card_design
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
    <div className={`min-h-screen flex flex-col items-center justify-center py-10 px-4 ${NEU_BG} gap-5`}>
      <CardPreview user={user} showQr={false} design={design} />

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        <button
          onClick={handleAddContact}
          className="bg-gradient-to-br from-[#3f88fc] to-[#3575dd] text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm tracking-wide shadow-[5px_5px_14px_#a9b8cc,-4px_-4px_12px_#ffffff] active:scale-[0.98] transition-transform"
        >
          <FaUserPlus /> Add Contact
        </button>
        <button
          onClick={handleCopyVcfText}
          title="Текстээр хуулах (Notepad-д буулгах)"
          aria-label="Текстээр хуулах"
          className={`${NEU_FLAT} text-slate-700 font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm tracking-wide border border-white/40 active:scale-[0.98] transition-transform`}
        >
          <FaDownload className="text-slate-500" /> VCF Contact
        </button>
      </div>
      <p className="text-center text-[10px] text-slate-400 -mt-2">
        &quot;VCF Contact&quot; товч нь мэдээллийг текст хэлбэрээр хуулж, Notepad зэрэгт буулгах боломжтой
      </p>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaWhatsapp,
  FaPhoneAlt,
  FaEnvelope,
  FaGlobe,
  FaMapMarkerAlt,
  FaUserPlus,
  FaDownload,
} from 'react-icons/fa'
import { getPublicCard } from '../../../lib/api'
import type { User } from '../../../lib/types'

// Neumorphic судлал — CardPreview.tsx-тэй адилхан arbitrary utility-нүүд
const NEU_BG = 'bg-[#e2e8f0]'
const NEU_FLAT = `${NEU_BG} shadow-[6px_6px_14px_#bec9d8,-6px_-6px_14px_#ffffff]`
const NEU_FLAT_SM = `${NEU_BG} shadow-[3px_3px_8px_#bec9d8,-3px_-3px_8px_#ffffff]`
const NEU_FLAT_LG = `${NEU_BG} shadow-[8px_8px_18px_#bec9d8,-8px_-8px_18px_#ffffff]`
const NEU_PRESSED = `${NEU_BG} shadow-[inset_4px_4px_8px_#bec9d8,inset_-4px_-4px_8px_#ffffff]`
const NEU_PRESSED_SM = `${NEU_BG} shadow-[inset_2px_2px_5px_#bec9d8,inset_-2px_-2px_5px_#ffffff]`

export default function PublicCardPage() {
  const params = useParams()
  const id = params?.id as string
  const [user, setUser] = useState<User | null>(null)
  const [vcf, setVcf] = useState('')
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

  const socials = [
    { icon: FaFacebookF, href: user.facebook, label: 'Facebook', hover: 'group-hover:text-blue-600' },
    { icon: FaInstagram, href: null as string | null, label: 'Instagram', hover: 'group-hover:text-pink-600' },
    { icon: FaTwitter, href: null as string | null, label: 'Twitter / X', hover: 'group-hover:text-slate-900' },
    { icon: FaWhatsapp, href: user.wiber, label: 'WhatsApp', hover: 'group-hover:text-emerald-600' },
  ]

  const rows = [
    user.phone && { icon: FaPhoneAlt, value: user.phone, label: 'Personal', href: `tel:${user.phone}` },
    user.email && { icon: FaEnvelope, value: user.email, label: 'Personal', href: `mailto:${user.email}` },
    user.website && { icon: FaGlobe, value: user.website, label: 'Work', href: user.website },
    user.location && { icon: FaMapMarkerAlt, value: user.location, label: 'Work', href: undefined },
  ].filter(Boolean) as {
    icon: React.ComponentType<{ className?: string }>
    value: string
    label: string
    href?: string
  }[]

  return (
    <div className={`min-h-screen flex items-center justify-center py-10 px-4 ${NEU_BG} text-slate-700`}>
      <div className={`w-full max-w-sm rounded-[36px] overflow-hidden ${NEU_FLAT} border border-white/40`}>
        <div className="px-6 py-6 space-y-5">
          {/* Profile */}
          <section className="flex flex-col items-center text-center pt-2">
            <div className="relative mb-4">
              <div className={`w-28 h-28 rounded-full ${NEU_FLAT_LG} flex items-center justify-center p-2.5`}>
                <div className={`w-full h-full rounded-full ${NEU_PRESSED} flex items-center justify-center relative overflow-hidden text-2xl font-bold text-slate-500`}>
                  {user.profile_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.profile_image}
                      alt={user.name || ''}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    user.name?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
              </div>
              <span
                className="absolute bottom-1 right-2 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#e2e8f0] shadow-sm"
                title="Active"
              />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-800 mb-0.5">
              {user.name || 'Нэргүй хэрэглэгч'}
            </h1>
            {user.title && (
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{user.title}</p>
            )}
            {user.company && (
              <div className={`${NEU_FLAT_SM} rounded-full px-3.5 py-1 inline-flex items-center gap-1.5`}>
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                <span className="text-xs font-medium text-slate-600">{user.company}</span>
              </div>
            )}
          </section>

          {/* Socials */}
          <section className="pt-2">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex-1 h-px border-t border-slate-300/60" style={{ boxShadow: '0 1px 0 0 #ffffff' }} />
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase whitespace-nowrap">
                Connect With Me On
              </span>
              <div className="flex-1 h-px border-t border-slate-300/60" style={{ boxShadow: '0 1px 0 0 #ffffff' }} />
            </div>
            <div className="flex justify-between items-center px-3">
              {socials.map(({ icon: Icon, href, label, hover }, i) => (
                <a
                  key={i}
                  href={href || undefined}
                  aria-label={label}
                  className={`w-13 h-13 p-3 rounded-full ${NEU_FLAT_SM} flex items-center justify-center group active:scale-[0.98] transition-transform`}
                >
                  <Icon className={`w-5 h-5 text-slate-600 ${hover} transition-colors`} />
                </a>
              ))}
            </div>
          </section>

          {/* Contact rows */}
          <section className="space-y-3.5 pt-1">
            {rows.map((row, i) => (
              <InfoRow key={i} icon={row.icon} label={row.label} value={row.value} href={row.href} />
            ))}
          </section>

          {/* Add Contact + VCF Contact */}
          <div className="grid grid-cols-2 gap-3 mt-2">
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
          <p className="text-center text-[10px] text-slate-400 mt-2">
            "VCF Contact" товч нь мэдээллийг текст хэлбэрээр хуулж, Notepad зэрэгт буулгах боломжтой
          </p>
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  href?: string
}) {
  const content = (
    <>
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`w-10 h-10 rounded-xl ${NEU_PRESSED_SM} flex items-center justify-center shrink-0 text-slate-600`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-left truncate">
          <h2 className="text-sm font-bold text-slate-800 leading-tight truncate">{value}</h2>
          <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">{label}</span>
        </div>
      </div>
      <div className="pr-1 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
        </svg>
      </div>
    </>
  )

  const classes = `w-full ${NEU_FLAT} rounded-2xl p-3 flex items-center justify-between group cursor-pointer active:scale-[0.98] transition-transform`

  if (href) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className={classes}>
        {content}
      </a>
    )
  }

  return <div className={classes}>{content}</div>
}
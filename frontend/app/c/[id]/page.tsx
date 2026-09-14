'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { FaThLarge, FaDownload, FaIdCard, FaFileAlt, FaCopy } from 'react-icons/fa'
import Sidebar from '../../components/Sidebar'
import CardPreview from '../../components/CardPreview'
import QRCode from '../../components/QRCode'
import { getCardData, getVcf, getTextContent } from '../../lib/api'
import type { CardData } from '../../lib/types'

// Neumorphic судлал — CardPreview.tsx-тэй адилхан arbitrary utility-нүүд
const NEU_BG = 'bg-[#e2e8f0]'
const NEU_FLAT = `${NEU_BG} shadow-[6px_6px_14px_#bec9d8,-6px_-6px_14px_#ffffff]`
const NEU_FLAT_SM = `${NEU_BG} shadow-[3px_3px_8px_#bec9d8,-3px_-3px_8px_#ffffff]`
const NEU_PRESSED = `${NEU_BG} shadow-[inset_4px_4px_8px_#bec9d8,inset_-4px_-4px_8px_#ffffff]`

export default function CardPage() {
  const [data, setData] = useState<CardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showQr, setShowQr] = useState(true)
  const [textContent, setTextContent] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      router.push('/login')
      return
    }

    getCardData()
      .then((d) => {
        setData(d)
        setTextContent(d.text_content || '')
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

  const handleDownloadQr = () => {
    const svg = document.getElementById('card-qr-svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'qr-code.svg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('QR код татагдлаа')
  }

  const handleDownloadVcf = async () => {
    try {
      const { content, filename } = await getVcf()
      downloadFile(content, filename || 'contact.vcf', 'text/vcard')
      toast.success('vCard татагдлаа')
    } catch {
      toast.error('Татахад алдаа гарлаа')
    }
  }

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(textContent)
      toast.success('Хууллаа')
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

  return (
    <div className={`min-h-screen ${NEU_BG} flex`}>
      <div className="w-64 hidden md:block">
        <Sidebar user={data?.user} />
      </div>
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-800 mb-6">
            <FaThLarge className="text-blue-500" /> Миний Карт &amp; QR
          </h1>

          <div className="grid lg:grid-cols-[400px_1fr] gap-6 items-start">
            <div>
              <CardPreview
                user={data?.user || null}
                showQr={showQr}
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
              <div className={`mt-4 flex items-center justify-center gap-3 ${NEU_FLAT_SM} rounded-full py-2 px-4 mx-auto w-fit`}>
                <span className={!showQr ? 'text-slate-400 text-sm' : 'text-sm text-slate-600'}>Нуух</span>
                <button
                  type="button"
                  onClick={() => setShowQr((v) => !v)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    showQr ? 'bg-gradient-to-br from-[#3f88fc] to-[#3575dd]' : NEU_PRESSED
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${
                      showQr ? 'left-6' : 'left-0.5'
                    }`}
                  />
                </button>
                <span className={showQr ? 'text-slate-400 text-sm' : 'text-sm text-slate-600'}>Харуулах</span>
              </div>
              <p className="text-center text-xs text-slate-400 mt-1">QR кодыг нуух / харуулах</p>
            </div>

            <div className="space-y-6">
              <div className={`${NEU_FLAT} rounded-2xl p-6`}>
                <h2 className="flex items-center gap-2 font-semibold text-slate-800 mb-1">
                  <FaDownload className="text-pink-500" /> QR код татаж авах
                </h2>
                <p className="text-sm text-slate-500 mb-4">
                  QR кодын зургийг татаж авах бол доорх товчийг дарна уу.
                </p>
                <button
                  onClick={handleDownloadQr}
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-400 text-white px-5 py-3 rounded-full font-medium shadow-[4px_4px_10px_#bec9d8,-3px_-3px_10px_#ffffff] active:scale-[0.98] transition-transform"
                >
                  <FaDownload /> QR татаж авах
                </button>
              </div>

              <div className={`${NEU_FLAT} rounded-2xl p-6`}>
                <h2 className="flex items-center gap-2 font-semibold text-slate-800 mb-1">
                  <FaIdCard className="text-blue-500" /> VCF файл татаж авах
                </h2>
                <p className="text-sm text-slate-500 mb-4">
                  Холбоо барих мэдээллийг VCF форматаар татаж авах
                </p>
                <button
                  onClick={handleDownloadVcf}
                  className="flex items-center gap-2 bg-gradient-to-br from-[#3f88fc] to-[#3575dd] text-white px-5 py-3 rounded-full font-medium shadow-[4px_4px_10px_#bec9d8,-3px_-3px_10px_#ffffff] active:scale-[0.98] transition-transform"
                >
                  <FaDownload /> VCF татаж авах
                </button>
              </div>

              <div className={`${NEU_FLAT} rounded-2xl p-6`}>
                <h2 className="flex items-center gap-2 font-semibold text-slate-800 mb-3">
                  <FaFileAlt className="text-slate-500" /> Текст хэлбэрээр харах
                </h2>
                <pre className={`${NEU_PRESSED} rounded-xl p-4 text-xs text-slate-600 whitespace-pre-wrap font-mono overflow-x-auto`}>
                  {textContent}
                </pre>
                <button
                  onClick={handleCopyText}
                  className="mt-4 flex items-center gap-2 text-blue-500 text-sm font-medium hover:underline"
                >
                  <FaCopy /> Хуулах
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
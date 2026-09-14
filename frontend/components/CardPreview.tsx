'use client'

import type { ReactNode } from 'react'
import type { User } from '../lib/types'
import { CARD_DESIGNS, type CardDesign } from '../lib/types'
import NeumorphicCard from './cards/NeumorphicCard'
import CyberCard from './cards/CyberCard'
import AbstractCard from './cards/AbstractCard'
import GlassCard from './cards/GlassCard'

// Хуучин код `../components/CardPreview`-с CardDesign/CARD_DESIGNS импортолсоор байгаа
// тул энд дахин export хийж уялдаа алдагдахаас сэргийлнэ.
export type { CardDesign }
export { CARD_DESIGNS }

interface CardPreviewProps {
  user: User | null
  showQr?: boolean
  qrChildren?: ReactNode
  design?: CardDesign
}

const NEU_BG = 'bg-[#e2e8f0]'
const NEU_PRESSED = `${NEU_BG} shadow-[inset_4px_4px_8px_#bec9d8,inset_-4px_-4px_8px_#ffffff]`

const TEMPLATES: Record<CardDesign, typeof NeumorphicCard> = {
  neumorphic: NeumorphicCard,
  cyber: CyberCard,
  abstract: AbstractCard,
  glass: GlassCard,
}

export default function CardPreview({ user, showQr = true, qrChildren, design = 'neumorphic' }: CardPreviewProps) {
  // Эцэг компонент (CardPage) loading/error төлөвийг барьдаг тул энд зөвхөн
  // user ирээгvй үед богино skeleton харуулна.
  if (!user) {
    return (
      <div className={`w-full max-w-[400px] mx-auto rounded-[44px] ${NEU_BG} border border-white/40 shadow-2xl min-h-[500px] flex items-center justify-center`}>
        <div className={`w-10 h-10 rounded-full ${NEU_PRESSED} border-t-blue-500 border-4 border-transparent animate-spin`} />
      </div>
    )
  }

  const Template = TEMPLATES[design] || NeumorphicCard

  return <Template user={user} showQr={showQr} qrChildren={qrChildren} />
}

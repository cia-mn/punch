'use client'

import { useState } from 'react'
import type { User } from '../lib/types'

interface PrintCardPreviewProps {
  user: User | null
}

type Orientation = 'horizontal' | 'vertical'

function initials(name?: string) {
  return name?.[0]?.toUpperCase() || 'U'
}

// Хэвлэмэл (физик) бизнес картны харагдацыг дуурайлган үзүүлэх preview.
// Лого баруун талд, нэр/мэдээлэл зүүн доод буланд байрлана — жинхэнэ
// хэвлэгдсэн картны стандарт зохион байгуулалт.
export default function PrintCardPreview({ user }: PrintCardPreviewProps) {
  const [orientation, setOrientation] = useState<Orientation>('horizontal')

  if (!user) return null

  const isHorizontal = orientation === 'horizontal'

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-dark">Хэвлэмэл картын харагдац</h2>
        <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
          <button
            type="button"
            onClick={() => setOrientation('horizontal')}
            aria-pressed={isHorizontal}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              isHorizontal ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ▭ Хэвтээ
          </button>
          <button
            type="button"
            onClick={() => setOrientation('vertical')}
            aria-pressed={!isHorizontal}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              !isHorizontal ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ▯ Босоо
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center py-2">
        <div
          className="relative rounded-2xl overflow-hidden shadow-[0_18px_40px_-12px_rgba(15,23,42,0.35)] ring-1 ring-black/5"
          style={{
            width: isHorizontal ? 340 : 220,
            aspectRatio: isHorizontal ? '1.68 / 1' : '0.6 / 1',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #3f3f9e 100%)',
          }}
        >
          {/* Дэвсгэр чимэглэл */}
          <div
            aria-hidden
            className="absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-30 blur-2xl"
            style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }}
          />
          <div
            aria-hidden
            className="absolute -bottom-12 -right-8 w-44 h-44 rounded-full opacity-25 blur-2xl"
            style={{ background: 'radial-gradient(circle, #38bdf8, transparent 70%)' }}
          />

          {/* Дээд зүүн буланд компанийн нэр / тодотгол */}
          {(user.company || user.title) && (
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <span className="text-[9px] font-bold tracking-[0.25em] text-white/60 uppercase truncate">
                {user.company || user.title}
              </span>
            </div>
          )}

          {/* Баруун талд лого / профайл зураг */}
          <div
            className={`absolute ${isHorizontal ? 'top-4 right-4' : 'top-4 right-4'} w-12 h-12 rounded-full bg-white/95 flex items-center justify-center overflow-hidden shadow-lg ring-2 ring-white/30`}
          >
            {user.profile_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.profile_image} alt={user.name || ''} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-extrabold text-slate-700">{initials(user.name)}</span>
            )}
          </div>

          {/* Зүүн доод буланд нэр болон холбоо барих мэдээлэл */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="h-[2px] w-8 bg-gradient-to-r from-sky-400 to-indigo-400 rounded-full mb-2" />
            <h3 className="text-white font-bold leading-tight text-base truncate">
              {user.name || 'Нэргүй хэрэглэгч'}
            </h3>
            {user.title && (
              <p className="text-white/70 text-[10px] uppercase tracking-wider truncate mt-0.5">{user.title}</p>
            )}
            <div className="mt-2.5 space-y-0.5">
              {user.phone && <p className="text-white/80 text-[10px] truncate">{user.phone}</p>}
              {user.email && <p className="text-white/80 text-[10px] truncate">{user.email}</p>}
              {user.website && <p className="text-white/60 text-[10px] truncate">{user.website}</p>}
            </div>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 mt-3 text-center">
        Хэвтээ болон босоо чиглэлээр хэвлэгдэх байдлыг урьдчилан харах
      </p>
    </div>
  )
}

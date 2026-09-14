import type { ReactNode } from 'react'
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaWhatsapp,
  FaPhoneAlt,
  FaEnvelope,
  FaGlobe,
  FaMapMarkerAlt,
} from 'react-icons/fa'
import type { User } from '../../lib/types'

export interface CardTemplateProps {
  user: User
  showQr?: boolean
  qrChildren?: ReactNode
}

export interface SocialItem {
  icon: React.ComponentType<{ className?: string }>
  href: string | null
  label: string
}

export interface RowItem {
  icon: React.ComponentType<{ className?: string }>
  value: string
  label: string
  href?: string
}

// 4 загвар бүр адилхан датаг өөр өөрийн визуалаар харуулна —
// иймд social/row тооцооллыг нэг газар байлгав.
export function getSocials(user: User): SocialItem[] {
  return [
    { icon: FaFacebookF, href: user.facebook || null, label: 'Facebook' },
    { icon: FaInstagram, href: null, label: 'Instagram' },
    { icon: FaTwitter, href: null, label: 'Twitter / X' },
    { icon: FaWhatsapp, href: user.wiber || null, label: 'WhatsApp' },
  ]
}

export function getRows(user: User): RowItem[] {
  return [
    user.phone && { icon: FaPhoneAlt, value: user.phone, label: 'Personal', href: `tel:${user.phone}` },
    user.email && { icon: FaEnvelope, value: user.email, label: 'Personal', href: `mailto:${user.email}` },
    user.website && { icon: FaGlobe, value: user.website, label: 'Work', href: user.website },
    user.location && { icon: FaMapMarkerAlt, value: user.location, label: 'Work', href: undefined },
  ].filter(Boolean) as RowItem[]
}

export function initials(name?: string) {
  return name?.[0]?.toUpperCase() || 'U'
}

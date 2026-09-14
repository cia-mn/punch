export type DotStyleKey =
  | 'square'
  | 'dots'
  | 'rounded'
  | 'soft_bubble'
  | 'classy'
  | 'classy_round'
  | 'diamond'
  | 'tiny'

export type EyeStyleKey =
  | 'square_square'
  | 'square_dot'
  | 'rounded_rounded'
  | 'rounded_dot'
  | 'rounded_square'
  | 'square_rounded'
  | 'dot_dot'
  | 'dot_square'

export interface QRDesign {
  dot_style?: DotStyleKey
  eye_style?: EyeStyleKey
  color?: string
  bg_color?: string
  logo_url?: string
}

// Картын харагдах загвар — /card дээр сонгоод сервэрт хадгалж,
// /c/[id] дээр зочдод харагдана.
export type CardDesign = 'neumorphic' | 'cyber' | 'abstract' | 'glass'

export const CARD_DESIGNS: { id: CardDesign; label: string }[] = [
  { id: 'neumorphic', label: 'Neumorphic' },
  { id: 'cyber', label: 'Cyber Y2K' },
  { id: 'abstract', label: 'Abstract Art' },
  { id: 'glass', label: 'Glassmorphism' },
]

export interface User {
  id: string
  name: string
  title?: string
  company?: string
  email?: string
  phone?: string
  bio?: string
  avatar_url?: string
  social_links?: Record<string, string>
  qr_design?: QRDesign
  card_design?: CardDesign
  [key: string]: any // Бусад нэмэлт талбаруудад алдаа заахаас сэргийлнэ
}

// api.ts дотор ашиглагддаг ч энд алга байсан төрлүүд — эдгээр байхгvй
// байснаас болж TypeScript compile хийхгvй, төслийг ажиллуулах боломжгvй
// болгодог байсан. (импортлогдсон боловч экспортлогдоогvй байсан.)

export interface LoginResponse {
  token: string
  user: User
}

// Хэрэглэгчийн мэдээллийг хэсэгчлэн шинэчлэхэд ашиглана (PUT /api/user/me)
export type UserUpdate = Partial<User>

// QR дизайныг хэсэгчлэн шинэчлэхэд ашиглана (PUT /api/card/qr-design)
export type QRDesignUpdate = Partial<QRDesign>

// /card хуудсанд ашиглагддаг нэгтгэсэн дата бүтэц
export interface CardData {
  user: User
  text_content?: string
  qr_design?: QRDesign
}

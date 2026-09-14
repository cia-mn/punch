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
  [key: string]: any // Бусад нэмэлт талбаруудад алдаа заахаас сэргийлнэ
}
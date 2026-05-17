import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kaldik RQ LHI — Kalender Akademik SIT LHI',
  description: 'Kalender Akademik Rumah Qur\'an, SDIT LHI, dan SMPIT LHI — Sekolah Islam Terpadu Lukman Hakim Internasional Yogyakarta',
  keywords: ['kalender akademik', 'SDIT LHI', 'SMPIT LHI', 'Rumah Quran', 'SIT LHI'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}

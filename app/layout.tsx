import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'India From Space',
  description: 'Animated visualization of India from space',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

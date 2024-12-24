import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Chess Frame Game',
  description: 'Play chess against an AI opponent on Farcaster',
  openGraph: {
    title: 'Chess Frame Game',
    description: 'Play chess against an AI opponent on Farcaster',
    images: ['https://wc-chess.vercel.app/api/image'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
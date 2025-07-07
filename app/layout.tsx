import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter, Poppins } from 'next/font/google'
import MainLayout from '@/components/layout/MainLayout'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Personal Finance Tracker',
  description: 'Track your personal finances with ease',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const dynamic = 'force-static'
export const revalidate = 0

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased text-[87.5%]`} suppressHydrationWarning>
        <MainLayout>{children}</MainLayout>
        <Toaster />
      </body>
    </html>
  )
}

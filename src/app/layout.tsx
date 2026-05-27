import type { Metadata } from 'next'
import { IBM_Plex_Sans } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Iris — Business Innovation | Inholland',
  description: 'Student dashboard for Business Innovation — expectations, learning cycle, criteria, and Q&A.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={ibmPlexSans.variable}>
      <body className="antialiased">
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  )
}

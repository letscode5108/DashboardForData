// src/app/layout.tsx
import { AuthProvider } from './context/auth.context'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Auth App',
  description: 'Authentication Frontend Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
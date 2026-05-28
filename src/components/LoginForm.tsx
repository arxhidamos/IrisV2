'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { getSession, setSession } from '@/lib/storage'

export function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  // Redirect if already logged in
  useEffect(() => {
    const session = getSession()
    if (session.loggedIn) {
      router.replace('/')
    } else {
      setChecking(false)
    }
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Small artificial delay so it feels like a real auth check
    await new Promise(r => setTimeout(r, 400))

    if (username.trim() === 'admin' && password === 'admin') {
      setSession({ loggedIn: true, loginTime: new Date().toISOString() })
      router.replace('/')
    } else {
      setError('Incorrect username or password. Try admin / admin.')
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4F5F7' }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#E6007E', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F4F5F7' }}>
      {/* Magenta header */}
      <header className="h-14 flex items-center px-3 sm:px-6" style={{ backgroundColor: '#E6007E' }}>
        <div className="flex items-center gap-3">
          <Image
            src="/inholland-logo.svg"
            alt="Inholland"
            width={36}
            height={36}
            className="rounded-md select-none flex-shrink-0"
            priority
          />
          <div className="flex flex-col leading-tight">
            <span className="text-white font-semibold text-xs sm:text-sm">Business Innovation</span>
            <span className="hidden sm:block text-white/70 text-xs">Inholland · 2024–2025</span>
          </div>
        </div>
      </header>

      {/* Login card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden">
            {/* Card header strip */}
            <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6 border-b border-border">
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/inholland-logo.svg"
                  alt="Inholland"
                  width={48}
                  height={48}
                  className="rounded-xl select-none flex-shrink-0"
                  priority
                />
                <div>
                  <h1 className="text-xl font-bold text-foreground">Iris Dashboard</h1>
                  <p className="text-xs text-muted-foreground">Inholland University</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Sign in to access the Business Innovation student portal.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-5 sm:px-8 py-5 sm:py-6 space-y-4">
              {/* Error message */}
              {error && (
                <div className="flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm bg-red-50 text-red-700 border border-red-200">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError('') }}
                  placeholder="Enter your username"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-transparent focus:ring-2"
                  style={{ '--tw-ring-color': '#E6007E' } as React.CSSProperties}
                  onFocus={e => { e.currentTarget.style.outline = 'none'; e.currentTarget.style.borderColor = '#E6007E'; e.currentTarget.style.boxShadow = '0 0 0 2px #E6007E30' }}
                  onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }}
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm outline-none transition"
                    onFocus={e => { e.currentTarget.style.borderColor = '#E6007E'; e.currentTarget.style.boxShadow = '0 0 0 2px #E6007E30' }}
                    onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Demo hint */}
              <p className="text-xs text-muted-foreground rounded-md bg-secondary/50 px-3 py-2">
                Demo credentials: <strong className="font-semibold">admin</strong> / <strong className="font-semibold">admin</strong>
              </p>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !username.trim() || !password}
                className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                style={{ backgroundColor: '#E6007E' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Inholland University of Applied Sciences · Business Innovation 2024–2025
          </p>
        </div>
      </main>
    </div>
  )
}

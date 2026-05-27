'use client'

import { useState } from 'react'
import { X, Save, User, Bell, Globe, Palette, LogOut, Check } from 'lucide-react'
import type { UserProfile, UserRole } from '@/lib/types'
import { saveProfile } from '@/lib/storage'

interface Props {
  profile: UserProfile
  onClose: () => void
  onSave: (profile: UserProfile) => void
  onLogout: () => void
}

const languages = [
  { value: 'en', label: 'English' },
  { value: 'nl', label: 'Nederlands' },
] as const

export function SettingsPanel({ profile, onClose, onSave, onLogout }: Props) {
  const [form, setForm] = useState<UserProfile>({ ...profile })
  const [saved, setSaved] = useState(false)

  function handleSave() {
    saveProfile(form)
    onSave(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function update<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const isDirty = JSON.stringify(form) !== JSON.stringify(profile)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className="fixed right-0 top-0 h-full z-50 w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Panel header */}
        <div
          className="flex items-center justify-between px-5 h-14 flex-shrink-0"
          style={{ backgroundColor: '#E6007E' }}
        >
          <div className="flex items-center gap-2.5">
            <User size={18} className="text-white" />
            <span className="text-white font-semibold text-sm">Profile &amp; Settings</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)')}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)')}
            aria-label="Close settings"
          >
            <X size={16} className="text-white" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* — Profile section ─────────────────────────── */}
          <section>
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              <User size={13} />
              Profile
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5" htmlFor="displayName">
                  Display name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={form.displayName}
                  onChange={e => update('displayName', e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition"
                  onFocus={e => { e.currentTarget.style.borderColor = '#E6007E'; e.currentTarget.style.boxShadow = '0 0 0 2px #E6007E25' }}
                  onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition"
                  onFocus={e => { e.currentTarget.style.borderColor = '#E6007E'; e.currentTarget.style.boxShadow = '0 0 0 2px #E6007E25' }}
                  onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }}
                />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground block mb-1.5">Default role</span>
                <div className="flex gap-2">
                  {(['student', 'lecturer'] as UserRole[]).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => update('rolePreference', r)}
                      className="flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors"
                      style={
                        form.rolePreference === r
                          ? { backgroundColor: '#E6007E', color: '#fff', borderColor: '#E6007E' }
                          : { backgroundColor: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }
                      }
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="border-t border-border" />

          {/* — Notifications section ────────────────────── */}
          <section>
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              <Bell size={13} />
              Notifications
            </h2>
            <div className="space-y-3">
              {[
                { key: 'notifyQuestions' as const,    label: 'New Q&A answers',       desc: 'When a lecturer replies to a question' },
                { key: 'notifyMilestones' as const,   label: 'Milestone reminders',   desc: 'Alerts before milestone due dates' },
                { key: 'notifyExpectations' as const, label: 'Expectation updates',   desc: 'When lecturer confirms or revises' },
              ].map(({ key, label, desc }) => (
                <label key={key} className="flex items-start gap-3 cursor-pointer group">
                  <div className="mt-0.5 flex-shrink-0">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={form[key]}
                      onClick={() => update(key, !form[key])}
                      className="relative w-10 h-5 rounded-full transition-colors"
                      style={{ backgroundColor: form[key] ? '#E6007E' : '#d1d5db' }}
                    >
                      <span
                        className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform"
                        style={{ transform: form[key] ? 'translateX(20px)' : 'translateX(0)' }}
                      />
                    </button>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <div className="border-t border-border" />

          {/* — Language section ─────────────────────────── */}
          <section>
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              <Globe size={13} />
              Language
            </h2>
            <div className="flex gap-2">
              {languages.map(lang => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => update('language', lang.value)}
                  className="flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors"
                  style={
                    form.language === lang.value
                      ? { backgroundColor: '#E6007E', color: '#fff', borderColor: '#E6007E' }
                      : { backgroundColor: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }
                  }
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </section>

          <div className="border-t border-border" />

          {/* — Appearance note ──────────────────────────── */}
          <section>
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              <Palette size={13} />
              Appearance
            </h2>
            <div
              className="rounded-lg px-4 py-3 text-sm text-muted-foreground border border-border"
              style={{ backgroundColor: '#fafafa' }}
            >
              <p className="font-medium text-foreground mb-1">Inholland Magenta theme</p>
              <p className="text-xs">
                This dashboard uses the official Inholland brand colours. Dark mode and custom themes
                are not available in this prototype.
              </p>
            </div>
          </section>

          {/* — Account ──────────────────────────────────── */}
          <section>
            <div className="border-t border-border mb-4" />
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </section>
        </div>

        {/* Footer — save button */}
        <div className="flex-shrink-0 border-t border-border px-5 py-4 bg-white">
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty && !saved}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ backgroundColor: saved ? '#16a34a' : '#E6007E' }}
          >
            {saved ? (
              <>
                <Check size={15} />
                Saved!
              </>
            ) : (
              <>
                <Save size={15} />
                Save changes
              </>
            )}
          </button>
          {!isDirty && !saved && (
            <p className="text-center text-xs text-muted-foreground mt-2">No unsaved changes</p>
          )}
        </div>
      </aside>
    </>
  )
}

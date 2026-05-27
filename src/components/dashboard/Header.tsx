'use client'

import type { UserRole, UserProfile } from '@/lib/types'

interface HeaderProps {
  role: UserRole
  onRoleChange: (role: UserRole) => void
  profile: UserProfile
  onOpenSettings: () => void
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}

export function Header({ role, onRoleChange, profile, onOpenSettings }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-6 h-14 shadow-md"
      style={{ backgroundColor: '#E6007E' }}
    >
      {/* Logo + course title */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center rounded-md font-bold text-sm tracking-tight select-none"
          style={{
            width: 36,
            height: 36,
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: '#fff',
            fontFamily: 'IBM Plex Sans, sans-serif',
          }}
        >
          inh
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-white font-semibold text-sm">Business Innovation</span>
          <span className="text-white/70 text-xs">Inholland · 2024–2025</span>
        </div>
      </div>

      {/* Right side: role toggle + profile */}
      <div className="flex items-center gap-3">
        {/* Role toggle */}
        <div className="flex items-center gap-1 rounded-lg p-1" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <button
            onClick={() => onRoleChange('student')}
            className="px-3 py-1 rounded-md text-sm font-medium transition-colors"
            style={{
              backgroundColor: role === 'student' ? 'rgba(255,255,255,0.95)' : 'transparent',
              color: role === 'student' ? '#E6007E' : 'rgba(255,255,255,0.85)',
            }}
          >
            Student
          </button>
          <button
            onClick={() => onRoleChange('lecturer')}
            className="px-3 py-1 rounded-md text-sm font-medium transition-colors"
            style={{
              backgroundColor: role === 'lecturer' ? 'rgba(255,255,255,0.95)' : 'transparent',
              color: role === 'lecturer' ? '#E6007E' : 'rgba(255,255,255,0.85)',
            }}
          >
            Lecturer
          </button>
        </div>

        {/* Profile avatar button */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          onMouseOver={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)')}
          onMouseOut={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)')}
          aria-label="Open profile settings"
          title={profile.displayName}
        >
          {/* Avatar circle */}
          <div
            className="flex items-center justify-center rounded-full text-xs font-bold"
            style={{ width: 30, height: 30, backgroundColor: 'rgba(255,255,255,0.9)', color: '#E6007E' }}
          >
            {getInitials(profile.displayName)}
          </div>
          <span className="hidden sm:block text-white text-xs font-medium max-w-[100px] truncate">
            {profile.displayName.split(' ')[0]}
          </span>
        </button>
      </div>
    </header>
  )
}

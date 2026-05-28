'use client'

import Image from 'next/image'
import { NotificationBell } from './NotificationBell'
import type { UserRole, UserProfile, DashboardData } from '@/lib/types'

interface HeaderProps {
  role: UserRole
  onRoleChange: (role: UserRole) => void
  profile: UserProfile
  onOpenSettings: () => void
  data: DashboardData
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export function Header({ role, onRoleChange, profile, onOpenSettings, data }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between gap-2 px-3 sm:px-6 h-14 shadow-md"
      style={{ backgroundColor: '#E6007E' }}
    >
      {/* Logo + course title — min-w-0 so it can shrink and truncate */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <Image
          src="/inholland-logo.svg"
          alt="Inholland"
          width={34}
          height={34}
          className="rounded-md select-none flex-shrink-0"
          priority
        />
        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-white font-semibold text-xs sm:text-sm leading-tight truncate">
            Business Innovation
          </span>
          <span className="hidden sm:block text-white/70 text-xs leading-tight">
            Inholland · 2024–2025
          </span>
        </div>
      </div>

      {/* Right side — flex-shrink-0 so it never gets squished */}
      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        {/* Role toggle */}
        <div
          className="flex items-center gap-0.5 rounded-lg p-0.5 sm:p-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
        >
          <button
            onClick={() => onRoleChange('student')}
            className="px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-colors"
            style={{
              backgroundColor: role === 'student' ? 'rgba(255,255,255,0.95)' : 'transparent',
              color: role === 'student' ? '#E6007E' : 'rgba(255,255,255,0.85)',
            }}
          >
            Student
          </button>
          <button
            onClick={() => onRoleChange('lecturer')}
            className="px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-colors"
            style={{
              backgroundColor: role === 'lecturer' ? 'rgba(255,255,255,0.95)' : 'transparent',
              color: role === 'lecturer' ? '#E6007E' : 'rgba(255,255,255,0.85)',
            }}
          >
            Lecturer
          </button>
        </div>

        {/* Notification bell */}
        <NotificationBell data={data} />

        {/* Profile avatar */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 rounded-full p-0.5 sm:pl-1 sm:pr-3 sm:py-1 transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          onMouseOver={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)')}
          onMouseOut={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)')}
          aria-label="Open profile settings"
        >
          <div
            className="flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0"
            style={{ width: 30, height: 30, backgroundColor: 'rgba(255,255,255,0.9)', color: '#E6007E' }}
          >
            {getInitials(profile.displayName)}
          </div>
          <span className="hidden sm:block text-white text-xs font-medium max-w-[80px] truncate">
            {profile.displayName.split(' ')[0]}
          </span>
        </button>
      </div>
    </header>
  )
}

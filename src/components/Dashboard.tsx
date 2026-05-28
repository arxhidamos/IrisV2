'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/dashboard/Header'
import { ExpectationClarity } from '@/components/dashboard/ExpectationClarity'
import { AppliedLearningCycle } from '@/components/dashboard/AppliedLearningCycle'
import { CriteriaTransparency } from '@/components/dashboard/CriteriaTransparency'
import { QAPortal } from '@/components/dashboard/QAPortal'
import { ProgressTracker } from '@/components/dashboard/ProgressTracker'
import { SettingsPanel } from '@/components/dashboard/SettingsPanel'
import type { UserRole, DashboardData, UserProfile } from '@/lib/types'
import { loadData, saveData, getSession, clearSession, loadProfile } from '@/lib/storage'

type Tab = 'expectations' | 'learning' | 'criteria' | 'qa' | 'progress'

const tabs: { id: Tab; label: string; shortLabel: string }[] = [
  { id: 'expectations', label: 'Expectation Clarity',    shortLabel: 'Expect.' },
  { id: 'learning',     label: 'Applied Learning Cycle', shortLabel: 'Learning' },
  { id: 'criteria',     label: 'Criteria Transparency',  shortLabel: 'Criteria' },
  { id: 'qa',           label: 'Q&A Portal',             shortLabel: 'Q&A'     },
  { id: 'progress',     label: 'Progress & ECTS',        shortLabel: 'Progress' },
]

export function Dashboard() {
  const router = useRouter()
  const [role, setRole] = useState<UserRole>('student')
  const [activeTab, setActiveTab] = useState<Tab>('expectations')
  const [data, setData] = useState<DashboardData | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const session = getSession()
    if (!session.loggedIn) {
      router.replace('/login')
      return
    }
    const loadedProfile = loadProfile()
    setProfile(loadedProfile)
    setRole(loadedProfile.rolePreference)
    setData(loadData())
    setAuthChecked(true)
  }, [router])

  const handleUpdate = useCallback((updated: DashboardData) => {
    setData(updated)
    saveData(updated)
  }, [])

  function handleProfileSave(updated: UserProfile) {
    setProfile(updated)
    setRole(updated.rolePreference)
  }

  function handleLogout() {
    clearSession()
    router.replace('/login')
  }

  if (!authChecked || !data || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4F5F7' }}>
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#E6007E', borderTopColor: 'transparent' }}
          />
          <p className="text-sm text-muted-foreground">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F4F5F7' }}>
        <Header
          role={role}
          onRoleChange={setRole}
          profile={profile}
          onOpenSettings={() => setSettingsOpen(true)}
          data={data}
        />

        {/* Tab navigation */}
        <div className="sticky top-14 z-30 bg-white border-b border-border shadow-sm">
          <div className="max-w-7xl mx-auto px-0 sm:px-6">
            <nav className="flex overflow-x-auto gap-0" style={{ scrollbarWidth: 'none' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex-shrink-0 px-3 sm:px-4 py-3.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
                  style={{
                    color: activeTab === tab.id ? '#E6007E' : '#6b7280',
                    borderBottom: activeTab === tab.id ? '2px solid #E6007E' : '2px solid transparent',
                  }}
                >
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Role context banner */}
        {role === 'lecturer' && (
          <div className="bg-violet-50 border-b border-violet-200 px-4 sm:px-6 py-2">
            <div className="max-w-7xl mx-auto">
              <p className="text-xs text-violet-700 font-medium">
                Lecturer view — confirm expectations, reply to questions, toggle milestones.
              </p>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-6">
          {activeTab === 'expectations' && (
            <ExpectationClarity data={data} role={role} onUpdate={handleUpdate} />
          )}
          {activeTab === 'learning' && (
            <AppliedLearningCycle data={data} role={role} onUpdate={handleUpdate} />
          )}
          {activeTab === 'criteria' && (
            <CriteriaTransparency data={data} role={role} onUpdate={handleUpdate} />
          )}
          {activeTab === 'qa' && (
            <QAPortal data={data} role={role} onUpdate={handleUpdate} />
          )}
          {activeTab === 'progress' && (
            <ProgressTracker />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-white mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
            <p className="text-xs text-muted-foreground">
              Inholland University · Business Innovation 2024–2025 · Iris Dashboard
            </p>
            <p className="text-xs text-muted-foreground">All data stored locally.</p>
          </div>
        </footer>
      </div>

      {settingsOpen && (
        <SettingsPanel
          profile={profile}
          onClose={() => setSettingsOpen(false)}
          onSave={handleProfileSave}
          onLogout={handleLogout}
        />
      )}
    </>
  )
}

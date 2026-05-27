'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/dashboard/Header'
import { ExpectationClarity } from '@/components/dashboard/ExpectationClarity'
import { AppliedLearningCycle } from '@/components/dashboard/AppliedLearningCycle'
import { CriteriaTransparency } from '@/components/dashboard/CriteriaTransparency'
import { QAPortal } from '@/components/dashboard/QAPortal'
import type { UserRole, DashboardData } from '@/lib/types'
import { loadData, saveData } from '@/lib/storage'

type Tab = 'expectations' | 'learning' | 'criteria' | 'qa'

const tabs: { id: Tab; label: string; shortLabel: string }[] = [
  { id: 'expectations', label: 'Expectation Clarity',   shortLabel: 'Expectations' },
  { id: 'learning',     label: 'Applied Learning Cycle', shortLabel: 'Learning'     },
  { id: 'criteria',     label: 'Criteria Transparency',  shortLabel: 'Criteria'     },
  { id: 'qa',           label: 'Q&A Portal',              shortLabel: 'Q&A'          },
]

export function Dashboard() {
  const [role, setRole] = useState<UserRole>('student')
  const [activeTab, setActiveTab] = useState<Tab>('expectations')
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    setData(loadData())
  }, [])

  const handleUpdate = useCallback((updated: DashboardData) => {
    setData(updated)
    saveData(updated)
  }, [])

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4F5F7' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#E6007E', borderTopColor: 'transparent' }} />
          <p className="text-sm text-muted-foreground">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F4F5F7' }}>
      <Header role={role} onRoleChange={setRole} />

      {/* Tab navigation */}
      <div className="sticky top-14 z-30 bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex overflow-x-auto scrollbar-none gap-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex-shrink-0 px-4 py-4 text-sm font-medium transition-colors whitespace-nowrap"
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
        <div className="bg-violet-50 border-b border-violet-200 px-4 sm:px-6 py-2.5">
          <div className="max-w-7xl mx-auto">
            <p className="text-xs text-violet-700 font-medium">
              Lecturer view — you can confirm expectations, reply to questions, and toggle milestones.
            </p>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
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
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Inholland University · Business Innovation 2024–2025 · Iris Dashboard Prototype
          </p>
          <p className="text-xs text-muted-foreground">All data stored locally in your browser.</p>
        </div>
      </footer>
    </div>
  )
}

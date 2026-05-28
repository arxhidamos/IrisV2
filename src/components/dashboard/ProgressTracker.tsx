'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Award, BookOpen, Target, GraduationCap, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { ECTSData, Grade } from '@/lib/types'
import { loadECTS } from '@/lib/storage'

function gradeColor(g: number | null) {
  if (g === null) return 'text-muted-foreground'
  if (g >= 8) return 'text-emerald-600'
  if (g >= 7) return 'text-blue-600'
  if (g >= 5.5) return 'text-amber-600'
  return 'text-red-500'
}

function gradeBg(g: number | null) {
  if (g === null) return 'bg-secondary/60 text-muted-foreground'
  if (g >= 8)   return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  if (g >= 7)   return 'bg-blue-50 text-blue-700 border border-blue-200'
  if (g >= 5.5) return 'bg-amber-50 text-amber-700 border border-amber-200'
  return 'bg-red-50 text-red-700 border border-red-200'
}

// Simple donut-ring progress drawn via SVG
function RingProgress({ value, total, label, sublabel }: { value: number; total: number; label: string; sublabel: string }) {
  const pct = Math.min(value / total, 1)
  const r = 42
  const circ = 2 * Math.PI * r
  const dash = circ * pct
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width="110" height="110" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
          <circle
            cx="55" cy="55" r={r}
            fill="none"
            stroke="#E6007E"
            strokeWidth="10"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={circ / 4}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-foreground">{value}</span>
          <span className="text-xs text-muted-foreground">/ {total}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{sublabel}</p>
      </div>
    </div>
  )
}

export function ProgressTracker() {
  const [ects, setEcts] = useState<ECTSData | null>(null)

  useEffect(() => {
    setEcts(loadECTS())
  }, [])

  if (!ects) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#E6007E', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  const passed = ects.grades.filter(g => g.passed)
  const inProgress = ects.grades.filter(g => g.inProgress)
  const earnedECTS = passed.reduce((s, g) => s + g.ects, 0)
  const inProgressECTS = inProgress.reduce((s, g) => s + g.ects, 0)
  const gradeValues = passed.filter(g => g.grade !== null).map(g => g.grade as number)
  const avg = gradeValues.length > 0 ? (gradeValues.reduce((s, v) => s + v, 0) / gradeValues.length) : 0
  const highest = gradeValues.length > 0 ? Math.max(...gradeValues) : 0
  const remaining = ects.totalProgramECTS - earnedECTS - inProgressECTS

  // Group by period
  const byPeriod: Record<string, Grade[]> = {}
  ects.grades.forEach(g => {
    byPeriod[g.period] = [...(byPeriod[g.period] ?? []), g]
  })

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div
        className="rounded-xl px-5 py-4 text-white"
        style={{ background: 'linear-gradient(135deg, #E6007E 0%, #a8005c 100%)' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold">Progress &amp; ECTS</h2>
            <p className="text-white/80 text-xs sm:text-sm mt-0.5">
              Business Innovation · Bachelor of Business Administration
            </p>
          </div>
          <GraduationCap size={28} className="text-white/70 flex-shrink-0 mt-0.5" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: BookOpen,   label: 'ECTS earned',    value: `${earnedECTS}`,              sub: `of ${ects.totalProgramECTS} total`,  color: '#E6007E' },
          { icon: TrendingUp, label: 'Average grade',  value: avg.toFixed(1),               sub: 'over all passed courses',            color: '#7c3aed' },
          { icon: Award,      label: 'Courses passed', value: `${passed.length}`,           sub: `${inProgress.length} in progress`,   color: '#0891b2' },
          { icon: Star,       label: 'Highest grade',  value: highest > 0 ? highest.toFixed(1) : '—', sub: 'best result so far',       color: '#16a34a' },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                  <Icon size={15} style={{ color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold leading-tight" style={{ color }}>{value}</p>
                  <p className="text-[11px] font-medium text-foreground leading-tight truncate">{label}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight truncate">{sub}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: grades table */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Grade Overview</CardTitle>
              <CardDescription>All completed and in-progress courses</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Course</th>
                      <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Period</th>
                      <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">ECTS</th>
                      <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ects.grades.map(g => (
                      <tr key={g.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-sm leading-tight">{g.course}</p>
                          <p className="text-xs text-muted-foreground sm:hidden mt-0.5">{g.period}</p>
                          {g.inProgress && (
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-full">
                              In Progress
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center text-xs text-muted-foreground hidden sm:table-cell">
                          {g.period}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="text-sm font-semibold text-foreground">{g.ects}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          {g.inProgress ? (
                            <span className="text-xs text-muted-foreground">Pending</span>
                          ) : (
                            <span className={`inline-block text-sm font-bold px-2 py-0.5 rounded-md ${gradeBg(g.grade)}`}>
                              {g.grade?.toFixed(1) ?? '—'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: ECTS ring + progress bars */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">ECTS Progress</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <RingProgress
                value={earnedECTS}
                total={ects.totalProgramECTS}
                label="ECTS Earned"
                sublabel={`${Math.round((earnedECTS / ects.totalProgramECTS) * 100)}% of programme`}
              />

              <div className="w-full space-y-3">
                {[
                  { label: 'Earned', value: earnedECTS,       total: ects.totalProgramECTS, color: '#E6007E' },
                  { label: 'In progress', value: inProgressECTS, total: ects.totalProgramECTS, color: '#7c3aed' },
                  { label: 'Remaining', value: remaining,     total: ects.totalProgramECTS, color: '#e5e7eb' },
                ].map(({ label, value, total, color }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold text-foreground">{value} ECTS</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${(value / total) * 100}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Grade Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Excellent (≥ 8)', count: gradeValues.filter(g => g >= 8).length, color: '#16a34a' },
                { label: 'Good (7–7.9)',    count: gradeValues.filter(g => g >= 7 && g < 8).length, color: '#2563eb' },
                { label: 'Pass (5.5–6.9)',  count: gradeValues.filter(g => g >= 5.5 && g < 7).length, color: '#d97706' },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-28 flex-shrink-0">{label}</span>
                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: gradeValues.length ? `${(count / gradeValues.length) * 100}%` : '0%', backgroundColor: color }}
                    />
                  </div>
                  <span className="text-xs font-semibold w-4 text-right flex-shrink-0">{count}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Degree target */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E6007E15' }}>
                  <Target size={18} style={{ color: '#E6007E' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Bachelor BBA</p>
                  <p className="text-xs text-muted-foreground">240 ECTS · Inholland</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    At current pace: <span className="font-medium text-foreground">~{Math.ceil(remaining / 60)} year{Math.ceil(remaining / 60) !== 1 ? 's' : ''}</span> remaining
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

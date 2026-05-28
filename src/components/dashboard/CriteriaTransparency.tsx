'use client'

import { useState } from 'react'
import { FileText, Calendar, Weight, Download, CheckSquare } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import type { DashboardData, UserRole } from '@/lib/types'

const levelColors = {
  Excellent:    { bg: 'bg-emerald-50',  text: 'text-emerald-800',  border: 'border-emerald-200',  badge: 'bg-emerald-100 text-emerald-700', ring: 'ring-emerald-400' },
  Good:         { bg: 'bg-blue-50',     text: 'text-blue-800',     border: 'border-blue-200',     badge: 'bg-blue-100 text-blue-700',     ring: 'ring-blue-400'    },
  Satisfactory: { bg: 'bg-amber-50',    text: 'text-amber-800',    border: 'border-amber-200',    badge: 'bg-amber-100 text-amber-700',   ring: 'ring-amber-400'   },
  Insufficient: { bg: 'bg-red-50',      text: 'text-red-800',      border: 'border-red-200',      badge: 'bg-red-100 text-red-700',       ring: 'ring-red-400'     },
}

type Level = keyof typeof levelColors
const LEVELS: Level[] = ['Excellent', 'Good', 'Satisfactory', 'Insufficient']

// Track self-assessments: { [deliverableId_criterionId]: Level }
type SelfAssessments = Record<string, Level>

function loadSelfAssessments(): SelfAssessments {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem('inholland_iris_self_assess')
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveSelfAssessments(sa: SelfAssessments) {
  try {
    localStorage.setItem('inholland_iris_self_assess', JSON.stringify(sa))
  } catch { /* ignore */ }
}

interface Props {
  data: DashboardData
  role: UserRole
  onUpdate: (d: DashboardData) => void
}

export function CriteriaTransparency({ data, role }: Props) {
  const today = new Date()
  const [selfAssess, setSelfAssess] = useState<SelfAssessments>(() => loadSelfAssessments())

  function handleSelfAssess(deliverableId: string, criterionId: string, level: Level) {
    const key = `${deliverableId}_${criterionId}`
    const prev = selfAssess[key]
    const next = prev === level ? undefined : level  // toggle off if same

    const updated = { ...selfAssess }
    if (next) {
      updated[key] = next
      toast.success(`Self-assessed: ${level}`, { description: 'Your self-assessment is saved locally.' })
    } else {
      delete updated[key]
      toast('Self-assessment cleared.')
    }
    setSelfAssess(updated)
    saveSelfAssessments(updated)
  }

  function handleExport(deliverableTitle: string) {
    toast.info('PDF export is not available in this prototype.', {
      description: `Use Ctrl+P / Cmd+P to print the rubric for "${deliverableTitle}".`,
      duration: 4000,
    })
  }

  function handleClearSelfAssess(deliverableId: string) {
    const updated: SelfAssessments = {}
    for (const [k, v] of Object.entries(selfAssess)) {
      if (!k.startsWith(deliverableId)) updated[k] = v
    }
    setSelfAssess(updated)
    saveSelfAssessments(updated)
    toast('Self-assessments cleared for this deliverable.')
  }

  const totalSelfAssessed = Object.keys(selfAssess).length

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="rounded-xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #E6007E 0%, #a8005c 100%)' }}>
        <h2 className="text-lg font-semibold">Criteria Transparency Board</h2>
        <p className="text-white/80 text-sm mt-1">
          Every deliverable&apos;s rubric is published here before you submit.
          {role === 'student' && ' Click a cell to self-assess your current level — it helps you prepare.'}
        </p>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Grade levels</p>
            {role === 'student' && totalSelfAssessed > 0 && (
              <span className="text-xs text-muted-foreground">
                <CheckSquare size={12} className="inline mr-1" />
                {totalSelfAssessed} self-assessment{totalSelfAssessed !== 1 ? 's' : ''} saved
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.entries(levelColors) as [Level, typeof levelColors.Excellent][]).map(([level, c]) => (
              <div key={level} className={`rounded-lg border p-3 ${c.bg} ${c.border}`}>
                <p className={`text-sm font-semibold ${c.text}`}>{level}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {level === 'Excellent' && 'Exceeds expectations'}
                  {level === 'Good' && 'Meets expectations'}
                  {level === 'Satisfactory' && 'Partially meets'}
                  {level === 'Insufficient' && 'Does not meet'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deliverables accordion */}
      <Accordion type="multiple" defaultValue={[data.deliverables[0]?.id]} className="space-y-4">
        {data.deliverables.map(deliverable => {
          const dueDate = new Date(deliverable.dueDate)
          const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          const isOverdue = daysLeft < 0
          const isSoon = daysLeft >= 0 && daysLeft <= 10
          const selfAssessedForThis = deliverable.criteria.filter(c =>
            selfAssess[`${deliverable.id}_${c.id}`]
          ).length

          return (
            <Card key={deliverable.id} className="overflow-hidden">
              <AccordionItem value={deliverable.id} className="border-0">
                <AccordionTrigger className="px-3 sm:px-6 py-3 sm:py-4 hover:no-underline [&>svg]:text-muted-foreground">
                  <div className="flex flex-1 items-center gap-2 sm:gap-4 text-left">
                    <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0" style={{ backgroundColor: '#E6007E15' }}>
                      <FileText size={18} style={{ color: '#E6007E' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{deliverable.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{deliverable.description}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {role === 'student' && selfAssessedForThis > 0 && (
                        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                          <CheckSquare size={10} />
                          {selfAssessedForThis}/{deliverable.criteria.length}
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${isOverdue ? 'bg-red-100 text-red-700' : isSoon ? 'bg-amber-100 text-amber-700' : 'bg-secondary text-secondary-foreground'}`}>
                        <Calendar size={11} />
                        {isOverdue
                          ? 'Overdue'
                          : isSoon
                          ? `${daysLeft}d left`
                          : dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                        }
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-0 pb-0">
                  <div className="px-3 sm:px-6 pb-4 sm:pb-6 space-y-4">
                    <p className="text-sm text-muted-foreground">{deliverable.description}</p>

                    {/* Actions row */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      {/* Weight summary */}
                      <div className="flex flex-wrap gap-2">
                        {deliverable.criteria.map(c => (
                          <span key={c.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                            <Weight size={10} />
                            {c.criterion}: {c.weight}%
                          </span>
                        ))}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {role === 'student' && selfAssessedForThis > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-muted-foreground"
                            onClick={() => handleClearSelfAssess(deliverable.id)}
                          >
                            Clear self-assessments
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => handleExport(deliverable.title)}
                        >
                          <Download size={12} />
                          Export
                        </Button>
                      </div>
                    </div>

                    {role === 'student' && (
                      <p className="text-xs text-muted-foreground rounded-md bg-violet-50 border border-violet-100 px-3 py-2">
                        💡 Click any cell to record your self-assessed level. This stays in your browser only.
                      </p>
                    )}

                    {/* Rubric table — desktop */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr>
                            <th className="text-left py-2 pr-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-40">Criterion</th>
                            {LEVELS.map(level => {
                              const c = levelColors[level]
                              return (
                                <th key={level} className={`text-center px-3 py-2 text-xs font-semibold uppercase tracking-wide rounded-t-md ${c.text}`}>
                                  {level}
                                </th>
                              )
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {deliverable.criteria.map((criterion, i) => (
                            <tr key={criterion.id} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                              <td className="py-3 pr-4 font-medium text-xs align-top">
                                <div>{criterion.criterion}</div>
                                <div className="text-muted-foreground font-normal mt-0.5">{criterion.weight}%</div>
                              </td>
                              {([criterion.excellent, criterion.good, criterion.satisfactory, criterion.insufficient] as const).map((desc, j) => {
                                const level = LEVELS[j]
                                const c = levelColors[level]
                                const key = `${deliverable.id}_${criterion.id}`
                                const isSelected = selfAssess[key] === level
                                const isInteractive = role === 'student'
                                return (
                                  <td
                                    key={j}
                                    className={`px-3 py-3 text-xs align-top ${c.text} border-l border-border/50 ${isInteractive ? 'cursor-pointer' : ''}`}
                                    onClick={isInteractive ? () => handleSelfAssess(deliverable.id, criterion.id, level) : undefined}
                                    title={isInteractive ? `Self-assess: ${level}` : undefined}
                                  >
                                    <div className={`rounded-md p-2 ${c.bg} transition-all ${isSelected ? `ring-2 ${c.ring} ring-offset-1` : ''}`}>
                                      {isSelected && <span className="block text-[10px] font-bold mb-1">✓ My level</span>}
                                      {desc}
                                    </div>
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Rubric — mobile stacked */}
                    <div className="md:hidden space-y-4">
                      {deliverable.criteria.map(criterion => (
                        <div key={criterion.id} className="border border-border rounded-lg overflow-hidden">
                          <div className="px-4 py-3 bg-muted/40">
                            <p className="text-sm font-semibold">{criterion.criterion}</p>
                            <p className="text-xs text-muted-foreground">Weight: {criterion.weight}%</p>
                          </div>
                          <div className="divide-y divide-border">
                            {([
                              { level: 'Excellent' as Level, desc: criterion.excellent },
                              { level: 'Good' as Level, desc: criterion.good },
                              { level: 'Satisfactory' as Level, desc: criterion.satisfactory },
                              { level: 'Insufficient' as Level, desc: criterion.insufficient },
                            ]).map(({ level, desc }) => {
                              const c = levelColors[level]
                              const key = `${deliverable.id}_${criterion.id}`
                              const isSelected = selfAssess[key] === level
                              const isInteractive = role === 'student'
                              return (
                                <div
                                  key={level}
                                  className={`px-4 py-2.5 ${c.bg} ${isInteractive ? 'cursor-pointer active:opacity-80' : ''} ${isSelected ? `ring-2 ${c.ring} ring-inset` : ''}`}
                                  onClick={isInteractive ? () => handleSelfAssess(deliverable.id, criterion.id, level) : undefined}
                                >
                                  <p className={`text-xs font-semibold mb-1 ${c.text}`}>
                                    {isSelected && '✓ '}
                                    {level}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{desc}</p>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Card>
          )
        })}
      </Accordion>

      {data.deliverables.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText size={40} className="mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">No deliverables published yet.</p>
            {role === 'lecturer' && <p className="text-xs text-muted-foreground mt-1">Add a deliverable to get started.</p>}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

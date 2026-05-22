'use client'

import { FileText, Calendar, Weight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import type { DashboardData, UserRole } from '@/lib/types'

const levelColors = {
  Excellent:    { bg: 'bg-emerald-50',  text: 'text-emerald-800',  border: 'border-emerald-200',  badge: 'bg-emerald-100 text-emerald-700' },
  Good:         { bg: 'bg-blue-50',     text: 'text-blue-800',     border: 'border-blue-200',     badge: 'bg-blue-100 text-blue-700'     },
  Satisfactory: { bg: 'bg-amber-50',    text: 'text-amber-800',    border: 'border-amber-200',    badge: 'bg-amber-100 text-amber-700'   },
  Insufficient: { bg: 'bg-red-50',      text: 'text-red-800',      border: 'border-red-200',      badge: 'bg-red-100 text-red-700'       },
}

interface Props {
  data: DashboardData
  role: UserRole
  onUpdate: (d: DashboardData) => void
}

export function CriteriaTransparency({ data, role, onUpdate }: Props) {
  const today = new Date()

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="rounded-xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #E6007E 0%, #a8005c 100%)' }}>
        <h2 className="text-lg font-semibold">Criteria Transparency Board</h2>
        <p className="text-white/80 text-sm mt-1">
          Every deliverable's rubric is published here before you submit. No surprises — know exactly what is being assessed and at what level.
        </p>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Grade levels</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.entries(levelColors) as [string, typeof levelColors.Excellent][]).map(([level, c]) => (
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

          return (
            <Card key={deliverable.id} className="overflow-hidden">
              <AccordionItem value={deliverable.id} className="border-0">
                <AccordionTrigger className="px-6 py-4 hover:no-underline [&>svg]:text-muted-foreground">
                  <div className="flex flex-1 items-center gap-4 text-left">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0" style={{ backgroundColor: '#E6007E15' }}>
                      <FileText size={18} style={{ color: '#E6007E' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{deliverable.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{deliverable.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
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
                  <div className="px-6 pb-6 space-y-4">
                    <p className="text-sm text-muted-foreground">{deliverable.description}</p>

                    {/* Weight summary */}
                    <div className="flex flex-wrap gap-2">
                      {deliverable.criteria.map(c => (
                        <span key={c.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                          <Weight size={10} />
                          {c.criterion}: {c.weight}%
                        </span>
                      ))}
                    </div>

                    {/* Rubric table — desktop */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr>
                            <th className="text-left py-2 pr-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-40">Criterion</th>
                            {(['Excellent', 'Good', 'Satisfactory', 'Insufficient'] as const).map(level => {
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
                              {([
                                criterion.excellent,
                                criterion.good,
                                criterion.satisfactory,
                                criterion.insufficient,
                              ] as const).map((desc, j) => {
                                const levels = ['Excellent', 'Good', 'Satisfactory', 'Insufficient'] as const
                                const c = levelColors[levels[j]]
                                return (
                                  <td key={j} className={`px-3 py-3 text-xs align-top ${c.text} border-l border-border/50`}>
                                    <div className={`rounded-md p-2 ${c.bg}`}>{desc}</div>
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
                              { level: 'Excellent', desc: criterion.excellent },
                              { level: 'Good', desc: criterion.good },
                              { level: 'Satisfactory', desc: criterion.satisfactory },
                              { level: 'Insufficient', desc: criterion.insufficient },
                            ] as const).map(({ level, desc }) => {
                              const c = levelColors[level]
                              return (
                                <div key={level} className={`px-4 py-2.5 ${c.bg}`}>
                                  <p className={`text-xs font-semibold mb-1 ${c.text}`}>{level}</p>
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

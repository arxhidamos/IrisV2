'use client'

import { useState } from 'react'
import { CheckCircle2, Clock, RefreshCw, Plus, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import type { DashboardData, UserRole, Expectation } from '@/lib/types'
import { addExpectation, updateExpectationStatus, toggleMilestone } from '@/lib/storage'

const statusConfig = {
  confirmed: { label: 'Confirmed', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  revised:   { label: 'Revised',   icon: RefreshCw,    color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-200' },
  pending:   { label: 'Pending',   icon: Clock,         color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200' },
}

function StatusBadge({ status }: { status: Expectation['status'] }) {
  const cfg = statusConfig[status]
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
      <Icon size={12} />
      {cfg.label}
    </span>
  )
}

interface Props {
  data: DashboardData
  role: UserRole
  onUpdate: (d: DashboardData) => void
}

export function ExpectationClarity({ data, role, onUpdate }: Props) {
  const [newText, setNewText] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [noteStatus, setNoteStatus] = useState<Expectation['status']>('confirmed')

  const confirmedCount = data.expectations.filter(e => e.status === 'confirmed').length
  const total = data.expectations.length

  function handleAddExpectation() {
    if (!newText.trim()) return
    const updated = addExpectation(data, {
      text: newText.trim(),
      authorName: newAuthor.trim() || 'You',
    })
    onUpdate(updated)
    setNewText('')
    setNewAuthor('')
    toast.success('Expectation submitted — the lecturer will review it shortly.')
  }

  function handleSaveNote(id: string) {
    const updated = updateExpectationStatus(data, id, noteStatus, noteText.trim() || undefined)
    onUpdate(updated)
    setEditingId(null)
    setNoteText('')
    toast.success(`Expectation marked as ${noteStatus}.`)
  }

  function handleToggleMilestone(milestoneId: string) {
    const milestone = data.milestones.find(m => m.id === milestoneId)
    if (!milestone) return
    const updated = toggleMilestone(data, milestoneId)
    onUpdate(updated)
    const next = !milestone.completed
    if (role === 'student') {
      toast(next ? '✅ Milestone marked as done!' : 'Milestone unmarked.', {
        description: milestone.title,
      })
    } else {
      toast(next ? 'Milestone completed.' : 'Milestone reopened.', {
        description: milestone.title,
      })
    }
  }

  const completedMilestones = data.milestones.filter(m => m.completed).length
  const milestoneProgress = Math.round((completedMilestones / data.milestones.length) * 100)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Expectations list */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Student Expectations</CardTitle>
                <CardDescription className="mt-1">
                  What students need to succeed — lecturer responses shown below each item.
                </CardDescription>
              </div>
              <Badge variant="muted">{confirmedCount}/{total} confirmed</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.expectations.map(exp => (
              <div key={exp.id} className={`rounded-lg border p-4 space-y-2 ${statusConfig[exp.status].bg}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm leading-relaxed flex-1">{exp.text}</p>
                  <StatusBadge status={exp.status} />
                </div>
                <p className="text-xs text-muted-foreground">
                  — {exp.authorName} · {new Date(exp.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </p>

                {exp.lecturerNote && (
                  <div className="mt-2 pl-3 border-l-2 border-current/20">
                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1">
                      <MessageSquare size={11} />
                      Lecturer response
                    </div>
                    <p className="text-sm">{exp.lecturerNote}</p>
                  </div>
                )}

                {role === 'lecturer' && editingId === exp.id && (
                  <div className="mt-3 space-y-2 bg-white rounded-md p-3 border border-border">
                    <Label className="text-xs">Status</Label>
                    <div className="flex gap-2">
                      {(['confirmed', 'revised', 'pending'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => setNoteStatus(s)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${noteStatus === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-white'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <Textarea
                      placeholder="Add a note for students…"
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      className="min-h-[60px] text-sm"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveNote(exp.id)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                )}

                {role === 'lecturer' && editingId !== exp.id && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs mt-1"
                    onClick={() => {
                      setEditingId(exp.id)
                      setNoteText(exp.lecturerNote ?? '')
                      setNoteStatus(exp.status)
                    }}
                  >
                    {exp.lecturerNote ? 'Edit response' : 'Respond'}
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Add expectation form */}
        {role === 'student' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus size={16} />
                Add an Expectation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label>Your expectation</Label>
                <Textarea
                  placeholder="What do you need from this course to succeed? Be specific."
                  value={newText}
                  onChange={e => setNewText(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Your name (optional)</Label>
                <Input
                  placeholder="Leave blank to post as Anonymous"
                  value={newAuthor}
                  onChange={e => setNewAuthor(e.target.value)}
                />
              </div>
              <Button onClick={handleAddExpectation} disabled={!newText.trim()}>
                Submit Expectation
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right column: milestones + participation */}
      <div className="space-y-4">
        {/* Milestone progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Milestones</CardTitle>
            <CardDescription>{completedMilestones} of {data.milestones.length} completed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={milestoneProgress} className="h-2" />
            <div className="space-y-3">
              {data.milestones.map(m => (
                <div key={m.id} className="flex items-start gap-2.5">
                  <button
                    onClick={() => handleToggleMilestone(m.id)}
                    className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border-2 transition-colors cursor-pointer hover:border-primary ${m.completed ? 'bg-primary border-primary' : 'border-border bg-white'}`}
                    aria-label={m.completed ? 'Mark incomplete' : 'Mark complete'}
                    title={role === 'student' ? 'Click to track your progress' : 'Click to toggle completion'}
                  >
                    {m.completed && (
                      <svg viewBox="0 0 12 12" fill="none" className="w-full h-full p-0.5">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-tight ${m.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {m.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Due {new Date(m.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              {role === 'student' ? 'Check off milestones as you complete them.' : 'Click checkboxes to toggle milestone completion.'}
            </p>
          </CardContent>
        </Card>

        {/* Participation guidelines */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Participation Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {[
                'Attend at least 80% of sessions (5/6 minimum).',
                'Submit a reflection within 24 hours of each session.',
                'Contribute to at least 2 in-class group activities per session.',
                'Post or answer at least 1 Q&A question per fortnight.',
                'Peer review submissions must be constructive and specific.',
              ].map((g, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: '#E6007E' }}>
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">{g}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

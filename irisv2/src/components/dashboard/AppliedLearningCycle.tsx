'use client'

import { useState } from 'react'
import { BookOpen, Wrench, MessageCircle, SmilePlus, Smile, Meh, Frown, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import type { DashboardData, UserRole, SessionMood } from '@/lib/types'
import { addReflection } from '@/lib/storage'

const phases = [
  {
    icon: BookOpen,
    label: 'Theory',
    duration: '25–30 min',
    color: '#E6007E',
    description: 'Lecturer introduces the concept with structured input and real-world examples.',
  },
  {
    icon: Wrench,
    label: 'Application',
    duration: '30–40 min',
    color: '#7c3aed',
    description: 'Groups apply theory to a live case study or structured exercise.',
  },
  {
    icon: MessageCircle,
    label: 'Reflection',
    duration: '10 min',
    color: '#0891b2',
    description: 'Class-wide debrief — what worked, what didn\'t, what to carry forward.',
  },
]

const moodOptions: { value: SessionMood; label: string; Icon: typeof SmilePlus; color: string }[] = [
  { value: 'great',     label: 'Great',      Icon: SmilePlus, color: 'text-emerald-600' },
  { value: 'good',      label: 'Good',       Icon: Smile,     color: 'text-blue-600'    },
  { value: 'neutral',   label: 'Neutral',    Icon: Meh,       color: 'text-amber-600'   },
  { value: 'struggling',label: 'Struggling', Icon: Frown,     color: 'text-red-500'     },
]

const sessions = [
  { number: 1, title: 'Introduction to Business Innovation',   date: '2025-05-07' },
  { number: 2, title: 'Stakeholder Mapping',                   date: '2025-05-12' },
  { number: 3, title: 'Team Dynamics & Conflict',              date: '2025-05-15' },
  { number: 4, title: 'Problem Framing Workshop',              date: '2025-05-21' },
  { number: 5, title: 'Prototyping Methods',                   date: '2025-06-05' },
  { number: 6, title: 'Pitch Preparation',                     date: '2025-06-12' },
]

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

interface Props {
  data: DashboardData
  role: UserRole
  onUpdate: (d: DashboardData) => void
}

export function AppliedLearningCycle({ data, role, onUpdate }: Props) {
  const [selectedSession, setSelectedSession] = useState<number>(4)
  const [reflectionText, setReflectionText] = useState('')
  const [mood, setMood] = useState<SessionMood>('good')
  const [authorName, setAuthorName] = useState('')

  const sessionReflections = data.reflections.filter(r => r.sessionNumber === selectedSession)
  const activeSession = sessions.find(s => s.number === selectedSession)

  function handleSubmitReflection() {
    if (!reflectionText.trim()) return
    const updated = addReflection(data, {
      sessionNumber: selectedSession,
      sessionTitle: activeSession?.title ?? `Session ${selectedSession}`,
      text: reflectionText.trim(),
      authorName: authorName.trim() || 'You',
      mood,
    })
    onUpdate(updated)
    setReflectionText('')
    setAuthorName('')
    setMood('good')
  }

  return (
    <div className="space-y-6">
      {/* Session format visualisation */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Session Structure</CardTitle>
          <CardDescription>Every session follows this repeatable format. Each phase builds on the last.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {phases.map((phase, i) => {
              const Icon = phase.icon
              return (
                <div key={phase.label} className="flex-1 relative">
                  <div className="rounded-xl border border-border bg-white p-5 h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: `${phase.color}15` }}>
                        <Icon size={18} style={{ color: phase.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{phase.label}</p>
                        <p className="text-xs text-muted-foreground">{phase.duration}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{phase.description}</p>
                  </div>
                  {i < phases.length - 1 && (
                    <div className="hidden sm:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-4">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 8h8m-4-4l4 4-4 4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session picker + reflections */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Session Reflections</CardTitle>
              <CardDescription>Select a session to view submitted reflections.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Session selector */}
              <div className="flex flex-wrap gap-2">
                {sessions.map(s => (
                  <button
                    key={s.number}
                    onClick={() => setSelectedSession(s.number)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${selectedSession === s.number ? 'border-primary text-primary bg-primary/5' : 'border-border text-muted-foreground hover:border-primary/50 bg-white'}`}
                    style={selectedSession === s.number ? { borderColor: '#E6007E', color: '#E6007E', backgroundColor: '#E6007E0D' } : {}}
                  >
                    Session {s.number}
                  </button>
                ))}
              </div>

              {activeSession && (
                <div className="rounded-lg bg-muted/40 px-4 py-2.5">
                  <p className="text-sm font-medium">{activeSession.title}</p>
                  <p className="text-xs text-muted-foreground">{new Date(activeSession.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
              )}

              <Separator />

              {sessionReflections.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No reflections submitted for this session yet.</p>
                  {role === 'student' && <p className="text-xs mt-1">Add yours below.</p>}
                </div>
              ) : (
                <div className="space-y-3">
                  {sessionReflections.map(r => {
                    const moodOpt = moodOptions.find(m => m.value === r.mood)
                    const MoodIcon = moodOpt?.Icon ?? Smile
                    return (
                      <div key={r.id} className="rounded-lg border border-border bg-white p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7 text-xs">
                              <AvatarFallback style={{ backgroundColor: '#E6007E20', color: '#E6007E' }}>
                                {initials(r.authorName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{r.authorName}</span>
                          </div>
                          <span className={`flex items-center gap-1 text-xs ${moodOpt?.color ?? 'text-muted-foreground'}`}>
                            <MoodIcon size={13} />
                            {moodOpt?.label}
                          </span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{r.text}</p>
                        <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit reflection */}
          {role === 'student' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Plus size={16} />
                  Submit Your Reflection
                </CardTitle>
                <CardDescription>For Session {selectedSession}: {activeSession?.title}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>How did this session go?</Label>
                  <div className="flex flex-wrap gap-2">
                    {moodOptions.map(({ value, label, Icon, color }) => (
                      <button
                        key={value}
                        onClick={() => setMood(value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${mood === value ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-white'}`}
                        style={mood === value ? { backgroundColor: '#E6007E', borderColor: '#E6007E', color: 'white' } : {}}
                      >
                        <Icon size={13} className={mood === value ? '' : color} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Your reflection</Label>
                  <Textarea
                    placeholder="What did you learn? What was unclear? What would help next time?"
                    value={reflectionText}
                    onChange={e => setReflectionText(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Your name (optional)</Label>
                  <Input placeholder="Leave blank to post as 'You'" value={authorName} onChange={e => setAuthorName(e.target.value)} />
                </div>
                <Button onClick={handleSubmitReflection} disabled={!reflectionText.trim()}>
                  Submit Reflection
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Progress check-in */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Course Progress</CardTitle>
              <CardDescription>Where the cohort is at a glance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Sessions completed', value: 3, total: 6 },
                { label: 'Reflections submitted', value: data.reflections.length, total: 18 },
                { label: 'Expectations addressed', value: data.expectations.filter(e => e.status !== 'pending').length, total: data.expectations.length },
                { label: 'Questions answered', value: data.questions.filter(q => q.answered).length, total: data.questions.length },
              ].map(({ label, value, total }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}/{total}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(value / total) * 100}%`, backgroundColor: '#E6007E' }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sessions.filter(s => s.number > 3).map(s => (
                  <div key={s.number} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: '#E6007E' }}>
                      {s.number}
                    </div>
                    <div>
                      <p className="text-xs font-medium leading-tight">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

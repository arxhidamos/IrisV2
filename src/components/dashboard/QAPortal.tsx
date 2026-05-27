'use client'

import { useState } from 'react'
import { MessageCircle, CheckCircle2, Clock, Send, ChevronDown, ChevronUp, Tag, Share2, ThumbsUp } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { DashboardData, UserRole, QuestionTag } from '@/lib/types'
import { addQuestion, addAnswer } from '@/lib/storage'

const tagConfig: Record<QuestionTag, { label: string; color: string; bg: string }> = {
  criteria:  { label: 'Criteria',  color: 'text-violet-700', bg: 'bg-violet-100' },
  logistics: { label: 'Logistics', color: 'text-sky-700',    bg: 'bg-sky-100'    },
  content:   { label: 'Content',   color: 'text-teal-700',   bg: 'bg-teal-100'   },
}

function TagBadge({ tag }: { tag: QuestionTag }) {
  const cfg = tagConfig[tag]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      <Tag size={10} />
      {cfg.label}
    </span>
  )
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const d = Math.floor(diff / 86400000)
  const h = Math.floor(diff / 3600000)
  const m = Math.floor(diff / 60000)
  if (d > 0) return `${d}d ago`
  if (h > 0) return `${h}h ago`
  return `${m}m ago`
}

type Filter = 'all' | 'unanswered' | QuestionTag

interface Props {
  data: DashboardData
  role: UserRole
  onUpdate: (d: DashboardData) => void
}

export function QAPortal({ data, role, onUpdate }: Props) {
  const [filter, setFilter] = useState<Filter>('all')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  // Helpful votes (local state only — no backend)
  const [helpfulVotes, setHelpfulVotes] = useState<Set<string>>(new Set())

  // New question form state
  const [qText, setQText] = useState('')
  const [qTag, setQTag] = useState<QuestionTag>('content')
  const [qAnon, setQAnon] = useState(false)
  const [qAuthor, setQAuthor] = useState('')
  const [showForm, setShowForm] = useState(false)

  const filtered = data.questions.filter(q => {
    if (filter === 'all') return true
    if (filter === 'unanswered') return !q.answered
    return q.tag === filter
  })

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleSubmitQuestion() {
    if (!qText.trim()) return
    const updated = addQuestion(data, {
      text: qText.trim(),
      tag: qTag,
      anonymous: qAnon,
      authorName: qAnon ? 'Anonymous' : (qAuthor.trim() || 'You'),
    })
    onUpdate(updated)
    setQText('')
    setQAuthor('')
    setQAnon(false)
    setShowForm(false)
    toast.success('Question posted!', { description: 'The lecturer will be notified.' })
  }

  function handleSubmitReply(questionId: string) {
    const text = replyText[questionId]?.trim()
    if (!text) return
    const updated = addAnswer(data, questionId, text, 'Dr. Brouwer')
    onUpdate(updated)
    setReplyText(prev => ({ ...prev, [questionId]: '' }))
    setReplyingTo(null)
    setExpandedIds(prev => new Set(prev).add(questionId))
    toast.success('Answer posted — students have been notified.')
  }

  function handleShareQuestion(questionId: string, questionText: string) {
    const url = `${window.location.href.split('?')[0]}?q=${questionId}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        toast.success('Link copied!', { description: questionText.slice(0, 60) + (questionText.length > 60 ? '…' : '') })
      }).catch(() => {
        toast.info('Copy this link:', { description: url })
      })
    } else {
      toast.info('Copy this link:', { description: url })
    }
  }

  function handleHelpful(questionId: string) {
    setHelpfulVotes(prev => {
      const next = new Set(prev)
      if (next.has(questionId)) {
        next.delete(questionId)
        toast('Vote removed.')
      } else {
        next.add(questionId)
        toast.success('Marked as helpful!')
      }
      return next
    })
  }

  const unansweredCount = data.questions.filter(q => !q.answered).length

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Questions list */}
      <div className="lg:col-span-2 space-y-4">
        {/* Filters + ask button */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(['all', 'unanswered', 'criteria', 'logistics', 'content'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filter === f ? 'text-white border-transparent' : 'border-border bg-white text-muted-foreground hover:border-primary/40'}`}
                style={filter === f ? { backgroundColor: '#E6007E', borderColor: '#E6007E' } : {}}
              >
                {f === 'all' ? 'All questions' : f === 'unanswered' ? `Unanswered (${unansweredCount})` : tagConfig[f as QuestionTag]?.label}
              </button>
            ))}
          </div>
          {role === 'student' && (
            <Button size="sm" onClick={() => setShowForm(v => !v)} style={{ backgroundColor: '#E6007E', color: 'white' }}>
              {showForm ? 'Cancel' : '+ Ask a question'}
            </Button>
          )}
        </div>

        {/* Ask form */}
        {showForm && role === 'student' && (
          <Card className="border-primary/30" style={{ borderColor: '#E6007E40' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ask the Lecturer</CardTitle>
              <CardDescription>Your question will be visible to the whole class — so others benefit too.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Question</Label>
                <Textarea
                  placeholder="Be specific — what exactly are you unsure about?"
                  value={qText}
                  onChange={e => setQText(e.target.value)}
                  className="min-h-[90px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Topic</Label>
                  <Select value={qTag} onValueChange={v => setQTag(v as QuestionTag)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="criteria">Criteria</SelectItem>
                      <SelectItem value="logistics">Logistics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Your name (optional)</Label>
                  <Input
                    placeholder="Leave blank = 'You'"
                    value={qAuthor}
                    onChange={e => setQAuthor(e.target.value)}
                    disabled={qAnon}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={qAnon}
                  onChange={e => setQAnon(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm text-muted-foreground">Post anonymously</span>
              </label>
              <Button onClick={handleSubmitQuestion} disabled={!qText.trim()} style={{ backgroundColor: '#E6007E', color: 'white' }}>
                <Send size={14} />
                Post Question
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Question cards */}
        {filtered.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageCircle size={36} className="mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-sm text-muted-foreground">No questions found for this filter.</p>
            </CardContent>
          </Card>
        )}

        {filtered.map(question => {
          const expanded = expandedIds.has(question.id)
          const isReplying = replyingTo === question.id
          const isHelpful = helpfulVotes.has(question.id)

          return (
            <Card key={question.id} className={`transition-shadow hover:shadow-md ${!question.answered ? 'border-amber-200' : ''}`}>
              <CardContent className="pt-5 pb-4 space-y-3">
                {/* Question header */}
                <div className="flex items-start gap-2 justify-between">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <Avatar className="h-8 w-8 text-xs flex-shrink-0 mt-0.5">
                      <AvatarFallback
                        className="text-xs font-semibold"
                        style={question.anonymous ? { backgroundColor: '#f3f4f6', color: '#6b7280' } : { backgroundColor: '#E6007E20', color: '#E6007E' }}
                      >
                        {question.anonymous ? '?' : initials(question.authorName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug">{question.text}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="text-xs text-muted-foreground">{question.authorName} · {timeAgo(question.createdAt)}</span>
                        <TagBadge tag={question.tag} />
                        {question.answered ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                            <CheckCircle2 size={11} /> Answered
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">
                            <Clock size={11} /> Awaiting answer
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {question.answers.length > 0 && (
                    <button
                      onClick={() => toggleExpand(question.id)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-0.5"
                    >
                      {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {question.answers.length} answer{question.answers.length !== 1 ? 's' : ''}
                    </button>
                  )}
                </div>

                {/* Answers */}
                {expanded && question.answers.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-border">
                    {question.answers.map(answer => (
                      <div key={answer.id} className="flex gap-3">
                        <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: '#E6007E', color: 'white' }}>
                          {initials(answer.authorName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold">{answer.authorName}</span>
                            <span className="text-xs font-medium text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: '#E6007E' }}>Lecturer</span>
                            <span className="text-xs text-muted-foreground">{timeAgo(answer.createdAt)}</span>
                          </div>
                          <p className="text-sm leading-relaxed">{answer.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Show answers button if collapsed */}
                {!expanded && question.answers.length > 0 && (
                  <button
                    onClick={() => toggleExpand(question.id)}
                    className="text-xs font-medium hover:underline"
                    style={{ color: '#E6007E' }}
                  >
                    Show {question.answers.length} answer{question.answers.length !== 1 ? 's' : ''} →
                  </button>
                )}

                {/* Action bar */}
                <div className="flex items-center gap-1 pt-1 border-t border-border/50">
                  {/* Helpful vote (student) */}
                  {role === 'student' && (
                    <button
                      onClick={() => handleHelpful(question.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${isHelpful ? 'text-white' : 'text-muted-foreground hover:bg-muted'}`}
                      style={isHelpful ? { backgroundColor: '#E6007E' } : {}}
                      aria-pressed={isHelpful}
                      title="Mark this question as helpful"
                    >
                      <ThumbsUp size={12} />
                      {isHelpful ? 'Helpful' : 'Helpful?'}
                    </button>
                  )}

                  {/* Share */}
                  <button
                    onClick={() => handleShareQuestion(question.id, question.text)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                    title="Copy link to this question"
                  >
                    <Share2 size={12} />
                    Share
                  </button>

                  {/* Lecturer reply area */}
                  {role === 'lecturer' && (
                    <div className="flex-1">
                      {isReplying ? (
                        <div className="space-y-2 mt-2">
                          <Textarea
                            placeholder="Write your answer — it will be visible to all students."
                            value={replyText[question.id] ?? ''}
                            onChange={e => setReplyText(prev => ({ ...prev, [question.id]: e.target.value }))}
                            className="min-h-[80px] text-sm"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSubmitReply(question.id)} disabled={!replyText[question.id]?.trim()} style={{ backgroundColor: '#E6007E', color: 'white' }}>
                              <Send size={12} /> Post Answer
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                          onClick={() => { setReplyingTo(question.id); setExpandedIds(prev => new Set(prev).add(question.id)) }}
                        >
                          <MessageCircle size={12} />
                          {question.answered ? 'Add another answer' : 'Answer this question'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Sidebar stats */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Q&amp;A Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Total questions', value: data.questions.length, color: 'text-foreground' },
              { label: 'Answered',        value: data.questions.filter(q => q.answered).length,  color: 'text-emerald-600' },
              { label: 'Awaiting answer', value: unansweredCount, color: 'text-amber-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className={`text-sm font-semibold ${color}`}>{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">By Topic</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(['criteria', 'logistics', 'content'] as QuestionTag[]).map(tag => {
              const count = data.questions.filter(q => q.tag === tag).length
              const cfg = tagConfig[tag]
              return (
                <button
                  key={tag}
                  className="w-full flex items-center gap-2 rounded hover:bg-muted/50 transition-colors py-1 px-1"
                  onClick={() => setFilter(tag)}
                  title={`Filter by ${cfg.label}`}
                >
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color} w-24 flex-shrink-0`}>
                    <Tag size={10} />
                    {cfg.label}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(count / data.questions.length) * 100}%`, backgroundColor: '#E6007E' }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-4 text-right flex-shrink-0">{count}</span>
                </button>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tips for Good Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                'Be specific — say exactly what you don\'t understand.',
                'Check if your question was already asked.',
                'Use "Criteria" for rubric/grading questions.',
                'Anonymous is fine — your classmates benefit too.',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-xs mt-0.5" style={{ color: '#E6007E' }}>•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

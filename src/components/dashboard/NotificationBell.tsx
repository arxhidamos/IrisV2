'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, X, AlertCircle, Clock, CheckCircle2 } from 'lucide-react'
import type { DashboardData } from '@/lib/types'
import { getReadNotifications, dismissNotification, markNotificationsRead } from '@/lib/storage'

interface Notification {
  id: string
  title: string
  subtitle: string
  urgency: 'overdue' | 'soon' | 'upcoming'
  type: 'milestone' | 'deliverable'
}

function computeNotifications(data: DashboardData): Notification[] {
  const today = new Date()
  const notifications: Notification[] = []

  data.milestones.forEach(m => {
    if (m.completed) return
    const due = new Date(m.dueDate)
    const daysLeft = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const urgency: Notification['urgency'] = daysLeft < 0 ? 'overdue' : daysLeft <= 7 ? 'soon' : 'upcoming'
    const subtitle = daysLeft < 0
      ? `${Math.abs(daysLeft)}d overdue · ${due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
      : daysLeft === 0 ? 'Due today!'
      : `Due in ${daysLeft}d · ${due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
    notifications.push({ id: `milestone-${m.id}`, title: m.title, subtitle, urgency, type: 'milestone' })
  })

  data.deliverables.forEach(d => {
    const due = new Date(d.dueDate)
    const daysLeft = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const urgency: Notification['urgency'] = daysLeft < 0 ? 'overdue' : daysLeft <= 7 ? 'soon' : 'upcoming'
    const subtitle = daysLeft < 0
      ? `${Math.abs(daysLeft)}d overdue · ${due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
      : daysLeft === 0 ? 'Due today!'
      : `Due in ${daysLeft}d · ${due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
    notifications.push({ id: `deliverable-${d.id}`, title: d.title, subtitle, urgency, type: 'deliverable' })
  })

  return notifications.sort((a, b) => {
    const order = { overdue: 0, soon: 1, upcoming: 2 }
    return order[a.urgency] - order[b.urgency]
  })
}

const urgencyStyle = {
  overdue: { icon: AlertCircle, iconColor: 'text-red-500', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  soon:    { icon: Clock,        iconColor: 'text-amber-500', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  upcoming:{ icon: Clock,        iconColor: 'text-blue-400',  badge: 'bg-blue-50 text-blue-600',    dot: 'bg-blue-400'  },
}

interface Props {
  data: DashboardData
}

export function NotificationBell({ data }: Props) {
  const [open, setOpen] = useState(false)
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setReadIds(getReadNotifications())
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  const notifications = computeNotifications(data)
  const unread = notifications.filter(n => !readIds.has(n.id))
  const unreadCount = unread.length

  function handleOpen() {
    setOpen(v => !v)
  }

  function handleMarkAllRead() {
    const ids = notifications.map(n => n.id)
    markNotificationsRead(ids)
    setReadIds(new Set(ids))
  }

  function handleDismiss(id: string) {
    dismissNotification(id)
    setReadIds(prev => new Set([...prev, id]))
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center w-8 h-8 rounded-full transition-colors"
        style={{ backgroundColor: open ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)' }}
        onMouseOver={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)')}
        onMouseOut={e => !open && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)')}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell size={16} className="text-white" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1"
            style={{ backgroundColor: '#ff3d71' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-24px)] bg-white rounded-xl shadow-2xl border border-border z-50 overflow-hidden"
          style={{ maxHeight: '70vh' }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell size={15} style={{ color: '#E6007E' }} />
              <span className="text-sm font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-medium text-white" style={{ backgroundColor: '#E6007E' }}>
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 48px)' }}>
            {notifications.length === 0 && (
              <div className="px-4 py-8 text-center">
                <CheckCircle2 size={28} className="mx-auto mb-2 text-emerald-400" />
                <p className="text-sm font-medium text-foreground">All caught up!</p>
                <p className="text-xs text-muted-foreground mt-1">No pending deadlines.</p>
              </div>
            )}

            {notifications.map(notif => {
              const isRead = readIds.has(notif.id)
              const style = urgencyStyle[notif.urgency]
              const Icon = style.icon
              return (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0 transition-colors ${isRead ? 'opacity-60' : 'bg-white'}`}
                >
                  <div className={`mt-0.5 flex-shrink-0 ${style.iconColor}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-tight ${isRead ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{notif.subtitle}</p>
                    <span className={`inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${style.badge}`}>
                      {notif.urgency === 'overdue' ? 'Overdue' : notif.urgency === 'soon' ? 'Due soon' : 'Upcoming'}
                    </span>
                  </div>
                  {!isRead && (
                    <button
                      onClick={() => handleDismiss(notif.id)}
                      className="flex-shrink-0 text-muted-foreground/50 hover:text-muted-foreground transition-colors mt-0.5"
                      aria-label="Dismiss"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

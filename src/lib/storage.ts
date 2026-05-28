'use client'

import type { DashboardData, Question, Expectation, SessionReflection, UserProfile, AuthSession } from './types'
import {
  seedQuestions,
  seedExpectations,
  seedReflections,
  seedDeliverables,
  seedMilestones,
} from './seed-data'

const STORAGE_KEY = 'inholland_iris_data'
const AUTH_KEY = 'inholland_iris_auth'
const PROFILE_KEY = 'inholland_iris_profile'

// ─── Auth ────────────────────────────────────────────────────────────────────

export function getSession(): AuthSession {
  if (typeof window === 'undefined') return { loggedIn: false, loginTime: '' }
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return { loggedIn: false, loginTime: '' }
    return JSON.parse(raw) as AuthSession
  } catch {
    return { loggedIn: false, loginTime: '' }
  }
}

export function setSession(session: AuthSession): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(AUTH_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(AUTH_KEY)
}

// ─── Profile ─────────────────────────────────────────────────────────────────

const defaultProfile: UserProfile = {
  displayName: 'Alex de Vries',
  email: 'a.devries@student.inholland.nl',
  rolePreference: 'student',
  notifyQuestions: true,
  notifyMilestones: true,
  notifyExpectations: false,
  language: 'en',
}

export function loadProfile(): UserProfile {
  if (typeof window === 'undefined') return defaultProfile
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return defaultProfile
    return { ...defaultProfile, ...JSON.parse(raw) } as UserProfile
  } catch {
    return defaultProfile
  }
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  } catch {
    // storage quota exceeded — silently ignore
  }
}

// ─── Notifications (read state) ──────────────────────────────────────────────

const NOTIF_KEY = 'inholland_iris_notif_read'

export function getReadNotifications(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(NOTIF_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

export function markNotificationsRead(ids: string[]): void {
  if (typeof window === 'undefined') return
  try {
    const existing = getReadNotifications()
    ids.forEach(id => existing.add(id))
    localStorage.setItem(NOTIF_KEY, JSON.stringify([...existing]))
  } catch { /* ignore */ }
}

export function dismissNotification(id: string): void {
  markNotificationsRead([id])
}

// ─── ECTS / Grades ───────────────────────────────────────────────────────────

import type { ECTSData } from './types'
import { seedGrades } from './seed-data'

const ECTS_KEY = 'inholland_iris_ects'

const defaultECTS: ECTSData = {
  grades: seedGrades,
  totalProgramECTS: 240,
  initialized: true,
}

export function loadECTS(): ECTSData {
  if (typeof window === 'undefined') return defaultECTS
  try {
    const raw = localStorage.getItem(ECTS_KEY)
    if (!raw) return defaultECTS
    const parsed = JSON.parse(raw) as ECTSData
    if (!parsed.initialized) return defaultECTS
    return parsed
  } catch {
    return defaultECTS
  }
}

export function saveECTS(data: ECTSData): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ECTS_KEY, JSON.stringify(data))
  } catch { /* ignore */ }
}

const defaultData: DashboardData = {
  questions: seedQuestions,
  expectations: seedExpectations,
  reflections: seedReflections,
  deliverables: seedDeliverables,
  milestones: seedMilestones,
  initialized: true,
}

export function loadData(): DashboardData {
  if (typeof window === 'undefined') return defaultData
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultData
    const parsed = JSON.parse(raw) as DashboardData
    if (!parsed.initialized) return defaultData
    return parsed
  } catch {
    return defaultData
  }
}

export function saveData(data: DashboardData): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // storage quota exceeded — silently ignore
  }
}

export function resetData(): DashboardData {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
  return defaultData
}

export function addQuestion(
  data: DashboardData,
  q: Omit<Question, 'id' | 'createdAt' | 'answered' | 'answers'>
): DashboardData {
  const newQ: Question = {
    ...q,
    id: `q${Date.now()}`,
    createdAt: new Date().toISOString(),
    answered: false,
    answers: [],
  }
  return { ...data, questions: [newQ, ...data.questions] }
}

export function addAnswer(
  data: DashboardData,
  questionId: string,
  text: string,
  authorName: string
): DashboardData {
  const questions = data.questions.map((q) => {
    if (q.id !== questionId) return q
    const answer = {
      id: `a${Date.now()}`,
      text,
      authorName,
      createdAt: new Date().toISOString(),
    }
    return { ...q, answered: true, answers: [...q.answers, answer] }
  })
  return { ...data, questions }
}

export function addExpectation(
  data: DashboardData,
  e: Omit<Expectation, 'id' | 'createdAt' | 'status'>
): DashboardData {
  const newE: Expectation = {
    ...e,
    id: `e${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
  }
  return { ...data, expectations: [newE, ...data.expectations] }
}

export function updateExpectationStatus(
  data: DashboardData,
  id: string,
  status: Expectation['status'],
  lecturerNote?: string
): DashboardData {
  const expectations = data.expectations.map((e) =>
    e.id === id ? { ...e, status, lecturerNote: lecturerNote ?? e.lecturerNote } : e
  )
  return { ...data, expectations }
}

export function addReflection(
  data: DashboardData,
  r: Omit<SessionReflection, 'id' | 'createdAt'>
): DashboardData {
  const newR: SessionReflection = {
    ...r,
    id: `r${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  return { ...data, reflections: [newR, ...data.reflections] }
}

export function toggleMilestone(data: DashboardData, id: string): DashboardData {
  const milestones = data.milestones.map((m) =>
    m.id === id ? { ...m, completed: !m.completed } : m
  )
  return { ...data, milestones }
}

'use client'

import type { DashboardData, Question, Expectation, SessionReflection } from './types'
import {
  seedQuestions,
  seedExpectations,
  seedReflections,
  seedDeliverables,
  seedMilestones,
} from './seed-data'

const STORAGE_KEY = 'inholland_iris_data'

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

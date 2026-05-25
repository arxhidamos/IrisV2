export type UserRole = 'student' | 'lecturer'
export type QuestionTag = 'criteria' | 'logistics' | 'content'
export type ExpectationStatus = 'pending' | 'confirmed' | 'revised'
export type SessionMood = 'great' | 'good' | 'neutral' | 'struggling'

export interface Answer {
  id: string
  text: string
  authorName: string
  createdAt: string
}

export interface Question {
  id: string
  text: string
  tag: QuestionTag
  anonymous: boolean
  authorName: string
  createdAt: string
  answered: boolean
  answers: Answer[]
}

export interface Expectation {
  id: string
  text: string
  authorName: string
  createdAt: string
  status: ExpectationStatus
  lecturerNote?: string
}

export interface SessionReflection {
  id: string
  sessionNumber: number
  sessionTitle: string
  text: string
  authorName: string
  createdAt: string
  mood: SessionMood
}

export interface CriterionRow {
  id: string
  criterion: string
  excellent: string
  good: string
  satisfactory: string
  insufficient: string
  weight: number
}

export interface Deliverable {
  id: string
  title: string
  description: string
  dueDate: string
  criteria: CriterionRow[]
}

export interface Milestone {
  id: string
  title: string
  dueDate: string
  completed: boolean
  description: string
}

export interface DashboardData {
  questions: Question[]
  expectations: Expectation[]
  reflections: SessionReflection[]
  deliverables: Deliverable[]
  milestones: Milestone[]
  initialized: boolean
}

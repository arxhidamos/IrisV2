import { LoginForm } from '@/components/LoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign in — Inholland Iris',
  description: 'Business Innovation student dashboard',
}

export default function LoginPage() {
  return <LoginForm />
}

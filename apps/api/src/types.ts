import type { D1Database } from '@cloudflare/workers-types'

export type Bindings = {
  DB: D1Database
  CLERK_PUBLISHABLE_KEY: string
  CLERK_SECRET_KEY: string
  CLERK_WEBHOOK_SECRET: string
  ADMIN_EMAILS?: string
}

export type Variables = {
  userId: string
  isAdmin?: boolean
}

export type AppEnv = {
  Bindings: Bindings
  Variables: Variables
}
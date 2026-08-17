import { drizzle } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import type { D1Database } from '@cloudflare/workers-types'
import { users } from '../db/schema'

export async function ensureUserExists(
  dbD1: D1Database,
  userId: string,
  email: string,
  name: string,
  adminEmails?: string
) {
  const db = drizzle(dbD1)
  
  const isAdmin = adminEmails
    ? adminEmails.split(',').map(e => e.trim().toLowerCase()).includes(email.toLowerCase())
    : false

  await db
    .insert(users)
    .values({
      id: userId,
      email,
      name,
      is_admin: isAdmin,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email,
        name,
        // Only promote to admin via ADMIN_EMAILS; never demote existing admins
        is_admin: isAdmin ? true : undefined,
      },
    })
}
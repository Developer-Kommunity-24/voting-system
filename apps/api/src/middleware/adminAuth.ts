import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { getAuth } from '@clerk/hono'
import { createMiddleware } from 'hono/factory'
import type { AppEnv } from '../types'
import { users } from '../db/schema'

export const requireAdmin = createMiddleware<AppEnv>(async (c, next) => {
  const auth = getAuth(c)
  
  if (!auth?.userId) {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }
  
  const db = drizzle(c.env.DB)
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, auth.userId))
    .get()
  
  if (!user || !user.is_admin) {
    return c.json({ success: false, error: 'Forbidden' }, 403)
  }
  
  c.set('userId', auth.userId)
  c.set('isAdmin', true)
  await next()
})
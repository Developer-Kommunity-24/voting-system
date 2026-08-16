import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import type { AppEnv } from '../types'
import { requireAuth } from '../middleware/auth'
import { users } from '../db/schema'
import { syncUser } from '../controllers/user.Controller'

const user = new Hono<AppEnv>()

// GET /api/v1/user/me — returns { isAdmin } for frontend route guard
user.get('/me', requireAuth, async (c) => {
  const db = drizzle(c.env.DB)
  const userId = c.get('userId')
  
  const row = await db.select().from(users).where(eq(users.id, userId)).get()
  
  return c.json({
    success: true,
    data: { isAdmin: row?.is_admin ?? false }
  })
})

user.post('/sync', requireAuth, syncUser)

export default user
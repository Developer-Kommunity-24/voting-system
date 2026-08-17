import { getAuth } from '@clerk/hono'
import { createMiddleware } from 'hono/factory'
import { createClerkClient } from '@clerk/backend' 
import type { AppEnv } from '../types'
import { ensureUserExists } from '../utils/user'

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const auth = getAuth(c)
  
  if (!auth?.userId) {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }
  
  // FIX: create the client instance
  const clerk = createClerkClient({ secretKey: c.env.CLERK_SECRET_KEY })
  const clerkUser = await clerk.users.getUser(auth.userId)
  
  const email = clerkUser.emailAddresses[0]?.emailAddress
  const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim()
  
  await ensureUserExists(
    c.env.DB,
    auth.userId,
    email || '',
    name,
    c.env.ADMIN_EMAILS
  )
  
  c.set('userId', auth.userId)
  await next()
})
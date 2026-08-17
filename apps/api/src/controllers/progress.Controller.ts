import type { Context } from 'hono'
import type { AppEnv } from '../types'
import { fetchProgress } from '../services/progress.Service'

export const getProgress = async (c: Context<AppEnv>) => {
  const paramUserId = c.req.param('userId')
  const tokenUserId = c.get('userId')  // set by requireAuth middleware

  if (!paramUserId) {
    return c.json({ success: false, message: 'userId is required' }, 400)
  }

  // Reject IDOR: param must match the authenticated user
  if (tokenUserId !== paramUserId) {
    return c.json({ success: false, error: 'Forbidden' }, 403)
  }

  try {
    const data = await fetchProgress(c.env.DB, paramUserId)
    return c.json(data)
  } catch (e: any) {
    console.error('Progress error:', e)
    return c.json({ success: false, message: 'Internal Server Error' }, 500)
  }
}
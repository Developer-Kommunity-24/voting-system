import type { Context } from 'hono'
import type { AppEnv } from '../types'
import type { VoteRequest, VoteResponse } from '@repo/shared'
import { submitVote } from '../services/vote.Service'

export const createVote = async (c: Context<AppEnv>) => {
  const userId = c.get('userId')

  let body: VoteRequest
  try {
    body = await c.req.json()
  } catch (e) {
    return c.json({ success: false, message: 'Invalid JSON body' }, 400)
  }

  const { stallId, rating } = body

  if (typeof stallId !== 'number' || typeof rating !== 'number') {
    return c.json({ success: false, message: 'stallId and rating must be numbers' }, 400)
  }

  if (rating < 0 || rating > 10) {
    return c.json({ success: false, message: 'rating must be between 0 and 10' }, 400)
  }

  try {
    const progressCount = await submitVote(c.env, userId, body)

    const response: VoteResponse = {
      success: true,
      message: 'Vote submitted successfully',
      progress: progressCount
    }

    return c.json(response)
  } catch (e: any) {
    if (e.message === 'Already voted') {
      return c.json({ success: false, message: 'Already voted' }, 400)
    }
    if (e.message === 'Voting is currently closed') {
      return c.json({ success: false, message: 'Voting is currently closed' }, 403)
    }
    return c.json({ success: false, message: 'Internal Server Error' }, 500)
  }
}

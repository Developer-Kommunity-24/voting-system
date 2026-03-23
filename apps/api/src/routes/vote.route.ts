import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { requireAuth } from '../middleware/auth'
import { createVote } from '../controllers/vote.Controller'

const vote = new Hono<AppEnv>()

vote.post('/', requireAuth, createVote)
export default vote

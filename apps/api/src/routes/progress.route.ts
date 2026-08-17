import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { getProgress } from '../controllers/progress.Controller'
import { requireAuth } from '../middleware/auth'  // ADD

const progress = new Hono<AppEnv>()

progress.get('/:userId', requireAuth, getProgress)

export default progress
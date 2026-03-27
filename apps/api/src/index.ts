import { Hono } from 'hono'
import { clerkMiddleware } from '@hono/clerk-auth'
import type { AppEnv } from './types'

import voteRoutes from './routes/vote.route'
import healthRoutes from './routes/health.route'
import progressRoutes from './routes/progress.route'
import stallsRoutes from './routes/stalls.route'
import resultsRoutes from './routes/results.route'
import userRoutes from './routes/user.route'
import webhookRoutes from './routes/webhook.route'
import { cors } from 'hono/cors'

const app = new Hono<AppEnv>()

const port = 8000;

//using cors and clerk middleware
app.use('*', cors())

// Webhook route must come before clerkMiddleware
app.route('/webhooks', webhookRoutes)

app.use('*', clerkMiddleware())

//protected api group
const api = app.basePath('/api/v1')

api.route('/vote', voteRoutes)
api.route('/health', healthRoutes)
api.route('/progress', progressRoutes)
api.route('/stalls', stallsRoutes)
api.route('/results', resultsRoutes)
api.route('/user', userRoutes)

export default {
  port,
  fetch: app.fetch,
}

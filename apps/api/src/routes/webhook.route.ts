import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { clerkWebhook } from '../controllers/webhook.Controller'

const webhook = new Hono<AppEnv>()

webhook.post('/clerk', clerkWebhook)

export default webhook

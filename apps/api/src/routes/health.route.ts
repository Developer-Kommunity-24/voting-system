import { Hono } from 'hono'
import { getDb } from '../db/client'
import type { AppEnv } from '../types'
import { sql } from 'drizzle-orm'
const health = new Hono<AppEnv>()

// Public — uptime monitor hit this. No auth, no DB.
health.get('/', (c) => {
  return c.json({ 
    success: true, 
    status: 'ok',
    timestamp: new Date().toISOString()
  })
})

// Public — pings D1 to verify connectivity. No auth.
health.get('/db', async (c) => {
  try {
    const db = getDb(c.env.DB)
     await db.run(sql`SELECT 1`)
    
    return c.json({ 
      success: true, 
      status: 'ok',
      db: 'connected',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health DB check failed:', error)
    return c.json({ 
      success: false, 
      status: 'error',
      db: 'unreachable',
      error: 'Database connection failed'
    }, 500)
  }
})

export default health
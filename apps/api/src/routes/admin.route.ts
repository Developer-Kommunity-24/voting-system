import { Hono } from 'hono'
import { eq, count } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { requireAdmin } from '../middleware/adminAuth'
import { items, ratings, users, settings } from '../db/schema'
import type { AppEnv } from '../types'
import { requireAuth } from './middleware/auth'

const app = new Hono<AppEnv>()

// Everything behind requireAdmin
app.use('*', requireAdmin)

// GET /items — list all with aggregates
app.get('/items', async (c) => {
  const db = drizzle(c.env.DB)
  const allItems = await db.select().from(items).all()
  return c.json({ success: true, data: allItems })
})

// POST /items — validate name, validate unique qrSlug, return 409 on duplicate
app.post('/items', async (c) => {
  const db = drizzle(c.env.DB)
  const body = await c.req.json()
  
  if (!body.name?.trim()) {
    return c.json({ success: false, error: 'Name is required' }, 400)
  }
  if (!body.qrSlug?.trim()) {
    return c.json({ success: false, error: 'qrSlug is required' }, 400)
  }
  
  const existing = await db.select().from(items).where(eq(items.qrSlug, body.qrSlug)).get()
  if (existing) {
    return c.json({ success: false, error: 'Duplicate qrSlug' }, 409)
  }
  
  const result = await db.insert(items).values({
    name: body.name,
    description: body.description,
    logo: body.logo,
    qrSlug: body.qrSlug,
  }).returning().get()
  
  return c.json({ success: true, data: result }, 201)
})

// PUT /items/:id
app.put('/items/:id', async (c) => {
  const db = drizzle(c.env.DB)
  const id = Number(c.req.param('id'))
  if (isNaN(id)) return c.json({ success: false, error: 'Invalid ID' }, 400)
  
  const body = await c.req.json()
  const updateData: Record<string, any> = {}
  
  if (body.name !== undefined) updateData.name = body.name
  if (body.description !== undefined) updateData.description = body.description
  if (body.logo !== undefined) updateData.logo = body.logo
  if (body.qrSlug !== undefined) {
    const existing = await db.select().from(items).where(eq(items.qrSlug, body.qrSlug)).get()
    if (existing && existing.id !== id) {
      return c.json({ success: false, error: 'Duplicate qrSlug' }, 409)
    }
    updateData.qrSlug = body.qrSlug
  }
  
  const result = await db.update(items).set(updateData).where(eq(items.id, id)).returning().get()
  if (!result) return c.json({ success: false, error: 'Not found' }, 404)
  
  return c.json({ success: true, data: result })
})

// DELETE /items/:id — ratings cascade, then delete item
app.delete('/items/:id', async (c) => {
  const db = drizzle(c.env.DB)
  const id = Number(c.req.param('id'))
  if (isNaN(id)) return c.json({ success: false, error: 'Invalid ID' }, 400)
  
  // Delete ratings first (cascade behavior)
  await db.delete(ratings).where(eq(ratings.itemId, id))
  
  const result = await db.delete(items).where(eq(items.id, id)).returning().get()
  if (!result) return c.json({ success: false, error: 'Not found' }, 404)
  
  return c.json({ success: true })
})

// POST /items/bulk — accept JSON array for seeding
app.post('/items/bulk', async (c) => {
  const db = drizzle(c.env.DB)
  const body = await c.req.json()
  
  if (!Array.isArray(body)) {
    return c.json({ success: false, error: 'Expected array' }, 400)
  }
  
  for (const item of body) {
    if (!item.name?.trim() || !item.qrSlug?.trim()) {
      return c.json({ success: false, error: 'Each item needs name and qrSlug' }, 400)
    }
    const existing = await db.select().from(items).where(eq(items.qrSlug, item.qrSlug)).get()
    if (existing) {
      return c.json({ success: false, error: `Duplicate qrSlug: ${item.qrSlug}` }, 409)
    }
  }
  
  await db.insert(items).values(body)
  return c.json({ success: true, count: body.length }, 201)
})

// GET /settings
app.get('/settings', async (c) => {
  const db = drizzle(c.env.DB)
  const allSettings = await db.select().from(settings).all()
  const settingsMap = Object.fromEntries(allSettings.map(s => [s.key, s.value]))
  return c.json({ success: true, data: settingsMap })
})

// PUT /settings
app.put('/settings', async (c) => {
  const db = drizzle(c.env.DB)
  const body = await c.req.json()
  
  if (typeof body !== 'object' || body === null) {
    return c.json({ success: false, error: 'Invalid body' }, 400)
  }
  
  for (const [key, value] of Object.entries(body)) {
    await db.insert(settings).values({ key, value: String(value) })
      .onConflictDoUpdate({ target: settings.key, set: { value: String(value) } })
  }
  
  return c.json({ success: true })
})

// GET /users — with vote counts and completion status
app.get('/users', async (c) => {
  const db = drizzle(c.env.DB)
  
  const allUsers = await db.select().from(users).all()
  const voteCounts = await db
    .select({ userId: ratings.userId, count: count() })
    .from(ratings)
    .groupBy(ratings.userId)
    .all()
  
  const countMap = new Map(voteCounts.map(v => [v.userId, v.count]))
  
  const result = allUsers.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    completed: u.completed,
    isAdmin: u.is_admin,
    voteCount: countMap.get(u.id) || 0,
  }))
  
  return c.json({ success: true, data: result })
})

// PUT /users/:id/admin — promote or demote
app.put('/users/:id/admin', async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  const body = await c.req.json()
  
  const result = await db.update(users)
    .set({ is_admin: body.isAdmin === true })
    .where(eq(users.id, id))
    .returning()
    .get()
  
  if (!result) return c.json({ success: false, error: 'Not found' }, 404)
  
  return c.json({ success: true, data: result })
})

export default app
import type { Context } from 'hono'
import type { AppEnv } from '../types'
import { fetchItem } from '../services/items.Service'

export const getItemBySlug = async (c: Context<AppEnv>) => {
  const slug = c.req.param('slug')

  if (!slug) {
    return c.json({ success: false, message: 'Slug is required' }, 400)
  }

  try {
    const item = await fetchItem(c.env.DB, slug)
    if (!item) {
       return c.json({ success: false, message: 'Item not found' }, 404)
    }
    return c.json({ success: true, data: item })
  } catch (e: any) {
    console.error('Item lookup error:', e)
    return c.json({ success: false, message: 'Internal Server Error' }, 500)
  }
}

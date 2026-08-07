import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { getItemBySlug } from '../controllers/items.Controller'

const items = new Hono<AppEnv>()

items.get('/:slug', getItemBySlug)

export default items

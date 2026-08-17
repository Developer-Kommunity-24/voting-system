import { Hono } from 'hono';
import { getAuth } from '@clerk/hono'
import { getDb } from '../db/client';
import { items, settings, users } from '../db/schema';  // add settings, users
import { eq } from 'drizzle-orm';
import type { AppEnv } from '../types';
import { refreshItemAggregates } from '../services/items.Service';

const resultsRoutes = new Hono<AppEnv>();

resultsRoutes.get('/', async (c) => {
  const db = getDb(c.env.DB);

  // 1. Check if results are deliberately made public
  const publicSetting = await db
    .select()
    .from(settings)
    .where(eq(settings.key, 'results_public'))
    .get();

  const isPublic = publicSetting?.value === 'true';

  // 2. If NOT public, require admin
  if (!isPublic) {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, auth.userId))
      .get();

    if (!user?.is_admin) {
      return c.json({ success: false, error: 'Forbidden' }, 403);
    }

    c.set('userId', auth.userId);
  }

  // 3. Fetch and return results
  try {
    const allItems = await db.select().from(items);
    const itemIds = allItems.map(i => i.id);

    await refreshItemAggregates(c.env.DB, itemIds);

    const finalResults = await db.select().from(items);
    finalResults.sort((a, b) => (b.qualifiedRatingSum || 0) - (a.qualifiedRatingSum || 0));

    return c.json({ success: true, data: finalResults });
  } catch (error) {
    console.error('Error fetching results:', error);
    return c.json({ success: false, error: 'Failed to fetch results' }, 500);
  }
});

export default resultsRoutes;
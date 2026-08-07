import { Hono } from 'hono';
import { getDb } from '../db/client';
import { items, ratings } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { AppEnv } from '../types';
import { refreshItemAggregates } from '../services/items.Service';
const resultsRoutes = new Hono<AppEnv>();

resultsRoutes.get('/', async (c) => {
  try {
    const db = getDb(c.env.DB);
    const allItems = await db.select().from(items);
    const itemIds = allItems.map(i => i.id);

    // Refresh all items to ensure consistency (optional but good for a "Results" view)
    // In a high-traffic app, we might skip this and just read, but for this event, real-time-consistent view is best.
    await refreshItemAggregates(c.env.DB, itemIds);

    // Fetch the updated data
    const finalResults = await db.select().from(items);
    
    // Sort by qualifiedRatingSum descending for the leaderboard
    finalResults.sort((a, b) => (b.qualifiedRatingSum || 0) - (a.qualifiedRatingSum || 0));

    return c.json({
      success: true,
      data: finalResults
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    return c.json({ success: false, error: 'Failed to fetch results' }, 500);
  }
});

export default resultsRoutes;

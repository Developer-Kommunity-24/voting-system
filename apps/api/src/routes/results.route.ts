import { Hono } from 'hono';
import { getDb } from '../db/client';
import { stalls, ratings } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { AppEnv } from '../types';
import { refreshStallAggregates } from '../services/stalls.Service';
const resultsRoutes = new Hono<AppEnv>();

resultsRoutes.get('/', async (c) => {
  try {
    const db = getDb(c.env.DB);
    const allStalls = await db.select().from(stalls);
    const stallIds = allStalls.map(s => s.id);

    // Refresh all stalls to ensure consistency (optional but good for a "Results" view)
    // In a high-traffic app, we might skip this and just read, but for this event, real-time-consistent view is best.
    await refreshStallAggregates(c.env.DB, stallIds);

    // Fetch the updated data
    const finalResults = await db.select().from(stalls);
    
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

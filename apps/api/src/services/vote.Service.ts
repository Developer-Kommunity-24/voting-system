import type { VoteRequest } from '@repo/shared'
import { getDb } from '../db/client'
import { ratings, users } from '../db/schema'
import { eq, count } from 'drizzle-orm'
import type { AppEnv } from '../types'
import { ensureUserExists } from './user.Service'
import { refreshItemAggregates } from './items.Service'
function isVotingOpen(): boolean {
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(Date.now() + istOffset);

  const year = istTime.getUTCFullYear();
  const month = istTime.getUTCMonth() + 1;
  
  const day = istTime.getUTCDate();

  if (year !== 2026 || month !== 3) return false;

  const timeInMinutes = istTime.getUTCHours() * 60 + istTime.getUTCMinutes();

  if (day === 28) {
    const startMinsDay1 = 8 * 60 + 30; // 8:30 AM (510)
    const endMins = 22 * 60; // 10:00 PM (1320)
    return timeInMinutes >= startMinsDay1 && timeInMinutes <= endMins;
  }

  if (day === 29) {
    const startMinsDay2 = 9 * 60 + 30; // 9:30 AM (570)
    const endMins = 4 * 60 +30; // 4:30 PM (270)
    return timeInMinutes >= startMinsDay2 && timeInMinutes <= endMins;
  }

  return false;
}

export const submitVote = async (
  env: AppEnv['Bindings'],
  userId: string,
  vote: VoteRequest
) => {
  if (!isVotingOpen()) {
    throw new Error('Voting is currently closed');
  }

  const { itemId, rating } = vote
  const ormDb = getDb(env.DB)

  try {
    // 1. Ensure whether the user exists 
    await ensureUserExists(env, userId)

    // 2. Now proceed with the vote
    await ormDb.insert(ratings).values({ userId, itemId, rating })
  } catch (e: any) {
    if (e.message && e.message.includes('UNIQUE constraint failed')) {
      throw new Error('Already voted')
    }
    console.error('Database insertion error:', e)
    throw new Error('Internal Server Error')
  }

  try {
    const countResult = await ormDb
      .select({ count: count() })
      .from(ratings)
      .where(eq(ratings.userId, userId))

    const progressCount = countResult[0]?.count || 1

    if (progressCount >= 11) {
      await ormDb
        .update(users)
        .set({ completed: true })
        .where(eq(users.id, userId))
    }

    // Update item aggregates immediately
    if (progressCount === 11) {
      // User just became qualified! All their items need refreshing
      const userRatings = await ormDb
        .select({ itemId: ratings.itemId })
        .from(ratings)
        .where(eq(ratings.userId, userId));

      const itemIds = userRatings
        .map(r => r.itemId)
        .filter((id): id is number => id !== null);

      await refreshItemAggregates(env.DB, itemIds);
    } else {
      // Normal vote (could be qualified or not, but only this item is affected)
      await refreshItemAggregates(env.DB, [itemId]);
    }

    return progressCount
  } catch (e: any) {
    console.error('Database query/update error:', e)
    throw new Error('Internal Server Error')
  }
}

import type { VoteRequest } from '@repo/shared'
import { getDb } from '../db/client'
import { ratings, users } from '../db/schema'
import { eq, count } from 'drizzle-orm'
import type { AppEnv } from '../types'
import { ensureUserExists } from './user.Service'
import { refreshStallAggregates } from './stalls.Service'
export const submitVote = async (
  env: AppEnv['Bindings'],
  userId: string,
  vote: VoteRequest
) => {
  const { stallId, rating } = vote
  const ormDb = getDb(env.DB)

  try {
    // 1. Ensure whether the user exists 
    await ensureUserExists(env, userId)

    // 2. Now proceed with the vote
    await ormDb.insert(ratings).values({ userId, stallId, rating })
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

    if (progressCount >= 12) {
      await ormDb
        .update(users)
        .set({ completed: true })
        .where(eq(users.id, userId))
    }

    // Update stall aggregates immediately
    if (progressCount === 12) {
      // User just became qualified! All their stalls need refreshing
      const userRatings = await ormDb
        .select({ stallId: ratings.stallId })
        .from(ratings)
        .where(eq(ratings.userId, userId));
      
      const stallIds = userRatings
        .map(r => r.stallId)
        .filter((id): id is number => id !== null);
      
      await refreshStallAggregates(env.DB, stallIds);
    } else {
      // Normal vote (could be qualified or not, but only this stall is affected)
      await refreshStallAggregates(env.DB, [stallId]);
    }

    return progressCount
  } catch (e: any) {
    console.error('Database query/update error:', e)
    throw new Error('Internal Server Error')
  }
}

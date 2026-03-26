import { getDb } from '../db/client'
import { stalls, ratings } from '../db/schema'
import { eq, inArray, count } from 'drizzle-orm'

export const fetchStall = async (db: D1Database, slug: string) => {
  const ormDb = getDb(db)
  const result = await ormDb.select().from(stalls).where(eq(stalls.qrSlug, slug)).limit(1)
  return result[0] || null
}

export const refreshStallAggregates = async (db: D1Database, stallIds: number[]) => {
  if (stallIds.length === 0) return;
  const ormDb = getDb(db);

  // 1. Get all ratings for these stalls
  const targetRatings = await ormDb
    .select()
    .from(ratings)
    .where(inArray(ratings.stallId, stallIds));

  // 2. Get qualification status for all users who voted for these stalls
  const userIds = [...new Set(targetRatings.map(r => r.userId))];
  if (userIds.length === 0) {
    // If no ratings left, reset stalls (unlikely in this context but good for robustness)
    for (const id of stallIds) {
      await ormDb.update(stalls)
        .set({
          totalVoters: 0,
          qualifiedVoters: 0,
          qualifiedRatingSum: 0,
          nonQualifiedRatingSum: 0,
          qualifiedAvgRating: 0
        })
        .where(eq(stalls.id, id));
    }
    return;
  }

  const userVoteCounts = await ormDb
    .select({
      userId: ratings.userId,
      count: count(ratings.userId),
    })
    .from(ratings)
    .where(inArray(ratings.userId, userIds))
    .groupBy(ratings.userId);

  const qualifiedUserIds = new Set(
    userVoteCounts
      .filter(u => u.count >= 12)
      .map(u => u.userId)
  );

  // 3. Aggregate per stall
  const aggregates = new Map<number, {
    totalVoters: number;
    qualifiedVoters: number;
    qualifiedRatingSum: number;
    nonQualifiedRatingSum: number;
  }>();

  for (const id of stallIds) {
    aggregates.set(id, {
      totalVoters: 0,
      qualifiedVoters: 0,
      qualifiedRatingSum: 0,
      nonQualifiedRatingSum: 0,
    });
  }

  for (const rating of targetRatings) {
    if (!rating.stallId) continue;
    const agg = aggregates.get(rating.stallId);
    if (!agg) continue;

    agg.totalVoters += 1;
    if (qualifiedUserIds.has(rating.userId)) {
      agg.qualifiedVoters += 1;
      agg.qualifiedRatingSum += rating.rating;
    } else {
      agg.nonQualifiedRatingSum += rating.rating;
    }
  }

  // 4. Update the database
  await Promise.all(stallIds.map(async (id) => {
    const agg = aggregates.get(id)!;
    const qualifiedAvgRating = agg.qualifiedVoters > 0 
      ? Math.round((agg.qualifiedRatingSum / agg.qualifiedVoters) * 100) / 100 
      : 0;

    await ormDb.update(stalls)
      .set({
        totalVoters: agg.totalVoters,
        qualifiedVoters: agg.qualifiedVoters,
        qualifiedRatingSum: agg.qualifiedRatingSum,
        nonQualifiedRatingSum: agg.nonQualifiedRatingSum,
        qualifiedAvgRating: qualifiedAvgRating,
      })
      .where(eq(stalls.id, id));
  }));
}

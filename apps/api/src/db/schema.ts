import { sqliteTable, text, integer, uniqueIndex, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique(),
  name: text('name'),
  completed: integer('completed', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const stalls = sqliteTable('stalls', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  logo: text('logo'),
  qrSlug: text('qr_slug').unique().notNull(),
  totalVoters: integer('total_voters').default(0),
  qualifiedVoters: integer('qualified_voters').default(0),
  qualifiedRatingSum: integer('qualified_rating_sum').default(0),
  nonQualifiedRatingSum: integer('non_qualified_rating_sum').default(0),
  qualifiedAvgRating: real('qualified_avg_rating').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const ratings = sqliteTable('ratings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  stallId: integer('stall_id').notNull().references(() => stalls.id),
  rating: integer('rating').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  unq: uniqueIndex('unique_vote').on(table.userId, table.stallId),
}));
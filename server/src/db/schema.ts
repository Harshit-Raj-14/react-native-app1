import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

// Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).unique().notNull(),
  email: varchar('email', { length: 150 }).unique().notNull(),
  password_hash: varchar('password_hash', { length: 255 }),
  profile_image: varchar('profile_image', { length: 500 }),
  frontierX_public_wallet: varchar('frontierX_public_wallet', { length: 255 }).unique(),
  frontierX_connected_wallet: varchar('frontierX_connected_wallet', { length: 255 }),
  is_mfa_enabled: boolean('is_mfa_enabled').default(false),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Friends Table
export const friends = pgTable('friends', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  friend_id: integer('friend_id').notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Referrals Table
export const referrals = pgTable('referrals', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  referral_code: varchar('referral_code', { length: 50 }).unique(),
  referred_user_id: integer('referred_user_id').references(() => users.id, { onDelete: 'set null' }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const feedbacks = pgTable('feedback', {
  id: serial('id').primaryKey(), 
  user_id: integer('user_id').notNull()
    .references(() => users.id, { onDelete: 'cascade' }), 
  feedback_text: text('feedback_text').notNull(),
  stars: integer('stars'), 
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(), 
});


// Type Definitions
export type User = InferSelectModel<typeof users>;
export type Friend = InferSelectModel<typeof friends>;
export type Referral = InferSelectModel<typeof referrals>;
export type Feedback = InferSelectModel<typeof feedbacks>;

export type InsertUser = InferInsertModel<typeof users>;
export type InsertFriend = InferInsertModel<typeof friends>;
export type InsertReferral = InferInsertModel<typeof referrals>;
export type InsertFeedback = InferInsertModel<typeof feedbacks>;
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp, varchar, decimal, jsonb } from 'drizzle-orm/pg-core';

// Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).unique().notNull(),
  email: varchar('email', { length: 150 }).unique().notNull(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  profile_image: varchar('profile_image', { length: 500 }),
  is_mfa_enabled: boolean('is_mfa_enabled').default(false),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Wallets Table
export const wallets = pgTable('wallets', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  wallet_address: varchar('wallet_address').unique().notNull(),
  public_address: varchar('public_address').unique().notNull(),
  wallet_type: varchar('wallet_type', { length: 100 }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Wallet Balances Table
export const walletBalances = pgTable('wallet_balances', {
  id: serial('id').primaryKey(),
  wallet_id: integer('wallet_id').notNull().references(() => wallets.id, { onDelete: 'cascade' }),
  token_symbol: varchar('token_symbol', { length: 10 }).notNull(),
  token_address: varchar('token_address').notNull(),
  token_balance: decimal('token_balance').notNull(),
  price_per_token: decimal('price_per_token').notNull(),
  last_updated: timestamp('last_updated', { withTimezone: true }),
});

// Friends Table
export const friends = pgTable('friends', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  friend_id: integer('friend_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Referrals Table
export const referrals = pgTable('referrals', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  referral_code: varchar('referral_code', { length: 50 }).unique().notNull(),
  referred_user_id: integer('referred_user_id').references(() => users.id, { onDelete: 'set null' }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// P2P Trades Table
export const p2pTrades = pgTable('p2p_trades', {
  id: serial('id').primaryKey(),
  sender_id: integer('sender_id').references(() => users.id, { onDelete: 'set null' }),
  receiver_id: integer('receiver_id').references(() => users.id, { onDelete: 'set null' }),
  sender_wallet_address: varchar('sender_wallet_address', { length: 255 }).notNull(),
  receiver_wallet_address: varchar('receiver_wallet_address', { length: 255 }).notNull(),
  sender_crypto_type: varchar('sender_crypto_type', { length: 100 }).notNull(),
  receiver_crypto_type: varchar('receiver_crypto_type', { length: 100 }).notNull(),
  sender_token_amount: decimal('sender_token_amount').notNull(),
  receiver_token_amount: decimal('receiver_token_amount').notNull(),
  status: varchar('status', { length: 100 }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// DEX Trades Table
export const dexTrades = pgTable('dex_trades', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  user_wallet_address: varchar('user_wallet_address', { length: 255 }).notNull(),
  from_crypto_type: varchar('from_crypto_type', { length: 100 }).notNull(),
  to_crypto_type: varchar('to_crypto_type', { length: 100 }).notNull(),
  token_amount: decimal('token_amount').notNull(),
  status: varchar('status', { length: 100 }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Trade History Table
export const tradeHistory = pgTable('trade_history', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  trade_id: integer('trade_id'),
  trade_type: varchar('trade_type', { length: 100 }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Feedback Table
export const feedbacks = pgTable('feedback', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  feedback_text: text('feedback_text').notNull(),
  stars: integer('stars'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Chat Sessions Table
export const chatSessions = pgTable('chat_sessions', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action_type: varchar('action_type', { length: 100 }).notNull(),
  session_status: varchar('session_status', { length: 100 }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Chat Messages Table
export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  session_id: integer('session_id').notNull().references(() => chatSessions.id, { onDelete: 'cascade' }),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  message_text: text('message_text').notNull(),
  message_type: varchar('message_type', { length: 100 }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// NFT System
export const nfts = pgTable('nfts', {
  id: serial('id').primaryKey(),
  wallet_id: integer('wallet_id').notNull().references(() => wallets.id, { onDelete: 'cascade' }),
  nft_contract_address: varchar('nft_contract_address', { length: 255 }).notNull(),
  nft_token_id: varchar('nft_token_id', { length: 100 }).notNull(),
  nft_name: varchar('nft_name', { length: 255 }),
  nft_image_url: varchar('nft_image_url', { length: 500 }),
  nft_metadata: jsonb('nft_metadata'),
  acquired_at: timestamp('acquired_at', { withTimezone: true }),
});

// Type Definitions
export type User = InferSelectModel<typeof users>;
export type Wallet = InferSelectModel<typeof wallets>;
export type WalletBalance = InferSelectModel<typeof walletBalances>;
export type Friend = InferSelectModel<typeof friends>;
export type Referral = InferSelectModel<typeof referrals>;
export type Feedback = InferSelectModel<typeof feedbacks>;
export type P2PTrade = InferSelectModel<typeof p2pTrades>;
export type DexTrade = InferSelectModel<typeof dexTrades>;
export type TradeHistory = InferSelectModel<typeof tradeHistory>;
export type ChatSession = InferSelectModel<typeof chatSessions>;
export type ChatMessage = InferSelectModel<typeof chatMessages>;
export type NFT = InferSelectModel<typeof nfts>;

export type InsertUser = InferInsertModel<typeof users>;
export type InsertWallet = InferInsertModel<typeof wallets>;
export type InsertWalletBalance = InferInsertModel<typeof walletBalances>;
export type InsertFriend = InferInsertModel<typeof friends>;
export type InsertReferral = InferInsertModel<typeof referrals>;
export type InsertFeedback = InferInsertModel<typeof feedbacks>;
export type InsertP2PTrade = InferInsertModel<typeof p2pTrades>;
export type InsertDexTrade = InferInsertModel<typeof dexTrades>;
export type InsertTradeHistory = InferInsertModel<typeof tradeHistory>;
export type InsertChatSession = InferInsertModel<typeof chatSessions>;
export type InsertChatMessage = InferInsertModel<typeof chatMessages>;
export type InsertNFT = InferInsertModel<typeof nfts>;

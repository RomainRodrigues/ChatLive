import { pgTable, text, timestamp, uuid, index, uniqueIndex, pgEnum } from 'drizzle-orm/pg-core'

// ─── Enums ───────────────────────────────────────────
export const friendshipStatusEnum = pgEnum('friendship_status', ['pending', 'accepted'])

// ─── Users ───────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// ─── Servers ─────────────────────────────────────────
export const servers = pgTable('servers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  inviteCode: uuid('invite_code').defaultRandom().unique().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// ─── Server Members ──────────────────────────────────
export const serverMembers = pgTable('server_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  serverId: uuid('server_id').references(() => servers.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, table => [
  uniqueIndex('idx_server_members_unique').on(table.serverId, table.userId)
])

// ─── Channels ────────────────────────────────────────
export const channels = pgTable('channels', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  serverId: uuid('server_id').references(() => servers.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, table => [
  index('idx_channels_server').on(table.serverId)
])

// ─── Messages ────────────────────────────────────────
export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  content: text('content').notNull(),
  channelId: uuid('channel_id').references(() => channels.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, table => [
  index('idx_messages_channel_created').on(table.channelId, table.createdAt),
  index('idx_messages_user').on(table.userId)
])

// ─── Friendships ─────────────────────────────────────
export const friendships = pgTable('friendships', {
  id: uuid('id').defaultRandom().primaryKey(),
  senderId: uuid('sender_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  receiverId: uuid('receiver_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  status: friendshipStatusEnum('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, table => [
  index('idx_friendships_sender').on(table.senderId),
  index('idx_friendships_receiver').on(table.receiverId),
  uniqueIndex('idx_friendships_pair').on(table.senderId, table.receiverId)
])

// ─── DM Messages ─────────────────────────────────────
export const dmMessages = pgTable('dm_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  senderId: uuid('sender_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  receiverId: uuid('receiver_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, table => [
  index('idx_dm_sender_receiver_created').on(table.senderId, table.receiverId, table.createdAt),
  index('idx_dm_receiver_sender_created').on(table.receiverId, table.senderId, table.createdAt)
])

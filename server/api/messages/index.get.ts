import { db } from '../../utils/drizzle'
import { messages, users } from '../../database/schema'
import { eq, desc, lt, and } from 'drizzle-orm'
import { decrypt } from '../../utils/encryption'
import { requireChannelAccess } from '../../utils/authorization'

const PAGE_SIZE = 50

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const query = getQuery(event)

  if (!query.channelId) {
    throw createError({ statusCode: 400, statusMessage: 'channelId required' })
  }

  await requireChannelAccess(session.user.id, String(query.channelId))

  // Cursor-based pagination: pass `before` (message id's createdAt ISO string) to load older pages
  const conditions = [eq(messages.channelId, String(query.channelId))]
  if (query.before) {
    conditions.push(lt(messages.createdAt, new Date(String(query.before))))
  }

  const result = await db.select({
    id: messages.id,
    content: messages.content,
    createdAt: messages.createdAt,
    userId: messages.userId,
    user: {
      id: users.id,
      name: users.name,
      avatarUrl: users.avatarUrl
    }
  })
    .from(messages)
    .leftJoin(users, eq(messages.userId, users.id))
    .where(conditions.length === 1 ? conditions[0] : and(...conditions))
    .orderBy(desc(messages.createdAt))
    .limit(PAGE_SIZE + 1) // fetch one extra to detect if there are more pages

  const hasMore = result.length > PAGE_SIZE
  const page = result.slice(0, PAGE_SIZE)

  const decrypted = page.map(m => ({
    ...m,
    content: decrypt(m.content)
  }))

  return {
    messages: decrypted.reverse(),
    hasMore
  }
})

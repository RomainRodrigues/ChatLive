import { db } from '../../utils/drizzle'
import { messages, users } from '../../database/schema'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const query = getQuery(event)

  if (!query.channelId) {
    throw createError({ statusCode: 400, statusMessage: 'channelId required' })
  }

  const result = await db.select({
    id: messages.id,
    content: messages.content,
    createdAt: messages.createdAt,
    user: {
      id: users.id,
      name: users.name,
      avatarUrl: users.avatarUrl
    }
  })
    .from(messages)
    .leftJoin(users, eq(messages.userId, users.id))
    .where(eq(messages.channelId, String(query.channelId)))
    .orderBy(desc(messages.createdAt))
    .limit(50)

  return result.reverse()
})

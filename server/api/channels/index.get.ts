import { db } from '../../utils/drizzle'
import { channels } from '../../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const query = getQuery(event)

  if (!query.serverId) {
    throw createError({ statusCode: 400, statusMessage: 'serverId required' })
  }

  return await db.select().from(channels).where(eq(channels.serverId, String(query.serverId)))
})

import { db } from '../../utils/drizzle'
import { messages } from '../../database/schema'
import { eq, and } from 'drizzle-orm'
import { broadcastToChannel } from '../../utils/wsRegistry'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readBody(event)

  if (!body.messageId) {
    throw createError({ statusCode: 400, statusMessage: 'messageId required' })
  }

  const [deleted] = await db.delete(messages)
    .where(
      and(
        eq(messages.id, String(body.messageId)),
        eq(messages.userId, session.user.id)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized to delete this message or message not found' })
  }

  broadcastToChannel(deleted.channelId, { type: 'message:delete', messageId: deleted.id })

  return { success: true }
})

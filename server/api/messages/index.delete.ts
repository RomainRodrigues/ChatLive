import { db } from '../../utils/drizzle'
import { messages } from '../../database/schema'
import { eq, and } from 'drizzle-orm'
import { broadcastToChannel } from '../../utils/wsRegistry'
import { DeleteMessageSchema } from '../../utils/validators'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readValidatedBody(event, DeleteMessageSchema.parse)

  const [deleted] = await db.delete(messages)
    .where(
      and(
        eq(messages.id, body.messageId),
        eq(messages.userId, session.user.id)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({ statusCode: 403, statusMessage: 'Message introuvable ou non autorisé.' })
  }

  broadcastToChannel(deleted.channelId, { type: 'message:delete', messageId: deleted.id })

  return { success: true }
})

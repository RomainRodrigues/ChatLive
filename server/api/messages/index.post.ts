import { db } from '../../utils/drizzle'
import { messages } from '../../database/schema'
import { broadcastToChannel } from '../../utils/wsRegistry'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readBody(event)

  if (!body.channelId || !body.content) {
    throw createError({ statusCode: 400, statusMessage: 'channelId and content required' })
  }

  const [newMessage] = await db.insert(messages).values({
    content: body.content,
    channelId: String(body.channelId),
    userId: session.user.id
  }).returning()

  if (!newMessage) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to create message' })
  }

  const populatedMessage = {
    ...newMessage,
    user: {
      id: session.user.id,
      name: session.user.name,
      avatarUrl: session.user.avatarUrl
    }
  }

  broadcastToChannel(newMessage.channelId, { type: 'message:new', message: populatedMessage })

  return populatedMessage
})

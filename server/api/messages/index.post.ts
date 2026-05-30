import { db } from '../../utils/drizzle'
import { messages } from '../../database/schema'
import { broadcastToChannel } from '../../utils/wsRegistry'
import { encrypt, decrypt } from '../../utils/encryption'
import { requireChannelAccess } from '../../utils/authorization'
import { SendMessageSchema } from '../../utils/validators'
import { enforceRateLimit } from '../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  enforceRateLimit(`msg:${session.user.id}`, { max: 30, windowSeconds: 60 })
  const body = await readValidatedBody(event, SendMessageSchema.parse)

  // Vérifie l'existence du channel ET la membership
  await requireChannelAccess(session.user.id, body.channelId)

  const [newMessage] = await db.insert(messages).values({
    content: encrypt(body.content),
    channelId: body.channelId,
    userId: session.user.id
  }).returning()

  if (!newMessage) {
    throw createError({ statusCode: 500, statusMessage: 'Échec de la création du message.' })
  }

  const decryptedContent = decrypt(newMessage.content)

  const populatedMessage = {
    ...newMessage,
    content: decryptedContent,
    user: {
      id: session.user.id,
      name: session.user.name,
      avatarUrl: session.user.avatarUrl
    }
  }

  broadcastToChannel(newMessage.channelId, { type: 'message:new', message: populatedMessage })

  return populatedMessage
})

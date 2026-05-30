import { db } from '../../utils/drizzle'
import { dmMessages } from '../../database/schema'
import { broadcastToChannel, sendToUser } from '../../utils/wsRegistry'
import { encrypt, decrypt } from '../../utils/encryption'
import { SendDmSchema } from '../../utils/validators'
import { enforceRateLimit } from '../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const currentUserId = session.user.id
  enforceRateLimit(`dm:${currentUserId}`, { max: 30, windowSeconds: 60 })
  const body = await readValidatedBody(event, SendDmSchema.parse)

  const [newMessage] = await db.insert(dmMessages).values({
    senderId: currentUserId,
    receiverId: body.receiverId,
    content: encrypt(body.content)
  }).returning()

  if (!newMessage) {
    throw createError({ statusCode: 500, statusMessage: 'Échec de la création du message privé.' })
  }

  const decryptedContent = decrypt(newMessage.content)

  const populatedMessage = {
    id: newMessage.id,
    content: decryptedContent,
    createdAt: newMessage.createdAt,
    senderId: newMessage.senderId,
    receiverId: newMessage.receiverId,
    user: {
      id: session.user.id,
      name: session.user.name,
      avatarUrl: session.user.avatarUrl
    }
  }

  // Calculer l'ID de salon de discussion privée (DM Room ID)
  const dmRoomId = [currentUserId, body.receiverId].sort().join('_')

  // Diffuser le message via WebSocket sur le canal spécifique du salon
  broadcastToChannel(`dm:${dmRoomId}`, {
    type: 'dm:message:new',
    dmRoomId,
    message: populatedMessage
  })

  // Envoyer également en direct aux connexions des deux utilisateurs
  sendToUser(currentUserId, {
    type: 'dm:message:new',
    dmRoomId,
    message: populatedMessage
  })
  sendToUser(body.receiverId, {
    type: 'dm:message:new',
    dmRoomId,
    message: populatedMessage
  })

  return populatedMessage
})

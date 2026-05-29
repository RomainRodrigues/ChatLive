import { db } from '../../utils/drizzle'
import { dmMessages } from '../../database/schema'
import { broadcastToChannel, sendToUser } from '../../utils/wsRegistry'
import { encrypt, decrypt } from '../../utils/encryption'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const currentUserId = session.user.id
  const body = await readBody(event)

  if (!body.receiverId || !body.content) {
    throw createError({ statusCode: 400, statusMessage: 'receiverId and content are required.' })
  }

  if (String(body.content).length > 4000) {
    throw createError({ statusCode: 400, statusMessage: 'Le message ne peut pas dépasser 4000 caractères.' })
  }

  const [newMessage] = await db.insert(dmMessages).values({
    senderId: currentUserId,
    receiverId: String(body.receiverId),
    content: encrypt(body.content)
  }).returning()

  if (!newMessage) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to create private message.' })
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
  // en triant les deux ID utilisateurs pour s'assurer de l'unicité
  const dmRoomId = [currentUserId, String(body.receiverId)].sort().join('_')

  // Diffuser le message via WebSocket sur le canal spécifique du salon
  broadcastToChannel(`dm:${dmRoomId}`, {
    type: 'dm:message:new',
    dmRoomId,
    message: populatedMessage
  })

  // Envoyer également en direct aux connexions des deux utilisateurs
  // pour actualiser leur liste de conversations (DMs) en temps réel, même s'ils
  // ne sont pas sur ce salon spécifique.
  sendToUser(currentUserId, {
    type: 'dm:message:new',
    dmRoomId,
    message: populatedMessage
  })
  sendToUser(String(body.receiverId), {
    type: 'dm:message:new',
    dmRoomId,
    message: populatedMessage
  })

  return populatedMessage
})

import { db } from '../../utils/drizzle'
import { messages, channels, serverMembers } from '../../database/schema'
import { broadcastToChannel } from '../../utils/wsRegistry'
import { eq, and } from 'drizzle-orm'
import { encrypt, decrypt } from '../../utils/encryption'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readBody(event)

  if (!body.channelId || !body.content) {
    throw createError({ statusCode: 400, statusMessage: 'channelId and content required' })
  }

  if (String(body.content).length > 4000) {
    throw createError({ statusCode: 400, statusMessage: 'Le message ne peut pas dépasser 4000 caractères.' })
  }

  // Trouver le salon pour récupérer le serverId
  const channel = await db.select().from(channels).where(eq(channels.id, String(body.channelId))).limit(1).then(res => res[0])
  if (!channel) {
    throw createError({ statusCode: 404, statusMessage: 'Salon introuvable.' })
  }

  // Vérifier si l'utilisateur est membre du serveur
  const isMember = await db.select().from(serverMembers)
    .where(and(
      eq(serverMembers.serverId, channel.serverId),
      eq(serverMembers.userId, session.user.id)
    ))
    .limit(1)
    .then(res => res[0])

  if (!isMember) {
    throw createError({ statusCode: 403, statusMessage: 'Vous n\'avez pas la permission d\'envoyer un message sur ce serveur.' })
  }

  const [newMessage] = await db.insert(messages).values({
    content: encrypt(body.content),
    channelId: String(body.channelId),
    userId: session.user.id
  }).returning()

  if (!newMessage) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to create message' })
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

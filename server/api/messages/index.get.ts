import { db } from '../../utils/drizzle'
import { messages, users, channels, serverMembers } from '../../database/schema'
import { eq, desc, and } from 'drizzle-orm'
import { decrypt } from '../../utils/encryption'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const query = getQuery(event)

  if (!query.channelId) {
    throw createError({ statusCode: 400, statusMessage: 'channelId required' })
  }

  // Trouver le salon pour récupérer le serverId
  const channel = await db.select().from(channels).where(eq(channels.id, String(query.channelId))).limit(1).then(res => res[0])
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
    throw createError({ statusCode: 403, statusMessage: 'Vous n\'avez pas accès à ce serveur.' })
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

  const decryptedResult = result.map(m => ({
    ...m,
    content: decrypt(m.content)
  }))

  return decryptedResult.reverse()
})

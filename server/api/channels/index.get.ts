import { db } from '../../utils/drizzle'
import { channels, serverMembers } from '../../database/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const query = getQuery(event)

  if (!query.serverId) {
    throw createError({ statusCode: 400, statusMessage: 'serverId required' })
  }

  // Vérifier si l'utilisateur est membre du serveur
  const isMember = await db.select().from(serverMembers)
    .where(and(
      eq(serverMembers.serverId, String(query.serverId)),
      eq(serverMembers.userId, session.user.id)
    ))
    .limit(1)
    .then(res => res[0])

  if (!isMember) {
    throw createError({ statusCode: 403, statusMessage: 'Vous n\'avez pas accès à ce serveur.' })
  }

  return await db.select().from(channels).where(eq(channels.serverId, String(query.serverId)))
})

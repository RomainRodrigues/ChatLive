import { db } from '../../utils/drizzle'
import { channels } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { requireServerMember } from '../../utils/authorization'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const query = getQuery(event)

  if (!query.serverId) {
    throw createError({ statusCode: 400, statusMessage: 'serverId required' })
  }

  // Vérifier la membership via l'utilitaire partagé
  await requireServerMember(session.user.id, String(query.serverId))

  return await db.select().from(channels).where(eq(channels.serverId, String(query.serverId)))
})

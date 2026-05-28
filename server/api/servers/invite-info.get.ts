import { db } from '../../utils/drizzle'
import { servers, users } from '../../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const query = getQuery(event)

  if (!query.inviteCode) {
    throw createError({ statusCode: 400, statusMessage: 'inviteCode is required' })
  }

  const server = await db.select({
    id: servers.id,
    name: servers.name,
    ownerName: users.name
  })
    .from(servers)
    .leftJoin(users, eq(servers.ownerId, users.id))
    .where(eq(servers.inviteCode, String(query.inviteCode)))
    .limit(1)
    .then(res => res[0])

  if (!server) {
    throw createError({ statusCode: 404, statusMessage: 'Lien d\'invitation invalide ou serveur introuvable.' })
  }

  return server
})

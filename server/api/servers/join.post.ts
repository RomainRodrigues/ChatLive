import { db } from '../../utils/drizzle'
import { servers, serverMembers } from '../../database/schema'
import { eq, and } from 'drizzle-orm'
import { JoinServerSchema } from '../../utils/validators'
import { enforceRateLimit } from '../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  enforceRateLimit(`join:${session.user.id}`, { max: 5, windowSeconds: 60 })
  const body = await readValidatedBody(event, JoinServerSchema.parse)

  // Trouver le serveur par code d'invitation
  const server = await db.select().from(servers)
    .where(eq(servers.inviteCode, body.inviteCode))
    .limit(1)
    .then(res => res[0])

  if (!server) {
    throw createError({ statusCode: 404, statusMessage: 'Serveur introuvable ou lien d\'invitation invalide.' })
  }

  // Vérifier si l'utilisateur est déjà membre
  const existingMember = await db.select().from(serverMembers)
    .where(and(
      eq(serverMembers.serverId, server.id),
      eq(serverMembers.userId, session.user.id)
    ))
    .limit(1)
    .then(res => res[0])

  if (!existingMember) {
    await db.insert(serverMembers).values({
      serverId: server.id,
      userId: session.user.id
    })
  }

  return server
})

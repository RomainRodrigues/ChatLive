import { db } from '../../utils/drizzle'
import { servers, serverMembers } from '../../database/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readBody(event)

  if (!body.inviteCode) {
    throw createError({ statusCode: 400, statusMessage: 'Le code d\'invitation est obligatoire.' })
  }

  // Trouver le serveur par code d'invitation
  const server = await db.select().from(servers).where(eq(servers.inviteCode, String(body.inviteCode))).limit(1).then(res => res[0])
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
    // Ajouter l'utilisateur comme membre
    await db.insert(serverMembers).values({
      serverId: server.id,
      userId: session.user.id
    })
  }

  return server
})

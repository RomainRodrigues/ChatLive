import { db } from '../../utils/drizzle'
import { servers, channels, serverMembers } from '../../database/schema'
import { CreateServerSchema } from '../../utils/validators'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readValidatedBody(event, CreateServerSchema.parse)

  const [newServer] = await db.insert(servers).values({
    name: body.name,
    ownerId: session.user.id
  }).returning()

  if (!newServer) {
    throw createError({ statusCode: 500, statusMessage: 'Échec de la création du serveur.' })
  }

  await db.insert(serverMembers).values({
    serverId: newServer.id,
    userId: session.user.id
  })

  await db.insert(channels).values({
    name: 'général',
    serverId: newServer.id
  })

  return newServer
})

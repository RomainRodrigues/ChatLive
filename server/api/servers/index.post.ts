import { db } from '../../utils/drizzle'
import { servers, channels, serverMembers } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readBody(event)

  const name = String(body.name).trim()
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Le nom du serveur est obligatoire.' })
  }

  if (name.length > 100) {
    throw createError({ statusCode: 400, statusMessage: 'Le nom du serveur ne peut pas dépasser 100 caractères.' })
  }

  const [newServer] = await db.insert(servers).values({
    name,
    ownerId: session.user.id
  }).returning()

  await db.insert(serverMembers).values({
    serverId: newServer!.id,
    userId: session.user.id
  })

  await db.insert(channels).values({
    name: 'général',
    serverId: newServer!.id
  })

  return newServer
})

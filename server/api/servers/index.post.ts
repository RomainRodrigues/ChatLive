import { db } from '../../utils/drizzle'
import { servers, channels } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readBody(event)

  const [newServer] = await db.insert(servers).values({
    name: body.name,
    ownerId: session.user.id
  }).returning()

  await db.insert(channels).values({
    name: 'général',
    serverId: newServer!.id
  })

  return newServer
})

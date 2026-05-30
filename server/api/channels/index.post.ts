import { db } from '../../utils/drizzle'
import { channels } from '../../database/schema'
import { requireServerMember } from '../../utils/authorization'
import { CreateChannelSchema } from '../../utils/validators'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readValidatedBody(event, CreateChannelSchema.parse)

  // Vérifier la membership via l'utilitaire partagé
  await requireServerMember(session.user.id, body.serverId)

  const cleanName = body.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s-]/g, '') // keep alphanumeric, spaces and hyphens
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-') // remove double hyphens

  const [newChannel] = await db.insert(channels).values({
    name: cleanName || 'salon',
    serverId: body.serverId
  }).returning()

  if (!newChannel) {
    throw createError({ statusCode: 500, statusMessage: 'Échec de la création du salon.' })
  }

  return newChannel
})

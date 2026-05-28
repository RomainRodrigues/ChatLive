import { db } from '../../utils/drizzle'
import { channels, serverMembers } from '../../database/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readBody(event)

  if (!body.name || !body.serverId) {
    throw createError({ statusCode: 400, statusMessage: 'name and serverId required' })
  }

  if (String(body.name).trim().length > 100) {
    throw createError({ statusCode: 400, statusMessage: 'Le nom du salon ne peut pas dépasser 100 caractères.' })
  }

  // Vérifier si l'utilisateur est membre du serveur avant de lui permettre d'y créer un salon
  const isMember = await db.select().from(serverMembers)
    .where(and(
      eq(serverMembers.serverId, String(body.serverId)),
      eq(serverMembers.userId, session.user.id)
    ))
    .limit(1)
    .then(res => res[0])

  if (!isMember) {
    throw createError({ statusCode: 403, statusMessage: 'Vous n\'avez pas la permission de créer un salon dans ce serveur.' })
  }

  const cleanName = body.name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s-]/g, '') // keep alphanumeric, spaces and hyphens
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-') // remove double hyphens

  const [newChannel] = await db.insert(channels).values({
    name: cleanName || 'salon',
    serverId: String(body.serverId)
  }).returning()

  return newChannel
})

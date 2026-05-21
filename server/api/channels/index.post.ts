import { db } from '../../utils/drizzle'
import { channels } from '../../database/schema'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const body = await readBody(event)

  if (!body.name || !body.serverId) {
    throw createError({ statusCode: 400, statusMessage: 'name and serverId required' })
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

import { db } from './drizzle'
import { channels, serverMembers } from '../database/schema'
import { eq, and } from 'drizzle-orm'

/**
 * Ensures the user is a member of the given server.
 * Throws 403 if not.
 */
export async function requireServerMember(userId: string, serverId: string) {
  const member = await db.select()
    .from(serverMembers)
    .where(and(eq(serverMembers.serverId, serverId), eq(serverMembers.userId, userId)))
    .limit(1)
    .then(r => r[0])

  if (!member) {
    throw createError({ statusCode: 403, statusMessage: 'Vous n\'avez pas accès à ce serveur.' })
  }

  return member
}

/**
 * Ensures the channel exists and the user has access to the server it belongs to.
 * Throws 404 if channel not found, 403 if user is not a member.
 * Returns the channel row.
 */
export async function requireChannelAccess(userId: string, channelId: string) {
  const channel = await db.select()
    .from(channels)
    .where(eq(channels.id, channelId))
    .limit(1)
    .then(r => r[0])

  if (!channel) {
    throw createError({ statusCode: 404, statusMessage: 'Salon introuvable.' })
  }

  await requireServerMember(userId, channel.serverId)

  return channel
}

import { db } from '../../utils/drizzle'
import { servers, serverMembers } from '../../database/schema'
import { desc, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  return await db.select({
    id: servers.id,
    name: servers.name,
    ownerId: servers.ownerId,
    inviteCode: servers.inviteCode,
    createdAt: servers.createdAt
  })
    .from(servers)
    .innerJoin(serverMembers, eq(servers.id, serverMembers.serverId))
    .where(eq(serverMembers.userId, session.user.id))
    .orderBy(desc(servers.createdAt))
})

import { db } from '../../utils/drizzle'
import { servers } from '../../database/schema'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  return await db.select().from(servers).orderBy(desc(servers.createdAt))
})

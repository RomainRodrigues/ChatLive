import { db } from '../../utils/drizzle'
import { users } from '../../database/schema'
import { ilike, and, ne } from 'drizzle-orm'
import { enforceRateLimit } from '../../utils/rateLimit'

/**
 * Escape special SQL LIKE/ILIKE pattern characters to prevent pattern injection.
 */
function escapeLikePattern(input: string): string {
  return input.replace(/[%_\\]/g, '\\$&')
}

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  enforceRateLimit(`search:${session.user.id}`, { max: 20, windowSeconds: 60 })
  const query = getQuery(event)
  const q = String(query.q || '').trim()

  if (!q || q.length < 2) {
    return []
  }

  const escaped = escapeLikePattern(q)

  // Search by username only — emails are not exposed (GDPR compliance)
  const searchResults = await db.select({
    id: users.id,
    name: users.name,
    avatarUrl: users.avatarUrl
  })
    .from(users)
    .where(
      and(
        ne(users.id, session.user.id),
        ilike(users.name, `%${escaped}%`)
      )
    )
    .limit(20)

  return searchResults
})

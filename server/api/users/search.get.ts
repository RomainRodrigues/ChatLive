import { db } from '../../utils/drizzle'
import { users } from '../../database/schema'
import { or, ilike, and, ne } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const query = getQuery(event)
  const q = String(query.q || '').trim()

  if (!q) {
    return []
  }

  // Chercher par pseudo ou e-mail, en excluant l'utilisateur connecté
  const searchResults = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    avatarUrl: users.avatarUrl
  })
    .from(users)
    .where(
      and(
        ne(users.id, session.user.id),
        or(
          ilike(users.name, `%${q}%`),
          ilike(users.email, `%${q}%`)
        )
      )
    )
    .limit(20)

  return searchResults
})

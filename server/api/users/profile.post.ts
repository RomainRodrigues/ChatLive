import { db } from '../../utils/drizzle'
import { users } from '../../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readBody(event)

  if (!body.name || !body.name.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Le nom est obligatoire.' })
  }

  const [updatedUser] = await db.update(users)
    .set({ name: String(body.name).trim() })
    .where(eq(users.id, session.user.id))
    .returning()

  if (!updatedUser) {
    throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable.' })
  }

  // Mettre à jour la session avec le nouveau nom
  await setUserSession(event, {
    user: {
      ...session.user,
      name: updatedUser.name
    }
  })

  return updatedUser
})

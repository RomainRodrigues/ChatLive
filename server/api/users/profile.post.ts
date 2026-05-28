import { db } from '../../utils/drizzle'
import { users } from '../../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readBody(event)

  const name = String(body.name).trim()
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Le nom est obligatoire.' })
  }

  if (name.length > 100) {
    throw createError({ statusCode: 400, statusMessage: 'Le nom ne peut pas dépasser 100 caractères.' })
  }

  const [updatedUser] = await db.update(users)
    .set({ name })
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

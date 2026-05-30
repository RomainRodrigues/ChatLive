import { db } from '../../utils/drizzle'
import { users } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { UpdateProfileSchema } from '../../utils/validators'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readValidatedBody(event, UpdateProfileSchema.parse)

  const [updatedUser] = await db.update(users)
    .set({ name: body.name })
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

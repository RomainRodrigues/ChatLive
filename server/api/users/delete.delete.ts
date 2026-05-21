import { db } from '../../utils/drizzle'
import { users } from '../../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = session.user.id

  // Supprimer l'utilisateur de la base de données.
  // Grâce aux contraintes "ON DELETE CASCADE" configurées,
  // tous ses messages, serveurs possédés et canaux seront automatiquement supprimés.
  const [deletedUser] = await db.delete(users)
    .where(eq(users.id, userId))
    .returning()

  if (!deletedUser) {
    throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable.' })
  }

  // Détruire la session utilisateur (déconnexion complète côté serveur)
  await clearUserSession(event)

  return { success: true }
})

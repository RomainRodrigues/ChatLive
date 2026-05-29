import { db } from '../../utils/drizzle'
import { friendships } from '../../database/schema'
import { eq, or, and } from 'drizzle-orm'
import { sendToUser } from '../../utils/wsRegistry'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const currentUserId = session.user.id
  const body = await readBody(event)

  if (!body.friendshipId) {
    throw createError({ statusCode: 400, statusMessage: 'friendshipId is required.' })
  }

  // Trouver la relation et vérifier que l'utilisateur y participe
  const relation = await db.select().from(friendships)
    .where(
      and(
        eq(friendships.id, String(body.friendshipId)),
        or(
          eq(friendships.senderId, currentUserId),
          eq(friendships.receiverId, currentUserId)
        )
      )
    )
    .limit(1)
    .then(res => res[0])

  if (!relation) {
    throw createError({ statusCode: 404, statusMessage: 'Relation d\'ami introuvable.' })
  }

  // Supprimer la relation
  await db.delete(friendships)
    .where(eq(friendships.id, relation.id))

  // Informer les deux utilisateurs en temps réel
  sendToUser(relation.senderId, { type: 'friends:update' })
  sendToUser(relation.receiverId, { type: 'friends:update' })

  return { success: true, message: 'Relation d\'ami supprimée.' }
})

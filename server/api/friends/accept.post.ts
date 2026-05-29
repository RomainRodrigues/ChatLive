import { db } from '../../utils/drizzle'
import { friendships } from '../../database/schema'
import { eq, and } from 'drizzle-orm'
import { sendToUser } from '../../utils/wsRegistry'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const currentUserId = session.user.id
  const body = await readBody(event)

  if (!body.friendshipId) {
    throw createError({ statusCode: 400, statusMessage: 'friendshipId is required.' })
  }

  // Trouver la demande et vérifier que le destinataire est bien l'utilisateur connecté
  const relation = await db.select().from(friendships)
    .where(
      and(
        eq(friendships.id, String(body.friendshipId)),
        eq(friendships.receiverId, currentUserId),
        eq(friendships.status, 'pending')
      )
    )
    .limit(1)
    .then(res => res[0])

  if (!relation) {
    throw createError({ statusCode: 404, statusMessage: 'Demande d\'ami introuvable ou déjà traitée.' })
  }

  // Mettre à jour la relation vers 'accepted'
  const [updated] = await db.update(friendships)
    .set({ status: 'accepted' })
    .where(eq(friendships.id, relation.id))
    .returning()

  // Informer les deux utilisateurs en temps réel
  sendToUser(relation.senderId, { type: 'friends:update' })
  sendToUser(relation.senderId, { type: 'dms:update' })
  sendToUser(currentUserId, { type: 'friends:update' })
  sendToUser(currentUserId, { type: 'dms:update' })

  return updated
})

import { db } from '../../utils/drizzle'
import { friendships, users } from '../../database/schema'
import { eq, or, and } from 'drizzle-orm'
import { sendToUser } from '../../utils/wsRegistry'

import type { UserProfile } from '~/types/chat'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const currentUserId = session.user.id
  const body = await readBody(event)

  const targetUserId = body.userId
  const email = String(body.email || '').trim().toLowerCase()

  let targetUser: UserProfile | null | undefined = null

  if (targetUserId) {
    targetUser = await db.select().from(users).where(eq(users.id, targetUserId)).limit(1).then(res => res[0])
  } else if (email) {
    targetUser = await db.select().from(users).where(eq(users.email, email)).limit(1).then(res => res[0])
  }

  if (!targetUser) {
    throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable.' })
  }

  if (targetUser.id === currentUserId) {
    throw createError({ statusCode: 400, statusMessage: 'Vous ne pouvez pas vous ajouter vous-même en ami.' })
  }

  // Vérifier s'il y a déjà une relation existante
  const existingRelation = await db.select().from(friendships)
    .where(
      or(
        and(eq(friendships.senderId, currentUserId), eq(friendships.receiverId, targetUser.id)),
        and(eq(friendships.senderId, targetUser.id), eq(friendships.receiverId, currentUserId))
      )
    )
    .limit(1)
    .then(res => res[0])

  if (existingRelation) {
    if (existingRelation.status === 'accepted') {
      throw createError({ statusCode: 400, statusMessage: 'Vous êtes déjà ami avec cet utilisateur.' })
    } else if (existingRelation.status === 'pending') {
      if (existingRelation.senderId === currentUserId) {
        throw createError({ statusCode: 400, statusMessage: 'Une demande d\'ami est déjà en attente pour cet utilisateur.' })
      } else {
        // Si l'autre personne nous a déjà envoyé une demande, on l'accepte automatiquement !
        const [updated] = await db.update(friendships)
          .set({ status: 'accepted' })
          .where(eq(friendships.id, existingRelation.id))
          .returning()

        // Informer les deux utilisateurs en temps réel
        sendToUser(existingRelation.senderId, { type: 'friends:update' })
        sendToUser(existingRelation.senderId, { type: 'dms:update' })
        sendToUser(currentUserId, { type: 'friends:update' })
        sendToUser(currentUserId, { type: 'dms:update' })

        return { status: 'accepted', relation: updated, message: 'Demande d\'ami acceptée automatiquement !' }
      }
    }
  }

  // Créer une nouvelle demande d'ami
  const [newRequest] = await db.insert(friendships)
    .values({
      senderId: currentUserId,
      receiverId: targetUser.id,
      status: 'pending'
    })
    .returning()

  // Informer le destinataire et l'expéditeur en temps réel
  sendToUser(targetUser.id, { type: 'friends:update' })
  sendToUser(currentUserId, { type: 'friends:update' })

  return { status: 'pending', relation: newRequest, message: 'Demande d\'ami envoyée.' }
})

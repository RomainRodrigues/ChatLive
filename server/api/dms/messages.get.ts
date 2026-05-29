import { db } from '../../utils/drizzle'
import { dmMessages, users } from '../../database/schema'
import { eq, or, and, desc } from 'drizzle-orm'
import { decrypt } from '../../utils/encryption'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const currentUserId = session.user.id
  const query = getQuery(event)
  const partnerId = String(query.partnerId || '').trim()

  if (!partnerId) {
    throw createError({ statusCode: 400, statusMessage: 'partnerId is required.' })
  }

  // Charger les messages privés échangés entre les deux utilisateurs
  const rawMessages = await db.select({
    id: dmMessages.id,
    content: dmMessages.content,
    createdAt: dmMessages.createdAt,
    senderId: dmMessages.senderId,
    receiverId: dmMessages.receiverId,
    sender: {
      id: users.id,
      name: users.name,
      avatarUrl: users.avatarUrl
    }
  })
    .from(dmMessages)
    .leftJoin(users, eq(dmMessages.senderId, users.id))
    .where(
      or(
        and(eq(dmMessages.senderId, currentUserId), eq(dmMessages.receiverId, partnerId)),
        and(eq(dmMessages.senderId, partnerId), eq(dmMessages.receiverId, currentUserId))
      )
    )
    .orderBy(desc(dmMessages.createdAt))
    .limit(50)

  const decryptedMessages = rawMessages.map(m => ({
    id: m.id,
    content: decrypt(m.content),
    createdAt: m.createdAt,
    senderId: m.senderId,
    receiverId: m.receiverId,
    user: m.sender || { id: m.senderId, name: 'Utilisateur', avatarUrl: null }
  }))

  return decryptedMessages.reverse()
})

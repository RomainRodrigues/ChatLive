import { db } from '../../utils/drizzle'
import { dmMessages, users } from '../../database/schema'
import { eq, or, and, desc, lt } from 'drizzle-orm'
import { decrypt } from '../../utils/encryption'

const PAGE_SIZE = 50

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const currentUserId = session.user.id
  const query = getQuery(event)
  const partnerId = String(query.partnerId || '').trim()

  if (!partnerId) {
    throw createError({ statusCode: 400, statusMessage: 'partnerId is required.' })
  }

  const baseCondition = or(
    and(eq(dmMessages.senderId, currentUserId), eq(dmMessages.receiverId, partnerId)),
    and(eq(dmMessages.senderId, partnerId), eq(dmMessages.receiverId, currentUserId))
  )

  const conditions = [baseCondition]
  if (query.before) {
    conditions.push(lt(dmMessages.createdAt, new Date(String(query.before))))
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
    .where(and(...conditions))
    .orderBy(desc(dmMessages.createdAt))
    .limit(PAGE_SIZE + 1)

  const hasMore = rawMessages.length > PAGE_SIZE
  const page = rawMessages.slice(0, PAGE_SIZE)

  const decryptedMessages = page.map(m => ({
    id: m.id,
    content: decrypt(m.content),
    createdAt: m.createdAt,
    senderId: m.senderId,
    receiverId: m.receiverId,
    user: m.sender || { id: m.senderId, name: 'Utilisateur', avatarUrl: null }
  }))

  return {
    messages: decryptedMessages.reverse(),
    hasMore
  }
})

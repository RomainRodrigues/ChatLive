import { db } from '../../utils/drizzle'
import { dmMessages, users } from '../../database/schema'
import { eq, or } from 'drizzle-orm'
import { decrypt } from '../../utils/encryption'
import type { UserProfile } from '~/types/chat'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const currentUserId = session.user.id

  // 1. Récupérer tous les DMs impliquant l'utilisateur
  const allDms = await db.select({
    senderId: dmMessages.senderId,
    receiverId: dmMessages.receiverId,
    content: dmMessages.content,
    createdAt: dmMessages.createdAt
  })
    .from(dmMessages)
    .where(
      or(
        eq(dmMessages.senderId, currentUserId),
        eq(dmMessages.receiverId, currentUserId)
      )
    )

  if (allDms.length === 0) {
    return []
  }

  // 2. Regrouper par partenaire de conversation et trouver le message le plus récent
  interface ConversationInfo {
    partnerId: string
    latestMessage: string
    latestMessageAt: Date
  }

  const conversationsMap = new Map<string, ConversationInfo>()

  for (const dm of allDms) {
    const partnerId = dm.senderId === currentUserId ? dm.receiverId : dm.senderId
    const decrypted = decrypt(dm.content)

    const existing = conversationsMap.get(partnerId)
    if (!existing || dm.createdAt > existing.latestMessageAt) {
      conversationsMap.set(partnerId, {
        partnerId,
        latestMessage: decrypted.length > 60 ? decrypted.substring(0, 57) + '...' : decrypted,
        latestMessageAt: dm.createdAt
      })
    }
  }

  const partnersInfo = Array.from(conversationsMap.values())

  // 3. Charger les profils des partenaires
  const partnerIds = partnersInfo.map(p => p.partnerId)
  let partnersProfiles: UserProfile[] = []

  if (partnerIds.length > 0) {
    partnersProfiles = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl
    })
      .from(users)
      .where(or(...partnerIds.map(id => eq(users.id, id))))
  }

  const profileMap = new Map(partnersProfiles.map(u => [u.id, u]))

  // 4. Construire le payload final trié du plus récent au plus ancien
  const result = partnersInfo
    .map((p) => {
      const profile = profileMap.get(p.partnerId)
      return {
        user: profile || { id: p.partnerId, name: 'Utilisateur inconnu', avatarUrl: null },
        latestMessage: p.latestMessage,
        latestMessageAt: p.latestMessageAt
      }
    })
    .sort((a, b) => b.latestMessageAt.getTime() - a.latestMessageAt.getTime())

  return result
})

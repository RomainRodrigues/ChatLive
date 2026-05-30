import { db } from '../../utils/drizzle'
import { dmMessages, users } from '../../database/schema'
import { eq, or, sql } from 'drizzle-orm'
import { decrypt } from '../../utils/encryption'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const currentUserId = session.user.id

  // Use a subquery to get only the latest message per conversation partner.
  // This avoids loading ALL DMs into memory.
  const latestPerPartner = await db.execute(sql`
    SELECT DISTINCT ON (partner_id)
      CASE
        WHEN ${dmMessages.senderId} = ${currentUserId} THEN ${dmMessages.receiverId}
        ELSE ${dmMessages.senderId}
      END AS partner_id,
      ${dmMessages.content} AS content,
      ${dmMessages.createdAt} AS created_at
    FROM ${dmMessages}
    WHERE ${dmMessages.senderId} = ${currentUserId}
       OR ${dmMessages.receiverId} = ${currentUserId}
    ORDER BY partner_id, ${dmMessages.createdAt} DESC
  `)

  if (!latestPerPartner || latestPerPartner.length === 0) {
    return []
  }

  // Extract partner IDs and decrypt the latest messages
  const partnersInfo = latestPerPartner.map((row: Record<string, unknown>) => {
    const content = decrypt(String(row.content || ''))
    return {
      partnerId: String(row.partner_id),
      latestMessage: content.length > 60 ? content.substring(0, 57) + '...' : content,
      latestMessageAt: new Date(row.created_at as string)
    }
  })

  // Load partner profiles
  const partnerIds = partnersInfo.map(p => p.partnerId)
  const partnersProfiles = partnerIds.length > 0
    ? await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl
      })
        .from(users)
        .where(or(...partnerIds.map(id => eq(users.id, id))))
    : []

  const profileMap = new Map(partnersProfiles.map(u => [u.id, u]))

  // Build final sorted payload
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

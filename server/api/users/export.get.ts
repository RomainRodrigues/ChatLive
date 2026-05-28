import { db } from '../../utils/drizzle'
import { users, servers, messages } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { decrypt } from '../../utils/encryption'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = session.user.id

  // 1. Récupérer le profil de l'utilisateur
  const userProfile = await db.select().from(users).where(eq(users.id, userId)).limit(1).then(res => res[0])

  if (!userProfile) {
    throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable.' })
  }

  // 2. Récupérer les serveurs appartenant à l'utilisateur
  const ownedServers = await db.select().from(servers).where(eq(servers.ownerId, userId))

  // 3. Récupérer les messages envoyés par l'utilisateur
  const userMessages = await db.select().from(messages).where(eq(messages.userId, userId))

  // Formater les données pour l'export légal
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    complianceNotice: 'Ce fichier contient l\'intégralité de vos données personnelles collectées et traitées par l\'application ChatLive, conformément à l\'Article 20 du RGPD (Droit à la portabilité).',
    profile: {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      avatarUrl: userProfile.avatarUrl,
      createdAt: userProfile.createdAt
    },
    ownedServers: ownedServers.map(s => ({
      id: s.id,
      name: s.name,
      createdAt: s.createdAt
    })),
    messagesSent: userMessages.map(m => ({
      id: m.id,
      content: decrypt(m.content),
      channelId: m.channelId,
      createdAt: m.createdAt
    }))
  }

  // Configurer les en-têtes HTTP pour déclencher le téléchargement du fichier JSON
  setResponseHeaders(event, {
    'Content-Type': 'application/json',
    'Content-Disposition': `attachment; filename="chatlive-export-donnees-${userId}.json"`
  })

  return exportPayload
})

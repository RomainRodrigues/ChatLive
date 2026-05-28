import { registerPeer, unregisterPeer } from '../utils/wsRegistry'
import { db } from '../utils/drizzle'
import { channels, serverMembers } from '../database/schema'
import { eq, and } from 'drizzle-orm'

interface AuthenticatedPeerContext {
  user?: {
    id: string
  }
}

export default defineWebSocketHandler({
  async upgrade(event) {
    try {
      // Require authenticated user session before establishing the websocket connection
      const session = await requireUserSession(event)

      // Store user session in the event context so that it's preserved by crossws in peer.context
      event.context.user = session.user

      return {
        context: {
          user: session.user
        }
      }
    } catch {
      // If not authenticated, reject the connection
      return { status: 401, statusText: 'Unauthorized' }
    }
  },

  open(peer) {
    console.log(`[WS] Connection opened (Peer ID: ${peer.id}, User ID: ${(peer.context as AuthenticatedPeerContext).user?.id})`)
  },

  async message(peer, message) {
    try {
      const data = JSON.parse(message.text())
      if (data.type === 'subscribe') {
        if (data.channelId) {
          const userId = (peer.context as AuthenticatedPeerContext).user?.id
          if (!userId) {
            console.error('[WS] Subscription rejected: no user session found')
            return
          }

          // Vérifier si l'utilisateur a le droit d'accéder au salon demandé
          const hasAccess = await db.select()
            .from(channels)
            .innerJoin(serverMembers, eq(channels.serverId, serverMembers.serverId))
            .where(and(
              eq(channels.id, String(data.channelId)),
              eq(serverMembers.userId, userId)
            ))
            .limit(1)
            .then(res => res[0])

          if (!hasAccess) {
            console.warn(`[WS] Blocked user ${userId} from subscribing to channel ${data.channelId}`)
            return
          }

          registerPeer(String(data.channelId), peer)
          console.log(`[WS] Peer ${peer.id} subscribed to channel: ${data.channelId}`)
        } else {
          unregisterPeer(peer)
          console.log(`[WS] Peer ${peer.id} unsubscribed from all channels`)
        }
      }
    } catch (e) {
      console.error('[WS] Error processing message:', e)
    }
  },

  close(peer) {
    unregisterPeer(peer)
    console.log(`[WS] Connection closed (Peer ID: ${peer.id})`)
  },

  error(peer, error) {
    unregisterPeer(peer)
    console.error(`[WS] Error on peer ${peer.id}:`, error)
  }
})

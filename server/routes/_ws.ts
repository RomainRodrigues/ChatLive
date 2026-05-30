import { registerPeer, unregisterPeer, registerUserPeer, unregisterUserPeer, addOnlineUser, removeOnlineUser, sendToUser, broadcastToChannel } from '../utils/wsRegistry'
import { db } from '../utils/drizzle'
import { channels, serverMembers, friendships } from '../database/schema'
import { eq, and, or } from 'drizzle-orm'

interface AuthenticatedPeerContext {
  user?: {
    id: string
    name: string
  }
}

/**
 * Fetches the IDs of all accepted friends for a given user.
 */
async function getFriendIds(userId: string): Promise<string[]> {
  const rows = await db.select()
    .from(friendships)
    .where(
      and(
        or(eq(friendships.senderId, userId), eq(friendships.receiverId, userId)),
        eq(friendships.status, 'accepted')
      )
    )
  return rows.map(r => r.senderId === userId ? r.receiverId : r.senderId)
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

  async open(peer) {
    const userId = (peer.context as AuthenticatedPeerContext).user?.id
    if (userId) {
      registerUserPeer(userId, peer)
      addOnlineUser(userId)

      // Notify all friends that this user is now online
      try {
        const friendIds = await getFriendIds(userId)
        for (const friendId of friendIds) {
          sendToUser(friendId, { type: 'presence', userId, status: 'online' })
        }
      } catch (e) {
        console.error('[WS] Failed to broadcast online presence:', e)
      }
    }
    console.log(`[WS] Connection opened (Peer ID: ${peer.id}, User ID: ${userId})`)
  },

  async message(peer, message) {
    try {
      const data = JSON.parse(message.text())
      const userId = (peer.context as AuthenticatedPeerContext).user?.id
      const userName = (peer.context as AuthenticatedPeerContext).user?.name

      if (data.type === 'subscribe') {
        if (data.channelId) {
          if (!userId) {
            console.error('[WS] Subscription rejected: no user session found')
            return
          }

          // Si c'est un canal de discussion privée (DM)
          if (String(data.channelId).startsWith('dm:')) {
            const roomPart = String(data.channelId).substring(3)
            const [u1, u2] = roomPart.split('_')
            if (u1 !== userId && u2 !== userId) {
              console.warn(`[WS] Blocked user ${userId} from subscribing to DM channel ${data.channelId}`)
              return
            }
            registerPeer(String(data.channelId), peer)
            console.log(`[WS] Peer ${peer.id} subscribed to DM channel: ${data.channelId}`)
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
      } else if (data.type === 'typing:start' && data.channelId && userId && userName) {
        broadcastToChannel(String(data.channelId), {
          type: 'typing',
          userId,
          userName,
          channelId: String(data.channelId)
        }, peer)
      } else if (data.type === 'typing:stop' && data.channelId && userId) {
        broadcastToChannel(String(data.channelId), {
          type: 'typing:stop',
          userId,
          channelId: String(data.channelId)
        }, peer)
      }
    } catch (e) {
      console.error('[WS] Error processing message:', e)
    }
  },

  async close(peer) {
    const userId = (peer.context as AuthenticatedPeerContext).user?.id
    if (userId) {
      unregisterUserPeer(userId, peer)
      removeOnlineUser(userId)

      // Notify all friends that this user is now offline
      try {
        const friendIds = await getFriendIds(userId)
        for (const friendId of friendIds) {
          sendToUser(friendId, { type: 'presence', userId, status: 'offline' })
        }
      } catch (e) {
        console.error('[WS] Failed to broadcast offline presence:', e)
      }
    }
    unregisterPeer(peer)
    console.log(`[WS] Connection closed (Peer ID: ${peer.id})`)
  },

  async error(peer, error) {
    const userId = (peer.context as AuthenticatedPeerContext).user?.id
    if (userId) {
      unregisterUserPeer(userId, peer)
      removeOnlineUser(userId)
    }
    unregisterPeer(peer)
    console.error(`[WS] Error on peer ${peer.id}:`, error)
  }
})

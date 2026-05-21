import { registerPeer, unregisterPeer } from '../utils/wsRegistry'

export default defineWebSocketHandler({
  async upgrade(event) {
    try {
      // Require authenticated user session before establishing the websocket connection
      await requireUserSession(event)
    } catch (e) {
      // If not authenticated, reject the connection
      return { status: 401, statusText: 'Unauthorized' }
    }
  },

  open(peer) {
    console.log(`[WS] Connection opened (Peer ID: ${peer.id})`)
  },

  message(peer, message) {
    try {
      const data = JSON.parse(message.text())
      if (data.type === 'subscribe') {
        if (data.channelId) {
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

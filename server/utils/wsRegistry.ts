import type { Peer } from 'crossws'

// In-memory store mapping channelId -> Set of Peer connections
const activePeers = new Map<string, Set<Peer>>()

export function registerPeer(channelId: string, peer: Peer) {
  // First, make sure the peer is not registered in other channels (clean-up)
  unregisterPeer(peer)

  if (!activePeers.has(channelId)) {
    activePeers.set(channelId, new Set())
  }
  activePeers.get(channelId)!.add(peer)
}

export function unregisterPeer(peer: Peer) {
  for (const [channelId, peers] of activePeers.entries()) {
    if (peers.has(peer)) {
      peers.delete(peer)
      if (peers.size === 0) {
        activePeers.delete(channelId)
      }
    }
  }
}

export function broadcastToChannel(channelId: string, message: unknown) {
  const peers = activePeers.get(channelId)
  if (peers) {
    const payload = typeof message === 'string' ? message : JSON.stringify(message)
    for (const peer of peers) {
      try {
        peer.send(payload)
      } catch (e) {
        console.error('[WS] Failed to send message to peer:', e)
      }
    }
  }
}

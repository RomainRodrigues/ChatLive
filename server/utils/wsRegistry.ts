import type { Peer } from 'crossws'

// In-memory store mapping channelId -> Set of Peer connections
const activePeers = new Map<string, Set<Peer>>()

// In-memory store mapping userId -> Set of Peer connections for global user updates
const userPeers = new Map<string, Set<Peer>>()

// In-memory set of online user IDs (a user is online as long as they have at least one WS connection)
const onlineUsers = new Set<string>()

export function addOnlineUser(userId: string) {
  onlineUsers.add(userId)
}

export function removeOnlineUser(userId: string) {
  // Only mark offline when all WS connections are gone
  const peers = userPeers.get(userId)
  if (!peers || peers.size === 0) {
    onlineUsers.delete(userId)
  }
}

export function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId)
}

export function getOnlineUserIds(): string[] {
  return Array.from(onlineUsers)
}

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

export function broadcastToChannel(channelId: string, message: unknown, excludePeer?: Peer) {
  const peers = activePeers.get(channelId)
  if (peers) {
    const payload = typeof message === 'string' ? message : JSON.stringify(message)
    for (const peer of peers) {
      if (excludePeer && peer.id === excludePeer.id) continue
      try {
        peer.send(payload)
      } catch (e) {
        console.error('[WS] Failed to send message to peer:', e)
      }
    }
  }
}

export function registerUserPeer(userId: string, peer: Peer) {
  if (!userPeers.has(userId)) {
    userPeers.set(userId, new Set())
  }
  userPeers.get(userId)!.add(peer)
}

export function unregisterUserPeer(userId: string, peer: Peer) {
  const peers = userPeers.get(userId)
  if (peers) {
    peers.delete(peer)
    if (peers.size === 0) {
      userPeers.delete(userId)
    }
  }
}

export function sendToUser(userId: string, message: unknown) {
  const peers = userPeers.get(userId)
  if (peers) {
    const payload = typeof message === 'string' ? message : JSON.stringify(message)
    for (const peer of peers) {
      try {
        peer.send(payload)
      } catch (e) {
        console.error('[WS] Failed to send message to user peer:', e)
      }
    }
  }
}

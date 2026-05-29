import { db } from '../../utils/drizzle'
import { friendships, users } from '../../database/schema'
import { eq, or } from 'drizzle-orm'
import type { UserProfile, FriendRelation } from '~/types/chat'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = session.user.id

  // Récupérer toutes les relations impliquant l'utilisateur
  const allRelations = await db.select({
    id: friendships.id,
    status: friendships.status,
    senderId: friendships.senderId,
    receiverId: friendships.receiverId,
    createdAt: friendships.createdAt
  })
    .from(friendships)
    .where(
      or(
        eq(friendships.senderId, userId),
        eq(friendships.receiverId, userId)
      )
    )

  if (allRelations.length === 0) {
    return {
      friends: [],
      pendingIncoming: [],
      pendingOutgoing: []
    }
  }

  // Pour remplir les profils utilisateurs, on va récupérer tous les utilisateurs concernés
  const userIds = Array.from(new Set(
    allRelations.flatMap(r => [r.senderId, r.receiverId]).filter(id => id !== userId)
  ))

  let relatedUsers: UserProfile[] = []
  if (userIds.length > 0) {
    relatedUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl
    })
      .from(users)
      .where(or(...userIds.map(id => eq(users.id, id))))
  }

  const userMap = new Map<string, UserProfile>(relatedUsers.map(u => [u.id, u]))

  const friends: FriendRelation[] = []
  const pendingIncoming: FriendRelation[] = []
  const pendingOutgoing: FriendRelation[] = []

  for (const rel of allRelations) {
    if (rel.status === 'accepted') {
      const friendId = rel.senderId === userId ? rel.receiverId : rel.senderId
      const friendUser = userMap.get(friendId)
      if (friendUser) {
        friends.push({
          friendshipId: rel.id,
          user: friendUser,
          createdAt: rel.createdAt
        })
      }
    } else if (rel.status === 'pending') {
      if (rel.receiverId === userId) {
        const senderUser = userMap.get(rel.senderId)
        if (senderUser) {
          pendingIncoming.push({
            friendshipId: rel.id,
            user: senderUser,
            createdAt: rel.createdAt
          })
        }
      } else if (rel.senderId === userId) {
        const receiverUser = userMap.get(rel.receiverId)
        if (receiverUser) {
          pendingOutgoing.push({
            friendshipId: rel.id,
            user: receiverUser,
            createdAt: rel.createdAt
          })
        }
      }
    }
  }

  return {
    friends,
    pendingIncoming,
    pendingOutgoing
  }
})

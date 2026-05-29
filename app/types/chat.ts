export interface User {
  id: string
  name: string
  email: string
  avatarUrl: string | undefined
  createdAt: string | Date
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatarUrl: string | undefined
}

export interface Server {
  id: string
  name: string
  ownerId: string
  inviteCode: string
  createdAt: string | Date
}

export interface Channel {
  id: string
  name: string
  serverId: string
  createdAt: string | Date
}

export interface Message {
  id: string
  content: string
  channelId: string
  userId: string
  createdAt: string | Date
  user: {
    id: string
    name: string
    avatarUrl: string | undefined
  }
}

export interface FriendRelation {
  friendshipId: string
  user: UserProfile
  createdAt: string | Date
}

export interface DmConversation {
  user: UserProfile
  latestMessage: string
  latestMessageAt?: string | Date
}

export interface DmMessage {
  id: string
  content: string
  senderId: string
  receiverId: string
  createdAt: string | Date
  user: {
    id: string
    name: string
    avatarUrl: string | undefined
  }
}

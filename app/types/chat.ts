export interface User {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  createdAt: string | Date
}

export interface Server {
  id: string
  name: string
  ownerId: string
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
    avatarUrl: string | null
  }
}

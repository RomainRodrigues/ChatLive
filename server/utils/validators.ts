import { z } from 'zod'

// ─── Server ──────────────────────────────────────────
export const CreateServerSchema = z.object({
  name: z.string().trim().min(1, 'Le nom du serveur est obligatoire.').max(100, 'Le nom du serveur ne peut pas dépasser 100 caractères.')
})

export const JoinServerSchema = z.object({
  inviteCode: z.string().uuid('Le code d\'invitation est invalide.')
})

// ─── Channel ─────────────────────────────────────────
export const CreateChannelSchema = z.object({
  name: z.string().trim().min(1, 'Le nom du salon est obligatoire.').max(100, 'Le nom du salon ne peut pas dépasser 100 caractères.'),
  serverId: z.string().uuid('serverId invalide.')
})

// ─── Message ─────────────────────────────────────────
export const SendMessageSchema = z.object({
  channelId: z.string().uuid('channelId invalide.'),
  content: z.string().min(1, 'Le message ne peut pas être vide.').max(4000, 'Le message ne peut pas dépasser 4000 caractères.')
})

export const DeleteMessageSchema = z.object({
  messageId: z.string().uuid('messageId invalide.')
})

// ─── Friends ─────────────────────────────────────────
export const FriendRequestSchema = z.object({
  userId: z.string().uuid('userId invalide.').optional(),
  email: z.string().email('Email invalide.').optional()
}).refine(data => data.userId || data.email, {
  message: 'userId ou email requis.'
})

export const FriendActionSchema = z.object({
  friendshipId: z.string().uuid('friendshipId invalide.')
})

// ─── DMs ─────────────────────────────────────────────
export const SendDmSchema = z.object({
  receiverId: z.string().uuid('receiverId invalide.'),
  content: z.string().min(1, 'Le message ne peut pas être vide.').max(4000, 'Le message ne peut pas dépasser 4000 caractères.')
})

// ─── Profile ─────────────────────────────────────────
export const UpdateProfileSchema = z.object({
  name: z.string().trim().min(1, 'Le nom est obligatoire.').max(100, 'Le nom ne peut pas dépasser 100 caractères.')
})

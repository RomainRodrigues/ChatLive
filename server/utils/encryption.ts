import crypto from 'node:crypto'

// ─── Key Management ──────────────────────────────────
const ENCRYPTION_KEY = process.env.MESSAGE_ENCRYPTION_KEY || process.env.NUXT_SESSION_PASSWORD

if (!ENCRYPTION_KEY) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: MESSAGE_ENCRYPTION_KEY or NUXT_SESSION_PASSWORD must be set in production')
  }
  console.warn('[SECURITY] Using insecure fallback encryption key — NOT safe for production')
}

// Derive a 256-bit key using SHA-256
const key = crypto.createHash('sha256').update(ENCRYPTION_KEY || 'dev-only-insecure-fallback-key!!').digest()

// ─── AES-256-GCM (Authenticated Encryption — current standard) ───

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12) // 96-bit IV for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag().toString('hex')
  return `enc2:${iv.toString('hex')}:${authTag}:${encrypted}`
}

export function decrypt(text: string): string {
  if (!text) return text

  // ─── AES-256-GCM (new format: enc2:iv:authTag:ciphertext) ───
  if (text.startsWith('enc2:')) {
    try {
      const parts = text.split(':')
      if (parts.length !== 4) return text
      const ivHex = parts[1]
      const authTagHex = parts[2]
      const encryptedHex = parts[3]
      if (!ivHex || !authTagHex || !encryptedHex) return text

      const iv = Buffer.from(ivHex, 'hex')
      const authTag = Buffer.from(authTagHex, 'hex')
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
      decipher.setAuthTag(authTag)
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      return decrypted
    } catch (e) {
      console.error('Failed to decrypt GCM message:', e)
      return text
    }
  }

  // ─── AES-256-CBC (legacy format: enc:iv:ciphertext — backwards compatible) ───
  if (text.startsWith('enc:')) {
    try {
      const parts = text.split(':')
      if (parts.length !== 3) return text
      const ivHex = parts[1]
      const encryptedHex = parts[2]
      if (!ivHex || !encryptedHex) return text

      const iv = Buffer.from(ivHex, 'hex')
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      return decrypted
    } catch (e) {
      console.error('Failed to decrypt CBC (legacy) message:', e)
      return text
    }
  }

  // Plain text (unencrypted legacy messages)
  return text
}

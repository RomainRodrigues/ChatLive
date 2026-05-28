import crypto from 'node:crypto'

const ENCRYPTION_KEY = process.env.MESSAGE_ENCRYPTION_KEY || process.env.NUXT_SESSION_PASSWORD || 'a-very-secure-32-chars-long-fallback-key-for-dev'

// Assurer que la clé fait exactement 32 octets (256 bits) en utilisant le hachage SHA-256
const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest()

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return `enc:${iv.toString('hex')}:${encrypted}`
}

export function decrypt(text: string): string {
  if (!text || !text.startsWith('enc:')) {
    return text // Rétrocompatibilité : retourne le texte en clair si non chiffré
  }

  try {
    const parts = text.split(':')
    if (parts.length !== 3) {
      return text
    }
    const ivHex = parts[1]
    const encryptedHex = parts[2]
    if (!ivHex || !encryptedHex) {
      return text
    }
    const iv = Buffer.from(ivHex, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (e) {
    console.error('Échec du déchiffrement du message, retour du texte brut:', e)
    return text
  }
}

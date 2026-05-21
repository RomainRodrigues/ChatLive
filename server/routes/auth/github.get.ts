import { db } from '../../utils/drizzle'
import { users } from '../../database/schema'
import { eq } from 'drizzle-orm'

export default defineOAuthGitHubEventHandler({
  config: {
    emailRequired: true
  },
  async onSuccess(event, { user }) {
    let dbUser = await db.select().from(users).where(eq(users.email, String(user.email))).limit(1).then(res => res[0])

    if (!dbUser) {
      dbUser = await db.insert(users).values({
        name: String(user.name || user.login),
        email: String(user.email),
        avatarUrl: String(user.avatar_url)
      }).returning().then(res => res[0])
    }

    await setUserSession(event, {
      user: {
        id: dbUser!.id,
        name: dbUser!.name,
        email: dbUser!.email,
        avatarUrl: dbUser!.avatarUrl || ''
      }
    })

    return sendRedirect(event, '/')
  },
  onError(event, error) {
    console.error('GitHub OAuth error:', error)
    return sendRedirect(event, '/')
  }
})

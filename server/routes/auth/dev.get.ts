import { db } from '../../utils/drizzle'
import { users } from '../../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  if (process.env.NODE_ENV === 'production') {
    throw createError({ statusCode: 404 })
  }

  const email = 'dev@local.host'
  let dbUser = await db.select().from(users).where(eq(users.email, email)).limit(1).then(res => res[0])

  if (!dbUser) {
    dbUser = await db.insert(users).values({
      name: 'Dev User',
      email: email,
      avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4'
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
})

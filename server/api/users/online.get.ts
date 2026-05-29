import { getOnlineUserIds } from '../../utils/wsRegistry'

/**
 * GET /api/users/online
 * Returns the list of currently online user IDs.
 * Used by the client to hydrate the online presence state on initial load.
 */
export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  return { onlineUserIds: getOnlineUserIds() }
})

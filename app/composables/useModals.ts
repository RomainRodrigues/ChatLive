/**
 * Centralized modal state management.
 * Replaces scattered useState<boolean>('isAddServerOpen') calls
 * with a single composable to prevent magic string collisions.
 */
export const useModals = () => ({
  createServer: useState('modal:createServer', () => false),
  createChannel: useState('modal:createChannel', () => false),
  userSettings: useState('modal:userSettings', () => false),
  invite: useState('modal:invite', () => false)
})

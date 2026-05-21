export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()

  const publicPaths = ['/login', '/privacy', '/terms']
  if (!loggedIn.value && !publicPaths.includes(to.path) && !to.path.startsWith('/auth')) {
    return navigateTo('/login')
  }
})

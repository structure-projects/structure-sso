import router from "@/router"
import { useUserStoreHook } from "@/store/modules/user"
import NProgress from "@/utils/nprogress"

export function setupPermission() {
  const whiteList = ["/login", "/register", "/", "/login/success", "/login/account", "/login/phone", "/login/qrcode", "/login/download", "/app-download"]

  router.beforeEach(async (to, from, next) => {
    NProgress.start()

    console.log('[Router Guard] Navigating to:', to.path, 'Query:', to.query)

    const userStore = useUserStoreHook()
    
    console.log('[Router Guard] isLogin:', userStore.isLogin)

    if (to.query.redirect) {
      userStore.saveRedirectUrl(to.query.redirect as string)
    }

    const path = to.path;
    
    if (whiteList.includes(path)) {
      console.log('[Router Guard] Path is in whitelist, allowing navigation')
      next()
      return
    }

    console.log('[Router Guard] Path is NOT in whitelist, checking isLogin...')
    
    if (userStore.isLogin) {
      console.log('[Router Guard] User is logged in, allowing navigation')
      next()
      return
    }

    console.log('[Router Guard] User is NOT logged in, redirecting to login')
    next(`/login?redirect=${to.path}`)
  })

  router.afterEach(() => {
    NProgress.done()
  })
}

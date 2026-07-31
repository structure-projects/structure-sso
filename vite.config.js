import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

/**
 * Proxy 配置说明：
 *
 * 前端 API 路径已带二级服务前缀（由 api 代码显式声明）：
 *   /auth/api/captcha/get    → auth-service (验证码)
 *   /auth/api/auth/login     → auth-service (登录)
 *   /auth/api/phone/...      → auth-service (短信)
 *   /auth/api/social/...     → auth-service (社交登录)
 *   /user/api/user/...       → user-service (用户信息)
 *
 * 请求链路：
 *   URL: /web-api/auth/api/captcha/get
 *   ├─ dev 直连: proxy /web-api/auth → auth-service:18103 (rewrite 去掉 /web-api/auth)
 *   ├─ dev 联调: proxy /web-api/auth → 网关:9000 (rewrite 去掉 /web-api) → 网关按 /auth StripPrefix
 *   └─ 生产:     Nginx → 网关 按二级前缀 /auth、/user 路由到对应微服务
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const apiPrefix = env.VITE_APP_BASE_API || '/web-api'

  /**
   * 开发环境默认直连 auth-service (18103)，无需启动网关
   * 联调时在 .env.local 覆盖: VITE_PROXY_TARGET=http://localhost:9000/
   */
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:18103/'
  const isDirect = !proxyTarget.includes('9000')

  /**
   * 直连模式 proxy
   *
   * /web-api/auth/api/captcha/get → 去掉 /web-api/auth → /api/captcha/get → auth-service
   * /web-api/user/api/users/current → 去掉 /web-api/user → /api/users/current → user-service
   *
   * 注意：注册/找回密码/注销已迁移到 user-service，/web-api/user 直接指向 user-service:18102
   */
  function directProxy() {
    // user-service 端口，可通过环境变量覆盖
    const userServiceTarget = env.VITE_PROXY_TARGET_USER || 'http://localhost:18102/'
    const rules = {
      // 具体服务前缀在最前（最长匹配优先）
      [`${apiPrefix}/auth`]: {
        target: proxyTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(apiPrefix + '/auth', ''),
      },
      [`${apiPrefix}/user`]: {
        target: userServiceTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(apiPrefix + '/user', ''),
      },
    }
    return rules
  }

  /**
   * 网关模式 proxy（联调）
   *
   * /web-api/auth/api/captcha/get → 去掉 /web-api → /auth/api/captcha/get → 网关按 /auth StripPrefix 到 auth-service
   * /web-api/user/api/user/profile → 去掉 /web-api → /user/api/user/profile → 网关按 /user StripPrefix 到 user-service
   */
  function gatewayProxy() {
    return {
      [apiPrefix]: {
        target: proxyTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(apiPrefix, ''),
      },
    }
  }

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: { api: 'modern-compiler' },
        sass: { api: 'modern-compiler' },
      },
    },
    server: {
      port: Number(env.VITE_APP_PORT) || 17103,
      proxy: isDirect ? directProxy() : gatewayProxy(),
      watch: {
        include: ['src/**/*.js', 'src/**/*.vue'],
      },
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: { drop_console: true },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router', 'element-plus'],
          },
        },
      },
    },
  }
})

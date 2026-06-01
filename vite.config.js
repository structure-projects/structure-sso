import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler'
        },
        sass: {
          api: 'modern-compiler'
        }
      }
    },
    server: {
      port: Number(env.VITE_APP_PORT) || 3000,
      proxy: {
        [env.VITE_APP_BASE_API]: {
          target: 'http://localhost:9000/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/web-api/, '')
        }
      },
      watch: {
        include: ['src/**/*.js', 'src/**/*.vue']
      }
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router', 'element-plus']
          }
        }
      }
    }
  }
})

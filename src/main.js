import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'

// 引入新的 store 和插件
import { setupStore } from './store'
import { setupI18n, setupPermission, setupElIcons } from './plugins'
import './styles/index.scss'

// 移除加载动画
function removeLoading() {
  const loading = document.getElementById('app-loading')
  if (loading) {
    loading.style.opacity = '0'
    loading.style.transition = 'opacity 0.3s'
    setTimeout(() => {
      loading.remove()
    }, 300)
  }
}

// 初始化应用
async function initApp() {
  try {
    // 创建应用实例
    const app = createApp(App)

    // 安装插件
    app.use(router)
    app.use(ElementPlus)
    setupStore(app)
    setupI18n(app)
    setupElIcons(app)

    // 设置权限路由守卫
    setupPermission()

    // 挂载应用
    app.mount('#app')

    // 移除加载动画
    removeLoading()
  } catch (error) {
    console.error('Failed to initialize app:', error)
    removeLoading()
  }
}

// 启动应用
initApp()

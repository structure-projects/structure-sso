# 路由设计规范

> 💡 **通用编码约定**见 [`_common/coding-conventions.md`](../../../_common/wiki/coding-conventions.md)。
> 本文只保留 **Vue Router 4 栈特有** 的约束。

## 硬约束

- **MUST** 使用 Vue Router 4（`createRouter` + `createWebHistory`）
- **MUST** 路由组件懒加载 `() => import('@/views/xxx/Index.vue')`
- **MUST** 路由 meta 声明 `title`、`icon`、`keepAlive`
- **MUST** 权限路由从后端 `structure-resource/menus` 动态加载

## 路由结构

```ts
// router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Index.vue'),
    meta: { title: '登录', public: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/BasicLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Index.vue'),
        meta: { title: '首页', icon: 'House', keepAlive: true },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404', public: true },
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
```

## 懒加载

- **MUST** 所有页面级组件用动态 `import()`
- **MUST** 路由 `name` 唯一，用作 `router.push({ name })` 定位
- **SHOULD** 同模块路由分组，便于分包

## 路由守卫

```ts
// router/guard.ts
import type { Router } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'

export function setupRouterGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const userStore = useUserStore()
    const permissionStore = usePermissionStore()

    // 公共路由放行
    if (to.meta.public) return true

    // 未登录跳登录
    if (!userStore.isLoggedIn) {
      return { name: 'Login', query: { redirect: to.fullPath } }
    }

    // 首次进入加载动态路由
    if (!permissionStore.isLoaded) {
      await permissionStore.generateRoutes()
      return { ...to, replace: true }
    }

    // 权限校验
    if (to.meta.roles && !permissionStore.hasRole(to.meta.roles as string[])) {
      return { name: 'Forbidden' }
    }
    return true
  })
}
```

- **MUST** `beforeEach` 完成登录校验 + 动态路由加载 + 权限校验
- **MUST** 动态路由用 `router.addRoute()` 注入后 `return { ...to, replace: true }` 重新匹配
- **SHOULD** `afterEach` 设置 `document.title = to.meta.title`

## 嵌套路由

```ts
{
  path: '/system',
  component: () => import('@/layouts/BasicLayout.vue'),
  children: [
    { path: 'user', component: () => import('@/views/system/user/Index.vue') },
    { path: 'user/:id', component: () => import('@/views/system/user/Detail.vue') },
  ],
}
```

- **MUST** 嵌套子路由 path **不** 以 `/` 开头（相对父级）
- **MUST** 父级组件包含 `<router-view />`

## 路由元信息（meta）

| 字段 | 类型 | 说明 |
|---|---|---|
| `title` | `string` | 菜单/页签标题 |
| `icon` | `string` | Element Plus 图标名 |
| `keepAlive` | `boolean` | 是否缓存组件 |
| `roles` | `string[]` | 访问所需角色 |
| `public` | `boolean` | 无需登录可访问 |
| `hidden` | `boolean` | 菜单中隐藏 |
| `order` | `number` | 菜单排序 |

- **MUST** meta 字段用 `RouteMeta` 接口扩展类型声明

```ts
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    keepAlive?: boolean
    roles?: string[]
    public?: boolean
    hidden?: boolean
    order?: number
  }
}
```

## 权限路由配置

- **MUST** 静态路由只含登录页、404、首页等公共页
- **MUST** 业务路由由后端 `structure-resource/menus` 返回后 `generateRoutes()` 动态注入
- **MUST** 后端返回的 `component` 字段映射到 `() => import()` 工厂函数表

```ts
const modules = import.meta.glob('@/views/**/*.vue')
function loadView(component: string) {
  return modules[`/src/views/${component}.vue`]
}
```

## 微前端路由集成（wujie）

- **MUST** 子应用用 `createWebHistory`（**禁止** hash 模式，避免与主应用冲突）
- **MUST** 子应用 history base 由 `createWujieSubapp().init()` 注入
- **MUST** 主子应用路由跳转通过 wujie bus 通信，**禁止** 直接 `window.location`
- **SHOULD** 子应用监听主应用路由变化同步内部状态

```ts
// 子应用入口
import { createWujieSubapp } from '@structure-projects/wujie-subapp'
import { router } from './router'

createWujieSubapp().init({
  router,
  mount(app, props) { /* 主应用下发的 props */ },
})
```

## KeepAlive

- **MUST** `keepAlive` 列表从路由 meta 动态生成
- **MUST** 缓存组件名与路由 `name` 一致

```vue
<router-view v-slot="{ Component }">
  <keep-alive :include="cachedViews">
    <component :is="Component" />
  </keep-alive>
</router-view>
```

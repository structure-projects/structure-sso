# 前端权限控制

> 💡 **通用编码约定**见 [`_common/coding-conventions.md`](../../../_common/wiki/coding-conventions.md)。
> 本文只保留 **RBAC 权限栈特有** 的约束。

## 硬约束

- **MUST** 权限数据来源：后端 `structure-resource` 接口
- **MUST** 路由权限、按钮权限、菜单权限三层独立校验
- **MUST** 权限数据缓存到 Pinia，登录后一次性加载
- **禁止** 前端硬编码角色判断（`if (role === 'admin')`）

## 权限分层

| 层级 | 控制对象 | 实现方式 |
|---|---|---|
| 路由权限 | 页面访问 | 路由 `meta.roles` + 守卫校验 |
| 菜单权限 | 菜单显隐 | 后端返回菜单树渲染 |
| 按钮权限 | 操作按钮显隐/禁用 | `v-permission` 指令 |
| 数据权限 | 列表数据范围 | 后端 SQL 控制，前端不处理 |

## 路由权限

```ts
// router/guard.ts
router.beforeEach(async (to) => {
  const permissionStore = usePermissionStore()

  if (to.meta.public) return true
  if (to.meta.roles && !permissionStore.hasRole(to.meta.roles)) {
    return { name: 'Forbidden' }
  }
  if (to.meta.permissions && !permissionStore.hasPermission(to.meta.permissions)) {
    return { name: 'Forbidden' }
  }
  return true
})
```

- **MUST** `meta.roles` 数组，命中任一即放行
- **MUST** 无 `meta.roles` 视为登录即可访问
- **MUST** 校验失败统一跳 `403` 页面

## 按钮权限

```ts
// directives/permission.ts
import type { Directive } from 'vue'
import { usePermissionStore } from '@/stores/permission'

export const vPermission: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    const store = usePermissionStore()
    const required = Array.isArray(binding.value) ? binding.value : [binding.value]
    if (!store.hasPermission(required)) {
      el.parentNode?.removeChild(el)
    }
  },
}

// main.ts
app.directive('permission', vPermission)
```

```vue
<!-- 单权限 -->
<el-button v-permission="'user:create'" type="primary">新增</el-button>

<!-- 多权限（命中任一） -->
<el-button v-permission="['user:export', 'admin']" type="success">导出</el-button>
```

- **MUST** 权限码格式 `资源:操作`（`user:create` / `user:delete`）
- **MUST** `v-permission` 在 `mounted` 移除元素，**禁止** 仅 `v-if`（指令更彻底）
- **SHOULD** 高危操作额外 `:disabled` 状态控制

## 菜单权限

```ts
// stores/permission.ts
export const usePermissionStore = defineStore('permission', () => {
  const menus = ref<MenuItem[]>([])
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])
  const routes = ref<RouteRecordRaw[]>([])
  const isLoaded = ref(false)

  const generateRoutes = async () => {
    const { menus: serverMenus, roles: r, permissions: p } = await getPermissions()
    menus.value = buildMenuTree(serverMenus)
    roles.value = r
    permissions.value = p
    routes.value = buildRoutes(serverMenus)  // 动态生成路由
    routes.value.forEach(route => router.addRoute('Layout', route))
    isLoaded.value = true
  }

  const hasRole = (required: string[]) => required.some(r => roles.value.includes(r))
  const hasPermission = (required: string[]) => required.some(p => permissions.value.includes(p))

  return { menus, roles, permissions, routes, isLoaded, generateRoutes, hasRole, hasPermission }
})
```

- **MUST** 菜单由后端返回的树结构渲染，**禁止** 前端写死菜单
- **MUST** 登录后 `generateRoutes()` 一次性加载菜单 + 角色 + 权限 + 动态路由

## 权限数据来源

```ts
// api/permission.ts
import { request } from '@structure-projects/gateway-client'
import type { MenuTreeVO, PermissionVO } from '@/types/permission'

export function getMyMenus() {
  return request.get<MenuTreeVO[]>('/api/structure-resource/menus/mine')
}

export function getMyPermissions() {
  return request.get<PermissionVO>('/api/structure-resource/permissions/mine')
}
```

- **MUST** 权限接口走 `structure-resource` 微服务
- **MUST** 接口返回当前用户可见菜单 + 拥有角色 + 拥有权限码

## 权限缓存

- **MUST** 权限数据缓存到 Pinia store（内存），**禁止** 持久化到 localStorage
- **MUST** `isLoaded` 标记避免重复请求
- **MUST** 路由刷新（F5）时若 `!isLoaded` 重新加载

## 权限变更处理

- **MUST** 用户角色被后端修改后，下次请求 401/403 触发重新登录
- **MUST** 登出时清空 `permissionStore`（`isLoaded = false`）
- **SHOULD** 提供手动刷新权限入口（管理员修改他人权限后）

## 微前端权限共享（wujie）

- **MUST** 主应用统一登录，子应用通过 wujie props 接收 `token` + `userInfo`
- **MUST** 子应用首次 `mount` 时同步主应用权限到本地 store
- **MUST** 主应用权限变更通过 wujie bus 通知子应用刷新
- **禁止** 子应用独立调登录接口

```ts
// 子应用入口
createWujieSubapp().init({
  mount(app, props) {
    const userStore = useUserStore()
    userStore.setToken(props.token)
    userStore.setUserInfo(props.userInfo)
    // 触发权限加载
    usePermissionStore().generateRoutes()
  },
})

// 主应用监听权限变更
wujieBus.$on('permission-changed', () => {
  // 通知所有子应用刷新
})
```

## 禁止事项

| 禁止 | 应当 |
|---|---|
| 前端硬编码 `role === 'admin'` | `hasPermission(['user:create'])` |
| 菜单写死在前端 | 后端返回 + 动态渲染 |
| 权限持久化到 localStorage | 内存 store |
| 仅前端校验权限 | 前端校验 + 后端兜底 |
| 子应用独立登录 | 主应用统一登录 + props 共享 |

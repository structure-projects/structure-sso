# Pinia 状态管理规范

> 💡 **通用编码约定**：命名 / 注释 / 异常 / 日志等通用约定见 [`_common/coding-conventions.md`](../../../_common/wiki/coding-conventions.md)。
> 本文只保留 **Pinia 栈特有** 的约束。

## 硬约束

- **MUST** 使用 Pinia（**禁止** Vuex）
- **MUST** 使用 Setup Store 语法（Composition API 风格 `defineStore('id', () => { ... })`）
- **MUST** Store 命名 `useXxxStore`（`useUserStore`、`useRoleStore`）
- **MUST** State 修改通过 action（**禁止** 组件内 `store.xxx = yyy` 直接赋值）
- **MUST** 按领域拆分 store 文件（`stores/user.ts`、`stores/role.ts`）

## Store 定义模式

```ts
// stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUserInfo } from '@/api/user'
import type { UserVO } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  // state
  const currentUser = ref<UserVO | null>(null)
  const token = ref<string>('')

  // getters
  const isLoggedIn = computed(() => !!token.value)
  const roles = computed(() => currentUser.value?.roles ?? [])

  // actions
  const fetchUser = async () => {
    currentUser.value = await getUserInfo()
  }
  const setToken = (t: string) => { token.value = t }
  const reset = () => { currentUser.value = null; token.value = '' }

  return { currentUser, token, isLoggedIn, roles, fetchUser, setToken, reset }
})
```

## 命名规范

| 元素 | 规范 | 示例 |
|---|---|---|
| Store id | 小写领域名 | `'user'`、`'role'` |
| 导出函数 | `useXxxStore` | `useUserStore` |
| 文件名 | 领域名小写 | `stores/user.ts` |
| State | `ref` 小驼峰 | `currentUser` |
| Getters | `computed` 小驼峰 | `isLoggedIn` |
| Actions | 动词开头 | `fetchUser` / `setToken` |

## state / getters / actions 规范

- **MUST** state 用 `ref()` 声明并显式标注类型
- **MUST** getters 用 `computed()` 派生，**禁止** 重复存储派生值
- **MUST** action 内部直接修改 state（action 是 state 修改唯一入口）
- **SHOULD** 异步 action 返回 `Promise`，便于调用方 `await`
- **MUST** 响应数据先做类型断言再赋值给 state

## 组合式 Store

跨 store 依赖时直接调用其他 store：

```ts
// stores/permission.ts
import { useUserStore } from './user'

export const usePermissionStore = defineStore('permission', () => {
  const userStore = useUserStore() // 跨 store 依赖
  const canEdit = computed(() => userStore.roles.includes('admin'))
  return { canEdit }
})
```

- **MUST** 跨 store 依赖在 setup 内部调用（保证 Pinia 实例已初始化）
- **SHOULD** 避免循环依赖（A 依赖 B、B 依赖 A）

## Store 持久化

- **MAY** 使用 `pinia-plugin-persistedstate` 持久化敏感度低的数据（如主题、语言）
- **MUST** token、用户信息等敏感数据 **禁止** 持久化到 localStorage（用 sessionStorage 或内存）
- **MUST** 显式声明 `persist: { key: 'xxx', paths: ['theme'] }`，**禁止** 全量持久化

## 跨 Store 依赖

- **SHOULD** 全局共享状态放 store，组件局部状态用 `ref`
- **MUST** 组件中 `const userStore = useUserStore()` 在 setup 顶层调用
- **禁止** 在模块作用域直接调用 `useXxxStore()`（Pinia 实例可能未创建）

## 禁止事项

| 禁止 | 应当 |
|---|---|
| `store.token = 'xxx'` 直接改 state | `store.setToken('xxx')` 走 action |
| 组件内 `ref` 存全局数据 | 放入对应领域 store |
| 多个领域共用一个 store | 按领域拆分 |
| `mapState` / `mapActions`（Options 语法） | Setup Store 解构 + `storeToRefs` |

## 组件使用

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
// 解构响应式 state/getters 必须用 storeToRefs
const { currentUser, isLoggedIn } = storeToRefs(userStore)
// action 可直接解构
const { fetchUser, logout } = userStore
</script>
```

- **MUST** 解构 state/getters 用 `storeToRefs()` 保持响应式
- **MAY** action 直接解构（函数引用不受响应式影响）

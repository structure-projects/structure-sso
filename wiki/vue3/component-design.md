# 组件设计规范

> 💡 **通用编码约定**见 [`_common/coding-conventions.md`](../../../_common/wiki/coding-conventions.md)。
> 本文只保留 **Vue 3 组件栈特有** 的约束。

## 组件分层

| 层级 | 职责 | 位置 | 依赖方向 |
|---|---|---|---|
| L1 通用 UI | 无业务语义（按钮、表单项、表格壳） | `components/ui/` | 仅依赖 element-plus / @structure-projects/components |
| L2 业务组件 | 含业务语义（UserCard、RoleForm） | `components/business/` | 依赖 L1 + store + api |
| L3 页面 | 路由级页面 | `views/` | 依赖 L2 + composables |

- **MUST** 严格分层，L1 **禁止** 引用 store / api
- **MUST** L2 通过 Props/Emits 与外部交互，**禁止** 直接读路由参数
- **SHOULD** L3 页面薄、组合 L2

## 命名规范

- **MUST** 组件文件名 PascalCase：`UserTable.vue`、`RoleForm.vue`
- **MUST** 组件名 PascalCase，多单词业务前缀：`<UserCard />`、`<RoleForm />`
- **MUST** 单文件组件文件名与导出名一致
- **SHOULD** 业务组件用领域中文语义命名（`UserCard` 而非 `Card1`）

## Props 类型规范

- **MUST** Props 用 `defineProps<T>()` 泛型声明完整 TS 类型
- **MUST** 复杂对象 Props 声明 `interface`，**禁止** `any`
- **MUST** 可选 Props 用 `withDefaults()` 提供默认值

```ts
// UserCard.vue
interface UserCardProps {
  user: UserVO              // 必传，无默认值
  editable?: boolean        // 可选
  mode?: 'view' | 'edit'
}

const props = withDefaults(defineProps<UserCardProps>(), {
  editable: false,
  mode: 'view',
})
```

## Emits 类型规范

- **MUST** Emits 用 `defineEmits<T>()` 泛型声明完整事件签名
- **MUST** 事件名小驼峰：`update:user`、`submit`、`cancel`
- **MUST** v-model 双向绑定遵循 `update:xxx` 约定

```ts
interface UserCardEmits {
  (e: 'update:user', value: UserVO): void
  (e: 'submit', payload: UserVO): void
  (e: 'cancel'): void
}

const emit = defineEmits<UserCardEmits>()
```

## 第三方组件使用

### @structure-projects/components

- **MUST** 按需命名导入（**禁止** 默认导入整个包）

```ts
// 正确
import { SpTable, SpForm, SpDialog } from '@structure-projects/components'
// 错误 - 体积过大
import Components from '@structure-projects/components'
```

- **MUST** 该包是纯组件库（**非** Vue 插件，无 `app.use()` 调用）
- **MAY** 项目级二次封装 L1 组件（`components/ui/SpTable.vue`）统一交互

### Element Plus

- **MUST** 全局注册（`*-ui` 子应用入口 `app.use(ElementPlus)`）
- **MUST** 全量引入 CSS：`import 'element-plus/dist/index.css'`
- **MUST** element-plus 声明为 external，**禁止** 打包进子应用产物
- **SHOULD** 按需引入图标：`import { User, Lock } from '@element-plus/icons-vue'`

## Script Setup 规范

- **MUST** 使用 `<script setup lang="ts">`
- **MUST** 业务逻辑超过 50 行抽到 `composables/useXxx.ts`
- **SHOULD** 组件内不放全局状态，放 Pinia store

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useUserForm } from '@/composables/useUserForm'

const props = defineProps<UserFormProps>()
const emit = defineEmits<UserFormEmits>()

const { formData, rules, submit, reset } = useUserForm(props, emit)
</script>
```

## 组件通信

| 场景 | 方案 |
|---|---|
| 父→子 | Props |
| 子→父 | Emits |
| 父→后代多层 | `provide` / `inject`（**MUST** 声明 `InjectionKey<T>`） |
| 跨组件 | Pinia store |
| 兄弟 | 提升到共同父级 + Props/Emits |

- **MUST** `provide`/`inject` 用 `InjectionKey<T>` 类型化，**禁止** 无类型注入

## Slots 规范

- **MUST** 具名插槽 `#[name]` 语法
- **MUST** 作用域插槽声明 slot props 类型
- **SHOULD** 提供默认插槽兜底 UI

```vue
<slot name="actions" :row="row" :index="index" />
```

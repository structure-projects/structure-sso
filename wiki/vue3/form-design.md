# 表单设计规范

> 💡 **通用编码约定**见 [`_common/coding-conventions.md`](../../../_common/wiki/coding-conventions.md)。
> 本文只保留 **Element Plus 表单栈特有** 的约束。

## 硬约束

- **MUST** 表单组件用 Element Plus（`el-form` / `el-form-item` / `el-input` 等）
- **MUST** 校验规则用 `rules` + `async-validator`
- **MUST** 表单数据类型显式 `interface` 声明
- **MUST** 双向绑定走 `v-model` + `defineEmits`

## 表单数据类型定义

```ts
// types/user.ts
export interface UserFormDTO {
  id?: number
  username: string
  realName: string
  email: string
  phone: string
  roles: string[]
  status: 0 | 1
  remark?: string
}
```

- **MUST** DTO 字段类型精确（`status: 0 | 1` 而非 `number`）
- **MUST** 可选字段用 `?`，必填字段无 `?`
- **MUST** 提交类型与回显类型分离（`UserFormDTO` 提交 / `UserVO` 回显）

## Props 与 Emits

```ts
interface UserFormProps {
  modelValue: UserFormDTO
  loading?: boolean
  disabled?: boolean
}

interface UserFormEmits {
  (e: 'update:modelValue', value: UserFormDTO): void
  (e: 'submit', value: UserFormDTO): void
  (e: 'cancel'): void
}
```

## 校验规则

```ts
import type { FormRules } from 'element-plus'

const rules: FormRules<UserFormDTO> = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度 3-20', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '仅字母数字下划线', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式错误', trigger: ['blur', 'change'] },
  ],
  phone: [{ validator: validatePhone, trigger: 'blur' }],
}

// 异步校验（唯一性检查）
const validateUsername = async (_rule, value: string) => {
  const exists = await checkUsernameExists(value)
  if (exists) throw new Error('用户名已存在')
}
```

- **MUST** `rules` 用 `FormRules<T>` 泛型绑定 DTO
- **MUST** 必填项 `required: true` + 明确 `message`
- **MUST** 每个字段声明 `trigger`（`blur` / `change`）
- **SHOULD** 异步校验封装为独立函数便于复用

## 表单布局

```vue
<el-form
  ref="formRef"
  :model="formData"
  :rules="rules"
  :disabled="disabled"
  label-width="100px"
  label-position="right"
>
  <el-row :gutter="20">
    <el-col :span="12">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="formData.username" placeholder="请输入" />
      </el-form-item>
    </el-col>
    <el-col :span="12">
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" />
      </el-form-item>
    </el-col>
  </el-row>
</el-form>
```

- **MUST** `el-form-item` 的 `prop` 与 `rules` key、`model` 字段三者一致
- **SHOULD** 栅格响应式：`<el-col :xs="24" :sm="12" :md="8">`
- **MUST** 标签 `label-width` 统一（同一表单内一致）

## 表单提交 / 重置

```ts
import type { FormInstance } from 'element-plus'

const formRef = ref<FormInstance>()

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()  // 触发全量校验
    emit('submit', { ...formData })
  } catch {
    // 校验失败 Element Plus 自动显示错误
  }
}

const handleReset = () => {
  formRef.value?.resetFields()  // 重置为初始值 + 清除校验
}

const clearValidate = () => {
  formRef.value?.clearValidate()
}
```

- **MUST** 提交前 `formRef.validate()`，校验失败 **禁止** 继续
- **MUST** 重置用 `resetFields()`，**禁止** 手动逐字段清空
- **MUST** 提交按钮 `loading` 绑定防重复提交

## 复杂表单拆分

| 场景 | 方案 |
|---|---|
| 字段 > 15 | 拆分为多个 `el-form` + 步骤条 |
| 主从表单 | 主表单 + 子表单（表格内编辑） |
| 动态字段 | `v-for` 渲染 `el-form-item`，`prop` 用 `list.${index}.field` |
| 分组表单 | `el-collapse` / `el-tabs` 分组 |

- **MUST** 动态列表项 `prop` 写成 `list.${index}.field` 才能触发校验
- **SHOULD** 抽离 `useUserForm()` composable 统一管理校验逻辑

```ts
// composables/useUserForm.ts
export function useUserForm(props: UserFormProps, emit: UserFormEmits) {
  const formData = reactive<UserFormDTO>({ ...props.modelValue })
  const rules: FormRules<UserFormDTO> = { /* ... */ }
  const submit = async (formRef: FormInstance) => {
    await formRef.validate()
    emit('submit', { ...formData })
  }
  return { formData, rules, submit }
}
```

## 禁止事项

| 禁止 | 应当 |
|---|---|
| 手动写正则替代 `rules` | 用 `async-validator` 规则 |
| `v-model` 绑定未声明的字段 | DTO 显式声明所有字段 |
| 同一表单多个 `label-width` | 统一 `label-width` |
| 提交未 disable 按钮 | `loading` 防重复 |

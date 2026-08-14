---
description: |
triggers:
  - 新建组件
  - 新增组件
  - 写组件
  - new component
  - add component
  - Vue 组件
role: developer
priority: high
category: coding
stack: vue3
alwaysApply: false
---


# vue3 新建组件

> 按 Vue 3 + Composition API + `<script setup>` 规范创建组件。

## 执行步骤

### 第 1 步：确认组件位置

- 通用组件：`src/components/{X}Component.vue`
- 业务组件：`src/views/{module}/components/{X}Component.vue`

### 第 2 步：生成组件骨架

```vue
<template>
  <div class="{x}-component">
    <el-card>
      <template #header>
        <span>{{ title }}</span>
      </template>
      <!-- 组件内容 -->
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
// MUST 按需命名导入 @structure-projects/components
import { SomeComponent } from '@structure-projects/components'
// Element Plus 组件由消费项目全局注册，这里按需用即可
import type { {X}Props, {X}Emits } from './types'

// Props 定义（MUST 完整 TS 类型）
interface Props {
  title?: string
  modelValue?: string
  // ...
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  modelValue: ''
})

// Emits 定义（MUST 完整 TS 类型）
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
}>()

// 响应式状态
const internalValue = ref(props.modelValue)

// 计算属性
const displayValue = computed(() => internalValue.value)

// 监听
watch(() => props.modelValue, (newVal) => {
  internalValue.value = newVal
})

// 方法
const handleChange = (val: string) => {
  emit('update:modelValue', val)
  emit('change', val)
}
</script>

<style scoped lang="scss">
.{x}-component {
  // 样式
}
</style>
```

### 第 3 步：关键约束

| 约束 | 说明 |
|---|---|
| **script** | MUST `<script setup lang="ts">` |
| **API** | MUST Composition API（不用 Options API） |
| **组件库** | MUST `@structure-projects/components` 按需命名导入 |
| **Element Plus** | 由消费项目 `app.use(ElementPlus)` 全局注册 |
| **样式** | MUST `scoped`；推荐 UnoCSS 原子类 |
| **Props/Emits** | MUST 完整 TS 类型 |
| **命名** | 组件名 PascalCase；文件名 kebab-case 或 PascalCase |

### 第 4 步：类型定义（如复杂）

新建 `types.ts`：

```typescript
export interface {X}Props {
  // ...
}

export interface {X}Emits {
  // ...
}
```

## 产出物

- {X}Component.vue
- types.ts（可选）

## 下一步

完成本技能后 MUST 按以下顺序继续：

1. **如还需配套组件** → 调用对应栈级 `new-*` 技能
2. **本层组件完成** → 调用 `unit-testing` 写测试
3. **全部代码完成** → 调用 `expert-review` 评审
4. **评审通过** → 调用 `ci-gate` 提交
5. **多人协作** → 调用 `gh-pr-workflow` 提 PR

**推荐下一技能**：`unit-testing`

## 关联

- 前置：`coding`
- 相关：`vue3-new-page` / `vue3-new-composable`
- Wiki：`wiki/vue3/components.md`

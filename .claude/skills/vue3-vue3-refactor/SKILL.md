---
name: vue3-vue3-refactor
description: |
  当用户要求"Vue 重构/Options API 迁移/Vue 2 升级"时触发（vue3 栈）。
  将 Options API 迁移到 Composition API + script setup。

triggers:
  - Vue 重构
  - Options API 迁移
  - Vue2 升级
  - 重构
  - refactor
  - composition api 迁移

role: architect
phase: support
delegates-to: coding

when-to-use: |
  vue3 项目需要从 Options API 迁移到 Composition API，或从 Vue 2 升级到 Vue 3。
when-not-to-use: |
  - 新项目（MUST 直接用 Composition API + script setup）
  - 非 vue3 项目

allowed-tools: Bash, Read, Write, Edit, Glob, Grep

related-rules:
  - vue3-architect
  - vue3-developer
  - common-naming
  - common-project-stack-detection

reads-before-action:
  - wiki/vue3/developer.md
  - wiki/vue3/components.md
  - wiki/_common/naming.md

stack-constraints:
  vue3:
    target-script: "<script setup lang=\"ts\">"
    target-api: "Composition API"
    target-import: "按需命名导入 @structure-projects/components"
    forbidden:
      - "Options API"
      - "this.$refs"
      - "this.$emit"
      - "mixins"
      - "Vue 2 生命周期"

produces:
  - 重构计划
  - 组件迁移清单
  - 代码变更

requires:
  - skill: coding
    condition: 变更提案存在
    error: 无变更提案，MUST 先调用 requirement-analysis

mode: semi-auto

category: architecture
stack: vue3
priority: high
maturity: stable
version: "0.3.0"
since: "2026-08-13"
---

# vue3 重构（Options API → Composition API）

> 将 Options API 迁移到 Composition API + `<script setup>`。
> **MUST 渐进式迁移，禁止一次性大爆炸重构**。

## 前置条件

- 变更提案已创建（`changes/proposals/<current>/proposal.md`）
- 明确迁移范围（全量迁移 / 按模块迁移）

## 执行步骤

### 第 1 步：扫描 Options API 组件

```bash
# 扫描 data() / methods / computed / watch（Options API 特征）
grep -rn "data()" --include="*.vue" | wc -l
grep -rn "methods:" --include="*.vue" | wc -l
grep -rn "computed:" --include="*.vue" | wc -l
grep -rn "watch:" --include="*.vue" | wc -l

# 扫描 mixins
grep -rn "mixins:" --include="*.vue" | head -20

# 扫描 this.$refs / this.$emit
grep -rn "this\.\$refs\|this\.\$emit" --include="*.vue" | head -20

# 扫描 Vue 2 生命周期
grep -rn "beforeDestroy\|destroyed" --include="*.vue" | head -20
```

**产出**：Options API 组件清单

### 第 2 步：建立迁移清单

| 组件名 | 文件路径 | 迁移优先级 | 复杂度 | 依赖 mixins |
|---|---|---|---|---|
| UserList | src/views/user/UserList.vue | 高 | 中 | userMixin |
| OrderForm | src/views/order/OrderForm.vue | 高 | 高 | formMixin |
| ... | ... | ... | ... | ... |

**迁移优先级**：
- 高：核心业务页面 / 高频修改
- 中：辅助功能页面
- 低：静态展示页面

**产出**：迁移清单（写入 `changes/proposals/<current>/design.md`）

### 第 3 步：逐组件迁移

#### data() → ref / reactive

```vue
<!-- 老：Options API -->
<script>
export default {
  data() {
    return {
      count: 0,
      user: { name: '', age: 0 }
    }
  }
}
</script>

<!-- 新：Composition API -->
<script setup lang="ts">
import { ref, reactive } from 'vue'

const count = ref(0)
const user = reactive({ name: '', age: 0 })
</script>
```

#### methods → 函数

```vue
<!-- 老 -->
<script>
export default {
  methods: {
    handleClick() { this.count++ },
    fetchData() { /* ... */ }
  }
}
</script>

<!-- 新 -->
<script setup lang="ts">
const handleClick = () => { count.value++ }
const fetchData = async () => { /* ... */ }
</script>
```

#### computed → computed()

```vue
<!-- 老 -->
<script>
export default {
  computed: {
    doubleCount() { return this.count * 2 }
  }
}
</script>

<!-- 新 -->
<script setup lang="ts">
import { computed } from 'vue'

const doubleCount = computed(() => count.value * 2)
</script>
```

#### watch → watch()

```vue
<!-- 老 -->
<script>
export default {
  watch: {
    count(newVal, oldVal) { /* ... */ }
  }
}
</script>

<!-- 新 -->
<script setup lang="ts">
import { watch } from 'vue'

watch(count, (newVal, oldVal) => { /* ... */ })
</script>
```

#### this.$emit → defineEmits

```vue
<!-- 老 -->
<script>
export default {
  methods: {
    submit() { this.$emit('success', this.data) }
  }
}
</script>

<!-- 新 -->
<script setup lang="ts">
const emit = defineEmits<{
  'success': [data: {X}Data]
}>()

const submit = () => { emit('success', data) }
</script>
```

#### this.$refs → ref()

```vue
<!-- 老 -->
<template>
  <input ref="inputRef" />
</template>
<script>
export default {
  mounted() { this.$refs.inputRef.focus() }
}
</script>

<!-- 新 -->
<template>
  <input ref="inputRef" />
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const inputRef = ref<HTMLInputElement>()
onMounted(() => { inputRef.value?.focus() })
</script>
```

### 第 4 步：迁移全局注册 → 按需命名导入

```typescript
// 老：main.ts 全局注册
app.component('ElButton', ElButton)
app.component('ElInput', ElInput)

// 新：组件内按需命名导入
// 在 .vue 文件中
<script setup lang="ts">
import { ElButton, ElInput } from '@structure-projects/components'
</script>
```

**约束**：MUST 按需命名导入 `@structure-projects/components`，禁止全局注册。

### 第 5 步：迁移 mixins → composables

```typescript
// 老：mixin（禁止）
// userMixin.ts
export default {
  data() { return { user: null } },
  methods: { loadUser() { /* ... */ } }
}

// 新：composable
// useUser.ts
import { ref } from 'vue'

export function useUser() {
  const user = ref(null)
  const loadUser = async () => { /* ... */ }
  return { user, loadUser }
}
```

**约束**：
- MUST 用 `useXxx` composable 替代 mixin
- composable 返回值 MUST 明确类型

### 第 6 步：验证

```bash
# 编译
npm run build

# 单测
npm test

# 视觉回归（如配置）
npm run test:visual
```

**验证标准**：
- 编译通过
- 单测全部通过
- 视觉回归无差异
- 无 Options API / mixins / this.$refs / this.$emit / Vue 2 生命周期

## 产出物

- 重构计划（`changes/proposals/<current>/design.md`）
- 组件迁移清单
- 代码变更（按组件提交，渐进式）

## 下一步

完成本技能后 MUST 按以下顺序继续：

1. **逐组件迁移完成** → 调用 `unit-testing` 补测试
2. **全部迁移完成** → 调用 `expert-review` 评审
3. **评审通过** → 调用 `ci-gate` 提交
4. **多人协作** → 调用 `gh-pr-workflow` 提 PR

**推荐下一技能**：`unit-testing`

## 关联

- 前置：`coding`
- 相关：`vue3-new-component` / `vue3-new-composable` / `vue3-new-page`
- Wiki：`wiki/vue3/developer.md` `wiki/vue3/components.md`

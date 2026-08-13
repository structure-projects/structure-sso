---
name: vue3-new-composable
description: |
  当用户要求"新建 composable/抽取逻辑/写 hook"时触发（vue3 栈）。
  按 Composition API 规范抽取可复用逻辑。

triggers:
  - 新建 composable
  - 抽取逻辑
  - 写 hook
  - new composable
  - 抽取 composable
  - 复用逻辑

role: developer
phase: support
delegates-to: coding

when-to-use: |
  在 vue3 项目里抽取可复用逻辑为 composable。
when-not-to-use: |
  - 仅写单个组件内的局部逻辑（直接写在组件里）
  - 非 vue3 项目

allowed-tools: Bash, Read, Write, Edit

related-rules:
  - vue3-developer
  - common-naming
  - common-project-stack-detection

reads-before-action:
  - wiki/vue3/developer.md
  - wiki/vue3/component-design.md

produces:
  - use{X}.ts composable

requires:
  - skill: coding
    condition: 变更提案存在

mode: auto

category: coding
stack: vue3
priority: medium
maturity: stable
version: "0.3.0"
since: "2026-08-13"
---

# vue3 新建 Composable

> 按 Composition API 规范抽取可复用逻辑。**MUST 命名 `use{X}`，返回值 MUST 明确**。

## 执行步骤

### 第 1 步：确认位置

- 全局 composable：`src/composables/use{X}.ts`
- 模块 composable：`src/views/{module}/composables/use{X}.ts`

### 第 2 步：生成 composable 骨架

```typescript
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { Ref, ComputedRef } from 'vue'

/**
 * use{X} - 一句话说明
 *
 * @example
 * const { data, loading, refresh } = use{X}()
 */
export function use{X}(options?: {X}Options) {
  // 响应式状态
  const data: Ref<{X}Data[]> = ref([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // 计算属性
  const hasData: ComputedRef<boolean> = computed(() => data.value.length > 0)

  // 方法
  const refresh = async () => {
    loading.value = true
    error.value = null
    try {
      // 逻辑
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  // 生命周期
  onMounted(refresh)
  onUnmounted(() => {
    // 清理
  })

  // 返回值（MUST 明确）
  return {
    data,
    loading,
    error,
    hasData,
    refresh
  }
}

// 类型定义
export interface {X}Options {
  // ...
}

export interface {X}Data {
  // ...
}
```

### 第 3 步：关键约束

| 约束 | 说明 |
|---|---|
| **命名** | MUST `use{X}`（PascalCase） |
| **返回** | MUST 返回对象，字段明确 |
| **TS** | MUST 完整类型 |
| **清理** | MUST `onUnmounted` 清理副作用 |
| **位置** | 全局 vs 模块按使用范围选择 |

## 常见模式

### 数据获取

```typescript
export function useFetch<T>(url: string) {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const execute = async () => {
    loading.value = true
    try {
      const res = await fetch(url)
      data.value = await res.json()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, execute }
}
```

### 事件监听

```typescript
export function useEventListener(target: EventTarget, event: string, handler: Function) {
  onMounted(() => target.addEventListener(event, handler))
  onUnmounted(() => target.removeEventListener(event, handler))
}
```

### 本地存储

```typescript
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const data = ref<T>(JSON.parse(localStorage.getItem(key) || JSON.stringify(defaultValue)))

  watch(data, (val) => {
    localStorage.setItem(key, JSON.stringify(val))
  }, { deep: true })

  return data
}
```

## 产出物

- use{X}.ts

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
- 相关：`vue3-new-component`
- Wiki：`wiki/vue3/developer.md`

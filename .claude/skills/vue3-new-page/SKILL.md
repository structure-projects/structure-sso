---
name: vue3-new-page
description: |
  当用户要求"新建页面/新增页面/写页面"时触发（vue3 栈）。
  按 vue3 + wujie 微前端规范创建页面。
  MUST 含路由注册 + 权限控制 + 页面级组件。

triggers:
  - 新建页面
  - 新增页面
  - 写页面
  - new page
  - add page
  - 新增路由

role: developer
phase: support
delegates-to: coding

when-to-use: |
  在 vue3 项目里新建页面级组件（含路由）。
when-not-to-use: |
  - 仅新建小组件（用 vue3-new-component）
  - 非 vue3 项目

allowed-tools: Bash, Read, Write, Edit

related-rules:
  - vue3-developer
  - common-naming
  - common-project-stack-detection

reads-before-action:
  - wiki/vue3/developer.md
  - wiki/vue3/routing.md
  - wiki/vue3/permission.md

stack-constraints:
  vue3:
    page-location: "src/views/{module}/{Page}.vue"
    router-location: "src/router/modules/{module}.ts"
    store-location: "src/stores/{module}.ts"
    api-location: "src/api/{module}.ts"
    wujie-required: true
    permission-directive: "v-permission"

produces:
  - {Page}.vue 页面组件
  - 路由配置
  - API 定义
  - Pinia store（如需要）

requires:
  - skill: coding
    condition: 变更提案存在

mode: auto

category: coding
stack: vue3
priority: high
maturity: stable
version: "0.3.0"
since: "2026-08-13"
---

# vue3 新建页面

> 按 vue3 + wujie 微前端规范创建页面。**MUST 含路由 + 权限 + API**。

## 执行步骤

### 第 1 步：确认页面位置

```
src/
├── views/{module}/
│   ├── {Page}.vue              # 页面组件
│   ├── components/             # 页面级子组件
│   └── composables/            # 页面级 composables
├── api/{module}.ts             # API 定义
├── stores/{module}.ts          # Pinia store
└── router/modules/{module}.ts  # 路由配置
```

### 第 2 步：生成 API 定义（`src/api/{module}.ts`）

```typescript
import { request } from '@structure-projects/gateway-client'
import type { {X}DTO, {X}VO, {X}Query, ResPage } from './types'

export const {x}Api = {
  // 分页查询
  page: (query: {X}Query, reqPage: ReqPage) =>
    request.post<ResPage<{X}VO>>('/api/v1/{x}/page', { query, ...reqPage }),

  // 根据 ID 查询
  findById: (id: number) =>
    request.get<{X}VO>(`/api/v1/{x}/${id}`),

  // 创建
  create: (dto: {X}DTO) =>
    request.post<number>('/api/v1/{x}', dto),

  // 更新
  update: (id: number, dto: {X}DTO) =>
    request.put<void>(`/api/v1/{x}/${id}`, dto),

  // 删除
  delete: (id: number) =>
    request.delete<void>(`/api/v1/{x}/${id}`)
}
```

**约束**：MUST 用 `@structure-projects/gateway-client` 的 `request`（自动带网关 Header）。

### 第 3 步：生成页面组件

```vue
<template>
  <div class="{x}-page">
    <el-card>
      <!-- 搜索栏 -->
      <el-form :model="query" inline>
        <el-form-item label="用户名">
          <el-input v-model="query.username" placeholder="请输入" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 操作栏 -->
      <div class="mb-4">
        <el-button v-permission="'{x}:create'" type="primary" @click="handleCreate">
          新增
        </el-button>
      </div>

      <!-- 表格 -->
      <el-table v-loading="loading" :data="tableData">
        <!-- 列定义 -->
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="reqPage.pageNum"
        v-model:page-size="reqPage.pageSize"
        :total="total"
        @change="loadData"
      />
    </el-card>

    <!-- 编辑对话框 -->
    <{X}EditDialog v-model="editVisible" :id="currentId" @success="loadData" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { {x}Api } from '@/api/{module}'
import { ElMessage } from 'element-plus'
import type { {X}Query, {X}VO } from './types'

// 查询条件
const query = reactive<{X}Query>({
  username: '',
  status: undefined
})

// 分页
const reqPage = reactive({
  pageNum: 1,
  pageSize: 10
})

// 数据
const tableData = ref<{X}VO[]>([])
const total = ref(0)
const loading = ref(false)
const editVisible = ref(false)
const currentId = ref<number>()

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await {x}Api.page(query, reqPage)
    tableData.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  reqPage.pageNum = 1
  loadData()
}

// 重置
const handleReset = () => {
  Object.assign(query, { username: '', status: undefined })
  handleSearch()
}

// 新增
const handleCreate = () => {
  currentId.value = undefined
  editVisible.value = true
}

onMounted(loadData)
</script>
```

### 第 4 步：注册路由

`src/router/modules/{module}.ts`：

```typescript
import type { RouteRecordRaw } from 'vue-router'

export const {module}Routes: RouteRecordRaw[] = [
  {
    path: '/{module}',
    name: '{Module}',
    component: () => import('@/views/{module}/{Page}.vue'),
    meta: {
      title: '{页面标题}',
      permission: '{x}:list'  // 权限标识
    }
  }
]
```

### 第 5 步：Pinia Store（如需要）

`src/stores/{module}.ts`：

```typescript
import { defineStore } from 'pinia'

export const use{X}Store = defineStore('{x}', () => {
  // state / getters / actions
})
```

### 第 6 步：关键约束

| 约束 | 说明 |
|---|---|
| **HTTP** | MUST `@structure-projects/gateway-client` |
| **权限** | MUST `v-permission` 指令控制按钮 |
| **路由** | MUST `meta.permission` 控制页面 |
| **状态** | MUST Pinia（不用 Vuex） |
| **wujie** | 子应用 MUST 用 `@structure-projects/wujie-subapp` |

## 产出物

- {Page}.vue
- {module}.ts（API）
- {module}.ts（路由）
- {module}.ts（store，可选）

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
- Wiki：`wiki/vue3/developer.md` `wiki/vue3/routing.md`

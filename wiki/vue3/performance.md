# 前端性能优化

> 💡 **通用编码约定**见 [`_common/coding-conventions.md`](../../../_common/wiki/coding-conventions.md)。
> 本文只保留 **Vue 3 + Vite 性能栈特有** 的约束。

## 硬约束

- **MUST** 路由级懒加载（`() => import()`）
- **MUST** 第三方库按需引入（element-plus 图标、@structure-projects/components）
- **MUST** 生产构建开启 gzip + brotli 压缩
- **MUST** 单包产物 < 500KB（gzip 后）

## 路由懒加载

- **MUST** 所有页面级组件动态导入
- **SHOULD** 同模块路由手动分包（webpackChunkName / vite comment）

```ts
{
  path: 'system/user',
  component: () => import(/* webpackChunkName: "system" */ '@/views/system/user/Index.vue'),
}
```

## 组件懒加载

```ts
import { defineAsyncComponent } from 'vue'

const HeavyChart = defineAsyncComponent({
  loader: () => import('@/components/business/HeavyChart.vue'),
  loadingComponent: () => import('@/components/ui/LoadingSpinner.vue'),
  delay: 200,
  timeout: 10000,
})
```

- **MUST** 体积大、非首屏组件用 `defineAsyncComponent`
- **MUST** 提供加载态 + 超时兜底
- **SHOULD** 弹窗/抽屉内的重组件懒加载

## 虚拟列表

| 场景 | 阈值 | 方案 |
|---|---|---|
| 表格数据 | > 200 行 | `el-table-v2` 虚拟滚动 |
| 列表渲染 | > 500 项 | `@vueuse/core` `useVirtualList` |
| 树形数据 | > 1000 节点 | 懒加载子节点 + 虚拟滚动 |

- **MUST** 大数据量列表用虚拟滚动，**禁止** 全量 `v-for`
- **MUST** 分页接口默认 `size: 20`，**禁止** 一次性拉全量

```vue
<el-table-v2
  :columns="columns"
  :data="data"
  :width="800"
  :height="500"
  :row-height="50"
  fixed
/>
```

## 图片懒加载

- **MUST** `<img>` 用 `v-lazy`（vueuse `useIntersectionObserver`）或 `loading="lazy"`
- **MUST** 图片资源走 CDN，**禁止** 打包进 JS
- **SHOULD** 提供缩略图 + 点击加载大图

```vue
<img v-lazy="item.url" loading="lazy" :alt="item.name" />
```

## 请求防抖/节流

```ts
import { useDebounceFn, useThrottleFn } from '@vueuse/core'

// 搜索输入防抖
const onSearch = useDebounceFn((keyword: string) => {
  searchUsers(keyword)
}, 300)

// 按钮防抖
const onSave = useThrottleFn(() => save(), 1000)
```

- **MUST** 搜索框 `@input` 防抖 300ms
- **MUST** 滚动事件节流 100ms
- **MUST** 提交按钮 `loading` 防重复

## 计算属性缓存

- **MUST** 派生数据用 `computed`，**禁止** 在模板写复杂表达式
- **MUST** 重量级计算用 `computed`（自带缓存）
- **禁止** `watch` 触发可由 `computed` 完成的派生

```ts
// 推荐
const fullName = computed(() => `${user.firstName} ${user.lastName}`)

// 禁止
watch(() => user.firstName, () => { fullName.value = `${user.firstName} ${user.lastName}` })
```

## Vite 构建优化

```ts
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es2018',
    cssCodeSplit: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus'],
          'echarts': ['echarts'],
        },
      },
    },
  },
})
```

- **MUST** `vue/router/pinia` 分到 vendor chunk
- **MUST** element-plus 声明 external，**禁止** 打包
- **MUST** echarts 等大库单独分包
- **SHOULD** 预构建依赖列入 `optimizeDeps.include`

## 包体积分析

- **MUST** CI 集成 `rollup-plugin-visualizer` 生成体积报告
- **MUST** 单 chunk > 200KB 报警
- **MUST** 产物包含 `source-map` 用于线上排查（仅 staging）

```ts
import { visualizer } from 'rollup-plugin-visualizer'

plugins: [
  visualizer({ open: false, filename: 'dist/stats.html', gzipSize: true }),
]
```

## 关键 CSS 内联

- **MUST** 首屏关键 CSS 内联到 `index.html`（`<style>` 标签）
- **MUST** 非关键 CSS 异步加载（`media="print" onload`）
- **SHOULD** Vite 自动 CSS code split

## KeepAlive 缓存

```vue
<router-view v-slot="{ Component }">
  <keep-alive :include="cachedViewNames">
    <component :is="Component" />
  </keep-alive>
</router-view>
```

- **MUST** 列表页 `keepAlive`，详情页不缓存
- **MUST** 缓存组件 `name` 与路由 `name` 一致
- **SHOULD** 缓存数量限制（避免内存膨胀）

## 禁止事项

| 禁止 | 应当 |
|---|---|
| 全量 `v-for` 渲染大列表 | 虚拟滚动 |
| 首屏加载所有路由 | 懒加载 |
| 图片打包进 JS | CDN + lazy |
| `watch` 替代 `computed` | 用 `computed` |
| 未分包的大依赖 | `manualChunks` 分包 |

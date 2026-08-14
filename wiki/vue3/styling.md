# 样式规范

> 💡 **通用编码约定**见 [`_common/coding-conventions.md`](../../../_common/wiki/coding-conventions.md)。
> 本文只保留 **UnoCSS + SCSS 栈特有** 的约束。

## 硬约束

- **MUST** 默认样式方式：UnoCSS 原子类
- **MUST** 组件特有样式用 `<style scoped lang="scss">`
- **MUST** 主题色用 CSS 变量（**禁止** 硬编码颜色值）
- **禁止** 内联样式 `style="..."`

## UnoCSS 优先

```vue
<!-- 推荐：原子类 -->
<div class="flex items-center justify-between p-4 text-sm text-gray-600">
  <span>{{ title }}</span>
  <el-button type="primary">操作</el-button>
</div>

<!-- 仅当原子类无法表达时才写 scoped -->
<style scoped lang="scss">
.special-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}
</style>
```

- **MUST** 简单布局/间距/颜色优先用 UnoCSS 类
- **MUST** 复杂动画、网格、伪元素用 SCSS
- **MUST** 同一元素避免原子类超过 8 个，超过则抽 class

## scoped 规范

- **MUST** 组件 `<style>` 必须带 `scoped`（除全局样式入口）
- **MUST** 全局样式集中在 `src/styles/`，按需在入口引入
- **MUST** App 根组件可无 scoped（定义全局基础样式）

```vue
<style scoped lang="scss">
.user-card {
  &__title {
    font-weight: 600;
  }
  &--active {
    background: var(--color-primary-light);
  }
}
</style>
```

## CSS 变量与主题

- **MUST** 颜色、间距、字号全部定义为 CSS 变量
- **MUST** 主题切换通过切换根 `data-theme` 属性

```scss
// src/styles/variables.scss
:root {
  --color-primary: #409eff;
  --color-success: #67c23a;
  --color-danger: #f56c6c;
  --spacing-base: 8px;
  --radius-md: 6px;
}

:root[data-theme='dark'] {
  --color-primary: #3a8ee6;
  --color-bg: #1d1e1f;
  --color-text: #e5eaf3;
}
```

- **MUST** Element Plus 主题变量通过 `--el-color-primary` 覆盖
- **MUST** 暗色主题覆盖 `--el-bg-color` 等变量

## SCSS 嵌套规范

- **MUST** 嵌套深度不超过 3 层
- **MUST** BEM 风格命名：`block__element--modifier`
- **MUST** `&` 连接符用于 BEM

```scss
// 推荐
.user-card {
  padding: var(--spacing-base);
  &__header { font-weight: 600; }
  &__body { margin-top: 12px; }
  &--disabled { opacity: 0.5; }
  .el-button { margin-right: 8px; }
}

// 禁止 - 嵌套过深
.user-card {
  .header {
    .title {
      .icon {
        color: var(--color-primary); // ❌ 4 层
      }
    }
  }
}
```

## 深度选择器

- **MUST** 穿透子组件样式用 `:deep()`
- **禁止** `>>>` / `/deep/` 旧语法
- **SHOULD** 深度选择器限定到具体元素，**禁止** 全局污染

```vue
<style scoped lang="scss">
.user-card {
  :deep(.el-input__inner) {
    border-radius: var(--radius-md);
  }
  :deep(.el-table .cell) {
    padding: 0 8px;
  }
}
</style>
```

## 响应式断点

| 断点 | 宽度 | UnoCSS 前缀 |
|---|---|---|
| xs | < 768px | `sm:` 起作用 |
| sm | ≥ 768px | `sm:` |
| md | ≥ 992px | `md:` |
| lg | ≥ 1200px | `lg:` |
| xl | ≥ 1920px | `xl:` |

- **MUST** 移动优先：基础类适配小屏，`sm:` `md:` 增强大屏
- **SHOULD** 关键布局用 `flex` / `grid` 自适应，少用媒体查询

```vue
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <div v-for="item in list" :key="item.id" class="p-4 bg-white rounded-md">
    {{ item.name }}
  </div>
</div>
```

## 暗色主题

- **MUST** 暗色模式用 CSS 变量切换，**禁止** 复制一份样式
- **MUST** 暗色变量集中维护在 `src/styles/dark.scss`
- **SHOULD** 图片资源提供暗色版本（`logo-dark.png`）

```ts
// 切换主题
document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
```

## 禁止事项

| 禁止 | 应当 |
|---|---|
| `style="color: red"` | `class="text-red-500"` 或 CSS 变量 |
| 硬编码 `#409eff` | `var(--color-primary)` |
| `!important` 覆盖 | 提升选择器优先级或调整顺序 |
| 全局 `.el-xxx` 样式 | `:deep(.el-xxx)` 限定作用域 |
| ID 选择器样式 | class 选择器 |

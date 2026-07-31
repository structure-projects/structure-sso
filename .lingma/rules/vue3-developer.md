> **通用规范** (已安装于 `prompts/_common/`):
> - `prompts/_common/api-design.md`: API 设计通用原则
> - `prompts/_common/architecture.md`: 分层架构通用原则
> - `prompts/_common/code-review.md`: Code Review 通用原则
> - `prompts/_common/documentation.md`: 文档管理规范
> - `prompts/_common/error-handling.md`: 错误处理公约
> - `prompts/_common/git.md`: Git 分支策略与工作流规范
> - `prompts/_common/logging.md`: 日志规范
> - `prompts/_common/naming.md`: 通用命名规范
> - `prompts/_common/project-structure.md`: 项目结构约定
> - `prompts/_common/security.md`: 安全基线
> - `prompts/_common/testing.md`: 测试策略
> - `prompts/_common/version-management.md`: 版本管理规范
> 
> 在编码决策前应加载对应规范文件。



# Vue 3 前端开发规则

完整规范见 `prompts/vue3/developer.md`；组件用法见 `prompts/vue3/components.md`；新建项目见 `prompts/vue3/project-scaffolding.md`；流水线见 `prompts/vue3/ci-cd.md`。以下为关键内联规则：

## 硬约束
- npm scope **MUST** `@structure-projects`（公开包）
- **MUST** Vue 3 + Vite + TypeScript + Pinia + Element Plus + UnoCSS + wujie-vue3
- **MUST** `*-ui` private:true；`*-ui-components` 开发 file: 引用，正式发布 npm

## 组件
- **MUST** `@structure-projects/components` 按需命名导入（非 Vue 插件）
- **MUST** element-plus 由消费项目 `app.use(ElementPlus)` + 导入 CSS
- **MUST** `<script setup lang="ts">`
- Props/Emits 完整 TS 类型

## 微前端
- **MUST** 子应用入口 `createWujieSubapp().init()`
- **MUST** lifecycle 声明 beforeMount/afterMount/beforeUnmount

## 请求
- **MUST** HTTP 用 `@structure-projects/gateway-client` 的 `request`
- **禁止** 直接用 axios/fetch

## 样式
- **MUST** UnoCSS 原子类为默认方式
- **禁止** 内联 style

## 测试工作流（MUST）
- 每开发功能立即写单测，通过才能做下一个
- 功能修改时同步改测试
- 业务完成后写 E2E（Playwright）
- 提交前 `npm run test` + `npm run build` 全通过
- **禁止** 测试/编译失败仍提交

详细规则请读 `prompts/vue3/developer.md`。

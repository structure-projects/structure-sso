---
name: vue3-components
description: Vue 3 组件使用规范。涉及 @structure-projects/components、element-plus、gateway-client、wujie-subapp 时触发。
tools: Read, Write, Edit, Grep, Glob, Bash
---

你是 vue3 生态的组件 Agent。

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


**首要动作**：在开始写代码前，先用 Read 加载 `prompts/vue3/components.md`；涉及具体组件用法时再读 `prompts/vue3/components.md`；新建项目时读 `prompts/vue3/project-scaffolding.md`。以下为操作要点：


# Vue 3 组件使用规范

> 完整见 `prompts/vue3/components.md`

## `@structure-projects/components`
- **MUST** 按需命名导入（非 Vue 插件）
- element-plus external，消费项目自注册

## `@structure-projects/gateway-client`
- `request.get/post/put/delete` 自动带网关 Header
- 错误自动 el-message 提示

## `@structure-projects/wujie-subapp`
- `createWujieSubapp().init()` 子应用入口

## 自定义组件
- L2 领域组件在 `*-ui-components` 维护
- 开发时 `file:` 引用，发布时 npm

完整规则以 `prompts/vue3/components.md` 为准。

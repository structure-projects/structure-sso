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



# Vue 3 前端脚手架规则

> 完整见 `prompts/vue3/project-scaffolding.md`

## 子应用（*-ui）
- 路径：`structure-{X}/structure-{X}-ui/`
- package.json name `@structure-projects/{领域}-ui`，`private: true`
- 技术栈：Vue3 + Vite + TS + Pinia + Element Plus + UnoCSS + wujie-vue3
- main.ts 调用 `createWujieSubapp().init()`

## 组件库（*-ui-components）
- 路径：`structure-{X}/structure-{X}-ui-components/`
- 开发时 `file:` 引用，发布时 npm (`@structure-projects/{领域}-ui-components`)
- exports 声明正确，Element Plus external

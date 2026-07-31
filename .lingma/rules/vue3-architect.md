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



# Vue 3 前端架构规则

> 完整见 `prompts/vue3/architect.md`

## 微前端
- **MUST** wujie（无界），`structure-portal` 为基座
- **MUST** `structure-portal` 基座负责路由分发与统一鉴权
- **MUST** 子应用入口 `createWujieSubapp().init()`
- 子应用 lifecycle：beforeMount/afterMount/beforeUnmount

## 组件分层
| 层 | 定位 | npm |
|---|---|---|
| L1 | `@structure-projects/components` | 发布 |
| L2 | `*-ui-components` | 开发 file: 引用 |
| L3 | 页面组件 | 内部 |

## 状态管理
- Pinia Setup Store 语法
- 按领域拆分 stores/

## 构建
- Vite + TypeScript strict
- unplugin-auto-import + unplugin-vue-components

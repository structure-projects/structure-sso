---
alwaysApply: false
description: Vue 3 表单设计约束。创建/修改表单组件时生效。校验规则、双向绑定。
---

> **通用规范** (已安装于 `wiki/_common/`):
> - `wiki/_common/api-design.md`: API 设计通用原则
> - `wiki/_common/architecture.md`: 分层架构通用原则
> - `wiki/_common/cache-design.md`: 缓存设计规范
> - `wiki/_common/ci-cd-pipeline.md`: CI/CD 流水线规范
> - `wiki/_common/code-review-checklist.md`: Code Review 通用原则
> - `wiki/_common/coding-conventions.md`: 通用编码约定（coding-conventions）
> - `wiki/_common/concurrency.md`: 并发编程规范
> - `wiki/_common/database-design.md`: 数据库设计规范
> - `wiki/_common/deployment.md`: 部署规范
> - `wiki/_common/detailed-design.md`: 详细设计（LLD）规范
> - `wiki/_common/distributed-transaction.md`: 分布式事务规范
> - `wiki/_common/docker.md`: Docker 规范
> - `wiki/_common/documentation.md`: 文档管理规范
> - `wiki/_common/error-handling.md`: 错误处理公约
> - `wiki/_common/git-workflow.md`: Git 工作流（分级规范）
> - `wiki/_common/git.md`: Git 分支策略与工作流规范
> - `wiki/_common/github-workflow.md`: GitHub 工作流（gh CLI + PR + Release）
> - `wiki/_common/high-level-design.md`: 概要设计（HLD）规范
> - `wiki/_common/kubernetes.md`: Kubernetes 规范
> - `wiki/_common/legacy-onboarding.md`: 老项目接入指南
> - `wiki/_common/logging.md`: 日志规范
> - `wiki/_common/maven-publish.md`: Maven 发布规范
> - `wiki/_common/messaging.md`: 消息队列规范
> - `wiki/_common/migration-strategies.md`: 迁移策略详解
> - `wiki/_common/model-design.md`: 模型设计规范
> - `wiki/_common/naming.md`: 通用命名规范
> - `wiki/_common/npm-publish.md`: npm 发布规范
> - `wiki/_common/observability.md`: 可观测性规范
> - `wiki/_common/performance.md`: 性能优化规范
> - `wiki/_common/project-form-decision.md`: 项目形态决策指南
> - `wiki/_common/project-structure.md`: 项目结构约定
> - `wiki/_common/requirement-analysis.md`: 需求分析规范
> - `wiki/_common/security.md`: 安全基线
> - `wiki/_common/testing-strategies.md`: 测试策略
> - `wiki/_common/transaction.md`: 本地事务规范
> - `wiki/_common/version-management.md`: 版本管理规范
> 
> 在编码决策前应加载对应规范文件。



# Vue 3 表单设计约束

## 关键规则

- MUST use Element Plus Form components (el-form + el-form-item)
- 校验规则 MUST use rules prop + async-validator
- 双向绑定 MUST use v-model + defineEmits
- 表单数据 MUST have TypeScript type definition
- 提交 MUST validate before submit
- 复杂表单 MUST 拆分为子组件

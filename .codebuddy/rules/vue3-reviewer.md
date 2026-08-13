---
alwaysApply: false
description: Vue 3 前端评审规则。审查 PR / diff 时通过 @reviewer 手动调用。
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



# Vue 3 前端评审规则

> 完整见 `wiki/vue3/reviewer.md`

## 审查清单

### 组件
- [ ] 复用 `@structure-projects/components` 而非重造轮子
- [ ] 复用 element-plus 而非自己实现基础交互
- [ ] `<script setup lang="ts">`

### 性能
- [ ] 路由懒加载
- [ ] 大列表虚拟滚动
- [ ] 无多余响应式数据

### 安全
- [ ] element-plus 表单校验（非仅前端）
- [ ] v-html 经 XSS 过滤

### 样式
- [ ] UnoCSS 优先
- [ ] 无行内 style

### 微前端
- [ ] `createWujieSubapp().init()` 调用
- [ ] lifecycle 声明
- [ ] 路由 base 正确

### 测试
- [ ] 新增功能有单元测试
- [ ] E2E 覆盖核心流程

## 常见驳回
1. 手写已存在组件
2. 不符合 wujie 规范
3. Props/Emits 无类型
4. 引入新 UI 库未评审

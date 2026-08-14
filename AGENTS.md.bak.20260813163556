# AGENTS.md — 全栈项目 AI 规则

> 由 structure-agent-rules install.sh 自动生成。
> 安装的技术栈: vue3

## vue3


> 本文件自包含，可直接拷贝到 Vue 3 前端项目根目录，供 Codex / 通用 AI Agent 自动加载。
> 修改规则时，请同步更新 `prompts/` 目录下的对应角色文件。

## 1. 硬约束

- npm scope **MUST** `@structure-projects`（公开包）；私有包不要使用该 scope。
- **MUST** 技术栈：Vue 3 + Vite + TypeScript + Pinia + Vue Router + Element Plus + UnoCSS + wujie-vue3。
- **MUST** `*-ui` 是 wujie 微前端子应用，`private: true`。
- **MUST** `*-ui-components` 开发时 `file:` 本地引用，正式发布到 npm (`@structure-projects/{领域}-ui-components`)。
- **MUST** `@structure-projects/components` 按需命名导入（**不是 Vue 插件**）。
- **MUST** element-plus 由消费项目自行 `app.use(ElementPlus)` + 导入 CSS。
- **MUST** 子应用入口调用 `createWujieSubapp().init()`。
- **MUST** HTTP 请求用 `@structure-projects/gateway-client` 的 `request`。

## 2. 组件规范

- 文件名 PascalCase（`UserTable.vue`）
- `<script setup lang="ts">` 必须
- Props 用 `defineProps<T>()`，Emits 用 `defineEmits<T>()`
- L1: `@structure-projects/components`（npm），L2: `*-ui-components`（本地），L3: 页面组件（内部）

## 3. 状态管理（Pinia）

- Setup Store 语法（`defineStore('id', () => { ... })`）
- 按领域拆分（`stores/user.ts`、`stores/role.ts`）

## 4. 路由

- 懒加载：`() => import('@/views/xxx/Index.vue')`
- 权限路由从后端 `structure-resource/menus` API 获取
- meta 声明 `title`、`icon`、`keepAlive`

## 5. 样式

- UnoCSS 原子类为默认方式
- `<style scoped>` 用于组件特有样式
- 禁止内联 `style="..."`

## 6. 微前端（wujie）

- 子应用入口：`createWujieSubapp().init()`
- 基座：`structure-portal`
- 子应用 lifecycle 声明 `beforeMount`、`afterMount`、`beforeUnmount`

## 7. 构建

- Vite 构建工具
- TypeScript strict 模式
- `unplugin-auto-import`（Vue/Pinia API 自动导入）
- `unplugin-vue-components`（Element Plus 按需导入）

## 8. 测试

| 层级 | 工具 |
|---|---|
| 单元测试 | Vitest |
| 组件测试 | Vitest + Vue Test Utils |
| E2E | Playwright |

- 每功能开发后立即写单测，通过才能做下一个
- 业务完成后写 E2E
- 提交前 `npm run test` 全通过 + `npm run build` 编译通过

## 9. CI/CD

- GitHub Actions
- `test.yml`：npm ci + vitest + vue-tsc
- `build-and-push.yml`：Docker (nginx) 构建推送（`*-ui`）
- `publish.yml`：npm publish（仅 `*-ui-components`）
- Secrets：`NPM_TOKEN`、`DOCKER_USERNAME`、`DOCKER_PASSWORD`

## 10. 项目结构

```
structure-{X}-ui/
├── src/
│   ├── api/          # API 封装
│   ├── components/   # L3 页面级组件
│   ├── composables/  # 可复用组合函数
│   ├── layouts/      # 布局
│   ├── router/       # 路由
│   ├── stores/       # Pinia
│   ├── styles/       # 全局样式（极少用）
│   ├── views/        # 页面
│   ├── App.vue
│   └── main.ts       # createWujieSubapp().init()
├── vite.config.ts
├── tsconfig.json
├── uno.config.ts
└── package.json      # private: true
```

## _common


> 本文件是 **Codex / 通用 AI Agent** 在 structure-projects 业务项目中的通用工作规则。
> 由 [structure-agent-rules](https://github.com/structure-projects/structure-agent-rules) 仓库的 `_common/codex/AGENTS.md` 模板复制而来。
>
> **使用方式**：安装时自动合并到项目 `AGENTS.md`。
> **详细规则**：`prompts/_common/git.md` / `prompts/_common/version-management.md` / `prompts/_common/documentation.md` / `prompts/_common/naming.md` / `prompts/_common/project-structure.md` 等。

---

## 1. Git 分支管理（MUST）

### 分支模型

```
master ──────────────────────── ●(hotfix merge) ──────
  ↑                 ↑          ↑
develop ────●←feat-A─●←feat-B──●←release-1.2.0──●←fix-C──
            ↑        ↑         ↑                 ↑
          feat-A   feat-B   release-1.2.0      fix-C
```

### 分支命名

| 分支 | 用途 | 来源 | 合并目标 | 生命周期 |
|------|------|------|----------|----------|
| `master` | 生产环境稳定代码 | — | — | 永久 |
| `develop` | 开发主分支 | master | — | 永久 |
| `feat-{描述/版本}` | 功能开发 | develop | develop | 合并后删除 |
| `fix-{描述/版本}` | Bug 修复（开发环境） | develop | develop | 合并后删除 |
| `release-{版本号}` | 发布准备 | develop | master + develop | 合并后删除 |
| `hotfix-{版本号}` | 生产热修复 | master | master + develop | 合并后删除 |

### 核心约束

- **禁止** 直接在 `master` 或 `develop` 上推送代码。
- **禁止** 将 `feat-*` 分支直接合并到 `master`（必须经过 `develop`）。
- **禁止** 在生产热修复分支中夹带新功能。
- **禁止** 在未关联版本号的情况下提交代码。
- **MUST** 已发布的 commit 不可变，不 force push 公共分支。
- **MUST** 所有代码合并到 `develop` 前通过 CI 测试。

## 2. 版本管理（MUST）

### 版本格式

`X.Y.Z` 3 段式语义化版本：

| 段位 | 名称 | 自增时机 | 示例 |
|------|------|----------|------|
| **X** | 架构版本 | 架构级别调整（模块拆分/合并、框架大版本升级） | 1 → 2 |
| **Y** | 功能版本 | 新增功能 | 1.0 → 1.1 |
| **Z** | 修复版本 | Bug 修复（每次修复必增） | 1.1.0 → 1.1.1 |

### 核心约束

- **MUST** 版本号不可重复，不可回退。
- **MUST** 每次开发前确认目标版本号（X/Y/Z 哪段自增）。
- **MUST** Y 自增时 Z 归 0；X 自增时 Y 和 Z 归 0。
- **MUST** 开发阶段使用 `{X}.{Y}.{Z}-SNAPSHOT`，发布时去掉 `-SNAPSHOT`。
- **MUST** 分支命名与版本号对应：`feat-1.2.0` 对应功能版本 `1.2.0`。
- **MUST** 发布前检查 `README.md` 是否与当前版本代码一致。
- **禁止** 在 README 过期的情况下发布版本。

## 3. 文档管理（MUST）

### 文档目录结构

```
docs/
├── overview.md                 # 概要设计
├── features/                   # 详细设计
├── {version}/                  # 版本快照
│   └── changelog/
│       ├── 001.md
│       └── ...
└── README.md
```

### AI 开发前置验证（编码前 MUST 执行）

1. **确认目标版本号**：X/Y/Z 哪段自增？
2. **验证设计文档存在**：`docs/features/` 下是否有对应的详细设计文档？
3. **确认预期交付**：从设计文档提取交付物清单并确认。
4. **禁止**在设计文档不存在或版本号不明确的情况下开始编码。

### Changelog 格式（每次变更 MUST 写入）

`docs/{version}/changelog/{序号}.md`：

```markdown
# 变更 #{序号}
- **类型**: feat / fix
- **日期**: YYYY-MM-DD
- **涉及文件**: xxx.java, xxx.sql, ...
- **原始设计**: [引用详细设计文档]
- **变更内容**: 本次修改的具体内容
- **测试结果**: 通过 / 失败 + 影响范围
- **修改人**: xxx
```

### 红线

- **设计文档缺失** → 禁止编码
- **版本号不明** → 禁止编码
- **changelog 未更新** → 禁止提交

## 4. 命名规范

### 通用命名（MUST）

| 元素 | 规范 | 示例 |
|------|------|------|
| 类名/接口名 | `UpperCamelCase` | `UserService`, `OrderRepository` |
| 方法名/变量名 | `lowerCamelCase` | `findById`, `userName` |
| 常量 | `UPPER_SNAKE_CASE` | `MAX_RETRY_COUNT` |
| 包名 | 全小写无分隔符 | `cn.structured.admin.biz.service` |
| 数据库表/字段 | `lower_snake_case` | `user_role`, `created_at` |
| REST API URL | `kebab-case` | `/api/user-roles` |

### Java 注释规范（MUST）

**类头注释**：

```java
/**
 * 用户管理服务实现
 *
 * @author zhangsan
 * @version 1.2.0
 * @since JDK 17 2025-07-31
 */
```

- **MUST** `@version` 与项目版本号同步更新。
- **SHOULD** `@since` 记录首次创建的 JDK 版本与日期。

**方法注释**：每个 public/protected 方法 MUST 包含 `@param` 和 `@return`。

## 5. 项目结构（MUST）

### 文档目录

```
docs/
├── overview.md                 # 概要设计
├── features/                   # 详细设计
├── {version}/                  # 版本快照
└── README.md                   # 文档索引
```

### 禁止事项

- **禁止** 将生成代码与手写代码混放在同一目录。
- **禁止** 在 commit 中包含临时文件、IDE 配置、构建产物。
- **禁止** 在 `README.md` 中写入超前于代码的内容。

---

**详细规则**（如能访问 structure-agent-rules 仓库）：`prompts/_common/git.md` / `prompts/_common/version-management.md` / `prompts/_common/documentation.md` / `prompts/_common/naming.md` / `prompts/_common/project-structure.md`。


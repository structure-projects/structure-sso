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



# Vue 3 前端 CI/CD 规则

> 完整见 `prompts/vue3/ci-cd.md`

## 标准 Workflow
| 文件 | 用途 |
|---|---|
| `test.yml` | npm ci + vitest + vue-tsc |
| `build-and-push.yml` | Docker nginx 构建推送（*-ui） |
| `publish.yml` | npm publish（仅 *-ui-components） |

## 关键约束
- **MUST** 版本号从 release tag 提取
- **MUST** @structure-projects scope，--access public
- **MUST** Secrets: NPM_TOKEN
- ⚠️ *-ui（private: true）不发布 npm

## Dockerfile
```dockerfile
FROM nginx:1.27-alpine
COPY dist /usr/share/nginx/html
```

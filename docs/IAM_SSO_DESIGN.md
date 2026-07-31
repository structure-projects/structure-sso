# SSO 统一认证前端设计 (structure-sso)

> **所属模块**：`structure-sso`
> **对应后端服务**：auth-service (18103) / auth-api-service (18104) / user-service (18102)
> **运行模式**：独立前端应用（认证网关入口）

---

## 1. 模块职责

SSO 前端是 IAM 平台的统一认证入口，负责用户名密码登录及 OAuth2 授权流程的 UI 层。

| 功能模块 | 说明 |
|---------|------|
| 统一登录页 | 用户名密码登录 + 验证码 |
| OAuth2 授权页 | 第三方应用授权的用户确认界面 |
| 注册页面 | 用户自主注册（可选开放） |
| MFA 验证页 | 多因素认证（TOTP/SMS） |
| 社交登录 | 第三方社交账号绑定登录 |
| 忘记密码 | 密码重置流程 |
| RAM 登录 | RAM（Resource Access Management）子账号登录 |
| 组织切换 | 多租户/多组织切换 |

---

## 2. 技术栈

| 技术 | 版本/说明 |
|------|----------|
| 框架 | Vue 3 + TypeScript |
| UI 库 | Element Plus 2.x |
| 构建工具 | Vite |
| HTTP 客户端 | Axios |
| Token 管理 | PKCE + OAuth2 授权码流程 |
| 部署方式 | 独立部署（前端静态资源） |

---

## 3. 架构设计

### 3.1 SSO 在整体架构中的位置

```
用户浏览器
    │
    ├── 访问 admin-ui（独立入口）
    │       └── 无 Token → 重定向到 SSO
    │
    ├── 访问 Portal-Shell → 子应用
    │       └── 无 Token → 重定向到 SSO
    │
    └── 直接访问 SSO
            │
            ▼
    ┌─────────────────────────────────┐
    │     SSO 前端 (structure-sso)     │
    │     http://sso.xxx.com          │
    │                                 │
    │  /login         统一登录         │
    │  /oauth/authorize  授权确认      │
    │  /register      用户注册         │
    │  /mfa           多因素认证        │
    │  /forgot-password 忘记密码        │
    │  /social-bind   社交绑定          │
    │  /ram-login     RAM 登录         │
    │  /switch-org    组织切换          │
    └──────────────┬──────────────────┘
                   │ POST /auth/login
                   │ GET  /oauth/authorize
                   │ POST /auth/register
                   ▼
    ┌─────────────────────────────────┐
    │  auth-service (18103)            │
    │  auth-api-service (18104)        │
    └─────────────────────────────────┘
```

### 3.2 OAuth2 授权码流程（PKCE）

```
1. 用户访问业务应用 → 无 Token
2. 重定向到 SSO: /oauth/authorize?client_id=xxx&redirect_uri=xxx&state=xxx&code_challenge=xxx
3. 用户登录（用户名+密码 → POST /auth/login）
4. SSO 展示授权确认页 → 用户点击"同意授权"
5. 后端生成 authorization_code
6. 重定向回业务应用: redirect_uri?code=xxx&state=xxx
7. 业务应用后端用 code + code_verifier 交换 Token → POST /oauth/token
8. 获取 access_token + refresh_token → 完成登录
```

---

## 4. 页面设计

### 4.1 登录页 (`/login`)

- 用户名/邮箱 + 密码输入
- 验证码（滑块验证/图片验证）
- 记住我功能
- 忘记密码链接
- 注册链接（可选）
- 社交登录入口（微信/企业微信等）

### 4.2 OAuth2 授权页 (`/oauth/authorize`)

- 展示请求授权的应用信息（名称、图标）
- 展示请求的权限范围（scopes）
- 用户确认/拒绝按钮
- 仅在用户已登录时展示

### 4.3 MFA 页 (`/mfa`)

- TOTP 验证码输入（6 位数字）
- SMS 验证码输入
- 备用恢复码输入
- 登录成功后跳转，携带 MFA 验证完成的标识

### 4.4 注册页 (`/register`)

- 用户名 + 邮箱 + 手机号 + 密码 + 确认密码
- 邮箱/手机验证码
- 同意服务协议

### 4.5 忘记密码 (`/forgot-password`)

找回密码采用**步骤式流程**（2026-07-31 更新），通过多重身份验证确保安全：

#### 步骤一：输入账号
- 用户输入用户名/手机号/邮箱
- 系统查找账号并获取已设置的密保问题列表

#### 步骤二：身份验证（两种方式可选）
- **密保问题验证**（优先）：回答 1-3 个密保问题
- **手机验证码验证**：通过绑定手机号接收短信验证码
- 验证通过后获得 `verifyToken`（一次性凭证）

#### 步骤三：设置新密码
- 输入新密码（8-20位，需包含字母、数字、特殊字符中至少两种）
- 确认密码
- 携带 `verifyToken` 提交重置

#### 步骤四：完成
- 显示重置成功提示
- 引导用户返回登录页

#### API 约定（user-service:18102）

| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/user/api/users/security-questions?identifier=xxx` | GET | 获取用户密保问题列表 |
| `/user/api/users/verify-security-answer` | POST | 校验密保答案，返回 verifyToken |
| `/user/api/users/send-phone-code` | POST | 发送手机验证码（场景: reset-password） |
| `/user/api/users/verify-phone-code` | POST | 校验手机验证码，返回 verifyToken |
| `/user/api/users/reset-password` | POST | 重置密码（携带 verifyToken + newPassword） |

> **当前状态**：后端 API 尚未实现，前端使用 Mock 数据（`src/api/auth/resetPassword.ts` 中 `USE_MOCK = true`）。
> 与后端约定的接口如上表，后端实现后只需将 `USE_MOCK` 改为 `false` 即可。

#### 组件文件
- `src/api/auth/resetPassword.ts` — API 函数与 Mock 实现
- `src/views/login/components/ForgotPassword.vue` — 步骤式找回密码组件
- `src/views/login/ForgotPasswordPage.vue` — 独立路由页面入口
- 路由: `/forgot-password`（独立页面），同时支持登录页内嵌方式

### 4.6 组织切换 (`/switch-org`)

- 展示用户所属组织/租户列表
- 选择目标组织 → 刷新 Token（包含目标 org_id）
- 重定向回业务应用

---

## 5. 组件结构

```
src/
├── api/                 # API 请求
│   ├── auth.ts          # 登录/注册/MFA
│   ├── oauth.ts         # OAuth2 授权
│   └── social.ts        # 社交登录
├── components/           # 组件
│   ├── LoginForm.vue    # 登录表单
│   ├── RegisterForm.vue # 注册表单
│   ├── MfaInput.vue     # MFA 验证码输入
│   ├── SocialLogin.vue  # 社交登录按钮组
│   ├── AuthorizationPanel.vue  # OAuth2 授权确认面板
│   └── OrgSwitcher.vue  # 组织切换器
├── composables/
│   ├── useAuth.ts       # 认证逻辑
│   ├── useOAuth.ts      # OAuth2 流程
│   └── useMfa.ts        # MFA 逻辑
├── layouts/              # 布局
│   └── AuthLayout.vue   # 认证页通用布局
├── router/
├── store/
│   └── auth.ts          # 认证状态
├── views/                # 页面
│   ├── LoginView.vue
│   ├── OAuthAuthorizeView.vue
│   ├── RegisterView.vue
│   ├── MfaView.vue
│   ├── ForgotPasswordView.vue
│   ├── RamLoginView.vue
│   └── SwitchOrgView.vue
├── utils/
│   ├── pkce.ts          # PKCE code_verifier/challenge 生成
│   ├── token.ts         # Token 管理
│   └── request.ts       # Axios 封装
└── styles/
```

---

## 6. 安全设计

### 6.1 PKCE 流程

- 使用 S256 (SHA-256) 作为 code_challenge_method
- code_verifier 随机生成（43-128 字符）
- 每次授权流程生成新的 code_verifier

### 6.2 CSRF 防护

- OAuth2 state 参数防 CSRF
- 表单提交使用 CSRF Token

### 6.3 密码安全

- 前端不存储明文密码
- 传输层使用 HTTPS
- 密码强度指示器

### 6.4 Session 管理

- SSO Session 独立于各应用 Token
- 登出时清除 SSO Session + 各应用 Token
- Session 超时自动跳转登录页

---

## 7. 关键设计决策

### 7.1 为何 SSO 独立部署

- SSO 是统一认证入口，所有应用共用的基础设施
- 独立部署保证高可用（CDN 加速、容灾）
- 与业务应用解耦，独立升级和灰度

### 7.2 Session 与 Token 分离

- **SSO Session**：由 auth-service 管理，在 SSO 前端通过 Cookie 传递
- **应用 Token**：由各应用自行管理（localStorage），通过 OAuth2 授权码流程获取
- 登出时同时清除两端

### 7.3 组件库依赖

- 引用 `@structure-projects/components`（L1 通用组件）
- SSO 页面风格独立，**不**使用 `admin-ui` 的布局组件
- 认证页使用专门设计的 `AuthLayout`

---

## 8. 待确认清单

| # | 不一致项 | 当前状态 | 建议 |
|---|---------|---------|------|
| 1 | 项目实现状态 | structure-sso 目录当前为空/占位状态 | **待确认**：确认开发时间线和优先级 |
| 2 | 验证码方案 | 滑块验证 vs 图片验证码 vs reCAPTCHA | **待确认**：确定验证码方案 |
| 3 | 社交登录范围 | 微信/企业微信/钉钉/飞书/OIDC | **待确认**：首批支持的社交登录方式 |
| 4 | RAM 登录 | RAM 子账号登录的设计方案 | **待确认**：RAM 登录与主账号登录的差异 |
| 5 | 国际化 | SSO 是否需要多语言支持 | **待确认**：国际化需求和范围 |

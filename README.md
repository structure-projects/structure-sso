# structure-sso

单点登录前端，基于 Vue 3 + Vite + TypeScript 构建，提供统一登录、注册、OAuth2 授权、扫码登录、手机登录、社交登录等多种认证方式。

## 技术栈

| 层次 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue 3 | ^3.4.21 |
| 构建工具 | Vite | ^5.2.8 |
| 语言 | TypeScript（含部分 JS） | ^5.4.5 |
| UI 库 | Element Plus | ^2.14.0 |
| 状态管理 | Pinia | ^2.1.7 |
| 路由 | Vue Router | ^4.3.0 |
| 国际化 | vue-i18n | 9.9.1 |
| 网关客户端 | @structure-projects/gateway-client | ^1.0.1 |
| 设备指纹 | @fingerprintjs/fingerprintjs | ^4.4.1 |
| HTTP 客户端 | axios | ^1.16.0 |
| 工具库 | uuid + nprogress + @popperjs/core | — |
| 样式 | Sass | ^1.99.0 |
| 测试 | Vitest + @vue/test-utils + jsdom | ^1.6.0 / ^2.4.6 / ^24.1.0 |

## 目录结构

```
structure-sso/
├── src/
│   ├── api/                    # API 请求层
│   │   ├── auth/               #   认证（登录/重置密码）
│   │   └── system/user/        #   用户管理
│   ├── assets/                 # 静态资源（图片/Logo）
│   ├── components/             # 通用组件（LangSelect）
│   ├── config/                 # 配置（oauth.ts）
│   ├── lang/                   # 国际化语言包（中文/英文）
│   ├── layout/                 # 布局（LoginLayout）
│   ├── plugins/                # 插件（i18n/icons/permission）
│   ├── router/                 # 路由配置
│   ├── store/                  # Pinia 状态管理（user/permission）
│   ├── styles/                 # 全局样式（Sass）
│   ├── utils/                  # 工具函数（request/crypto/nprogress）
│   ├── views/
│   │   └── login/              # 登录页面
│   │       ├── components/     #   登录子组件
│   │       │   ├── AccountLogin.vue     #   账号登录
│   │       │   ├── ForgotPassword.vue   #   忘记密码
│   │       │   ├── PhoneLogin.vue       #   手机登录
│   │       │   ├── QRCodeLogin.vue      #   扫码登录
│   │       │   ├── RegisterForm.vue     #   注册表单
│   │       │   ├── SocialLogin.vue      #   社交登录
│   │       │   └── ...
│   │       ├── Index.vue               #   登录首页
│   │       ├── OAuth2Authorize.vue     #   OAuth2 授权页
│   │       ├── OAuth2Callback.vue      #   OAuth2 回调
│   │       └── ...
│   ├── App.vue
│   ├── main.js
│   └── settings.ts
├── docs/
│   └── IAM_SSO_DESIGN.md      # SSO 设计文档
├── .github/workflows/          # CI/CD（build-and-push + test）
├── Dockerfile
├── nginx.template
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.js
```

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## 测试

```bash
npm run test
npm run type-check
```

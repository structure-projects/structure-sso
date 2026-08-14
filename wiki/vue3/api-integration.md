# API 集成规范

> 💡 **通用编码约定**（统一响应 / 异常 / 日志）见 [`_common/coding-conventions.md`](../../../_common/wiki/coding-conventions.md)。
> 本文只保留 **gateway-client 栈特有** 的约束。

## 硬约束

- **MUST** HTTP 请求用 `@structure-projects/gateway-client` 的 `request` 实例
- **MUST** 网关 7 个 Header 由 gateway-client 自动附带，**禁止** 手动设置
- **MUST** API 函数集中放 `src/api/`，按领域分文件
- **禁止** 直接用 `axios` / `fetch`

## request 实例用法

```ts
// src/api/user.ts
import { request } from '@structure-projects/gateway-client'
// 或: import { default as request } from '@structure-projects/components'

import type { UserVO, UserFormDTO, UserQueryDTO, PageResult } from '@/types/user'

// GET 带查询参数
export function listUsers(params: UserQueryDTO) {
  return request.get<PageResult<UserVO>>('/api/users', { params })
}

// GET 详情
export function getUser(id: number) {
  return request.get<UserVO>(`/api/users/${id}`)
}

// POST 创建
export function createUser(data: UserFormDTO) {
  return request.post<UserVO>('/api/users', data)
}

// PUT 更新（全量）
export function updateUser(id: number, data: UserFormDTO) {
  return request.put<UserVO>(`/api/users/${id}`, data)
}

// PATCH 部分更新
export function patchUser(id: number, data: Partial<UserFormDTO>) {
  return request.patch<UserVO>(`/api/users/${id}`, data)
}

// DELETE
export function deleteUser(id: number) {
  return request.delete<void>(`/api/users/${id}`)
}
```

- **MUST** 泛型声明响应业务数据类型（`request.get<UserVO>`）
- **MUST** 路径参数拼接到 URL（`/api/users/${id}`）
- **MUST** 查询参数走 `{ params }`，请求体走第二参数

## 网关 Header 自动附带

gateway-client 自动注入以下 7 个 Header，业务代码 **禁止** 覆盖：

| Header | 来源 | 说明 |
|---|---|---|
| `X-Gateway-App` | 子应用配置 | 应用标识 |
| `X-Gateway-Tenant` | 租户 store | 多租户隔离 |
| `X-Gateway-User` | 用户 store | 用户 ID |
| `X-Gateway-Token` | 认证 store | JWT Token |
| `X-Gateway-TraceId` | 自动生成 | 链路追踪 |
| `X-Gateway-Lang` | i18n store | 语言标识 |
| `X-Gateway-Timezone` | 客户端时区 | Asia/Shanghai |

## request 函数封装

- **MUST** 业务代码只调用 `src/api/` 暴露的函数，**禁止** 直接调 `request`
- **MUST** 函数命名：动词 + 资源（`listUsers` / `getUser` / `createUser`）
- **SHOULD** 复杂查询封装专用函数（`listActiveUsers`）
- **MUST** 每个函数声明入参 + 返回类型

## 响应拦截器

gateway-client 内置拦截器已处理：

1. 解包 `ResResultVO<T>` → 业务数据 `T`
2. `code !== 0` 抛出 `CommonException`
3. HTTP 4xx/5xx 转 `CommonException`
4. 401 触发登出跳转

- **MUST** 业务代码 `try/catch` 捕获 `CommonException`，**禁止** 依赖 `code` 字段判断
- **禁止** 业务层重复实现响应解包逻辑

## 错误处理

```ts
import { CommonException } from '@structure-projects/gateway-client'
import { ElMessage } from 'element-plus'

const handleSave = async () => {
  try {
    await createUser(formData)
    ElMessage.success('保存成功')
    emit('success')
  } catch (e) {
    const err = e as CommonException
    if (err.code === 'USER_EXISTS') {
      ElMessage.error('用户名已存在')
    } else if (err.code === 'VALIDATION_ERROR') {
      ElMessage.error(err.message)
    } else {
      ElMessage.error('保存失败，请重试')
    }
  }
}
```

- **MUST** 捕获 `CommonException`，按 `err.code` 分支处理
- **MUST** 用户可见错误用 `ElMessage.error` 提示
- **SHOULD** 表单字段级错误映射到 `el-form-item` 的 `error`
- **MUST** 未知错误记录日志并提示通用文案

## 请求取消

```ts
import { AbortController } from '@structure-projects/gateway-client'

let controller: AbortController | null = null

const search = (keyword: string) => {
  controller?.abort()  // 取消上一个请求
  controller = new AbortController()
  return request.get('/api/users', { params: { keyword }, signal: controller.signal })
}
```

- **MUST** 搜索类请求发起新请求时取消旧请求
- **MUST** 路由离开时取消进行中的请求
- **MUST** 用 `AbortController`，**禁止** 用布尔标志模拟

## 请求重试

- **SHOULD** 网络错误、5xx 由 gateway-client 自动重试（指数退避）
- **MUST** 业务幂等接口才允许重试（GET 默认可重试）
- **禁止** 写操作（POST/PUT/DELETE）自动重试

## API 类型定义

```ts
// src/types/user.ts
export interface UserVO {
  id: number
  username: string
  realName: string
  email: string
  roles: string[]
  status: 0 | 1
  createTime: string
}

export interface UserFormDTO {
  username: string
  realName: string
  email: string
  roleIds: number[]
}

export interface UserQueryDTO {
  keyword?: string
  status?: 0 | 1
  page: number
  size: number
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  size: number
}
```

- **MUST** VO（回显）/ DTO（提交）/ QueryDTO（查询）分离
- **MUST** 后端响应字段命名小驼峰（网关统一转换）
- **MUST** 时间字段类型 `string`（ISO 8601），前端格式化
- **禁止** 用 `any` 替代类型声明

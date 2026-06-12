/**
 * 统一 API 响应格式
 */
export interface ApiResponse<T> {
  /**
   * 业务状态码
   */
  code: string;
  /**
   * 返回的消息内容
   */
  message: string;
  /**
   * 业务是否成功
   */
  success: boolean;
  /**
   * 返回的数据（业务VO）
   */
  data: T;
  /**
   * 系统响应的时间戳
   */
  timestamp: number;
}

/**
 * 登录请求参数
 */
export interface LoginData {
  /**
   * 用户名
   */
  username?: string;
  /**
   * 手机号
   */
  phone?: string;
  /**
   * 邮箱
   */
  email?: string;
  /**
   * 密码
   */
  password: string;
  /**
   * 图形验证码
   */
  code?: string;
  /**
   * 图形验证码key
   */
  key?: string;
  /**
   * 登录类型：USERNAME, PHONE, EMAIL
   */
  loginType?: string;
}

/**
 * 登录响应
 */
export interface LoginResult {
  /**
   * 用户ID
   */
  userId?: string;
  /**
   * 用户名
   */
  username?: string;
  /**
   * 手机号
   */
  phone?: string;
  /**
   * 邮箱
   */
  email?: string;
  /**
   * 访问token
   */
  accessToken?: string;
  /**
   * 刷新token
   */
  refreshToken?: string;
  /**
   * token 类型
   */
  tokenType?: string;
  /**
   * 过期时间(单位：秒)
   */
  expiresIn?: number;
  /**
   * 授权范围
   */
  scope?: string;
  /**
   * 第三方平台用户ID
   */
  platformUserId?: string;
  /**
   * 平台编码
   */
  platformCode?: string;
  /**
   * 是否新用户
   */
  isNewUser?: boolean;
  /**
   * 登录类型：password, phone, email, social
   */
  loginType?: string;
  /**
   * 是否需要选择组织
   */
  needSelectOrg?: boolean;
  /**
   * 是否拥有组织
   */
  hasOrganization?: boolean;
}

/**
 * 手机号登录请求
 */
export interface PhoneLoginRequest {
  /**
   * 手机号
   */
  phone: string;
  /**
   * 验证码
   */
  code: string;
}

/**
 * 验证码类型
 */
export type VerificationCodeType = 'login' | 'register' | 'resetPassword';

/**
 * 发送短信验证码请求
 */
export interface SendSmsCodeRequest {
  /**
   * 手机号
   */
  phone: string;
  /**
   * 验证码类型
   */
  codeType: VerificationCodeType;
  /**
   * 图形验证码
   */
  code?: string;
}

/**
 * 社交登录请求
 */
export interface SocialLoginRequest {
  /**
   * 平台编码
   */
  platformCode: string;
  /**
   * 授权码
   */
  authCode: string;
  /**
   * 扩展参数
   */
  extraParams?: string;
}

/**
 * 社交渠道DTO
 */
export interface SocialChannelDTO {
  /**
   * 渠道编码
   */
  channelCode: string;
  /**
   * 渠道名称
   */
  channelName: string;
  /**
   * 授权URL
   */
  authUrl?: string;
  /**
   * 授权范围
   */
  scope?: string;
}


// import request from "@/utils/request";
import {client} from '@structure-projects/gateway-client';
import {
  LoginData,
  LoginResult,
  PhoneLoginRequest,
  SendSmsCodeRequest,
  SocialLoginRequest,
  SocialChannelDTO,
  QRCodeCreateRequest,
  QRCodeCreateResponse,
  QRCodeStatusResponse,
  QRCodeUpdateStatusRequest,
  QRCodeLoginRequest,
  QRCodeStatus
} from "./types";

export interface ResetPasswordRequest {
  phone: string;
  code: string;
  password: string;
}

export async function resetPasswordApi(data: ResetPasswordRequest): Promise<void> {
  await client.request({
    url: "/user/api/users/userResetPassword",
    method: "put",
    data: {
      ...data,
      type: 'phone',  // 验证类型，SSO 默认通过手机号验证
    },
  });
}

export async function loginApi(data: LoginData): Promise<LoginResult> {
  console.log('=== loginApi START ===');
  console.log('Data to send:', data);
  console.log('Keys:', Object.keys(data));
  console.log('code:', data.code);
  console.log('key:', data.key);
  const response = await client.request({
      url: "/auth/api/auth/login",
      method: "post",
      data: data,
    });
  return response.data as LoginResult;
}

export async function logoutApi(): Promise<void> {
  await client.request({
    url: "/auth/api/auth/logout",
    method: "post",
  });
}

export async function sendSmsCodeApi(data: SendSmsCodeRequest): Promise<void> {
  await client.request({
    url: "/auth/api/phone/send-phone-auth-code",
    method: "post",
    data: data,
  });
}

export interface RegisterRequest {
  username: string;
  password: string;
  phone: string;
  code: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
}

export async function registerApi(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await client.request({
    url: "/user/api/users/register",
    method: "post",
    data: {
      ...data,
      type: 'phone',  // 注册类型，SSO 默认通过手机号注册
    },
  });
  return response.data as RegisterResponse;
}

/**
 * 注销当前账号
 * 调用用户服务接口完成账号注销（标记删除+禁用）
 */
export async function cancelAccountApi(): Promise<void> {
  await client.request({
    url: "/user/api/users/cancel",
    method: "delete",
  });
}

export function getSmsCodeApi(phone: string): Promise<void> {
  // 注册流程走用户服务自己的短信发送接口，与登录分离
  return client.request({
    url: "/user/api/auth-code/send-phone-auth-code",
    method: "post",
    data: { phone, codeType: 'register' },
  });
}

export interface CaptchaResponse {
  key: string;
  image: string;
}

export async function getCaptchaApi(): Promise<CaptchaResponse> {
  const response = await client.request({
    url: "/auth/api/captcha/get",
    method: "get",
  });
  return response.data as CaptchaResponse;
}

export async function qrcodeLoginApi(data: QRCodeLoginRequest): Promise<LoginResult> {
  const response = await client.request({
    url: "/auth/api/auth/qrcode-login",
    method: "post",
    data: data,
  });
  return response.data as LoginResult;
}

/**
 * 创建二维码
 * @param data 创建请求
 */
export async function createQRCodeApi(data?: QRCodeCreateRequest): Promise<QRCodeCreateResponse> {
  const response = await client.request({
    url: "/auth/api/auth/qrcode/create",
    method: "post",
    data: data || {},
  });
  return response.data as QRCodeCreateResponse;
}

/**
 * 查询二维码状态
 * @param qrcodeId 二维码ID
 */
export async function getQRCodeStatusApi(qrcodeId: string): Promise<QRCodeStatusResponse> {
  const response = await client.request({
    url: "/auth/api/auth/qrcode/status",
    method: "get",
    params: { qrcodeId },
  });
  return response.data as QRCodeStatusResponse;
}

/**
 * 更新二维码状态
 * @param data 更新请求
 */
export async function updateQRCodeStatusApi(data: QRCodeUpdateStatusRequest): Promise<void> {
  await client.request({
    url: "/auth/api/auth/qrcode/status",
    method: "put",
    data: data,
  });
}

/**
 * 确认二维码登录（手机端已登录用户调用）
 * @param qrcodeId 二维码ID
 */
export async function confirmQRCodeApi(qrcodeId: string): Promise<void> {
  await client.request({
    url: "/auth/api/auth/qrcode/confirm",
    method: "post",
    params: { qrcodeId },
  });
}

export async function phoneLoginApi(data: PhoneLoginRequest): Promise<LoginResult> {
  const response = await client.request({
    url: "/auth/api/phone/login",
    method: "post",
    data: data,
  });
  return response.data as LoginResult;
}

export async function getEnabledSocialPlatformsApi(appId: string): Promise<SocialChannelDTO[]> {
  const response = await client.request({
    url: `/auth/api/social/${appId}/enabled-platforms`,
    method: "get",
  });
  return response.data as SocialChannelDTO[];
}

export async function socialLoginApi(appId: string, data: SocialLoginRequest): Promise<LoginResult> {
  const response = await client.request({
    url: `/auth/api/social/${appId}/login`,
    method: "post",
    data: data,
  });
  return response.data as LoginResult;
}

export interface ClientInfoResponse {
  clientId: string;
  clientName: string;
}

export async function getClientInfoApi(clientId: string): Promise<ClientInfoResponse | null> {
  const response = await client.request({
    url: `/auth/api/auth/client-info/${clientId}`,
    method: "get",
  });
  return response.data as ClientInfoResponse | null;
}

// ======================== PKCE 工具 ========================

/**
 * 生成 PKCE code_verifier（43-128 字符的随机字符串）
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/**
 * 根据 code_verifier 计算 code_challenge（S256 方法）
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(hash));
}

/**
 * Base64URL 编码（无填充）
 */
function base64UrlEncode(buffer: Uint8Array): string {
  let binary = '';
  buffer.forEach(byte => binary += String.fromCharCode(byte));
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// ======================== SSE 订阅 ========================

/**
 * SSE 状态变更回调
 */
export interface QRCodeSSECallbacks {
  onStatusChange: (data: QRCodeStatusResponse) => void;
  onError?: (error: Event) => void;
  onTimeout?: () => void;
}

/**
 * 订阅二维码状态变更（SSE 推送，替代轮询）
 * @param qrcodeId    二维码ID
 * @param callbacks   回调函数
 * @param signal      取消信号（AbortController.signal）
 */
export function subscribeQRCodeSSE(
  qrcodeId: string,
  callbacks: QRCodeSSECallbacks,
  signal?: AbortSignal
): void {
  // dev 走 Vite 代理(/web-api/auth → auth-service:18103);OSS 静态托管下
  // VITE_APP_BASE_API 是网关绝对地址,此时为跨源连接
  const baseApi = import.meta.env.VITE_APP_BASE_API || '/web-api';
  const sseUrl = `${baseApi}/auth/api/auth/qrcode/subscribe?qrcodeId=${encodeURIComponent(qrcodeId)}`;

  // 跨源 EventSource 默认不携带 cookie,须与 request.ts 的 withCredentials 保持一致
  const eventSource = new EventSource(sseUrl, { withCredentials: true });

  eventSource.addEventListener('status', (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data) as QRCodeStatusResponse;
      callbacks.onStatusChange(data);
    } catch (e) {
      console.error('SSE 数据解析失败:', e);
    }
  });

  eventSource.onerror = (error) => {
    console.warn('SSE 连接错误或关闭:', error);
    if (eventSource.readyState === EventSource.CLOSED) {
      callbacks.onTimeout?.();
    } else {
      callbacks.onError?.(error);
    }
  };

  // 监听取消信号
  if (signal) {
    signal.addEventListener('abort', () => {
      eventSource.close();
    });
  }
}

// 导出 PKCE 相关类型供外部使用
export type { QRCodeStatus };

// import request from "@/utils/request";
import {client} from '@structure-projects/gateway-client';
import {
  LoginData,
  LoginResult,
  OAuthTokenResponse,
  OAuthUserInfoResponse,
  OAuthIntrospectResponse,
  PhoneLoginRequest,
  SendSmsCodeRequest,
  SocialLoginRequest,
  SocialChannelDTO
} from "./types";
import { getOAuthConfig } from "@/config/oauth";

export interface ResetPasswordRequest {
  phone: string;
  code: string;
  password: string;
}

export async function resetPasswordApi(data: ResetPasswordRequest): Promise<void> {
  await client.request({
    url: "/api/user/resetPassword",
    method: "put",
    data: data,
  });
}

export async function loginApi(data: LoginData): Promise<LoginResult> {
  console.log('=== loginApi START ===');
  console.log('Data to send:', data);
  console.log('Keys:', Object.keys(data));
  console.log('code:', data.code);
  console.log('key:', data.key);
  const response = await client.request({
      url: "/api/auth/login",
      method: "post",
      data: data,
    });
  return response.data as LoginResult;
}

export async function logoutApi(): Promise<void> {
  await client.request({
    url: "/api/auth/logout",
    method: "post",
  });
}

export async function sendSmsCodeApi(data: SendSmsCodeRequest): Promise<void> {
  await client.request({
    url: "/api/phone/send-phone-auth-code",
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
    url: "/api/user/register",
    method: "post",
    data: data,
  });
  return response.data as RegisterResponse;
}

export function getSmsCodeApi(phone: string): Promise<void> {
  return sendSmsCodeApi({ phone, codeType: 'register' });
}

export interface CaptchaResponse {
  key: string;
  image: string;
}

export async function getCaptchaApi(): Promise<CaptchaResponse> {
  const response = await client.request({
    url: "/api/captcha/get",
    method: "get",
  });
  return response.data as CaptchaResponse;
}

export interface QRCodeLoginRequest {
  authCode: string;
  codeVerifier: string;
  state: string;
  qrcodeId: string;
}

export async function qrcodeLoginApi(data: QRCodeLoginRequest): Promise<LoginResult> {
  const response = await client.request({
    url: "/api/auth/qrcode-login",
    method: "post",
    data: data,
  });
  return response.data as LoginResult;
}

export async function phoneLoginApi(data: PhoneLoginRequest): Promise<LoginResult> {
  const response = await client.request({
    url: "/api/phone/login",
    method: "post",
    data: data,
  });
  return response.data as LoginResult;
}

export async function getSocialPlatformsApi(): Promise<SocialChannelDTO[]> {
  const response = await client.request({
    url: "/api/social/platforms",
    method: "get",
  });
  return response.data as SocialChannelDTO[];
}

export async function getEnabledSocialPlatformsApi(appId: string): Promise<SocialChannelDTO[]> {
  const response = await client.request({
    url: `/api/social/${appId}/enabled-platforms`,
    method: "get",
  });
  return response.data as SocialChannelDTO[];
}

export async function socialLoginApi(appId: string, data: SocialLoginRequest): Promise<LoginResult> {
  const response = await client.request({
    url: `/api/social/${appId}/login`,
    method: "post",
    data: data,
  });
  return response.data as LoginResult;
}

export async function refreshTokenApi(refreshToken: string): Promise<LoginResult> {
  const tokenResponse = await refreshOAuthToken(refreshToken);
  return {
    accessToken: tokenResponse.access_token,
    expires: Date.now() + tokenResponse.expires_in * 1000,
    refreshToken: tokenResponse.refresh_token,
    tokenType: tokenResponse.token_type,
    expiresIn: tokenResponse.expires_in,
    scope: tokenResponse.scope,
  };
}

/**
 * 使用授权码换取访问令牌
 */
export async function exchangeCodeForToken(
  code: string,
  codeVerifier?: string
): Promise<OAuthTokenResponse> {
  const config = getOAuthConfig();
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code: code,
    redirect_uri: config.redirectUri,
  });

  if (codeVerifier) {
    params.append("code_verifier", codeVerifier);
  }

  const authHeader = `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`;

  const response = await client.post<OAuthTokenResponse>(
    `${config.baseUrl}${config.tokenEndpoint}`,
    params,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: authHeader,
      },
    }
  );

  return response.data;
}

/**
 * 使用刷新令牌获取新的访问令牌
 */
export async function refreshOAuthToken(
  refreshToken: string
): Promise<OAuthTokenResponse> {
  const config = getOAuthConfig();
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    scope: config.scope,
  });

  const authHeader = `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`;

  const response = await client.post<OAuthTokenResponse>(
    `${config.baseUrl}${config.tokenEndpoint}`,
    params,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: authHeader,
      },
    }
  );

  return response.data;
}

/**
 * 获取用户信息
 */
export async function getOAuthUserInfo(
  accessToken: string
): Promise<OAuthUserInfoResponse> {
  const config = getOAuthConfig();

  const response = await client.get<OAuthUserInfoResponse>(
    `${config.baseUrl}${config.userInfoEndpoint}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
}

/**
 * 验证令牌有效性
 */
export async function introspectToken(
  token: string
): Promise<OAuthIntrospectResponse> {
  const config = getOAuthConfig();
  const params = new URLSearchParams({
    token: token,
  });

  const authHeader = `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`;

  const response = await client.post<OAuthIntrospectResponse>(
    `${config.baseUrl}${config.introspectEndpoint}`,
    params,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: authHeader,
      },
    }
  );

  return response.data;
}

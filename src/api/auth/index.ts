import request from "@/utils/request";
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

export function loginApi(data: LoginData): Promise<LoginResult> {
  console.log('=== loginApi START ===');
  console.log('Data to send:', data);
  console.log('Keys:', Object.keys(data));
  console.log('code:', data.code);
  console.log('key:', data.key);
  
  return request({
      url: "/api/auth/login",
      method: "post",
      data: data,
    }) as Promise<LoginResult>;
}

export function logoutApi(): Promise<void> {
  return request({
    url: "/api/auth/logout",
    method: "post",
  }) as Promise<void>;
}

export function sendSmsCodeApi(data: SendSmsCodeRequest): Promise<void> {
  return request({
    url: "/api/phone/send-phone-auth-code",
    method: "post",
    data: data,
  }) as Promise<void>;
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

export function registerApi(data: RegisterRequest): Promise<RegisterResponse> {
  return request({
    url: "/api/auth/register",
    method: "post",
    data: data,
  }) as Promise<RegisterResponse>;
}

export function getSmsCodeApi(phone: string): Promise<void> {
  return sendSmsCodeApi({ phone, codeType: 'register' });
}

export interface CaptchaResponse {
  key: string;
  image: string;
}

export function getCaptchaApi(): Promise<CaptchaResponse> {
  return request({
    url: "/api/captcha/get",
    method: "get",
  }) as Promise<CaptchaResponse>;
}

export interface QRCodeLoginRequest {
  authCode: string;
  codeVerifier: string;
  state: string;
  qrcodeId: string;
}

export function qrcodeLoginApi(data: QRCodeLoginRequest): Promise<LoginResult> {
  return request({
    url: "/api/auth/qrcode-login",
    method: "post",
    data: data,
  }) as Promise<LoginResult>;
}

export function phoneLoginApi(data: PhoneLoginRequest): Promise<LoginResult> {
  return request({
    url: "/api/phone/login",
    method: "post",
    data: data,
  }) as Promise<LoginResult>;
}

export function getSocialPlatformsApi(): Promise<SocialChannelDTO[]> {
  return request({
    url: "/api/social/platforms",
    method: "get",
  }) as Promise<SocialChannelDTO[]>;
}

export function getEnabledSocialPlatformsApi(appId: string): Promise<SocialChannelDTO[]> {
  return request({
    url: `/api/social/${appId}/enabled-platforms`,
    method: "get",
  });
}

export function socialLoginApi(appId: string, data: SocialLoginRequest): Promise<LoginResult> {
  return request({
    url: `/api/social/${appId}/login`,
    method: "post",
    data: data,
  }) as Promise<LoginResult>;
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

  const response = await axios.post<OAuthTokenResponse>(
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

  const response = await axios.post<OAuthTokenResponse>(
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

  const response = await axios.get<OAuthUserInfoResponse>(
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

  const response = await axios.post<OAuthIntrospectResponse>(
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

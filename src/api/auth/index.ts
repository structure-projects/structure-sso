// import request from "@/utils/request";
import {client} from '@structure-projects/gateway-client';
import {
  LoginData,
  LoginResult,
  PhoneLoginRequest,
  SendSmsCodeRequest,
  SocialLoginRequest,
  SocialChannelDTO
} from "./types";

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

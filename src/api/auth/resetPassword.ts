import request from '@/utils/request';

// ============================================================
// 类型定义
// ============================================================

/** 密保问题项 */
export interface SecurityQuestion {
  /** 问题ID */
  questionId: string;
  /** 问题内容 */
  question: string;
}

/** 发送手机验证码请求 */
export interface SendPhoneCodeRequest {
  /** 手机号 */
  phone: string;
  /** 场景类型: reset-password */
  scene: string;
}

/** 发送手机验证码响应 */
export interface SendPhoneCodeResponse {
  success: boolean;
  message?: string;
}

/** 校验密保答案请求 */
export interface VerifySecurityAnswerRequest {
  /** 用户名/手机号/邮箱 */
  identifier: string;
  /** 密保答案列表，按顺序对应问题 */
  answers: SecurityAnswerItem[];
}

/** 密保答案项 */
export interface SecurityAnswerItem {
  /** 问题ID */
  questionId: string;
  /** 用户输入的答案 */
  answer: string;
}

/** 校验密保答案响应 */
export interface VerifySecurityAnswerResponse {
  success: boolean;
  /** 验证通过的凭证 token，用于后续重置密码 */
  verifyToken: string;
  message?: string;
}

/** 校验手机验证码请求 */
export interface VerifyPhoneCodeRequest {
  /** 手机号 */
  phone: string;
  /** 验证码 */
  code: string;
  /** 场景类型 */
  scene: string;
}

/** 校验手机验证码响应 */
export interface VerifyPhoneCodeResponse {
  success: boolean;
  /** 验证通过的凭证 token，用于后续重置密码 */
  verifyToken: string;
  message?: string;
}

/** 重置密码请求 */
export interface ResetPasswordRequest {
  /** 身份验证后获得的 verifyToken */
  verifyToken: string;
  /** 新密码 */
  newPassword: string;
}

/** 重置密码响应 */
export interface ResetPasswordResponse {
  success: boolean;
  message?: string;
}

// ============================================================
// Mock 开关 - 后端 API 未就绪时设为 true
// ============================================================
// TODO: 后端 API 实现后改为 false
const USE_MOCK = true;

// ============================================================
// Mock 数据 - 仅用于开发测试
// ============================================================
const MOCK_QUESTIONS: SecurityQuestion[] = [
  { questionId: 'q1', question: '您母亲的名字是？' },
  { questionId: 'q2', question: '您的出生城市是？' },
  { questionId: 'q3', question: '您的小学校名是？' },
];

const MOCK_ANSWERS: Record<string, string> = {
  q1: '李丽',
  q2: '北京',
  q3: '第一小学',
};

// ============================================================
// API 函数
// ============================================================

/**
 * 获取用户的密保问题列表
 * GET /user/api/users/security-questions?identifier=xxx
 *
 * TODO: 与后端约定接口路径和参数格式
 */
export async function getSecurityQuestions(
  identifier: string
): Promise<{ data: SecurityQuestion[] }> {
  if (USE_MOCK) {
    // Mock: 仅当 identifier 非空时返回问题列表
    await mockDelay(300);
    if (!identifier || identifier.trim() === '') {
      throw new Error('请输入有效的账号信息');
    }
    return { data: MOCK_QUESTIONS };
  }

  const response = await request({
    url: '/user/api/users/security-questions',
    method: 'get',
    params: { identifier },
  });
  return { data: response as SecurityQuestion[] };
}

/**
 * 校验密保问题答案
 * POST /user/api/users/verify-security-answer
 *
 * TODO: 与后端约定接口路径和参数格式
 */
export async function verifySecurityAnswer(
  params: VerifySecurityAnswerRequest
): Promise<VerifySecurityAnswerResponse> {
  if (USE_MOCK) {
    await mockDelay(500);
    // Mock: 检查所有答案是否匹配
    const allCorrect = params.answers.every(
      (item) => MOCK_ANSWERS[item.questionId] === item.answer
    );
    if (!allCorrect) {
      throw new Error('密保答案验证失败，请检查答案');
    }
    return {
      success: true,
      verifyToken: 'mock-verify-token-' + Date.now(),
    };
  }

  const response = await request({
    url: '/user/api/users/verify-security-answer',
    method: 'post',
    data: params,
  });
  return response as VerifySecurityAnswerResponse;
}

/**
 * 发送手机验证码（用于找回密码场景）
 * POST /user/api/users/send-phone-code
 *
 * TODO: 与后端约定接口路径和参数格式
 */
export async function sendPhoneCode(
  params: SendPhoneCodeRequest
): Promise<SendPhoneCodeResponse> {
  if (USE_MOCK) {
    await mockDelay(300);
    if (!params.phone || !/^1[3-9]\d{9}$/.test(params.phone)) {
      throw new Error('手机号格式不正确');
    }
    console.log(`[Mock] 验证码已发送到 ${params.phone}，验证码: 123456`);
    return { success: true, message: '验证码已发送' };
  }

  const response = await request({
    url: '/user/api/users/send-phone-code',
    method: 'post',
    data: params,
  });
  return response as SendPhoneCodeResponse;
}

/**
 * 校验手机验证码（找回密码场景）
 * POST /user/api/users/verify-phone-code
 *
 * TODO: 与后端约定接口路径和参数格式
 */
export async function verifyPhoneCode(
  params: VerifyPhoneCodeRequest
): Promise<VerifyPhoneCodeResponse> {
  if (USE_MOCK) {
    await mockDelay(300);
    if (params.code !== '123456') {
      throw new Error('验证码错误，请检查后重试');
    }
    return {
      success: true,
      verifyToken: 'mock-verify-token-phone-' + Date.now(),
    };
  }

  const response = await request({
    url: '/user/api/users/verify-phone-code',
    method: 'post',
    data: params,
  });
  return response as VerifyPhoneCodeResponse;
}

/**
 * 重置密码
 * POST /user/api/users/reset-password
 *
 * TODO: 与后端约定接口路径和参数格式
 */
export async function resetPassword(
  params: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  if (USE_MOCK) {
    await mockDelay(400);
    if (!params.newPassword || params.newPassword.length < 8) {
      throw new Error('密码长度不能少于8位');
    }
    console.log('[Mock] 密码重置成功');
    return { success: true, message: '密码重置成功' };
  }

  const response = await request({
    url: '/user/api/users/reset-password',
    method: 'post',
    data: params,
  });
  return response as ResetPasswordResponse;
}

// ============================================================
// 工具函数
// ============================================================

function mockDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 检测账号标识类型（手机号/邮箱/用户名）
 */
export function detectIdentifierType(identifier: string): 'PHONE' | 'EMAIL' | 'USERNAME' {
  const phoneRegex = /^1[3-9]\d{9}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (phoneRegex.test(identifier)) return 'PHONE';
  if (emailRegex.test(identifier)) return 'EMAIL';
  return 'USERNAME';
}

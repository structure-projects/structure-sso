/**
 * OAuth 2.0 配置
 */
export interface OAuthConfig {
  /**
   * OAuth 服务端地址
   */
  baseUrl: string;
  /**
   * 客户端 ID
   */
  clientId: string;
  /**
   * 客户端密钥
   */
  clientSecret: string;
  /**
   * 重定向 URI
   */
  redirectUri: string;
  /**
   * 授权范围
   */
  scope: string;
  /**
   * 授权端点
   */
  authorizeEndpoint: string;
  /**
   * 令牌端点
   */
  tokenEndpoint: string;
  /**
   * 令牌内省端点
   */
  introspectEndpoint: string;
  /**
   * 用户信息端点
   */
  userInfoEndpoint: string;
}

/**
 * 社交登录配置
 */
export interface SocialLoginConfig {
  /**
   * 社交应用ID
   */
  appId: string;
}

/**
 * 获取社交登录配置
 */
export function getSocialLoginConfig(): SocialLoginConfig {
  return {
    appId: import.meta.env.VITE_SOCIAL_APP_ID || 'default-app',
  };
}

/**
 * 生成随机 state 参数
 */
export function generateState(): string {
  const array = new Uint32Array(8);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) =>
    ('0' + byte.toString(16)).slice(-2)
  ).join('');
}

/**
 * 生成随机 code_verifier
 */
export function generateCodeVerifier(): string {
  const array = new Uint32Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) =>
    ('0' + byte.toString(16)).slice(-2)
  ).join('');
}

/**
 * 生成 code_challenge (SHA256 + Base64URL)
 */
export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * 获取 OAuth 配置
 */
export function getOAuthConfig(): OAuthConfig {
  return {
    baseUrl: import.meta.env.VITE_OAUTH_BASE_URL || 'http://localhost:18103',
    clientId: import.meta.env.VITE_OAUTH_CLIENT_ID || 'test-client',
    clientSecret: import.meta.env.VITE_OAUTH_CLIENT_SECRET || 'secret',
    redirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI || 'http://localhost:17103/#/oauth2/callback',
    scope: import.meta.env.VITE_OAUTH_SCOPE || 'read write',
    authorizeEndpoint: import.meta.env.VITE_OAUTH_AUTHORIZE_ENDPOINT || '/oauth2/authorize',
    tokenEndpoint: import.meta.env.VITE_OAUTH_TOKEN_ENDPOINT || '/oauth2/token',
    introspectEndpoint: import.meta.env.VITE_OAUTH_INTROSPECT_ENDPOINT || '/oauth2/introspect',
    userInfoEndpoint: import.meta.env.VITE_OAUTH_USER_INFO_ENDPOINT || '/oauth2/userinfo',
  };
}

/**
 * 构建授权 URL
 */
export function buildAuthorizeUrl(config: OAuthConfig, state: string, codeChallenge?: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope,
    state: state,
  });
  
  if (codeChallenge) {
    params.append('code_challenge', codeChallenge);
    params.append('code_challenge_method', 'S256');
  }
  
  return `${config.baseUrl}${config.authorizeEndpoint}?${params.toString()}`;
}

/**
 * Token响应
 */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

/**
 * 通过授权码获取Token
 */
export async function getTokenByCode(config: OAuthConfig, code: string, codeVerifier?: string): Promise<TokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    code: code,
  });
  
  if (codeVerifier) {
    params.append('code_verifier', codeVerifier);
  }
  
  const response = await fetch(`${config.baseUrl}${config.tokenEndpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  
  if (!response.ok) {
    throw new Error(`获取Token失败: ${response.status}`);
  }
  
  return response.json() as TokenResponse;
}

/**
 * 存储state和codeVerifier到sessionStorage
 */
export function saveOAuthState(state: string, codeVerifier?: string): void {
  sessionStorage.setItem('oauth_state', state);
  if (codeVerifier) {
    sessionStorage.setItem('oauth_code_verifier', codeVerifier);
  }
}

/**
 * 获取存储的state
 */
export function getSavedOAuthState(): string | null {
  return sessionStorage.getItem('oauth_state');
}

/**
 * 获取存储的codeVerifier
 */
export function getSavedCodeVerifier(): string | null {
  return sessionStorage.getItem('oauth_code_verifier');
}

/**
 * 清除OAuth状态
 */
export function clearOAuthState(): void {
  sessionStorage.removeItem('oauth_state');
  sessionStorage.removeItem('oauth_code_verifier');
}

/**
 * 验证state是否匹配
 */
export function validateState(state: string): boolean {
  const savedState = getSavedOAuthState();
  return savedState === state;
}

/**
 * 用户信息响应
 */
export interface UserInfoResponse {
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  nickname?: string;
  preferred_username?: string;
  profile?: string;
  picture?: string;
  website?: string;
  email?: string;
  email_verified?: boolean;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  phone_number?: string;
  phone_number_verified?: boolean;
  address?: {
    formatted?: string;
    street_address?: string;
    locality?: string;
    region?: string;
    postal_code?: string;
    country?: string;
  };
  updated_at?: number;
  roles?: string[];
  permissions?: string[];
}

/**
 * 通过refresh_token获取新的access_token
 */
export async function refreshToken(config: OAuthConfig, refreshToken: string): Promise<TokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: refreshToken,
  });
  
  const response = await fetch(`${config.baseUrl}${config.tokenEndpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  
  if (!response.ok) {
    throw new Error(`刷新Token失败: ${response.status}`);
  }
  
  return response.json() as TokenResponse;
}

/**
 * 获取用户信息
 */
export async function getUserInfo(config: OAuthConfig, accessToken: string): Promise<UserInfoResponse> {
  const response = await fetch(`${config.baseUrl}${config.userInfoEndpoint}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`获取用户信息失败: ${response.status}`);
  }
  
  return response.json() as UserInfoResponse;
}

/**
 * 验证Token是否有效
 */
export async function introspectToken(config: OAuthConfig, token: string): Promise<boolean> {
  const params = new URLSearchParams({
    token: token,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });
  
  const response = await fetch(`${config.baseUrl}${config.introspectEndpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  
  if (!response.ok) {
    return false;
  }
  
  const result = await response.json() as { active: boolean };
  return result.active === true;
}

/**
 * 存储Token到localStorage
 */
export function saveToken(token: TokenResponse): void {
  localStorage.setItem('oauth_token', JSON.stringify(token));
  const expiresAt = Date.now() + token.expires_in * 1000;
  localStorage.setItem('oauth_token_expires_at', expiresAt.toString());
}

/**
 * 获取存储的Token
 */
export function getSavedToken(): TokenResponse | null {
  const tokenStr = localStorage.getItem('oauth_token');
  return tokenStr ? JSON.parse(tokenStr) : null;
}

/**
 * 清除存储的Token
 */
export function clearToken(): void {
  localStorage.removeItem('oauth_token');
  localStorage.removeItem('oauth_token_expires_at');
}

/**
 * 检查Token是否过期
 */
export function isTokenExpired(): boolean {
  const expiresAtStr = localStorage.getItem('oauth_token_expires_at');
  if (!expiresAtStr) {
    return true;
  }
  const expiresAt = parseInt(expiresAtStr, 10);
  return Date.now() > expiresAt;
}

/**
 * 自动刷新Token（如果即将过期）
 */
export async function autoRefreshToken(config: OAuthConfig): Promise<TokenResponse | null> {
  const token = getSavedToken();
  if (!token || !token.refresh_token) {
    return null;
  }
  
  if (!isTokenExpired()) {
    return token;
  }
  
  try {
    const newToken = await refreshToken(config, token.refresh_token);
    saveToken(newToken);
    return newToken;
  } catch (error) {
    console.error('自动刷新Token失败:', error);
    clearToken();
    return null;
  }
}

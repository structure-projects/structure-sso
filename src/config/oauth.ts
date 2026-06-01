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
    baseUrl: import.meta.env.VITE_OAUTH_BASE_URL || 'http://localhost:9000',
    clientId: import.meta.env.VITE_OAUTH_CLIENT_ID || 'test-client',
    clientSecret: import.meta.env.VITE_OAUTH_CLIENT_SECRET || 'secret',
    redirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI || 'http://localhost:3000/callback',
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

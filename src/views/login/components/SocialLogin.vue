<template>
  <div class="social-login">
    <div class="social-description">
      <p>使用以下社交账号快速登录</p>
    </div>

    <!-- 社交平台按钮列表 - 使用动态网格布局 -->
    <!-- 根据平台数量自动调整：1-3个平台直接显示，超过3个显示前3个 -->
    <div class="social-buttons" :style="gridStyle">
      <div
        v-for="provider in displayedProviders"
        :key="provider.key"
        :class="['social-button', provider.key]"
        :disabled="isLoading"
        @click="handleSocialLogin(provider)"
      >
        <div class="social-icon">
          <SocialIcons :type="provider.key" :size="36" />
        </div>
        <span class="social-name">{{ provider.name }}</span>
      </div>
    </div>

    <!-- 展开前的更多按钮（未展开状态显示） -->
    <div v-if="hasMoreProviders && !showAll" class="more-button-wrapper">
      <div
        class="more-button"
        @click="toggleShowAll"
      >
        <span class="more-text">更多登录方式</span>
        <span class="more-arrow">↓</span>
      </div>
    </div>

    <!-- 展开后的额外平台列表 + 收起按钮 -->
    <div v-if="showAll && hasMoreProviders" class="more-platforms-section">
      <!-- 额外平台列表 - 使用和主列表相同的网格布局 -->
      <div class="more-platforms" :style="gridStyle">
        <div
          v-for="provider in hiddenProviders"
          :key="provider.key"
          :class="['social-button', provider.key]"
          :disabled="isLoading"
          @click="handleSocialLogin(provider)"
        >
          <div class="social-icon">
            <SocialIcons :type="provider.key" :size="36" />
          </div>
          <span class="social-name">{{ provider.name }}</span>
        </div>
      </div>

      <!-- 收起按钮（在额外平台下方） -->
      <div class="more-button-wrapper">
        <div
          class="more-button"
          @click="toggleShowAll"
        >
          <span class="more-text">收起</span>
          <span class="more-arrow">↑</span>
        </div>
      </div>
    </div>

    <div class="social-tips">
      <p>登录即表示同意
        <a href="javascript:void(0)" class="agreement-link" @click.prevent="handleOpenAgreement('user')">《用户协议》</a>
        和
        <a href="javascript:void(0)" class="agreement-link" @click.prevent="handleOpenAgreement('privacy')">《隐私政策》</a>
      </p>
    </div>

    <!-- 协议弹窗 -->
    <AgreementModal
      v-model="agreementModalVisible"
      :type="agreementType"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import SocialIcons from './SocialIcons.vue';
import AgreementModal from './AgreementModal.vue';
import { getEnabledSocialPlatformsApi, socialLoginApi } from '@/api/auth';
import type { SocialChannelDTO } from '@/api/auth/types';
import { getSocialLoginConfig } from '@/config/oauth';

interface Props {
  formData?: any;
  disabled?: boolean;
  appId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  appId: () => getSocialLoginConfig().appId,
});

const emit = defineEmits<{
  (e: 'update:form-data', data: any): void;
  (e: 'login', data: any): void;
  (e: 'platforms-loaded', hasPlatforms: boolean): void;
}>();

interface SocialProvider {
  key: 'wechat' | 'qq' | 'weibo' | 'feishu' | 'dingtalk' | 'wework';
  name: string;
  authorizeUrl?: string;
  appId?: string;
  channelCode: string;
  scope?: string;
}

const socialProviders = ref<SocialProvider[]>([]);
const isLoading = ref(false);
const showAll = ref(false);
const agreementModalVisible = ref(false);
const agreementType = ref<'user' | 'privacy'>('user');

const MAX_VISIBLE = 3;

const hasMoreProviders = computed(() => {
  return socialProviders.value.length > MAX_VISIBLE;
});

const hiddenCount = computed(() => {
  return socialProviders.value.length - MAX_VISIBLE;
});

const displayedProviders = computed(() => {
  if (socialProviders.value.length <= MAX_VISIBLE) {
    return socialProviders.value;
  }
  return socialProviders.value.slice(0, MAX_VISIBLE);
});

const hiddenProviders = computed(() => {
  if (socialProviders.value.length <= MAX_VISIBLE) {
    return [];
  }
  return socialProviders.value.slice(MAX_VISIBLE);
});

function toggleShowAll() {
  showAll.value = !showAll.value;
}

const gridColumns = computed(() => {
  const count = socialProviders.value.length;
  
  if (count <= 1) return 1;
  if (count === 2) return 2;
  return 3;
});

const gridStyle = computed(() => {
  return {
    gridTemplateColumns: `repeat(${gridColumns.value}, 1fr)`
  };
});

async function loadEnabledPlatforms() {
  try {
    const channels: SocialChannelDTO[] = await getEnabledSocialPlatformsApi(props.appId) || [];
    
    socialProviders.value = channels
      .filter(channel => {
        const key = channel.channelCode.toLowerCase();
        return key !== 'oauth' && mapChannelCodeToKey(channel.channelCode) !== null;
      })
      .map(channel => {
        const provider: SocialProvider = {
          key: mapChannelCodeToKey(channel.channelCode)!,
          name: channel.channelName,
          channelCode: channel.channelCode,
          authorizeUrl: channel.authUrl,
          scope: channel.scope,
        };
        return provider;
      });
    
    emit('platforms-loaded', socialProviders.value.length > 0);
  } catch (error) {
    console.error('Failed to load enabled platforms:', error);
    socialProviders.value = [];
    emit('platforms-loaded', false);
  }
}

function mapChannelCodeToKey(channelCode: string): SocialProvider['key'] | null {
  const mapping: Record<string, SocialProvider['key']> = {
    'wechat': 'wechat',
    'weChat': 'wechat',
    'qq': 'qq',
    'weibo': 'weibo',
    'feishu': 'feishu',
    'feiShu': 'feishu',
    'dingtalk': 'dingtalk',
    'dingTalk': 'dingtalk',
    'wework': 'wework',
    'weCom': 'wework',
  };
  return mapping[channelCode] || null;
}

async function handleSocialLogin(provider: SocialProvider) {
  if (props.disabled || isLoading.value) return;

  isLoading.value = true;

  const state = `${provider.key}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('oauth_state', state);
  sessionStorage.setItem('oauth_platform', provider.channelCode);

  const redirectUri = encodeURIComponent(`${window.location.origin}/login/callback`);
  
  if (provider.authorizeUrl) {
    const authUrl = buildAuthUrl(provider, state, redirectUri);
    setTimeout(() => {
      window.location.href = authUrl;
      isLoading.value = false;
    }, 50);
  } else {
    isLoading.value = false;
  }
}

function buildAuthUrl(provider: SocialProvider, state: string, redirectUri: string): string {
  const scope = provider.scope || '';
  
  switch (provider.key) {
    case 'wechat':
      return `${provider.authorizeUrl}?appid=${provider.appId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope || 'snsapi_login'}&state=${state}#wechat_redirect`;

    case 'qq':
      return `${provider.authorizeUrl}?response_type=code&client_id=${provider.appId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope || 'get_user_info'}`;

    case 'feishu':
      return `${provider.authorizeUrl}?app_id=${provider.appId}&redirect_uri=${redirectUri}&response_type=code&state=${state}`;

    case 'dingtalk':
      return `${provider.authorizeUrl}?appid=${provider.appId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope || 'snsapi_login'}&state=${state}&prompt=consent`;

    case 'wework':
      return `${provider.authorizeUrl}?appid=${provider.appId}&redirect_uri=${redirectUri}&state=${state}`;

    default:
      return `${provider.authorizeUrl}?redirect_uri=${redirectUri}&response_type=code&state=${state}${scope ? `&scope=${scope}` : ''}`;
  }
}

function handleOpenAgreement(type: 'user' | 'privacy') {
  agreementType.value = type;
  agreementModalVisible.value = true;
}

onMounted(() => {
  loadEnabledPlatforms();
});
</script>

<style lang="scss" scoped>
/* 社交登录容器样式 */
.social-login {
  padding: 20px 0;
}

/* 社交登录描述区域样式 */
.social-description {
  text-align: center;
  margin-bottom: 24px;

  p {
    color: var(--el-text-color-secondary);
    font-size: 14px;
    margin: 0;
  }
}

/* 社交平台按钮网格容器样式 - 移除固定列数，由 JS 动态控制 */
.social-buttons {
  display: grid;
  /* grid-template-columns 通过 :style 动态绑定 */
  gap: 16px;
  margin-bottom: 0;
}

/* 更多按钮容器样式 - 独立于社交平台按钮网格 */
.more-button-wrapper {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}

/* 更多按钮样式 */
.more-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: transparent;

  &:hover {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    
    .more-text {
      color: var(--el-color-primary);
    }
    
    .more-arrow {
      color: var(--el-color-primary);
    }
  }
}

/* 更多按钮文字样式 */
.more-text {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  font-weight: 500;
  transition: color 0.3s ease;
}

/* 更多按钮箭头样式 */
.more-arrow {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  transition: color 0.3s ease;
}

/* 展开后的额外平台区域容器样式 */
.more-platforms-section {
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-extra-light);
}

/* 展开后的额外平台列表容器样式 - 与主列表保持一致 */
.more-platforms {
  display: grid;
  /* grid-template-columns 通过 :style 动态绑定，与主列表一致 */
  gap: 16px;
  margin-bottom: 16px;
}

/* 社交平台按钮基础样式 */
.social-button {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--el-bg-color);

  /* 悬停效果 */
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  /* 点击效果 */
  &:active:not(:disabled) {
    transform: translateY(0);
  }

  /* 禁用状态样式 */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* 微信平台悬停样式 */
  &.wechat:hover:not(:disabled) {
    border-color: #07c160;
  }

  /* QQ平台悬停样式 */
  &.qq:hover:not(:disabled) {
    border-color: #12b7f5;
  }

  /* 飞书平台悬停样式 */
  &.feishu:hover:not(:disabled) {
    border-color: #0064ff;
  }

  /* 钉钉平台悬停样式 */
  &.dingtalk:hover:not(:disabled) {
    border-color: #1677ff;
  }

  /* 企业微信平台悬停样式 */
  &.wework:hover:not(:disabled) {
    border-color: #00b38a;
  }

  /* OAuth 2.0 平台悬停样式 */
  &.oauth:hover:not(:disabled) {
    border-color: #7e57c2;
  }
}

/* 社交平台图标容器样式 */
.social-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 社交平台名称样式 */
.social-name {
  font-size: 13px;
  color: var(--el-text-color-primary);
  font-weight: 500;
}

/* 用户协议提示区域样式 */
.social-tips {
  text-align: center;
  font-size: 12px;
  color: var(--el-text-color-secondary);

  a {
    color: var(--el-color-primary);
    text-decoration: none;
    margin: 0 2px;

    /* 链接悬停样式 */
    &:hover {
      text-decoration: underline;
    }
  }
}

/* 平板设备响应式样式（屏幕宽度 ≤ 768px） */
@media (max-width: 768px) {
  .social-buttons,
  .more-platforms {
    gap: 12px;
  }

  .social-button {
    padding: 16px 10px;
  }

  .social-icon {
    width: 32px;
    height: 32px;
  }

  .social-name {
    font-size: 12px;
  }
}

/* 大屏幕设备响应式样式（屏幕宽度 ≥ 1200px） */
@media (min-width: 1200px) {
  .social-buttons,
  .more-platforms {
    gap: 20px;
  }
}

/* 小屏幕设备响应式样式（屏幕宽度 ≤ 480px） */
@media (max-width: 480px) {
  .social-buttons,
  .more-platforms {
    gap: 10px;
  }

  .social-button {
    padding: 14px 8px;
  }

  .social-icon {
    width: 28px;
    height: 28px;
  }

  .social-name {
    font-size: 11px;
  }

  .more-button {
    padding: 8px 16px;
  }
}
</style>

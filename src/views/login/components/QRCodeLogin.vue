<template>
  <div class="qrcode-login">
    <div class="qrcode-container">
      <!-- 二维码图片（从后端 base64 生成） -->
      <div class="qrcode-wrapper" v-loading="loading" element-loading-text="正在生成二维码...">
        <img
          v-if="qrCodeImage"
          :src="qrCodeImage"
          alt="扫码登录二维码"
          :class="['qrcode-image', { 'is-expired': expired }]"
          @error="onImageError"
          @click="onImageClick"
        />

        <!-- 失效遮罩：覆盖在二维码上方，支持点击刷新 -->
        <div
          v-if="expired && qrCodeImage"
          class="qrcode-overlay"
          @click="refreshQRCode"
        >
          <el-icon :size="48" color="#f56c6c"><WarningFilled /></el-icon>
          <p>二维码已失效</p>
          <el-button type="primary" size="small" @click.stop="refreshQRCode">
            刷新二维码
          </el-button>
        </div>

        <div v-else-if="!qrCodeImage && !loading" class="qrcode-failed">
          <el-icon :size="48"><WarningFilled /></el-icon>
          <p>二维码生成失败</p>
          <el-button type="primary" size="small" @click="refreshQRCode">
            刷新二维码
          </el-button>
        </div>
      </div>

      <!-- 状态提示 -->
      <div class="qrcode-tip" v-if="!loading && !expired && qrCodeImage">
        <template v-if="waiting">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>等待扫码确认...</span>
        </template>
        <template v-else-if="scanning">
          <el-icon color="#409eff"><View /></el-icon>
          <span>已扫码，请在手机上确认登录</span>
        </template>
      </div>
    </div>

    <div class="qrcode-desc">
      <p>请使用 <strong>App</strong> 扫码登录</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Loading, View, WarningFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import {
  createQRCodeApi,
  qrcodeLoginApi,
  subscribeQRCodeSSE,
  generateCodeVerifier,
  generateCodeChallenge,
  type QRCodeStatusResponse,
  type QRCodeStatus
} from '@/api/auth';
import { saveToken, type TokenResponse } from '@/config/oauth';

const emit = defineEmits<{
  login: [result: Record<string, unknown>];
}>();

const loading = ref(true);
const waiting = ref(false);
const scanning = ref(false);
const expired = ref(false);

const qrcodeId = ref('');
const qrCodeImage = ref('');

// PKCE
let codeVerifier = '';
const authCode = ref('');
const state = ref('');

// SSE 取消控制器
let abortController: AbortController | null = null;

/**
 * 生成二维码
 */
async function generateQRCode() {
  loading.value = true;
  waiting.value = false;
  scanning.value = false;
  expired.value = false;
  qrCodeImage.value = '';

  try {
    // 1. PKCE: 生成 code_verifier 和 code_challenge
    codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // 2. 请求后端创建二维码（含 PKCE challenge + base64 图片）
    const response = await createQRCodeApi({
      appId: 'default',
      codeChallenge,
      codeChallengeMethod: 'S256'
    });

    qrcodeId.value = response.qrcodeId;
    qrCodeImage.value = response.qrcodeImage;
    waiting.value = true;

    // 3. 启动 SSE 订阅状态变更
    startSSESubscription(response.qrcodeId);

  } catch (error: any) {
    ElMessage.error(error?.message || '生成二维码失败，请重试');
    expired.value = true;
  } finally {
    loading.value = false;
  }
}

/**
 * 通过 SSE 订阅二维码状态变更（替代轮询）
 */
function startSSESubscription(id: string) {
  // 取消之前的 SSE 连接
  stopSSESubscription();

  abortController = new AbortController();

  subscribeQRCodeSSE(
    id,
    {
      onStatusChange: (data: QRCodeStatusResponse) => {
        handleStatusChange(data);
      },
      onTimeout: () => {
        console.log('SSE 连接超时，二维码可能已过期');
        expired.value = true;
        waiting.value = false;
        scanning.value = false;
        stopSSESubscription();
      },
      onError: () => {
        // EventSource 会自动重连，不需要手动处理
        console.log('SSE 连接异常，等待自动重连...');
      }
    },
    abortController.signal
  );
}

/**
 * 处理状态变更
 */
async function handleStatusChange(data: QRCodeStatusResponse) {
  switch (data.status as QRCodeStatus) {
    case 'WAITING':
      waiting.value = true;
      scanning.value = false;
      break;

    case 'SCANNED':
      waiting.value = false;
      scanning.value = true;
      break;

    case 'CONFIRMED':
      waiting.value = false;
      scanning.value = false;
      stopSSESubscription();

      // 保存 authCode 和 state 用于登录
      authCode.value = data.authCode || '';
      state.value = data.state || '';

      // 使用 PKCE code_verifier 完成登录
      await doQRCodeLogin();
      break;

    case 'EXPIRED':
      waiting.value = false;
      scanning.value = false;
      expired.value = true;
      stopSSESubscription();
      break;

    case 'CANCELLED':
      waiting.value = true;
      scanning.value = false;
      break;
  }
}

/**
 * 停止 SSE 订阅
 */
function stopSSESubscription() {
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
}

/**
 * 二维码登录（获取 token）
 */
async function doQRCodeLogin() {
  try {
    const loginResult = await qrcodeLoginApi({
      qrcodeId: qrcodeId.value,
      authCode: authCode.value,
      codeVerifier: codeVerifier,
      state: state.value
    });

    if (loginResult?.accessToken) {
      saveToken({
        access_token: loginResult.accessToken,
        token_type: loginResult.tokenType || 'Bearer',
        expires_in: loginResult.expiresIn || 3600,
        refresh_token: loginResult.refreshToken,
        scope: (loginResult as any).scope || ''
      } as TokenResponse);
    }
    ElMessage.success('登录成功');
    emit('login', { loginType: 'qrcode' });
  } catch (error: any) {
    ElMessage.error(error?.message || '二维码登录失败');
    await refreshQRCode();
  }
}

/**
 * 刷新二维码
 */
async function refreshQRCode() {
  stopSSESubscription();
  await generateQRCode();
}

/**
 * 图片加载失败处理
 */
function onImageError() {
  ElMessage.error('二维码图片加载失败');
  qrCodeImage.value = '';
  expired.value = true;
}

/**
 * 点击二维码刷新（仅在失效状态下触发）
 */
function onImageClick() {
  if (expired.value) {
    refreshQRCode();
  }
}

onMounted(() => {
  generateQRCode();
});

onUnmounted(() => {
  stopSSESubscription();
});
</script>

<style lang="scss" scoped>
.qrcode-login {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;

  .qrcode-container {
    position: relative;
    width: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .qrcode-wrapper {
    position: relative;
    width: 300px;
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;
    border-radius: 12px;
    border: 1px solid #e4e7ed;
    overflow: hidden;

    .qrcode-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 8px;
      box-sizing: border-box;
      cursor: default;

      &.is-expired {
        filter: grayscale(100%);
        opacity: 0.6;
        cursor: pointer;
      }
    }

    .qrcode-overlay,
    .qrcode-failed {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      background: rgba(255, 255, 255, 0.92);
      color: #606266;
      cursor: pointer;

      p {
        margin: 0;
        font-size: 14px;
      }
    }
  }

  .qrcode-tip {
    margin-top: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #606266;
  }

  .qrcode-desc {
    margin-top: 24px;
    text-align: center;
    color: #909399;
    font-size: 13px;

    p {
      margin: 0;
    }
  }
}
</style>

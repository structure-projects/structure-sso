<template>
  <div class="qrcode-login">
    <div class="qrcode-container">
      <div
        :class="['qrcode-wrapper', { expired: isExpired, 'border-error': isExpired }]"
        :style="{ width: '200px', height: '200px' }"
      >
        <div v-if="loading" class="qrcode-loading">
          <el-icon class="is-loading" :size="40">
            <Loading />
          </el-icon>
          <p>{{ $t('login.generatingQRCode') }}</p>
        </div>
        <div v-else-if="isExpired" class="qrcode-expired">
          <el-icon :size="48">
            <WarningFilled />
          </el-icon>
          <p>{{ $t('login.qrCodeExpired') }}</p>
          <p class="expired-tip">{{ $t('login.qrCodeExpiredTip') }}</p>
        </div>
        <img
          v-else
          :src="qrcodeUrl"
          alt="QR Code"
          class="qrcode-image"
          @load="handleQRCodeLoad"
        />
      </div>

      <div class="qrcode-actions">
        <el-button
          type="primary"
          :loading="refreshing"
          @click="refreshQRCode"
          circle
        >
          <template #icon>
            <RefreshRight />
          </template>
        </el-button>
      </div>

      <div class="scan-status">
        <div class="status-indicator" :class="scanStatus">
          <div class="status-dot"></div>
          <span class="status-text">{{ statusText }}</span>
        </div>
        <div class="status-description">
          <p v-if="scanStatus === 'waiting'">{{ $t('login.scanQRCode').replace('{appName}', currentAppName) }}</p>
          <p v-else-if="scanStatus === 'scanned'">{{ $t('login.qrCodeScanned') }}</p>
          <p v-else-if="scanStatus === 'logging'">{{ $t('login.loggingIn') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, getCurrentInstance } from 'vue';
import { RefreshRight, Loading, WarningFilled } from '@element-plus/icons-vue';
import { getOAuthConfig, generateState, generateCodeVerifier, generateCodeChallenge } from '@/config/oauth';

interface Props {
  formData?: any;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:form-data', data: any): void;
  (e: 'login', data: any): void;
}>();

const { proxy } = getCurrentInstance() || {};

const qrcodeUrl = ref('');
const loading = ref(true);
const refreshing = ref(false);
const isExpired = ref(false);
const scanStatus = ref<'waiting' | 'scanned' | 'logging'>('waiting');
const qrcodeId = ref('');
const expireTimer = ref<number | null>(null);
const pollTimer = ref<number | null>(null);
const currentAppName = '应用';
const codeVerifier = ref('');
const state = ref('');

const statusText = computed(() => {
  const statusMap = {
    waiting: proxy?.$t('login.scanStatusWaiting'),
    scanned: proxy?.$t('login.scanStatusScanned'),
    logging: proxy?.$t('login.scanStatusLogging'),
  };
  return statusMap[scanStatus.value];
});

async function generateQRCode() {
  loading.value = true;
  isExpired.value = false;
  qrcodeUrl.value = '';
  
  try {
    const config = getOAuthConfig();
    state.value = generateState();
    codeVerifier.value = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier.value);
    
    qrcodeId.value = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const loginUrl = new URL(window.location.origin + '/phone-login');
    loginUrl.searchParams.set('state', state.value);
    loginUrl.searchParams.set('code_challenge', codeChallenge);
    loginUrl.searchParams.set('code_challenge_method', 'S256');
    loginUrl.searchParams.set('qrcode_id', qrcodeId.value);
    loginUrl.searchParams.set('client_id', config.clientId);
    loginUrl.searchParams.set('redirect_uri', config.redirectUri);
    loginUrl.searchParams.set('response_type', 'code');
    loginUrl.searchParams.set('scope', config.scope);
    
    qrcodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(loginUrl.toString())}&t=${Date.now()}`;
    
    localStorage.setItem('qr_code_verifier', codeVerifier.value);
    localStorage.setItem('qr_state', state.value);
    localStorage.setItem('qr_id', qrcodeId.value);
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    loading.value = false;
  }
}

function handleQRCodeLoad() {
  loading.value = false;
  startExpireTimer();
  startScanPoll();
}

function startExpireTimer() {
  if (expireTimer.value) {
    clearTimeout(expireTimer.value);
  }

  expireTimer.value = window.setTimeout(() => {
    isExpired.value = true;
    stopScanPoll();
    clearQRCodeData();
  }, 300000);
}

function startScanPoll() {
  if (pollTimer.value) {
    clearInterval(pollTimer.value);
  }

  pollTimer.value = window.setInterval(() => {
    checkScanStatus();
  }, 2000);
}

function stopScanPoll() {
  if (pollTimer.value) {
    clearInterval(pollTimer.value);
    pollTimer.value = null;
  }
}

function clearQRCodeData() {
  localStorage.removeItem('qr_code_verifier');
  localStorage.removeItem('qr_state');
  localStorage.removeItem('qr_id');
}

function checkScanStatus() {
  if (isExpired.value || !qrcodeId.value) return;

  const authCode = localStorage.getItem('auth_code');
  const qrId = localStorage.getItem('qr_id');
  
  if (authCode && qrId === qrcodeId.value) {
    scanStatus.value = 'logging';
    stopScanPoll();
    handleLoginSuccess(authCode);
  }
}

function handleLoginSuccess(authCode: string) {
  setTimeout(() => {
    emit('login', {
      type: 'qrcode',
      qrcodeId: qrcodeId.value,
      authCode: authCode,
      codeVerifier: codeVerifier.value,
      state: state.value,
    });
    clearQRCodeData();
    localStorage.removeItem('auth_code');
  }, 1500);
}

function refreshQRCode() {
  refreshing.value = true;
  stopScanPoll();
  clearQRCodeData();

  if (expireTimer.value) {
    clearTimeout(expireTimer.value);
    expireTimer.value = null;
  }

  scanStatus.value = 'waiting';
  isExpired.value = false;

  setTimeout(() => {
    generateQRCode();
    refreshing.value = false;
  }, 500);
}

onMounted(() => {
  generateQRCode();
});

onUnmounted(() => {
  if (expireTimer.value) {
    clearTimeout(expireTimer.value);
  }
  stopScanPoll();
  clearQRCodeData();
});

defineExpose({
  refreshQRCode,
  isExpired,
  scanStatus,
});
</script>

<style lang="scss" scoped>
.qrcode-login {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
}

.qrcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.qrcode-wrapper {
  position: relative;
  border: 2px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  transition: all 0.3s ease;

  &.border-error {
    border-color: #ff4d4f;
    animation: shake 0.5s ease-in-out;
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.qrcode-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.qrcode-loading,
.qrcode-expired {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--el-text-color-regular);
  font-size: 14px;
  text-align: center;
  padding: 20px;
}

.qrcode-expired {
  color: #ff4d4f;

  .expired-tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.qrcode-actions {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.scan-status {
  text-align: center;
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;

  &.waiting { color: var(--el-color-primary); }
  &.scanned { color: #52c41a; }
  &.logging { color: #faad14; }
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: pulse 1.5s infinite;

  .waiting & {
    background: var(--el-color-primary);
  }
  .scanned & {
    background: #52c41a;
  }
  .logging & {
    background: #faad14;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

.status-description {
  font-size: 14px;
  color: var(--el-text-color-secondary);

  p {
    margin: 4px 0;
  }
}

@media (max-width: 768px) {
  .qrcode-wrapper {
    width: 180px !important;
    height: 180px !important;
  }

  .qrcode-loading,
  .qrcode-expired {
    font-size: 13px;

    .expired-tip {
      font-size: 11px;
    }
  }
}
</style>

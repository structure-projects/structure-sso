<template>
  <div class="oauth2-callback">
    <div class="callback-content">
      <div v-if="loading" class="loading-container">
        <el-spinner size="large" />
        <p class="loading-text">{{ $t('oauth2.processing') }}</p>
      </div>
      
      <div v-else-if="error" class="error-container">
        <el-icon :size="48" color="#ef4444">
          <CircleClose />
        </el-icon>
        <h3>{{ $t('oauth2.error') }}</h3>
        <p class="error-message">{{ error }}</p>
        <el-button type="primary" @click="handleRetry">
          {{ $t('common.retry') }}
        </el-button>
      </div>
      
      <div v-else class="success-container">
        <el-icon :size="48" color="#22c55e">
          <CircleCheck />
        </el-icon>
        <h3>{{ $t('oauth2.authorized') }}</h3>
        <p>{{ $t('oauth2.redirecting') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { CircleCheck, CircleClose } from '@element-plus/icons-vue';
import { 
  getOAuthConfig, 
  getTokenByCode, 
  validateState, 
  getSavedCodeVerifier, 
  clearOAuthState,
  saveToken
} from '@/config/oauth';
import { useUserStore } from '@/store';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const loading = ref(true);
const error = ref('');

async function handleCallback() {
  const code = route.query.code as string;
  const state = route.query.state as string;
  const errorParam = route.query.error as string;

  if (errorParam) {
    error.value = errorParam === 'access_denied' 
      ? '用户拒绝授权' 
      : `授权失败: ${errorParam}`;
    loading.value = false;
    return;
  }

  if (!code) {
    error.value = '未获取到授权码';
    loading.value = false;
    return;
  }

  if (!validateState(state)) {
    error.value = 'State验证失败';
    loading.value = false;
    return;
  }

  try {
    const config = getOAuthConfig();
    const codeVerifier = getSavedCodeVerifier();
    
    const tokenResponse = await getTokenByCode(config, code, codeVerifier || undefined);
    
    saveToken(tokenResponse);
    
    const redirectUrl = userStore.getRedirectUrl() || '/';
    
    clearOAuthState();
    
    router.push({ path: '/login/success', query: { redirect: redirectUrl } });
  } catch (err: any) {
    error.value = err.message || '获取Token失败';
    loading.value = false;
  }
}

function handleRetry() {
  router.push('/login');
}

onMounted(() => {
  handleCallback();
});
</script>

<style lang="scss" scoped>
.oauth2-callback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.callback-content {
  background: white;
  border-radius: 16px;
  padding: 48px 32px;
  text-align: center;
  min-width: 360px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
}

html.dark .callback-content {
  background: rgba(30, 30, 50, 0.95);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-text {
  font-size: 16px;
  color: var(--el-text-color-secondary);
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.error-container h3 {
  font-size: 20px;
  color: #ef4444;
  margin: 0;
}

.error-message {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
  max-width: 280px;
}

.success-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.success-container h3 {
  font-size: 20px;
  color: #22c55e;
  margin: 0;
}

.success-container p {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
}
</style>

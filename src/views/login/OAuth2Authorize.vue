<template>
  <div class="oauth2-authorize">
    <div class="authorize-card">
      <div class="app-info">
        <div class="app-icon">
          <el-icon :size="48">
            <FolderOpened />
          </el-icon>
        </div>
        <div class="app-details">
          <h2>{{ appName }}</h2>
          <p class="app-description">{{ $t('oauth2.requestAccess') }}</p>
        </div>
      </div>

      <div class="scope-section">
        <h3>{{ $t('oauth2.permissions') }}</h3>
        <ul class="scope-list">
          <li v-for="scope in scopes" :key="scope" class="scope-item">
            <el-icon :size="16" color="#22c55e">
              <Check />
            </el-icon>
            <span>{{ getScopeDescription(scope) }}</span>
          </li>
        </ul>
      </div>

      <div class="actions">
        <el-button type="default" @click="handleDeny">
          {{ $t('oauth2.deny') }}
        </el-button>
        <el-button type="primary" @click="handleAllow">
          {{ $t('oauth2.allow') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { FolderOpened, Check } from '@element-plus/icons-vue';
import { getOAuthConfig } from '@/config/oauth';
import { useUserStore } from '@/store';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const appName = ref('第三方应用');
const scopes = ref<string[]>([]);

const scopeDescriptions: Record<string, string> = {
  'read': '读取您的基本信息',
  'write': '修改您的基本信息',
  'openid': '获取您的身份信息',
  'profile': '获取您的个人资料',
  'email': '获取您的邮箱地址',
  'phone': '获取您的手机号码',
};

function getScopeDescription(scope: string): string {
  return scopeDescriptions[scope] || scope;
}

function handleAllow() {
  const clientId = route.query.client_id as string;
  const redirectUri = route.query.redirect_uri as string;
  const responseType = route.query.response_type as string;
  const state = route.query.state as string;
  
  userStore.saveRedirectUrl(route.fullPath);
  
  router.push({
    path: '/login',
    query: {
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: responseType,
      state: state,
    },
  });
}

function handleDeny() {
  const redirectUri = route.query.redirect_uri as string;
  const state = route.query.state as string;
  
  const url = new URL(redirectUri);
  url.searchParams.set('error', 'access_denied');
  if (state) {
    url.searchParams.set('state', state);
  }
  
  window.location.href = url.toString();
}

onMounted(() => {
  const scope = route.query.scope as string;
  scopes.value = scope ? scope.split(' ') : [];
  
  const clientId = route.query.client_id as string;
  if (clientId) {
    appName.value = clientId;
  }
});
</script>

<style lang="scss" scoped>
.oauth2-authorize {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.authorize-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
}

html.dark .authorize-card {
  background: rgba(30, 30, 50, 0.95);
}

.app-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.app-icon {
  width: 64px;
  height: 64px;
  background: var(--el-color-primary-light-9);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-color-primary);
}

.app-details h2 {
  font-size: 20px;
  margin: 0 0 8px 0;
}

.app-description {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

.scope-section {
  margin-bottom: 24px;
}

.scope-section h3 {
  font-size: 16px;
  margin: 0 0 16px 0;
}

.scope-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.scope-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 12px;
}

.actions .el-button {
  flex: 1;
  height: 44px;
  font-size: 16px;
}
</style>

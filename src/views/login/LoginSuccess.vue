<template>
  <div class="login-success-container">
    <div class="success-card">
      <div class="success-icon">
        <el-icon size="64" color="#67c23a">
          <CircleCheck />
        </el-icon>
      </div>
      
      <h1 class="success-title">登录成功</h1>
      <p class="success-desc">欢迎回来！您已成功登录系统</p>
    </div>

    <el-dialog
      v-model="showAuthDialog"
      title="授权确认"
      width="420px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="auth-dialog-content">
        <div class="auth-info">
          <el-icon size="24" color="#409eff">
            <InfoFilled />
          </el-icon>
          <div class="info-text">
            <p class="info-title">应用请求访问权限</p>
            <p class="info-desc">当前应用请求访问您的账户信息，是否授权？</p>
          </div>
        </div>
        
        <div class="auth-details">
          <div class="detail-item">
            <span class="detail-label">应用名称：</span>
            <span class="detail-value">{{ appName }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">目标地址：</span>
            <span class="detail-value redirect-url" :title="redirectUrl">{{ redirectUrl }}</span>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleAuthorize" :loading="isAuthorizing">确认授权</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/store';
import { CircleCheck, InfoFilled } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const isAuthorizing = ref(false);
const showAuthDialog = ref(false);

const redirectUrl = computed(() => {
  return route.query.redirect as string || '/';
});

const appName = computed(() => {
  return route.query.appName as string || '当前应用';
});

const needAuth = computed(() => {
  return route.query.needAuth === 'true';
});

function handleRedirect() {
  const url = redirectUrl.value;
  console.log('正在跳转到:', url);
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    window.location.href = url;
  } else {
    router.push(url);
  }
}

function handleAuthorize() {
  isAuthorizing.value = true;
  
  setTimeout(() => {
    try {
      showAuthDialog.value = false;
      handleRedirect();
    } catch (error) {
      isAuthorizing.value = false;
    }
  }, 500);
}

function handleCancel() {
  showAuthDialog.value = false;
}

onMounted(() => {
  console.log('LoginSuccess mounted, redirectUrl:', redirectUrl.value, 'needAuth:', needAuth.value);
  
  if (needAuth.value) {
    showAuthDialog.value = true;
  } else {
    const url = redirectUrl.value;
    if (url !== '/') {
      handleRedirect();
    }
  }
});
</script>

<style scoped>
.login-success-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.success-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  padding: 48px 40px;
  text-align: center;
  max-width: 480px;
  width: 100%;
}

.success-icon {
  margin-bottom: 24px;
  animation: bounce 0.6s ease;
}

@keyframes bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.success-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px;
}

.success-desc {
  font-size: 14px;
  color: #606266;
  margin: 0 0 32px;
}

.auth-dialog-content {
  padding: 10px 0;
}

.auth-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}

.info-text {
  flex: 1;
}

.info-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 6px;
}

.info-desc {
  font-size: 14px;
  color: #606266;
  margin: 0;
}

.auth-details {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.detail-label {
  color: #909399;
}

.detail-value {
  color: #303133;
  font-weight: 500;
}

.redirect-url {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .success-card {
    padding: 32px 24px;
  }
  
  .success-title {
    font-size: 24px;
  }
}
</style>

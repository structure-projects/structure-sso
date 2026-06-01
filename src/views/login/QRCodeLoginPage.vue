<template>
  <div class="login-card">
    <div class="card-header">
      <h2>扫码登录</h2>
      <p>请使用应用扫描二维码</p>
    </div>

    <div class="card-body">
      <QRCodeLogin @login="handleLogin" :loading="isLoading" />
    </div>

    <div class="card-footer">
      <div class="quick-links">
        <router-link to="/login/account">账号登录</router-link>
        <span>|</span>
        <router-link to="/login/phone">手机登录</router-link>
        <span>|</span>
        <router-link to="/register?login=/login/qrcode">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import QRCodeLogin from './components/QRCodeLogin.vue';
import { useUserStoreHook } from '@/store/modules/user';
import { LoginData } from '@/api/auth/types';

const router = useRouter();
const route = useRoute();
const userStore = useUserStoreHook();
const isLoading = ref(false);

const handleLogin = async (data: any) => {
  isLoading.value = true;
  try {
    // 这里假设扫码登录会返回用户名密码，或者需要特殊处理
    // 暂时使用与账号登录相同的逻辑
    const loginData: LoginData = {
      username: data.username || 'admin',
      password: data.password || 'admin123',
    };
    
    await userStore.login(loginData);
  } catch (error) {
    ElMessage.error('登录失败，请重试');
  } finally {
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

html.dark .login-card {
  background: rgba(30, 30, 50, 0.95);
}

.card-header {
  text-align: center;
  padding: 24px 32px 16px;
  border-bottom: 1px solid var(--el-border-color);
}

.card-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px;
}

.card-header p {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

.card-body {
  padding: 24px 32px;
  width: 360px;
}

.card-footer {
  padding: 20px 32px 24px;
  border-top: 1px solid var(--el-border-color);
}

.quick-links {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 14px;
}

.quick-links a {
  color: var(--el-color-primary);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.quick-links span {
  color: var(--el-border-color);
}

@media (max-width: 768px) {
  .card-header {
    padding: 20px;
  }

  .card-body {
    padding: 20px;
    width: auto;
  }

  .card-footer {
    padding: 16px 20px 20px;
  }
}
</style>

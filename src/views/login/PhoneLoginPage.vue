<template>
  <div class="login-card">
    <div class="card-header">
      <h2>手机号登录</h2>
      <p>请输入您的手机号</p>
    </div>

    <div class="card-body">
      <PhoneLogin @login="handleLogin" :loading="isLoading" />
    </div>

    <div class="card-footer">
      <div class="quick-links">
        <router-link to="/login/account">账号登录</router-link>
        <span>|</span>
        <router-link to="/login/qrcode">扫码登录</router-link>
        <span>|</span>
        <router-link to="/register?login=/login/phone">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import PhoneLogin from './components/PhoneLogin.vue';
import { useUserStore } from '@/store';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const isLoading = ref(false);

const handleLogin = async (data: any) => {
  if (!data.phone || !data.code) {
    ElMessage.warning('请填写手机号和验证码');
    return;
  }

  isLoading.value = true;

  try {
    await userStore.loginByPhone(data.phone, data.code);
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

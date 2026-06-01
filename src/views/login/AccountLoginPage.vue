<template>
  <div class="login-card">
    <div class="card-header">
      <h2>账号密码登录</h2>
      <p>请输入您的账号信息</p>
    </div>
    <div class="card-body">
      <AccountLogin @login="handleLogin" :loading="isLoading" />
    </div>

    <div class="card-footer" v-if="showFooter">
      <div class="quick-links">
        <router-link to="/login/phone">手机登录</router-link>
        <span>|</span>
        <router-link to="/register?login=/login/account">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import AccountLogin from './components/AccountLogin.vue';
import { useUserStore } from '@/store';
import { LoginData } from '@/api/auth/types';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const isLoading = ref(false);
const showFooter = ref(true);

function detectLoginType(identifier: string): string {
  const phoneRegex = /^1[3-9]\d{9}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (phoneRegex.test(identifier)) {
    return 'PHONE';
  } else if (emailRegex.test(identifier)) {
    return 'EMAIL';
  } else {
    return 'USERNAME';
  }
}

const handleLogin = async (data: any) => {
  if (!data.username || !data.password) {
    ElMessage.warning('请填写用户名和密码');
    return;
  }

  const redirectUrl = (route.query.redirect as string) || '/';
  userStore.saveRedirectUrl(redirectUrl);

  isLoading.value = true;

  try {
    const loginData: LoginData = {
      username: data.username,
      password: data.password,
      code: data.captcha,
      key: data.captchaId,
      loginType: detectLoginType(data.username),
    };
    
    await userStore.login(loginData);
    
    const needAuth = redirectUrl.startsWith('http://') || redirectUrl.startsWith('https://');
    
    router.push({
      path: '/login/success',
      query: {
        redirect: redirectUrl,
        needAuth: needAuth ? 'true' : 'false',
      },
    });
  } catch (error) {
    ElMessage.error('登录失败，请重试');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  const hideFooter = route.query.hideFooter as string;
  if (hideFooter === 'true' || hideFooter === '1') {
    showFooter.value = false;
  }
});
</script>

<style lang="scss" scoped>
.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
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
  margin: 0 auto;
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

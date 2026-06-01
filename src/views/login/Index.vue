<template>
  <div class="login-card">
    <!-- 忘记密码页面 -->
    <div v-if="isForgotPassword" class="step-content">
      <div class="register-container">
        <ForgotPassword
          @back="handleBackToLogin"
        />
      </div>
    </div>

    <!-- 注册页面 -->
    <div v-else-if="isRegistering" class="step-content">
      <div class="register-container">
        <RegisterForm
          back-route="/login"
          @back="handleBackToLogin"
          @register-success="handleRegisterSuccess"
        />
      </div>
    </div>

    <!-- 登录页面 -->
    <div v-else class="step-content">
      <div class="tab-header">
        <SmartTabs
          :tabs="tabs"
          v-model:active-tab="activeTab"
        />
      </div>

      <div class="tab-content">
        <div class="login-panels">
          <transition-group name="panel-slide">
            <div
              v-for="(tab, index) in tabs"
              :key="tab.key + '-panel'"
              v-show="activeTab === index"
              :class="['login-panel']"
            >
              <component
                :is="tab.component"
                :form-data="formDataMap[tab.key]"
                :disabled="isLoggingIn"
                :app-id="tab.key === 'social' ? socialConfig.appId : undefined"
                @update:form-data="(data) => handleFormDataUpdate(tab.key, data)"
                @login="handleLogin"
                @forgot-password="handleShowForgotPassword"
                @platforms-loaded="handlePlatformsLoaded"
              />
            </div>
          </transition-group>
        </div>
      </div>

      <div class="ram-link">
        <a href="http://www.baidu.com" target="_blank" class="register-link-text" @click="handleShowRegister">
          下载应用
        </a>
        <span class="link-separator">|</span>
        <a href="javascript:void(0)" class="register-link-text" @click="handleShowRegister">
          立即注册
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, markRaw, computed } from 'vue';
import { useRoute } from 'vue-router';
import router from '@/router';
import { useUserStore, usePermissionStore } from '@/store';
import { ElMessage } from 'element-plus';
import { FullScreen, Phone, User, Share, UserFilled } from '@element-plus/icons-vue';
import { LoginData } from '@/api/auth/types';
import { RouteRecordRaw } from 'vue-router';
import { getSocialLoginConfig } from '@/config/oauth';

import SmartTabs from './components/SmartTabs.vue';
import QRCodeLogin from './components/QRCodeLogin.vue';
import PhoneLogin from './components/PhoneLogin.vue';
import AccountLogin from './components/AccountLogin.vue';
import SocialLogin from './components/SocialLogin.vue';
import RegisterForm from './components/RegisterForm.vue';
import ForgotPassword from './components/ForgotPassword.vue';

const socialConfig = getSocialLoginConfig();

const route = useRoute();
const userStore = useUserStore();
const permissionStore = usePermissionStore();

const hasSocialPlatforms = ref(false);

const baseTabs = [
  { key: 'qrcode', label: '扫码登录', icon: markRaw(FullScreen), component: markRaw(QRCodeLogin) },
  { key: 'account', label: '用户名/邮箱', icon: markRaw(User), component: markRaw(AccountLogin) },
  { key: 'phone', label: '手机号登录', icon: markRaw(Phone), component: markRaw(PhoneLogin) },
];

const socialTab = { key: 'social', label: '社交账号', icon: markRaw(Share), component: markRaw(SocialLogin) };

const tabs = computed(() => {
  if (hasSocialPlatforms.value) {
    return [...baseTabs, socialTab];
  }
  return baseTabs;
});

const activeTab = ref(0);
const formDataMap = ref<{ [key: string]: any }>({
  qrcode: {},
  phone: {},
  account: {},
  social: {},
});

const isLoggingIn = ref(false);
const isRegistering = ref(false);
const isForgotPassword = ref(false);

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

function handleFormDataUpdate(key: string, data: any) {
  formDataMap.value[key] = { ...formDataMap.value[key], ...data };
}

async function handleLogin(data?: any) {
    if (!data) return;

    isLoggingIn.value = true;

    try {
      const redirectUrl = route.query.redirect as string || '/';
      userStore.saveRedirectUrl(redirectUrl);
      
      if (data.type === 'phone') {
        await userStore.loginByPhone(data.phone, data.code);
      } else {
        const loginData: LoginData = {
          username: data.username,
          password: data.password,
          code: data.captcha,
          key: data.captchaId,
          loginType: detectLoginType(data.username),
        };
        await userStore.login(loginData);
      }
      
      const needAuth = redirectUrl.startsWith('http://') || redirectUrl.startsWith('https://');
      
      router.push({
        path: '/login/success',
        query: {
          redirect: redirectUrl,
          needAuth: needAuth ? 'true' : 'false',
        },
      });
    } catch (error: any) {
      ElMessage.error(error?.message || '登录失败，请重试');
    } finally {
      isLoggingIn.value = false;
    }
  }

const handleShowRegister = () => {
  isRegistering.value = true;
};

const handleShowForgotPassword = () => {
  isForgotPassword.value = true;
};

const handleBackToLogin = () => {
  isRegistering.value = false;
  isForgotPassword.value = false;
};

const handleRegisterSuccess = () => {
  isRegistering.value = false;
};

const handlePlatformsLoaded = (hasPlatforms: boolean) => {
  hasSocialPlatforms.value = hasPlatforms;
};
</script>

<style lang="scss" scoped>
.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  width: 100%;
  max-width: 460px;
}

html.dark .login-card {
  background: rgba(30, 30, 50, 0.95);
}

.tab-header {
  padding: 20px 24px 0;
  border-bottom: 1px solid var(--el-border-color);
}

.tab-content {
  padding: 0 24px 20px;
}

.login-panels {
  position: relative;
  min-height: 280px;
}

.login-panel {
  width: 100%;
}

.ram-link {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--el-border-color);
  font-size: 14px;
}

.ram-link-text {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--el-color-primary);
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
}

.link-separator {
  color: var(--el-border-color);
}

.register-link-text {
  color: var(--el-color-primary);
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
}

.step-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: all 0.3s ease;
  position: absolute;
  width: 100%;
}

.panel-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.panel-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.panel-slide-leave-active {
  position: absolute;
}

.register-container {
  padding: 20px;
}

@media (max-width: 768px) {
  .tab-header {
    padding: 16px 16px 0;
  }
  
  .tab-content {
    padding: 0 16px 16px;
  }
  
  .ram-link {
    padding: 12px 16px;
    font-size: 13px;
  }
  
  .login-panels {
    min-height: 240px;
  }
}
</style>

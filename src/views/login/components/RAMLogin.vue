<template>
  <div class="ram-login-page">

    <!-- 主内容区域 -->
    <main class="main-content">
      <div class="login-wrapper">
        <!-- 左侧信息区域 -->
        <div class="info-panel">
          <div class="info-content">
            <h1 class="title">RAM 子账号登录</h1>
            <p class="description">
              使用云极搭 RAM 子账号安全登录系统，享受企业级身份认证服务。
            </p>
            <div class="features">
              <div class="feature-item">
                <el-icon class="feature-icon">
                  <FullScreen />
                </el-icon>
                <span>企业级安全防护</span>
              </div>
              <div class="feature-item">
                <el-icon class="feature-icon">
                  <User />
                </el-icon>
                <span>MFA 多因素认证</span>
              </div>
              <div class="feature-item">
                <el-icon class="feature-icon">
                  <Lock />
                </el-icon>
                <span>细粒度权限控制</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧登录区域 -->
        <div class="login-panel">
          <el-card class="login-card" shadow="never">
            <!-- 标签页切换 -->
            <div class="tab-header">
              <button v-for="tab in tabs" :key="tab.name" :class="['tab-item', { active: activeTab === tab.name }]"
                @click="activeTab = tab.name">
                <el-icon :component="tab.icon" class="tab-icon" />
                <span>{{ tab.label }}</span>
              </button>
            </div>

            <!-- 内容区域 -->
            <div class="tab-content">
              <!-- RAM 用户登录 -->
              <div v-show="activeTab === 'account'" class="form-container">
                <!-- 安全提示 -->
                <div v-show="isAlertVisible" class="security-alert">
                  <el-icon class="alert-icon">
                    <InfoFilled />
                  </el-icon>
                  <div  class="alert-content">
                    <p>
                      为了更好地保护您的账户及资产安全，2024年8月20日开始将陆续为所有用户开启登录时强制进行
                      <span class="highlight">MFA 多因素认证</span>，详见
                      <el-link type="primary" underline="never">公告</el-link>。
                    </p>
                    <p>
                      2024年9月20日开始将分批执行
                      <span class="highlight">2年以上未登录的闲置 RAM 用户自动禁用</span>，详见
                      <el-link type="primary" underline="never">公告</el-link>。
                    </p>
                  </div>
                </div>

                <!-- 登录表单 -->
                <el-form ref="ramFormRef" :model="formData" :rules="formRules" class="login-form">
                  <el-form-item prop="username" class="form-group">
                    <label class="form-label">
                      <span class="required-mark">*</span>
                      <span>用户名</span>
                    </label>
                    <el-input v-model="formData.username" :placeholder="usernamePlaceholder" size="large"
                      class="form-input" clearable @input="handleUsernameInput" @blur="validateField('username')" />
                    <div class="input-tip">{{ usernameTip }}</div>
                    <div v-if="errors.username" class="error-message">
                      {{ errors.username }}
                    </div>
                  </el-form-item>


                  <el-form-item class="form-group">
                    <el-button type="primary" size="large" class="submit-btn" :loading="loading" :disabled="!canSubmit"
                      @click="handleNext">
                      下一步
                    </el-button>

                  </el-form-item>
                </el-form>
                <div class="agreement-section">
                  <span>登录并使用 RAM 需遵守</span>
                  <el-link type="primary" underline="never">产品协议</el-link>
                </div>
                <!-- 底部链接 -->
                <div class="form-footer">
                  <div class="divider-line">
                    <span class="divider-text">或</span>
                  </div>
                  <el-link type="primary" underline="never" @click="goToMainLogin" class="footer-link">
                    返回主账号登录
                  </el-link>
                </div>
              </div>

              <!-- 扫码登录 -->
              <div v-show="activeTab === 'qrcode'" class="qrcode-container">
                <div class="qrcode-wrapper">
                  <div class="qrcode-box">
                    <el-icon class="qrcode-icon">
                      <Picture />
                    </el-icon>
                    <p class="qrcode-text">扫码登录</p>
                  </div>
                  <div class="qrcode-hint">
                    使用钉钉扫码登录
                  </div>
                </div>
                <div class="form-footer">
                  <div class="divider-line">
                    <span class="divider-text">或</span>
                  </div>
                  <el-link type="primary" underline="never" @click="goToMainLogin" class="footer-link">
                    返回主账号登录
                  </el-link>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watchEffect } from 'vue';
import {
  Sunny, Moon, InfoFilled, Picture, Document,
  Lock, User, FullScreen
} from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { useRouter } from 'vue-router';
import { useSettingsStore } from '@/store';
import { ThemeEnum } from '@/enums/ThemeEnum';

const router = useRouter();
const settingsStore = useSettingsStore();

const isDark = ref(settingsStore.theme === ThemeEnum.DARK);
const activeTab = ref('account');

const ramFormRef = ref<FormInstance>();
const formData = reactive({
  username: '',
});
const errors = reactive({
  username: '',
});
const loading = ref(false);

const tabs = [
  { name: 'account', label: '账号登录', icon: User },
  { name: 'qrcode', label: '扫码登录', icon: Picture },
];

const usernamePlaceholder = '<用户名>@<默认域名> 或 <用户名>@<企业别名>';
const usernameTip = '例如：username@11383226193497 或 username@company-alias';

const formRules: FormRules = {
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value || value.trim() === '') {
          callback(new Error('用户名不能为空'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
};

const canSubmit = computed(() => {
  return formData.username && formData.username.trim() !== '';
});

const toggleTheme = () => {
  const newTheme = settingsStore.theme === ThemeEnum.DARK ? ThemeEnum.LIGHT : ThemeEnum.DARK;
  settingsStore.changeTheme(newTheme);
};

watchEffect(() => {
  if (typeof window !== 'undefined' && window.innerHeight < 600) {
    document.querySelector('.page-footer')?.classList.add('hidden');
  } else {
    document.querySelector('.page-footer')?.classList.remove('hidden');
  }
});

function handleUsernameInput() {
  validateField('username');
}

function validateField(field: string) {
  ramFormRef.value?.validateField(field, (message) => {
    errors[field] = message || '';
  });
}

async function handleNext() {
  const valid = await ramFormRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  loading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('RAM登录下一步:', { username: formData.username });
  } finally {
    loading.value = false;
  }
}

function goToMainLogin() {
  router.push('/login');
}
</script>

<style lang="scss" scoped>
.ram-login-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: url(/src/assets/images/login-bg.jpg) no-repeat center right;
}

.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--el-border-color);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand-logo {
  display: flex;
  align-items: center;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--el-color-primary);
  letter-spacing: 1px;
}

.header-actions {
  display: flex;
  align-items: center;
}

.main-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  max-width: 1200px;
  width: 100%;
  align-items: center;
}

.info-panel {
  padding: 40px;
}

.info-content {
  max-width: 420px;
}

.title {
  font-size: 36px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin: 0 0 16px 0;
  line-height: 1.2;
}

.description {
  font-size: 16px;
  color: var(--el-text-color-secondary);
  line-height: 1.8;
  margin: 0 0 32px 0;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.feature-icon {
  width: 24px;
  height: 24px;
  color: var(--el-color-primary);
}

.login-panel {
  display: flex;
  justify-content: center;
}

.login-card {
  width: 100%;
  max-width: 460px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
}

:deep(.el-card__body) {
  padding: 0;
}

.tab-header {
  display: flex;
  border-bottom: 1px solid var(--el-border-color);
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  background: transparent;
  border: none;
  font-size: 15px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    color: var(--el-color-primary);
    background: rgba(0, 0, 0, 0.02);
  }

  &.active {
    color: var(--el-color-primary);
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 20%;
      right: 20%;
      height: 3px;
      background: var(--el-color-primary);
      border-radius: 2px;
    }
  }
}

.tab-icon {
  width: 18px;
  height: 18px;
}

.tab-content {
  padding: 32px;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.security-alert {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #e6f4ff 0%, #f0f7ff 100%);
  border-radius: 8px;
  border-left: 4px solid var(--el-color-primary);
}

html.dark .security-alert {
  background: rgba(64, 158, 255, 0.1);
}

.alert-icon {
  width: 20px;
  height: 20px;
  color: var(--el-color-primary);
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-content {
  flex: 1;
}

.alert-content p {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: var(--el-text-color-regular);
  line-height: 1.6;

  &:last-child {
    margin-bottom: 0;
  }
}

.highlight {
  color: #f56c6c;
  font-weight: 500;
}

.login-form {
  margin: 0;
}

.form-group {
  margin-bottom: 0;

  &:not(:last-child) {
    margin-bottom: 20px;
  }
}

.form-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 10px;
}

.required-mark {
  color: #f56c6c;
  font-size: 14px;
}

.form-input {
  width: 100%;

  :deep(.el-input__wrapper) {
    height: 48px;
    border-radius: 8px;
    border: 1px solid var(--el-border-color);
    transition: all 0.3s ease;
  }

  :deep(.el-input__wrapper:hover) {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
  }

  :deep(.el-input__wrapper.is-focus) {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.15);
  }
}

.input-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 8px;
}

.error-message {
  font-size: 13px;
  color: #f56c6c;
  margin-top: 8px;
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--el-color-primary) 0%, #3a8ee6 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;

  &:hover:not(.is-disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
  }

  &.is-disabled {
    background: #e5e6eb;
    box-shadow: none;
    color: #c9cdd4;
  }
}

.form-footer {
  margin-top: 8px;
}

.divider-line {
  display: flex;
  align-items: center;
  margin: 20px 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--el-border-color);
  }
}

.divider-text {
  padding: 0 16px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.footer-link {
  display: block;
  text-align: center;
  font-size: 14px;
}

.qrcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qrcode-wrapper {
  text-align: center;
}

.qrcode-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 50px 70px;
  border: 2px dashed var(--el-border-color);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.02);
  margin-bottom: 20px;
}

.qrcode-icon {
  width: 80px;
  height: 80px;
  color: var(--el-text-color-placeholder);
}

.qrcode-text {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-regular);
}

.qrcode-hint {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.page-footer {
  padding: 24px 40px;
  text-align: center;
  border-top: 1px solid var(--el-border-color);
  background: rgba(255, 255, 255, 0.5);
}

html.dark .page-footer {
  background: rgba(26, 26, 46, 0.5);
}

.page-footer.hidden {
  display: none;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.agreement-section {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.copyright {
  font-size: 12px;
  color: var(--el-text-color-secondary);

  p {
    margin: 4px 0;
  }
}

@media (max-width: 960px) {
  .login-wrapper {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .info-panel {
    padding: 0;
    text-align: center;
  }

  .info-content {
    max-width: 100%;
    margin: 0 auto;
  }

  .features {
    align-items: center;
  }

  .title {
    font-size: 28px;
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 12px 20px;
  }

  .main-content {
    padding: 80px 20px 30px;
  }

  .logo-text {
    font-size: 18px;
  }

  .title {
    font-size: 24px;
  }

  .features {
    display: none;
  }

  .description {
    font-size: 14px;
  }

  .tab-content {
    padding: 24px 20px;
  }

  .qrcode-box {
    padding: 40px 50px;
  }

  .qrcode-icon {
    width: 64px;
    height: 64px;
  }

  .page-footer {
    padding: 20px 20px;
  }
}
</style>

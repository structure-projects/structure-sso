<template>
  <div class="account-login">
    <el-form
      ref="accountFormRef"
      :model="formData"
      :rules="formRules"
      class="account-form"
      @submit.prevent="handleSubmit"
    >
      <el-form-item prop="username">
        <el-input
          v-model="formData.username"
          :placeholder="$t('login.usernamePlaceholder')"
          size="large"
          class="h-[48px]"
          @input="handleUsernameInput"
          @blur="validateField('username')"
        >
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="formData.password"
          :type="showPassword ? 'text' : 'password'"
          :placeholder="$t('login.passwordPlaceholder')"
          size="large"
          class="h-[48px]"
          @input="handlePasswordInput"
          @blur="validateField('password')"
        >
          <template #prefix>
            <el-icon><Lock /></el-icon>
          </template>
          <template #suffix>
            <el-icon
              class="password-toggle"
              @click="togglePasswordVisibility"
            >
              <component :is="showPassword ? 'View' : 'Hide'" />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="captcha">
        <div class="captcha-wrapper">
          <el-input
            v-model="formData.captcha"
            :placeholder="$t('login.captchaPlaceholder')"
            size="large"
            class="captcha-input h-[48px]"
            maxlength="4"
            @input="handleCaptchaInput"
            @blur="validateField('captcha')"
          />
          <div class="captcha-image" @click="refreshCaptcha">
            <img
              v-if="captchaUrl"
              :src="captchaUrl"
              :alt="$t('login.captchaCode')"
              class="captcha-img"
            />
            <div v-else class="captcha-loading">
              <el-icon class="is-loading"><Loading /></el-icon>
            </div>
          </div>
        </div>
      </el-form-item>

      <div class="form-options">
        <el-checkbox v-model="formData.remember" @change="handleRememberChange">
          {{ $t('login.remember') }}
        </el-checkbox>
        <el-link type="primary" underline="never" @click="handleForgotPassword">
          {{ $t('login.forgotPassword') }}
        </el-link>
      </div>

      <el-form-item>
        <el-button
          type="primary"
          size="large"
          class="login-button"
          :loading="loading"
          :disabled="!canSubmit || internalDisabled"
          @click="handleSubmit"
        >
          {{ $t('login.loginButton') }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted, getCurrentInstance } from 'vue';
import { User, Lock, View, Hide, Loading } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { getCaptchaApi } from '@/api/auth';

interface Props {
  formData?: any;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});
const emit = defineEmits<{
  (e: 'update:form-data', data: any): void;
  (e: 'login', data: any): void;
  (e: 'forgot-password'): void;
}>();

const { proxy } = getCurrentInstance() || {};

const accountFormRef = ref<FormInstance>();
const formData = reactive({
  username: '',
  password: '',
  captcha: '',
  remember: false,
});
const errors = reactive({
  username: '',
  password: '',
  captcha: '',
});
const showPassword = ref(false);
const loading = ref(false);
const captchaUrl = ref('');
const captchaId = ref('');
const inputType = ref<'phone' | 'email' | 'username' | ''>('');
const internalDisabled = computed(() => props.disabled || loading.value);

const formRules: FormRules = {
  username: [
    { required: true, message: proxy?.$t('login.usernameRequired'), trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (inputType.value === 'email' && !isValidEmail(value)) {
          callback(new Error(proxy?.$t('login.emailFormatError')));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  password: [
    { required: true, message: proxy?.$t('login.passwordRequired'), trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value.length < 6) {
          callback(new Error(proxy?.$t('login.passwordLengthError')));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  captcha: [
    { required: true, message: proxy?.$t('login.captchaRequired'), trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value.length !== 4) {
          callback(new Error(proxy?.$t('login.captchaLengthError')));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
};

const inputTypeText = computed(() => {
  const typeMap = {
    phone: proxy?.$t('login.inputTypePhone'),
    email: proxy?.$t('login.inputTypeEmail'),
    username: proxy?.$t('login.inputTypeUsername'),
  };
  return typeMap[inputType.value] || '';
});

const inputTypeTagType = computed(() => {
  const typeMap = {
    phone: 'success',
    email: 'warning',
    username: 'info',
  };
  return typeMap[inputType.value] || 'info';
});

const canSubmit = computed(() => {
  if (!formData.username || !formData.password || !formData.captcha) {
    return false;
  }
  if (formData.captcha.length !== 4) {
    return false;
  }
  if (inputType.value === 'email' && !isValidEmail(formData.username)) {
    return false;
  }
  return true;
});

watch(() => props.formData, (newData) => {
  if (newData) {
    Object.assign(formData, newData);
  }
}, { immediate: true, deep: true });

function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

function detectInputType(value: string) {
  const phoneRegex = /^1[3-9]\d{9}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (phoneRegex.test(value)) {
    inputType.value = 'phone';
  } else if (emailRegex.test(value)) {
    inputType.value = 'email';
    if (!isValidEmail(value)) {
      errors.username = proxy?.$t('login.emailFormatError');
    } else {
      errors.username = '';
    }
  } else if (value.length > 0) {
    inputType.value = 'username';
  } else {
    inputType.value = '';
  }
}

function handleUsernameInput(value: string) {
  detectInputType(value);
  validateField('username');
  emit('update:form-data', { username: formData.username });
}

function handlePasswordInput(value: string) {
  validateField('password');
  emit('update:form-data', { password: formData.password });
}

function handleCaptchaInput(value: string) {
  formData.captcha = value.toLowerCase();
  validateField('captcha');
  emit('update:form-data', { captcha: formData.captcha });
}

function handleRememberChange(value: boolean) {
  emit('update:form-data', { remember: value });
}

function validateField(field: string) {
  accountFormRef.value?.validateField(field, (message) => {
    errors[field] = message || '';
  });
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

async function refreshCaptcha() {
  console.log('=== AccountLogin.refreshCaptcha START ===');
  try {
    const data = await getCaptchaApi();
    console.log('Captcha API response:', data);
    console.log('Captcha key:', data.key);
    captchaId.value = data.key;
    captchaUrl.value = data.image;
    console.log('captchaId.value set to:', captchaId.value);
  } catch (error) {
    console.error('Failed to get captcha:', error);
    captchaId.value = `cap_${Date.now()}`;
    captchaUrl.value = `https://via.placeholder.com/120x40/1890ff/ffffff?text=${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    console.log('Fallback captchaId:', captchaId.value);
  }
}

function handleForgotPassword() {
  emit('forgot-password');
}

async function handleSubmit() {
  const valid = await accountFormRef.value?.validate().catch(() => false);
  if (!valid) {
    const firstError = Object.values(errors).find(e => e);
    if (firstError) {
      const firstErrorField = Object.keys(errors).find(k => errors[k as keyof typeof errors]);
      if (firstErrorField) {
        const input = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
        input?.focus();
      }
    }
    return;
  }

  loading.value = true;
  try {
    console.log('=== AccountLogin.handleSubmit ===');
    console.log('formData:', formData);
    console.log('formData.captcha:', formData.captcha);
    console.log('captchaId.value:', captchaId.value);
    
    const loginPayload = {
      type: 'account',
      username: formData.username,
      password: formData.password,
      captcha: formData.captcha,
      captchaId: captchaId.value,
      remember: formData.remember,
    };
    
    console.log('Emitting login with:', loginPayload);
    emit('login', loginPayload);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  refreshCaptcha();
});

defineExpose({
  refreshCaptcha,
});
</script>

<style lang="scss" scoped>
.account-login {
  padding: 20px 0;
}

.account-form {
  .el-form-item {
    margin-bottom: 20px;
  }
}

.input-type-hint {
  margin-top: 4px;
}

.password-toggle {
  cursor: pointer;
  color: var(--el-text-color-secondary);
  transition: color 0.3s;

  &:hover {
    color: var(--el-color-primary);
  }
}

.captcha-wrapper {
  display: flex;
  gap: 12px;
  width: 100%;

  .captcha-input {
    flex: 1;
  }

  .captcha-image {
    flex-shrink: 0;
    height: 48px;
    width: auto;
    min-width: 80px;
    max-width: 120px;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.3s;

    &:hover {
      border-color: var(--el-color-primary);
    }
  }

  .captcha-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .captcha-loading {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--el-fill-color-light);
  }
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  height: 48px;
}

@media (max-width: 768px) {
  .account-login {
    padding: 15px 0;
  }

  .captcha-wrapper {
    gap: 8px;
  }
}

@media (max-width: 420px) {
  .captcha-wrapper {
    gap: 6px;
  }
}
</style>

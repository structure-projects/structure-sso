<template>
  <div class="register-card">
    <div class="card-header">
      <h2>{{ $t('register.title') }}</h2>
      <p>{{ $t('register.subtitle') }}</p>
    </div>

    <div class="card-body">
      <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" class="register-form">
        <el-form-item prop="username">
          <el-input v-model="registerForm.username" :placeholder="$t('register.username')" size="large" :prefix-icon="User" />
        </el-form-item>

        <el-form-item prop="phone">
          <el-input v-model="registerForm.phone" :placeholder="$t('register.phone')" size="large" :prefix-icon="Phone"
            maxlength="11" />
        </el-form-item>

        <el-form-item prop="code">
          <div class="code-input-wrapper">
            <el-input v-model="registerForm.code" :placeholder="$t('register.smsCode')" size="large" :prefix-icon="ChatDotRound"
              maxlength="6" />
            <el-button :disabled="codeCountdown > 0 || !phoneValid" :loading="sendingCode" type="primary"
              size="large" class="code-button" @click="handleSendCode">
              {{ codeCountdown > 0 ? `${codeCountdown}s` : $t('common.getSmsCode') }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="registerForm.password" type="password" :placeholder="$t('register.password')" size="large"
            :prefix-icon="Lock" show-password />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" :placeholder="$t('register.confirmPassword')" size="large"
            :prefix-icon="Lock" show-password />
        </el-form-item>

        <el-form-item prop="agreement" class="agreement-item">
          <el-checkbox 
            v-model="registerForm.agreement"
            @click.prevent="handleAgreementClick"
          >
            {{ $t('register.agreementPrefix') }}
            <a href="javascript:void(0)" class="agreement-link" @click.stop="handleOpenAgreement('user')">{{ $t('common.userAgreement') }}</a>
            {{ $t('common.agreementAnd') }}
            <a href="javascript:void(0)" class="agreement-link" @click.stop="handleOpenAgreement('privacy')">{{ $t('common.privacyPolicy') }}</a>
          </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" class="register-button" :loading="registering"
            :disabled="!canRegister" @click="handleRegister">
            {{ $t('register.registerButton') }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="card-footer" v-if="showFooter">
      <div class="login-link">
        {{ $t('register.alreadyHasAccount') }}
        <a href="javascript:void(0)" @click="handleGoLogin">{{ $t('register.goToLogin') }}</a>
      </div>
    </div>
  </div>

  <!-- 协议弹窗 -->
  <AgreementModal
    v-model="agreementModalVisible"
    :type="agreementType"
    :merged="true"
    @closed="handleAgreementModalClosed"
  />
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, getCurrentInstance } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Phone, Lock, ChatDotRound } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { getSmsCodeApi, registerApi } from '@/api/auth';
import AgreementModal from './components/AgreementModal.vue';

const router = useRouter();
const route = useRoute();
const { proxy } = getCurrentInstance() as any;

const loginUrl = ref('/login');

const registerFormRef = ref<FormInstance>();
const registering = ref(false);
const sendingCode = ref(false);
const codeCountdown = ref(0);
const phoneValid = ref(false);
const agreementModalVisible = ref(false);
const agreementType = ref<'user' | 'privacy'>('user');
const showFooter = ref(true);

const registerForm = reactive({
  username: '',
  phone: '',
  code: '',
  password: '',
  confirmPassword: '',
  agreement: false
});

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error(proxy?.$t('register.confirmPasswordRequired')));
  } else if (value !== registerForm.password) {
    callback(new Error(proxy?.$t('common.passwordMismatch')));
  } else {
    callback();
  }
};

const validatePhone = (rule: any, value: any, callback: any) => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!value) {
    callback(new Error(proxy?.$t('common.phoneRequired')));
  } else if (!phoneRegex.test(value)) {
    callback(new Error(proxy?.$t('common.phoneFormatError')));
  } else {
    phoneValid.value = true;
    callback();
  }
};

const registerRules: FormRules = {
  username: [
    { required: true, message: proxy?.$t('common.usernameRequired'), trigger: 'blur' },
    { min: 3, max: 20, message: proxy?.$t('register.usernameLengthError'), trigger: 'blur' }
  ],
  phone: [
    { required: true, validator: validatePhone, trigger: 'blur' }
  ],
  code: [
    { required: true, message: proxy?.$t('common.smsCodeRequired'), trigger: 'blur' },
    { len: 6, message: proxy?.$t('common.smsCodeLengthError'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: proxy?.$t('common.passwordRequired'), trigger: 'blur' },
    { min: 6, max: 20, message: proxy?.$t('common.passwordLengthError'), trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ],
  agreement: [
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error(proxy?.$t('register.agreementRequired')));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ]
};

const canRegister = computed(() => {
  return registerForm.username &&
    registerForm.phone &&
    registerForm.code &&
    registerForm.password &&
    registerForm.confirmPassword &&
    registerForm.agreement &&
    registerForm.password === registerForm.confirmPassword;
});

const handleSendCode = async () => {
  if (!phoneValid.value) {
    registerFormRef.value?.validateField('phone');
    return;
  }

  sendingCode.value = true;
  try {
    await getSmsCodeApi(registerForm.phone);
    ElMessage.success(proxy?.$t('common.smsCodeSent'));
    codeCountdown.value = 60;
    const timer = setInterval(() => {
      codeCountdown.value--;
      if (codeCountdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (error: any) {
    ElMessage.error(error.message || proxy?.$t('common.smsCodeSendFailed'));
  } finally {
    sendingCode.value = false;
  }
};

const handleRegister = async () => {
  if (!registerFormRef.value) return;

  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      registering.value = true;
      try {
        const result = await registerApi({
          username: registerForm.username,
          password: registerForm.password,
          phone: registerForm.phone,
          code: registerForm.code,
        });
        
        if (result.data.success) {
          ElMessage.success(proxy?.$t('register.registerSuccess'));
          router.push(loginUrl.value);
        } else {
          ElMessage.error(result.data.message || proxy?.$t('register.registerFailed'));
        }
      } catch (error: any) {
        ElMessage.error(error.message || proxy?.$t('register.registerFailed'));
      } finally {
        registering.value = false;
      }
    }
  });
};

const handleGoLogin = () => {
  router.push(loginUrl.value);
};

const handleOpenAgreement = (type: 'user' | 'privacy') => {
  agreementType.value = type;
  agreementModalVisible.value = true;
};

const handleAgreementClick = () => {
  if (!registerForm.agreement) {
    agreementModalVisible.value = true;
  } else {
    registerForm.agreement = false;
  }
};

const handleAgreementModalClosed = () => {
  registerForm.agreement = true;
};

onMounted(() => {
  const loginParam = route.query.login as string;
  if (loginParam && loginParam.trim()) {
    loginUrl.value = loginParam;
  }
  
  const hideFooter = route.query.hideFooter as string;
  if (hideFooter === 'true' || hideFooter === '1') {
    showFooter.value = false;
  }
});
</script>

<style lang="scss" scoped>
.register-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

html.dark .register-card {
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
  margin: 0 auto;
}

.card-footer {
  padding: 20px 32px 24px;
  border-top: 1px solid var(--el-border-color);
}

.register-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }
}

.code-input-wrapper {
  display: flex;
  gap: 10px;
  width: 100%;

  .code-button {
    flex-shrink: 0;
    min-width: 90px;
  }
}

.register-button {
  width: 100%;
  height: 44px;
}

.login-link {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 14px;
  color: var(--el-text-color-secondary);

  a {
    color: var(--el-color-primary);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.agreement-item {
  :deep(.el-checkbox__label) {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.agreement-link {
  color: var(--el-color-primary);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

@media (max-width: 768px) {
  .card-header {
    padding: 20px;
  }

  .card-body {
    padding: 20px;
  }

  .card-footer {
    padding: 16px 20px 20px;
  }

  .code-input-wrapper {
    flex-direction: column;
    gap: 8px;

    .code-button {
      width: 100%;
      min-width: unset;
    }
  }
}
</style>

<template>
  <div class="register-form">
    <div class="form-header">
      <h2>注册新账户</h2>
      <p>填写以下信息完成注册</p>
    </div>

    <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" class="register-form-content">
      <div class="form-grid">
        <label class="form-label">用户名</label>
        <el-form-item prop="username" class="form-item">
          <el-input v-model="registerForm.username" placeholder="请输入用户名" size="large" :prefix-icon="User" />
        </el-form-item>
      </div>

      <div class="form-grid">
        <label class="form-label">手机号</label>
        <el-form-item prop="phone" class="form-item">
          <el-input v-model="registerForm.phone" placeholder="请输入手机号" size="large" :prefix-icon="Phone" maxlength="11" />
        </el-form-item>
      </div>

      <div class="form-grid">
        <label class="form-label">验证码</label>
        <el-form-item prop="code" class="form-item">
          <div class="code-input-wrapper">
            <el-input v-model="registerForm.code" placeholder="请输入验证码" size="large" :prefix-icon="ChatDotRound" maxlength="6" />
            <el-button :disabled="codeCountdown > 0 || !phoneValid" :loading="sendingCode" type="primary" size="large" class="code-button" @click="handleSendCode">
              {{ codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
      </div>

      <div class="form-grid">
        <label class="form-label">密码</label>
        <el-form-item prop="password" class="form-item">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" size="large" :prefix-icon="Lock" show-password />
        </el-form-item>
      </div>

      <div class="form-grid">
        <label class="form-label">确认密码</label>
        <el-form-item prop="confirmPassword" class="form-item">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" size="large" :prefix-icon="Lock" show-password />
        </el-form-item>
      </div>

      <div class="form-grid agreement-grid">
        <label class="form-label"></label>
        <el-form-item prop="agreement" class="form-item">
          <el-checkbox 
            v-model="registerForm.agreement"
            @click.prevent="handleAgreementClick"
          >
            我已阅读并同意
            <a href="javascript:void(0)" class="agreement-link" @click.stop="handleOpenAgreement('user')">《用户协议》</a>
            和
            <a href="javascript:void(0)" class="agreement-link" @click.stop="handleOpenAgreement('privacy')">《隐私政策》</a>
          </el-checkbox>
        </el-form-item>
      </div>

      <div class="form-grid">
        <label class="form-label"></label>
        <el-form-item class="form-item">
          <el-button type="primary" size="large" class="register-button" :loading="registering" :disabled="!canRegister" @click="handleRegister">
            立即注册
          </el-button>
        </el-form-item>
      </div>
    </el-form>

    <div class="back-to-login">
      已有账户？
      <a href="javascript:void(0)" @click="handleBack">立即登录</a>
    </div>

    <!-- 协议弹窗 -->
    <AgreementModal
      v-model="agreementModalVisible"
      :type="agreementType"
      :merged="true"
      @closed="handleAgreementModalClosed"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { User, Phone, Lock, ChatDotRound } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import AgreementModal from './AgreementModal.vue';

interface Props {
  backRoute?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'register-success'): void;
}>();

const registerFormRef = ref<FormInstance>();
const registering = ref(false);
const sendingCode = ref(false);
const codeCountdown = ref(0);
const phoneValid = ref(false);
const agreementModalVisible = ref(false);
const agreementType = ref<'user' | 'privacy'>('user');

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
    callback(new Error('请再次输入密码'));
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'));
  } else {
    callback();
  }
};

const validatePhone = (rule: any, value: any, callback: any) => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!value) {
    callback(new Error('请输入手机号'));
  } else if (!phoneRegex.test(value)) {
    callback(new Error('手机号格式不正确'));
  } else {
    phoneValid.value = true;
    callback();
  }
};

const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, validator: validatePhone, trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度为6位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ],
  agreement: [
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请阅读并同意用户协议和隐私政策'));
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

const handleBack = () => {
  emit('back');
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

const handleSendCode = async () => {
  if (!phoneValid.value) {
    registerFormRef.value?.validateField('phone');
    return;
  }

  sendingCode.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    ElMessage.success('验证码已发送，请查收');
    codeCountdown.value = 60;
    const timer = setInterval(() => {
      codeCountdown.value--;
      if (codeCountdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (error) {
    ElMessage.error('发送验证码失败，请重试');
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
        await new Promise(resolve => setTimeout(resolve, 1500));
        ElMessage.success('注册成功！');
        emit('register-success');
      } catch (error) {
        ElMessage.error('注册失败，请重试');
      } finally {
        registering.value = false;
      }
    }
  });
};
</script>

<style lang="scss" scoped>
.register-form {
  width: 100%;
}

.form-header {
  text-align: center;
  margin-bottom: 28px;

  h2 {
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  p {
    margin: 0;
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
}

.register-form-content {
  .form-grid {
    display: grid;
    grid-template-columns: 80px 1fr;
    gap: 12px;
    align-items: flex-start;
    margin-bottom: 16px;

    &.agreement-grid {
      grid-template-columns: 80px 1fr;
      align-items: center;
    }
  }

  .form-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-regular);
    line-height: 40px;
    text-align: right;
    padding-right: 8px;
  }

  .form-item {
    margin: 0;

    :deep(.el-form-item__error) {
      padding-top: 2px;
    }
  }
}

.code-input-wrapper {
  display: flex;
  gap: 10px;
  width: 100%;

  .code-button {
    flex-shrink: 0;
    min-width: 100px;
  }
}

.register-button {
  width: 100%;
  height: 44px;
}

.back-to-login {
  text-align: center;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-top: 20px;

  a {
    color: var(--el-color-primary);
    text-decoration: none;
    font-weight: 500;

    &:hover {
      color: var(--el-color-primary-dark-2);
      text-decoration: underline;
    }
  }
}

.agreement-link {
  color: var(--el-color-primary);
  text-decoration: none;

  &:hover {
    color: var(--el-color-primary-dark-2);
    text-decoration: underline;
  }
}

@media (max-width: 768px) {
  .register-form-content {
    .form-grid {
      grid-template-columns: 70px 1fr;
      gap: 8px;
      margin-bottom: 14px;
    }

    .form-label {
      font-size: 13px;
    }
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

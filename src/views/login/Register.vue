<template>
  <div class="register-card">
    <div class="card-header">
      <h2>注册新账户</h2>
      <p>填写以下信息完成注册</p>
    </div>

    <div class="card-body">
      <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" class="register-form">
        <el-form-item prop="username">
          <el-input v-model="registerForm.username" placeholder="用户名" size="large" :prefix-icon="User" />
        </el-form-item>

        <el-form-item prop="phone">
          <el-input v-model="registerForm.phone" placeholder="手机号" size="large" :prefix-icon="Phone"
            maxlength="11" />
        </el-form-item>

        <el-form-item prop="code">
          <div class="code-input-wrapper">
            <el-input v-model="registerForm.code" placeholder="验证码" size="large" :prefix-icon="ChatDotRound"
              maxlength="6" />
            <el-button :disabled="codeCountdown > 0 || !phoneValid" :loading="sendingCode" type="primary"
              size="large" class="code-button" @click="handleSendCode">
              {{ codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="密码" size="large"
            :prefix-icon="Lock" show-password />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="确认密码" size="large"
            :prefix-icon="Lock" show-password />
        </el-form-item>

        <el-form-item prop="agreement" class="agreement-item">
          <el-checkbox v-model="registerForm.agreement">
            我已阅读并同意
            <a href="#" class="agreement-link">《用户协议》</a>
            和
            <a href="#" class="agreement-link">《隐私政策》</a>
          </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" class="register-button" :loading="registering"
            :disabled="!canRegister" @click="handleRegister">
            立即注册
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="card-footer">
      <div class="login-link">
        已有账户？
        <a href="javascript:void(0)" @click="handleGoLogin">立即登录</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Phone, Lock, ChatDotRound } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { getSmsCodeApi, registerApi } from '@/api/auth';

const router = useRouter();
const route = useRoute();

const loginUrl = ref('/login');

const registerFormRef = ref<FormInstance>();
const registering = ref(false);
const sendingCode = ref(false);
const codeCountdown = ref(0);
const phoneValid = ref(false);

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

const handleSendCode = async () => {
  if (!phoneValid.value) {
    registerFormRef.value?.validateField('phone');
    return;
  }

  sendingCode.value = true;
  try {
    await getSmsCodeApi(registerForm.phone);
    ElMessage.success('验证码已发送，请查收');
    codeCountdown.value = 60;
    const timer = setInterval(() => {
      codeCountdown.value--;
      if (codeCountdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (error: any) {
    ElMessage.error(error.message || '发送验证码失败，请重试');
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
          ElMessage.success('注册成功！');
          router.push(loginUrl.value);
        } else {
          ElMessage.error(result.data.message || '注册失败，请重试');
        }
      } catch (error: any) {
        ElMessage.error(error.message || '注册失败，请重试');
      } finally {
        registering.value = false;
      }
    }
  });
};

const handleGoLogin = () => {
  router.push(loginUrl.value);
};

onMounted(() => {
  const loginParam = route.query.login as string;
  if (loginParam && loginParam.trim()) {
    loginUrl.value = loginParam;
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

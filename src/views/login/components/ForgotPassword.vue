<!--
ForgotPassword.vue - 忘记密码页面组件
功能说明：
- 通过手机号验证找回密码
- 支持发送验证码、验证验证码、设置新密码
- 支持返回登录页面
- 响应式设计，适配不同屏幕尺寸
-->
<template>
  <div class="forgot-password">
    <!-- 返回登录按钮 -->
    <div class="back-button">
      <el-button text @click="handleBack">
        <el-icon><ArrowLeft /></el-icon>
        返回登录
      </el-button>
    </div>

    <!-- 标题 -->
    <div class="title-section">
      <h2 class="title">忘记密码</h2>
      <p class="subtitle">通过手机号验证找回密码</p>
    </div>

    <!-- 步骤指示器 -->
    <div class="steps-indicator">
      <div
        v-for="(step, index) in steps"
        :key="index"
        :class="['step', {
          'active': currentStep === index,
          'completed': currentStep > index
        }]"
      >
        <div class="step-number">
          <el-icon v-if="currentStep > index"><Check /></el-icon>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <div class="step-label">{{ step.label }}</div>
      </div>
    </div>

    <!-- 步骤1：验证手机号 -->
    <div v-if="currentStep === 0" class="step-content">
      <el-form
        ref="phoneFormRef"
        :model="phoneForm"
        :rules="phoneRules"
        class="forgot-form"
      >
        <el-form-item prop="phone">
          <el-input
            v-model="phoneForm.phone"
            placeholder="请输入注册的手机号"
            size="large"
            class="h-[48px]"
            maxlength="11"
            @input="handlePhoneInput"
          >
            <template #prefix>
              <el-icon><Iphone /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="smsCode">
          <div class="sms-wrapper">
            <el-input
              v-model="phoneForm.smsCode"
              placeholder="请输入短信验证码"
              size="large"
              class="sms-input h-[48px]"
              maxlength="6"
              @input="handleSmsCodeInput"
            />
            <el-button
              :disabled="countdown > 0 || !canSendSms"
              class="sms-button"
              @click="handleSendSms"
            >
              {{ countdown > 0 ? `${countdown}秒后重发` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="submit-button"
            :loading="loading"
            :disabled="!canVerifyPhone"
            @click="handleVerifyPhone"
          >
            下一步
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 步骤2：设置新密码 -->
    <div v-if="currentStep === 1" class="step-content">
      <div class="phone-display">
        已向 <span class="phone-number">{{ maskedPhone }}</span> 发送验证码
      </div>

      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        class="forgot-form"
      >
        <el-form-item prop="smsCode">
          <div class="sms-wrapper">
            <el-input
              v-model="passwordForm.smsCode"
              placeholder="请输入短信验证码"
              size="large"
              class="sms-input h-[48px]"
              maxlength="6"
              @input="handlePasswordSmsInput"
            />
            <el-button
              :disabled="countdown > 0"
              class="sms-button"
              @click="handleResendSms"
            >
              {{ countdown > 0 ? `${countdown}秒后重发` : '重新获取' }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="passwordForm.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入新密码"
            size="large"
            class="h-[48px]"
            @input="handlePasswordInput"
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

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="请再次输入新密码"
            size="large"
            class="h-[48px]"
            @input="handleConfirmPasswordInput"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
            <template #suffix>
              <el-icon
                class="password-toggle"
                @click="toggleConfirmPasswordVisibility"
              >
                <component :is="showConfirmPassword ? 'View' : 'Hide'" />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="submit-button"
            :loading="loading"
            :disabled="!canResetPassword"
            @click="handleResetPassword"
          >
            重置密码
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 步骤3：完成 -->
    <div v-if="currentStep === 2" class="step-content success-content">
      <div class="success-icon">
        <el-icon color="#67c23a" :size="64"><SuccessFilled /></el-icon>
      </div>
      <h3 class="success-title">密码重置成功</h3>
      <p class="success-desc">请使用新密码登录您的账号</p>
      <el-button
        type="primary"
        size="large"
        class="submit-button"
        @click="handleBackToLogin"
      >
        返回登录
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 导入 Vue 内置 API 和依赖组件
import { ref, computed, reactive, onUnmounted } from 'vue';
import {
  ArrowLeft,
  Check,
  Iphone,
  Lock,
  View,
  Hide,
  SuccessFilled
} from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import router from '@/router';

// 组件属性定义
interface Props {
  // 是否显示
  visible?: boolean;
}

// 组件属性
const props = withDefaults(defineProps<Props>(), {
  visible: false,
});

// 组件事件定义
const emit = defineEmits<{
  // 返回登录页面事件
  (e: 'back'): void;
}>();

// 步骤定义
const steps = [
  { label: '验证手机号' },
  { label: '设置新密码' },
  { label: '完成' }
];

// 当前步骤
const currentStep = ref(0);

// 表单引用
const phoneFormRef = ref<FormInstance>();
const passwordFormRef = ref<FormInstance>();

// 加载状态
const loading = ref(false);

// 手机号表单数据
const phoneForm = reactive({
  phone: '',
  smsCode: ''
});

// 密码表单数据
const passwordForm = reactive({
  smsCode: '',
  password: '',
  confirmPassword: ''
});

// 密码可见性
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// 倒计时
const countdown = ref(0);
let countdownTimer: number | null = null;

// 计算属性：是否可以发送短信
const canSendSms = computed(() => {
  return phoneForm.phone.length === 11;
});

// 计算属性：是否可以验证手机号
const canVerifyPhone = computed(() => {
  return phoneForm.phone.length === 11 && phoneForm.smsCode.length === 6;
});

// 计算属性：是否可以重置密码
const canResetPassword = computed(() => {
  return passwordForm.smsCode.length === 6 &&
         passwordForm.password.length >= 8 &&
         passwordForm.confirmPassword.length >= 8;
});

// 计算属性：脱敏手机号
const maskedPhone = computed(() => {
  const phone = phoneForm.phone;
  if (phone.length === 11) {
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }
  return '';
});

// 手机号表单验证规则
const phoneRules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号',
      trigger: 'blur'
    }
  ],
  smsCode: [
    { required: true, message: '请输入短信验证码', trigger: 'blur' },
    { min: 6, max: 6, message: '短信验证码为6位', trigger: 'blur' }
  ]
};

// 密码表单验证规则
const passwordRules: FormRules = {
  smsCode: [
    { required: true, message: '请输入短信验证码', trigger: 'blur' },
    { min: 6, max: 6, message: '短信验证码为6位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, max: 20, message: '密码长度为8-20位', trigger: 'blur' },
    {
      pattern: /^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$).{8,20}$/,
      message: '密码必须包含字母、数字和特殊字符中的至少两种',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.password) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 方法：返回上一页
function handleBack() {
  emit('back');
}

// 方法：返回登录页
function handleBackToLogin() {
  emit('back');
}

// 方法：手机号输入处理
function handlePhoneInput(value: string) {
  phoneForm.phone = value.replace(/\D/g, '');
}

// 方法：短信验证码输入处理（步骤1）
function handleSmsCodeInput(value: string) {
  phoneForm.smsCode = value.replace(/\D/g, '');
}

// 方法：短信验证码输入处理（步骤2）
function handlePasswordSmsInput(value: string) {
  passwordForm.smsCode = value.replace(/\D/g, '');
}

// 方法：发送短信验证码
async function handleSendSms() {
  if (!canSendSms.value) return;

  loading.value = true;
  try {
    // TODO: 调用后端API发送短信验证码
    // await sendSmsCode({ phone: phoneForm.phone });

    ElMessage.success('验证码已发送');
    startCountdown();
  } catch (error: any) {
    ElMessage.error(error.message || '发送验证码失败');
  } finally {
    loading.value = false;
  }
}

// 方法：重新发送短信验证码
async function handleResendSms() {
  loading.value = true;
  try {
    // TODO: 调用后端API重新发送短信验证码
    // await sendSmsCode({ phone: phoneForm.phone });

    ElMessage.success('验证码已重新发送');
    startCountdown();
  } catch (error: any) {
    ElMessage.error(error.message || '发送验证码失败');
  } finally {
    loading.value = false;
  }
}

// 方法：开始倒计时
function startCountdown() {
  countdown.value = 60;
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
  countdownTimer = window.setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
    }
  }, 1000);
}

// 方法：验证手机号
async function handleVerifyPhone() {
  const valid = await phoneFormRef.value?.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    // TODO: 调用后端API验证手机号和验证码
    // await verifyPhoneCode({ phone: phoneForm.phone, code: phoneForm.smsCode });

    ElMessage.success('验证成功');
    currentStep.value = 1;
    startCountdown();
  } catch (error: any) {
    ElMessage.error(error.message || '验证失败，请检查验证码');
  } finally {
    loading.value = false;
  }
}

// 方法：密码输入处理
function handlePasswordInput(value: string) {
  passwordForm.password = value;
}

// 方法：确认密码输入处理
function handleConfirmPasswordInput(value: string) {
  passwordForm.confirmPassword = value;
}

// 方法：切换密码可见性
function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

// 方法：切换确认密码可见性
function toggleConfirmPasswordVisibility() {
  showConfirmPassword.value = !showConfirmPassword.value;
}

// 方法：重置密码
async function handleResetPassword() {
  const valid = await passwordFormRef.value?.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    // TODO: 调用后端API重置密码
    // await resetPassword({
    //   phone: phoneForm.phone,
    //   code: passwordForm.smsCode,
    //   newPassword: passwordForm.password
    // });

    ElMessage.success('密码重置成功');
    currentStep.value = 2;
  } catch (error: any) {
    ElMessage.error(error.message || '重置密码失败');
  } finally {
    loading.value = false;
  }
}

// 生命周期钩子：组件卸载时清理
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});
</script>

<style lang="scss" scoped>
/* 忘记密码容器样式 */
.forgot-password {
  padding: 20px 0;
}

/* 返回按钮样式 */
.back-button {
  margin-bottom: 24px;
}

/* 标题区域样式 */
.title-section {
  text-align: center;
  margin-bottom: 32px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

/* 步骤指示器样式 */
.steps-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px;
  gap: 0;
}

.step {
  display: flex;
  align-items: center;
  position: relative;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    left: calc(50% + 20px);
    top: 50%;
    width: 60px;
    height: 2px;
    background: var(--el-border-color);
    transform: translateY(-50%);
  }

  &.completed:not(:last-child)::after {
    background: var(--el-color-primary);
  }

  &:last-child {
    .step-number {
      margin-right: 0;
    }
  }
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  margin-right: 8px;
  transition: all 0.3s;
}

.step.active .step-number {
  background: var(--el-color-primary);
  color: white;
}

.step.completed .step-number {
  background: var(--el-color-primary);
  color: white;
}

.step-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.step.active .step-label {
  color: var(--el-color-primary);
  font-weight: 500;
}

.step.completed .step-label {
  color: var(--el-text-color-primary);
}

/* 步骤内容区域样式 */
.step-content {
  width: 100%;
}

/* 手机号显示样式 */
.phone-display {
  text-align: center;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 24px;
  padding: 12px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.phone-number {
  color: var(--el-color-primary);
  font-weight: 500;
}

/* 表单样式 */
.forgot-form {
  width: 100%;
}

/* 短信验证码输入框容器样式 */
.sms-wrapper {
  display: flex;
  gap: 12px;
  width: 100%;
}

.sms-input {
  flex: 1;
}

.sms-button {
  width: 130px;
  height: 48px;
  white-space: nowrap;
}

/* 密码切换按钮样式 */
.password-toggle {
  cursor: pointer;
  color: var(--el-text-color-placeholder);
  transition: color 0.3s;

  &:hover {
    color: var(--el-color-primary);
  }
}

/* 提交按钮样式 */
.submit-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
}

/* 成功页面样式 */
.success-content {
  text-align: center;
  padding: 40px 0;
}

.success-icon {
  margin-bottom: 24px;
}

.success-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 12px 0;
}

.success-desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0 0 32px 0;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .forgot-password {
    padding: 16px 0;
  }

  .title-section {
    margin-bottom: 24px;
  }

  .title {
    font-size: 20px;
  }

  .steps-indicator {
    margin-bottom: 24px;
  }

  .step:not(:last-child)::after {
    width: 40px;
    left: calc(50% + 16px);
  }

  .step-label {
    font-size: 12px;
  }

  .sms-wrapper {
    flex-direction: column;
  }

  .sms-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .step:not(:last-child)::after {
    width: 30px;
    left: calc(50% + 14px);
  }

  .step-number {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}
</style>

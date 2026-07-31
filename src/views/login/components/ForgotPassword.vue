<template>
  <div class="forgot-password">
    <!-- 标题 -->
    <div class="fp-header">
      <h2 class="fp-title">{{ $t('forgotPassword.title') }}</h2>
      <p class="fp-subtitle">{{ $t('forgotPassword.subtitle') }}</p>
    </div>

    <!-- 步骤条 -->
    <el-steps :active="currentStep" align-center class="fp-steps" finish-status="success">
      <el-step :title="$t('forgotPassword.stepInputAccount')" />
      <el-step :title="$t('forgotPassword.stepVerifyIdentity')" />
      <el-step :title="$t('forgotPassword.stepSetPassword')" />
      <el-step :title="$t('forgotPassword.stepComplete')" />
    </el-steps>

    <!-- 步骤内容区域 -->
    <div class="fp-content">
      <!-- ===== 第一步：输入账号 ===== -->
      <div v-if="currentStep === 0" class="step-panel">
        <el-form
          ref="accountFormRef"
          :model="accountForm"
          :rules="accountRules"
          label-position="top"
          @keyup.enter="handleFindAccount"
        >
          <el-form-item prop="identifier">
            <el-input
              v-model="accountForm.identifier"
              :placeholder="$t('forgotPassword.accountPlaceholder')"
              size="large"
              clearable
            />
          </el-form-item>
        </el-form>
        <el-button
          type="primary"
          size="large"
          class="fp-full-btn"
          :loading="findingAccount"
          @click="handleFindAccount"
        >
          {{ $t('forgotPassword.findAccount') }}
        </el-button>
      </div>

      <!-- ===== 第二步：身份验证 ===== -->
      <div v-if="currentStep === 1" class="step-panel">
        <!-- 验证方式选择 -->
        <div v-if="!verifyMethod" class="verify-methods">
          <p class="verify-method-title">{{ $t('forgotPassword.verifyMethodTitle') }}</p>

          <!-- 密保问题验证 -->
          <div
            class="verify-method-card"
            :class="{ disabled: !hasSecurityQuestions }"
            @click="selectVerifyMethod('security')"
          >
            <div class="method-icon">
              <el-icon><QuestionFilled /></el-icon>
            </div>
            <div class="method-info">
              <div class="method-name">{{ $t('forgotPassword.verifyBySecurityQuestion') }}</div>
              <div class="method-desc">{{ $t('forgotPassword.securityQuestionDesc') }}</div>
            </div>
            <el-icon class="method-arrow"><ArrowRight /></el-icon>
          </div>

          <!-- 手机验证码验证 -->
          <div
            class="verify-method-card"
            @click="selectVerifyMethod('phone')"
          >
            <div class="method-icon">
              <el-icon><PhoneFilled /></el-icon>
            </div>
            <div class="method-info">
              <div class="method-name">{{ $t('forgotPassword.verifyByPhone') }}</div>
              <div class="method-desc">{{ $t('forgotPassword.phoneVerifyDesc') }}</div>
            </div>
            <el-icon class="method-arrow"><ArrowRight /></el-icon>
          </div>
        </div>

        <!-- 密保问题表单 -->
        <div v-if="verifyMethod === 'security'" class="verify-form">
          <div class="verify-form-header">
            <el-button
              type="default"
              text
              @click="verifyMethod = null"
            >
              <el-icon><ArrowLeft /></el-icon>
              {{ $t('forgotPassword.verifyBySecurityQuestion') }}
            </el-button>
          </div>
          <el-form
            ref="securityFormRef"
            :model="securityForm"
            label-position="top"
          >
            <el-form-item
              v-for="(q, idx) in securityQuestions"
              :key="q.questionId"
              :label="`${idx + 1}. ${q.question}`"
              :prop="'answers.' + idx + '.answer'"
              :rules="securityAnswerRules"
            >
              <el-input
                v-model="securityForm.answers[idx].answer"
                :placeholder="$t('forgotPassword.answerPlaceholder')"
                size="large"
              />
            </el-form-item>
          </el-form>
          <el-button
            type="primary"
            size="large"
            class="fp-full-btn"
            :loading="verifyingSecurity"
            @click="handleVerifySecurityAnswer"
          >
            {{ $t('forgotPassword.submitAnswers') }}
          </el-button>
        </div>

        <!-- 手机验证码表单 -->
        <div v-if="verifyMethod === 'phone'" class="verify-form">
          <div class="verify-form-header">
            <el-button
              type="default"
              text
              @click="verifyMethod = null"
            >
              <el-icon><ArrowLeft /></el-icon>
              {{ $t('forgotPassword.verifyByPhone') }}
            </el-button>
          </div>
          <el-form
            ref="phoneFormRef"
            :model="phoneForm"
            :rules="phoneRules"
            label-position="top"
          >
            <el-form-item prop="phone">
              <el-input
                v-model="phoneForm.phone"
                :placeholder="$t('forgotPassword.phonePlaceholder')"
                size="large"
              />
            </el-form-item>
            <el-form-item prop="code">
              <div class="sms-row">
                <el-input
                  v-model="phoneForm.code"
                  :placeholder="$t('forgotPassword.smsCodePlaceholder')"
                  size="large"
                  class="sms-input"
                />
                <el-button
                  size="large"
                  :disabled="smsCountdown > 0"
                  :loading="sendingSms"
                  @click="handleSendPhoneCode"
                >
                  <template v-if="smsCountdown > 0">
                    {{ $t('forgotPassword.resendAfter', { count: smsCountdown }) }}
                  </template>
                  <template v-else>
                    {{ $t('forgotPassword.sendSmsCode') }}
                  </template>
                </el-button>
              </div>
            </el-form-item>
          </el-form>
          <el-button
            type="primary"
            size="large"
            class="fp-full-btn"
            :loading="verifyingPhone"
            @click="handleVerifyPhoneCode"
          >
            {{ $t('forgotPassword.verifyPhoneCode') }}
          </el-button>
        </div>
      </div>

      <!-- ===== 第三步：设置新密码 ===== -->
      <div v-if="currentStep === 2" class="step-panel">
        <el-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          label-position="top"
          @keyup.enter="handleResetPassword"
        >
          <el-form-item prop="newPassword">
            <el-input
              v-model="passwordForm.newPassword"
              type="password"
              :placeholder="$t('forgotPassword.newPassword')"
              size="large"
              show-password
            />
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              :placeholder="$t('forgotPassword.confirmNewPassword')"
              size="large"
              show-password
            />
          </el-form-item>
        </el-form>
        <div class="password-hint">
          <el-icon><InfoFilled /></el-icon>
          <span>{{ $t('forgotPassword.passwordRuleHint') }}</span>
        </div>
        <el-button
          type="primary"
          size="large"
          class="fp-full-btn"
          :loading="resettingPassword"
          @click="handleResetPassword"
        >
          {{ $t('forgotPassword.resetPassword') }}
        </el-button>
      </div>

      <!-- ===== 第四步：完成 ===== -->
      <div v-if="currentStep === 3" class="step-panel success-panel">
        <div class="success-icon">
          <el-icon><CircleCheckFilled /></el-icon>
        </div>
        <h3 class="success-title">{{ $t('forgotPassword.resetSuccess') }}</h3>
        <p class="success-desc">{{ $t('forgotPassword.resetSuccessDesc') }}</p>
        <el-button
          type="primary"
          size="large"
          class="fp-full-btn"
          @click="handleGoToLogin"
        >
          {{ $t('forgotPassword.goToLogin') }}
        </el-button>
      </div>
    </div>

    <!-- 底部：返回登录 -->
    <div v-if="currentStep < 3" class="fp-footer">
      <el-button
        v-if="currentStep > 0"
        type="default"
        text
        @click="handlePrevStep"
      >
        <el-icon><ArrowLeft /></el-icon>
        {{ $t('common.backToLogin') }}
      </el-button>
      <el-button
        v-else
        type="default"
        text
        @click="emit('back')"
      >
        <el-icon><ArrowLeft /></el-icon>
        {{ $t('common.backToLogin') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import {
  QuestionFilled,
  PhoneFilled,
  ArrowRight,
  ArrowLeft,
  InfoFilled,
  CircleCheckFilled,
} from '@element-plus/icons-vue';
import {
  getSecurityQuestions,
  verifySecurityAnswer,
  sendPhoneCode,
  verifyPhoneCode,
  resetPassword,
  type SecurityQuestion,
} from '@/api/auth/resetPassword';

const emit = defineEmits<{
  (e: 'back'): void;
}>();

// ============================================================
// 步骤状态
// ============================================================
const currentStep = ref(0); // 0:输入账号 1:身份验证 2:设置密码 3:完成
const verifyMethod = ref<'security' | 'phone' | null>(null); // 身份验证方式
const verifyToken = ref(''); // 验证通过后的凭证

// ============================================================
// 第一步：输入账号
// ============================================================
const accountFormRef = ref<FormInstance>();
const accountForm = reactive({
  identifier: '',
});
const findingAccount = ref(false);

const accountRules: FormRules = {
  identifier: [
    { required: true, message: '请输入账号信息', trigger: 'blur' },
  ],
};

const hasSecurityQuestions = ref(false);
const securityQuestions = ref<SecurityQuestion[]>([]);

async function handleFindAccount() {
  const valid = await accountFormRef.value?.validate().catch(() => false);
  if (!valid) return;

  findingAccount.value = true;
  try {
    // 获取用户的密保问题
    const { data: questions } = await getSecurityQuestions(accountForm.identifier);
    securityQuestions.value = questions;
    hasSecurityQuestions.value = questions.length > 0;

    // 初始化答案表单
    securityForm.answers = questions.map((q) => ({
      questionId: q.questionId,
      answer: '',
    }));

    // 如果有绑定手机号，预填（Mock 下用测试手机号）
    phoneForm.phone = '13800138000';

    currentStep.value = 1;
  } catch (error: any) {
    ElMessage.error(error?.message || '未找到该账号，请检查输入');
  } finally {
    findingAccount.value = false;
  }
}

// ============================================================
// 第二步：身份验证 - 方式选择
// ============================================================
function selectVerifyMethod(method: 'security' | 'phone') {
  if (method === 'security' && !hasSecurityQuestions.value) {
    ElMessage.warning('该账号未设置密保问题');
    return;
  }
  verifyMethod.value = method;
}

// ============================================================
// 第二步：密保问题验证
// ============================================================
const securityFormRef = ref<FormInstance>();
const securityForm = reactive({
  answers: [] as { questionId: string; answer: string }[],
});
const verifyingSecurity = ref(false);

const securityAnswerRules: FormRules = {
  answer: [
    { required: true, message: '请输入答案', trigger: 'blur' },
  ],
};

async function handleVerifySecurityAnswer() {
  const valid = await securityFormRef.value?.validate().catch(() => false);
  if (!valid) return;

  verifyingSecurity.value = true;
  try {
    const result = await verifySecurityAnswer({
      identifier: accountForm.identifier,
      answers: securityForm.answers,
    });
    verifyToken.value = result.verifyToken;
    ElMessage.success('验证成功');
    currentStep.value = 2;
  } catch (error: any) {
    ElMessage.error(error?.message || '密保答案验证失败');
  } finally {
    verifyingSecurity.value = false;
  }
}

// ============================================================
// 第二步：手机验证码验证
// ============================================================
const phoneFormRef = ref<FormInstance>();
const phoneForm = reactive({
  phone: '',
  code: '',
});
const sendingSms = ref(false);
const verifyingPhone = ref(false);
const smsCountdown = ref(0);
let countdownTimer: ReturnType<typeof setInterval> | null = null;

const phoneRules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码必须是6位数字', trigger: 'blur' },
  ],
};

async function handleSendPhoneCode() {
  const phoneValid = phoneForm.phone && /^1[3-9]\d{9}$/.test(phoneForm.phone);
  if (!phoneValid) {
    ElMessage.warning('请输入正确的手机号');
    return;
  }

  sendingSms.value = true;
  try {
    await sendPhoneCode({ phone: phoneForm.phone, scene: 'reset-password' });
    ElMessage.success('验证码已发送');
    startCountdown();
  } catch (error: any) {
    ElMessage.error(error?.message || '发送验证码失败');
  } finally {
    sendingSms.value = false;
  }
}

function startCountdown() {
  smsCountdown.value = 60;
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    smsCountdown.value--;
    if (smsCountdown.value <= 0) {
      clearInterval(countdownTimer!);
      countdownTimer = null;
    }
  }, 1000);
}

async function handleVerifyPhoneCode() {
  const valid = await phoneFormRef.value?.validate().catch(() => false);
  if (!valid) return;

  verifyingPhone.value = true;
  try {
    const result = await verifyPhoneCode({
      phone: phoneForm.phone,
      code: phoneForm.code,
      scene: 'reset-password',
    });
    verifyToken.value = result.verifyToken;
    ElMessage.success('验证成功');
    currentStep.value = 2;
  } catch (error: any) {
    ElMessage.error(error?.message || '验证码校验失败');
  } finally {
    verifyingPhone.value = false;
  }
}

// ============================================================
// 第三步：设置新密码
// ============================================================
const passwordFormRef = ref<FormInstance>();
const passwordForm = reactive({
  newPassword: '',
  confirmPassword: '',
});
const resettingPassword = ref(false);

const validatePassword = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入新密码'));
    return;
  }
  if (value.length < 8 || value.length > 20) {
    callback(new Error('密码长度为8-20位'));
    return;
  }
  // 检查是否包含至少两种：字母、数字、特殊字符
  let types = 0;
  if (/[a-zA-Z]/.test(value)) types++;
  if (/[0-9]/.test(value)) types++;
  if (/[^a-zA-Z0-9]/.test(value)) types++;
  if (types < 2) {
    callback(new Error('密码必须包含字母、数字和特殊字符中至少两种'));
    return;
  }
  callback();
};

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请再次输入新密码'));
    return;
  }
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入密码不一致'));
    return;
  }
  callback();
};

const passwordRules: FormRules = {
  newPassword: [{ validator: validatePassword, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
};

async function handleResetPassword() {
  const valid = await passwordFormRef.value?.validate().catch(() => false);
  if (!valid) return;

  resettingPassword.value = true;
  try {
    await resetPassword({
      verifyToken: verifyToken.value,
      newPassword: passwordForm.newPassword,
    });
    ElMessage.success('密码重置成功');
    currentStep.value = 3;
  } catch (error: any) {
    ElMessage.error(error?.message || '重置密码失败');
  } finally {
    resettingPassword.value = false;
  }
}

// ============================================================
// 导航
// ============================================================
function handlePrevStep() {
  if (currentStep.value === 1) {
    // 从身份验证回到输入账号
    verifyMethod.value = null;
    currentStep.value = 0;
  } else if (currentStep.value === 2) {
    currentStep.value = 1;
  }
}

function handleGoToLogin() {
  emit('back');
}
</script>

<style lang="scss" scoped>
.forgot-password {
  padding: 8px 0;
}

.fp-header {
  text-align: center;
  margin-bottom: 24px;

  .fp-title {
    font-size: 22px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 8px;
  }

  .fp-subtitle {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    margin: 0;
  }
}

.fp-steps {
  margin-bottom: 28px;

  :deep(.el-step__title) {
    font-size: 13px;
  }
}

.fp-content {
  min-height: 200px;
}

.step-panel {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fp-full-btn {
  width: 100%;
  margin-top: 16px;
}

// ===== 身份验证方式选择 =====
.verify-methods {
  .verify-method-title {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    margin-bottom: 16px;
  }
}

.verify-method-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 12px;

  &:hover:not(.disabled) {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .method-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: var(--el-color-primary-light-9);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: var(--el-color-primary);
    flex-shrink: 0;
  }

  .method-info {
    flex: 1;

    .method-name {
      font-size: 15px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      margin-bottom: 4px;
    }

    .method-desc {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .method-arrow {
    color: var(--el-text-color-placeholder);
    font-size: 16px;
  }
}

// ===== 验证表单 =====
.verify-form {
  .verify-form-header {
    margin-bottom: 16px;
  }
}

.sms-row {
  display: flex;
  gap: 10px;

  .sms-input {
    flex: 1;
  }

  .el-button {
    flex-shrink: 0;
    min-width: 110px;
  }
}

// ===== 密码提示 =====
.password-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  background: var(--el-color-info-light-9);
  border-radius: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;

  .el-icon {
    color: var(--el-color-info);
    flex-shrink: 0;
  }
}

// ===== 成功页面 =====
.success-panel {
  text-align: center;
  padding-top: 20px;

  .success-icon {
    font-size: 56px;
    color: var(--el-color-success);
    margin-bottom: 16px;
  }

  .success-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 8px;
  }

  .success-desc {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    margin: 0 0 24px;
  }
}

// ===== 底部 =====
.fp-footer {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color);
}

// 暗色模式
html.dark {
  .verify-method-card {
    border-color: var(--el-border-color);

    &:hover:not(.disabled) {
      border-color: var(--el-color-primary);
      background: rgba(var(--el-color-primary-rgb), 0.1);
    }

    .method-icon {
      background: rgba(var(--el-color-primary-rgb), 0.15);
    }
  }

  .password-hint {
    background: rgba(var(--el-color-info-rgb), 0.1);
  }
}
</style>

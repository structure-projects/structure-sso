<template>
  <div class="phone-login">
    <el-form
      ref="phoneFormRef"
      :model="formData"
      :rules="formRules"
      class="phone-form"
      @submit.prevent="handleSubmit"
    >
      <el-form-item prop="phone">
        <el-input
          v-model="formData.phone"
          placeholder="请输入手机号"
          size="large"
          class="h-[48px]"
          maxlength="11"
          @input="handlePhoneInput"
          @blur="validateField('phone')"
        >
          <template #prefix>
            <span class="phone-prefix">+86</span>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="code">
        <div class="code-input-wrapper">
          <el-input
            v-model="formData.code"
            placeholder="请输入验证码"
            size="large"
            class="code-input h-[48px]"
            maxlength="6"
            @input="handleCodeInput"
            @blur="validateField('code')"
          />
          <el-button
            :disabled="countdown > 0 || !phoneValid"
            :loading="sendingCode"
            type="primary"
            size="large"
            class="code-button"
            @click="handleSendCode"
          >
            {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
          </el-button>
        </div>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          size="large"
          class="login-button"
          :loading="loading"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          登录
        </el-button>
      </el-form-item>
    </el-form>

    <div v-if="showCaptcha" class="captcha-overlay" @click.self="closeCaptcha">
      <div class="captcha-modal">
        <div class="captcha-header">
          <h3>安全验证</h3>
          <el-button text @click="closeCaptcha">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        <div class="captcha-body">
          <div class="slider-captcha">
              <div class="slider-background">
                <div class="slider-target" :style="{ left: `${targetPosition}%` }"></div>
                <div 
                  class="slider-block" 
                  :style="{ left: `${sliderPosition}%` }"
                  @mousedown="handleSliderStart"
                  @touchstart="handleSliderStart"
                >
                  <el-icon><DArrowRight /></el-icon>
                </div>
              </div>
              <div class="slider-hint">按住滑块，拖动到最右边</div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted, onUnmounted } from 'vue';
import { Close, DArrowRight } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { sendSmsCodeApi } from '@/api/auth';
import type { VerificationCodeType } from '@/api/auth/types';

interface Props {
  formData?: any;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:form-data', data: any): void;
  (e: 'login', data: any): void;
}>();

const phoneFormRef = ref<FormInstance>();
const formData = reactive({
  phone: '',
  code: '',
});
const errors = reactive({
  phone: '',
  code: '',
});
const countdown = ref(0);
const sendingCode = ref(false);
const loading = ref(false);
const showCaptcha = ref(false);
const sliderPosition = ref(0);
const targetPosition = ref(70);
const isDragging = ref(false);
const phoneValid = ref(false);

onMounted(() => {
  document.addEventListener('mousemove', handleSliderMove);
  document.addEventListener('mouseup', handleSliderEnd);
  document.addEventListener('touchmove', handleSliderMove);
  document.addEventListener('touchend', handleSliderEnd);
});

onUnmounted(() => {
  document.removeEventListener('mousemove', handleSliderMove);
  document.removeEventListener('mouseup', handleSliderEnd);
  document.removeEventListener('touchmove', handleSliderMove);
  document.removeEventListener('touchend', handleSliderEnd);
});

const formRules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(value)) {
          callback(new Error('手机号格式不正确'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        const codeRegex = /^\d{6}$/;
        if (!codeRegex.test(value)) {
          callback(new Error('验证码必须是6位数字'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
};

const canSubmit = computed(() => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  const codeRegex = /^\d{6}$/;
  return phoneRegex.test(formData.phone) && codeRegex.test(formData.code);
});

watch(() => props.formData, (newData) => {
  if (newData) {
    Object.assign(formData, newData);
  }
}, { immediate: true, deep: true });

function handlePhoneInput(value: string) {
  formData.phone = value.replace(/\D/g, '');
  validateField('phone');

  const phoneRegex = /^1[3-9]\d{9}$/;
  phoneValid.value = phoneRegex.test(formData.phone);

  emit('update:form-data', { phone: formData.phone });
}

function handleCodeInput(value: string) {
  formData.code = value.replace(/\D/g, '');
  validateField('code');

  emit('update:form-data', { code: formData.code });
}

function validateField(field: string) {
  phoneFormRef.value?.validateField(field, (message) => {
    errors[field] = message || '';
  });
}

function handleSendCode() {
  if (!phoneValid.value) {
    errors.phone = '请输入正确的手机号';
    return;
  }

  showCaptcha.value = true;
  resetSlider();
}

function closeCaptcha() {
  showCaptcha.value = false;
  resetSlider();
}

function resetSlider() {
  sliderPosition.value = 0;
  targetPosition.value = Math.random() * 30 + 60;
}

function handleSliderStart() {
  isDragging.value = true;
}

function handleSliderMove(event: MouseEvent | TouchEvent) {
  if (!isDragging.value) return;

  const container = document.querySelector('.slider-background') as HTMLElement;
  if (!container) return;

  const rect = container.getBoundingClientRect();
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
  let newPosition = ((clientX - rect.left) / rect.width) * 100;
  newPosition = Math.max(0, Math.min(100, newPosition));

  sliderPosition.value = newPosition;

  if (Math.abs(sliderPosition.value - targetPosition.value) < 5) {
    completeCaptcha();
  }
}

function handleSliderEnd() {
  isDragging.value = false;

  if (Math.abs(sliderPosition.value - targetPosition.value) >= 5) {
    sliderPosition.value = 0;
  }
}

function completeCaptcha() {
  isDragging.value = false;
  showCaptcha.value = false;
  startCountdown();
  sendVerificationCode();
}

function startCountdown() {
  countdown.value = 60;
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
}

 function sendVerificationCode() {
  sendingCode.value = true;
  try {
     sendSmsCodeApi({
       phone: formData.phone,
       codeType: 'login' as VerificationCodeType
     });
  } finally {
    sendingCode.value = false;
  }
}

async function handleSubmit() {
  if (!canSubmit.value) {
    if (!phoneValid.value) {
      errors.phone = '请输入正确的手机号';
      phoneFormRef.value?.validateField('phone');
    }
    if (formData.code.length !== 6) {
      errors.code = '请输入6位验证码';
      phoneFormRef.value?.validateField('code');
    }
    return;
  }

  loading.value = true;
  try {
    emit('login', {
      type: 'phone',
      phone: formData.phone,
      code: formData.code,
    });
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.phone-login {
  padding: 20px 0;
}

.phone-form {
  .el-form-item {
    margin-bottom: 20px;
  }
}

.phone-prefix {
  font-weight: 600;
  color: var(--el-text-color-primary);
  padding-right: 8px;
  border-right: 1px solid var(--el-border-color);
  margin-right: 8px;
}

.code-input-wrapper {
  display: flex;
  gap: 12px;
  width: 100%;

  .code-input {
    flex: 1;
  }

  .code-button {
    flex-shrink: 0;
    min-width: 120px;
    height: 48px;
  }
}

.login-button {
  width: 100%;
  height: 48px;
}

.captcha-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.captcha-modal {
  background: white;
  border-radius: 8px;
  width: 360px;
  max-width: 90vw;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.captcha-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color);

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
}

.captcha-body {
  padding: 30px 20px;
}

.slider-captcha {
  .slider-background {
    position: relative;
    height: 40px;
    background: #f0f0f0;
    border-radius: 4px;
    overflow: hidden;
  }

  .slider-target {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 40px;
    background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
    border-radius: 4px;
  }

  .slider-block {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 40px;
    background: white;
    border: 2px solid #d9d9d9;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    user-select: none;
    transition: left 0.1s ease;

    &:active {
      cursor: grabbing;
    }
  }

  .slider-hint {
    margin-top: 12px;
    text-align: center;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.error-tip {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
}

@media (max-width: 768px) {
  .phone-login {
    padding: 15px 0;
  }

  .phone-form {
    width: 100%;

    .el-form-item {
      width: 100%;
      margin-bottom: 16px;
    }

    .el-input {
      width: 100%;
      min-width: 280px;
    }
  }

  .code-input-wrapper {
    flex-direction: column;
    width: 100%;

    .code-input {
      width: 100%;
      min-width: 280px;
    }

    .code-button {
      width: 100%;
      min-width: 280px;
    }
  }

  .captcha-modal {
    width: 320px;
  }
}
</style>

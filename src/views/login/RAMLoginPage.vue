<template>
  <div class="ram-login-card">
    <div class="ram-card-header">
      <h2 class="ram-title">RAM 子账号登录</h2>
      <p class="ram-desc">使用企业 RAM 子账号安全登录系统</p>
    </div>

    <div class="ram-card-body">
      <!-- 安全提示 -->
      <div class="security-alert">
        <el-icon class="alert-icon"><InfoFilled /></el-icon>
        <div class="alert-content">
          <p>为了更好地保护您的账户安全，登录时已开启 MFA 多因素认证。</p>
          <p>长期未登录的闲置 RAM 用户可能被自动禁用。</p>
        </div>
      </div>

      <!-- 登录表单 -->
      <el-form ref="ramFormRef" :model="formData" :rules="formRules" class="login-form" @submit.prevent="handleNext">
        <el-form-item prop="username" class="form-group">
          <label class="form-label">
            <span class="required-mark">*</span>
            <span>用户名</span>
          </label>
          <el-input
            v-model="formData.username"
            placeholder="<用户名>@<默认域名> 或 <用户名>@<企业别名>"
            size="large"
            class="form-input"
            clearable
          />
          <div class="input-tip">例如：username@11383226193497 或 username@company-alias</div>
          <div v-if="errors.username" class="error-message">{{ errors.username }}</div>
        </el-form-item>

        <el-form-item class="form-group">
          <el-button
            type="primary"
            size="large"
            class="submit-btn"
            :loading="loading"
            :disabled="!canSubmit"
            @click="handleNext"
          >
            下一步
          </el-button>
        </el-form-item>
      </el-form>

      <div class="agreement-section">
        <span>登录并使用 RAM 需遵守</span>
        <el-link type="primary" :underline="false">产品协议</el-link>
      </div>

      <!-- 底部链接 -->
      <div class="form-footer">
        <div class="divider-line">
          <span class="divider-text">或</span>
        </div>
        <router-link to="/login" class="footer-link">
          返回主账号登录
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'

const ramFormRef = ref()
const formData = reactive({
  username: ''
})
const errors = reactive({
  username: ''
})
const loading = ref(false)

const formRules = {
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value || value.trim() === '') {
          callback(new Error('用户名不能为空'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const canSubmit = computed(() => {
  return formData.username && formData.username.trim() !== ''
})

async function handleNext() {
  const valid = await ramFormRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    // TODO: 调用 RAM 登录 API
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('RAM 登录下一步:', { username: formData.username })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.ram-login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  width: 100%;
  max-width: 460px;
}

html.dark .ram-login-card {
  background: rgba(30, 30, 50, 0.95);
}

.ram-card-header {
  padding: 32px 32px 0;
  text-align: center;
}

.ram-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}

.ram-desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

.ram-card-body {
  padding: 24px 32px 32px;
}

.security-alert {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #e6f4ff 0%, #f0f7ff 100%);
  border-radius: 8px;
  border-left: 4px solid var(--el-color-primary);
  margin-bottom: 24px;
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
  margin: 0 0 4px 0;
  font-size: 13px;
  color: var(--el-text-color-regular);
  line-height: 1.6;

  &:last-child {
    margin-bottom: 0;
  }
}

.login-form {
  margin: 0;
}

.form-group {
  margin-bottom: 20px;
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

.agreement-section {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  justify-content: center;
  margin-top: 8px;
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
  color: var(--el-color-primary);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

@media (max-width: 768px) {
  .ram-card-header {
    padding: 24px 20px 0;
  }

  .ram-card-body {
    padding: 20px 20px 24px;
  }

  .ram-title {
    font-size: 20px;
  }
}
</style>

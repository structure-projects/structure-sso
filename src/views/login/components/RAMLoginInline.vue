<template>
  <div class="ram-login-inline">
    <el-form
      ref="ramFormRef"
      :model="formData"
      :rules="formRules"
      class="ram-form"
      @submit.prevent="handleSubmit"
    >
      <el-form-item prop="parentAccount" :error="errors.parentAccount">
        <el-select
          v-model="formData.parentAccount"
          placeholder="请选择或输入父账号"
          filterable
          allow-create
          default-first-option
          size="large"
          class="w-full"
          @change="handleParentAccountChange"
        >
          <el-option
            v-for="account in parentAccounts"
            :key="account.id"
            :label="account.name"
            :value="account.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item prop="username" :error="errors.username">
        <el-input
          v-model="formData.username"
          placeholder="请输入子账号"
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

      <el-form-item prop="password" :error="errors.password">
        <el-input
          v-model="formData.password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="请输入密码"
          size="large"
          class="h-[48px]"
          @input="handlePasswordInput"
          @blur="validateField('password')"
        >
          <template #prefix>
            <el-icon><Lock /></el-icon>
          </template>
          <template #suffix>
            <el-icon class="password-toggle" @click="togglePasswordVisibility">
              <component :is="showPassword ? 'View' : 'Hide'" />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          size="large"
          class="w-full h-[48px]"
          :loading="loading"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          子账号登录
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { User, Lock, View, Hide } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';

const emit = defineEmits<{
  (e: 'login', data: any): void;
}>();

const ramFormRef = ref<FormInstance>();
const showPassword = ref(false);
const loading = ref(false);

const formData = reactive({
  parentAccount: '',
  username: '',
  password: '',
});

const errors = reactive({
  parentAccount: '',
  username: '',
  password: '',
});

const parentAccounts = ref([
  { id: 'parent_001', name: '主账号 - 企业A' },
  { id: 'parent_002', name: '主账号 - 企业B' },
  { id: 'parent_003', name: '主账号 - 企业C' },
]);

const formRules: FormRules = {
  parentAccount: [
    { required: true, message: '请选择或输入父账号', trigger: 'change' },
  ],
  username: [
    { required: true, message: '请输入子账号', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        const usernameRegex = /^[a-zA-Z0-9_@.-]+$/;
        if (!usernameRegex.test(value)) {
          callback(new Error('子账号只能包含字母、数字及特殊字符_-@.'));
        } else if (value.length < 3) {
          callback(new Error('子账号长度不能少于3位'));
        } else if (value.length > 64) {
          callback(new Error('子账号长度不能超过64位'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value.length < 6) {
          callback(new Error('密码长度不能少于6位'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
};

const canSubmit = computed(() => {
  return (
    formData.parentAccount &&
    formData.username.length >= 3 &&
    formData.password.length >= 6
  );
});

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

function handleParentAccountChange(value: string) {
  validateField('parentAccount');
}

function handleUsernameInput(value: string) {
  errors.username = '';
}

function handlePasswordInput(value: string) {
  errors.password = '';
}

function validateField(field: string) {
  ramFormRef.value?.validateField(field, (message: string | boolean) => {
    errors[field as keyof typeof errors] = typeof message === 'string' ? message : '';
  });
}

async function handleSubmit() {
  const valid = await ramFormRef.value?.validate().catch(() => false);
  if (!valid) {
    const firstError = Object.keys(errors).find(k => errors[k as keyof typeof errors]);
    if (firstError) {
      const input = document.querySelector(`[name="${firstError}"]`) as HTMLElement;
      input?.focus();
    }
    return;
  }

  loading.value = true;
  try {
    await performRAMLogin();
  } finally {
    loading.value = false;
  }
}

async function performRAMLogin() {
  await new Promise(resolve => setTimeout(resolve, 1000));
  emit('login', {
    type: 'ram',
    parentAccount: formData.parentAccount,
    username: formData.username,
    password: formData.password,
  });
}
</script>

<style lang="scss" scoped>
.ram-login-inline {
  padding: 20px 0;
}

.ram-form {
  .el-form-item {
    background: var(--el-input-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: 5px;
  }
}

:deep(.el-input) {
  .el-input__wrapper {
    padding: 0;
    background-color: transparent;
    box-shadow: none;

    &.is-focus,
    &:hover {
      box-shadow: none !important;
    }
  }
}

.password-toggle {
  cursor: pointer;
  color: var(--el-text-color-secondary);
  transition: color 0.3s;

  &:hover {
    color: var(--el-color-primary);
  }
}
</style>

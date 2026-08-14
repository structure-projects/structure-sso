<template>
  <div class="qrcode-confirm-page">
    <div class="confirm-card">
      <div class="brand">
        <el-icon class="logo"><Monitor /></el-icon>
        <h1 class="title">Structure IAM</h1>
      </div>

      <h2 class="subtitle">确认登录</h2>
      <p class="desc">您正在使用扫码登录电脑端</p>

      <div v-if="loading" class="loading-section">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <p>正在处理...</p>
      </div>

      <template v-else>
        <div v-if="!isLoggedIn" class="login-section">
          <p class="tip">请先登录以确认本次扫码登录</p>
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            size="large"
          >
            <el-form-item prop="account">
              <el-input
                v-model="loginForm.account"
                placeholder="用户名/手机号/邮箱"
                :prefix-icon="User"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="密码"
                :prefix-icon="Lock"
                show-password
                @keyup.enter="handleLogin"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                class="login-btn"
                :loading="loginLoading"
                @click="handleLogin"
              >
                登录并确认
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <div v-else class="confirm-section">
          <div class="user-info">
            <el-icon class="user-icon"><UserFilled /></el-icon>
            <span class="username">{{ username }}</span>
          </div>
          <p class="tip">是否确认登录电脑端？</p>
          <div class="actions">
            <el-button
              type="primary"
              size="large"
              class="confirm-btn"
              :loading="confirming"
              @click="handleConfirm"
            >
              确认登录
            </el-button>
            <el-button
              size="large"
              class="cancel-btn"
              @click="handleCancel"
            >
              取消
            </el-button>
          </div>
        </div>
      </template>

      <p class="footer-tip">请在确保是您本人操作后再点击确认</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { Loading, User, Lock, UserFilled, Monitor } from '@element-plus/icons-vue';
import { loginApi, confirmQRCodeApi } from '@/api/auth';
import { getSavedToken, saveToken, type TokenResponse } from '@/config/oauth';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const isLoggedIn = ref(false);
const username = ref('');
const confirming = ref(false);

const loginFormRef = ref<FormInstance>();
const loginForm = ref({
  account: '',
  password: ''
});
const loginLoading = ref(false);

const loginRules: FormRules = {
  account: [{ required: true, message: '请输入用户名/手机号/邮箱', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

const qrcodeId = ref('');

onMounted(() => {
  qrcodeId.value = (route.query.qrcodeId as string) || '';
  if (!qrcodeId.value) {
    ElMessage.error('无效的二维码');
    loading.value = false;
    return;
  }

  checkLoginStatus();
});

/**
 * 检查当前是否已登录
 */
function checkLoginStatus() {
  const token = getSavedToken();
  if (token?.access_token) {
    // 简单认为存在 token 即已登录；后续请求失败会触发重新登录
    isLoggedIn.value = true;
    // 尝试从 token 中解析用户名（JWT payload）
    username.value = parseUsernameFromToken(token.access_token);
  }
  loading.value = false;
}

/**
 * 从 JWT token 中解析用户名
 */
function parseUsernameFromToken(token: string): string {
  try {
    const payload = token.split('.')[1];
    if (!payload) return '已登录用户';
    const decoded = JSON.parse(atob(payload));
    return decoded?.sub || decoded?.username || '已登录用户';
  } catch {
    return '已登录用户';
  }
}

/**
 * 处理登录并确认
 */
async function handleLogin() {
  if (!loginFormRef.value) return;

  const valid = await loginFormRef.value.validate().catch(() => false);
  if (!valid) return;

  loginLoading.value = true;
  try {
    const result = await loginApi({
      username: loginForm.value.account,
      password: loginForm.value.password,
      loginType: 'USERNAME'
    });

    if (result?.accessToken) {
      saveToken({
        access_token: result.accessToken,
        token_type: result.tokenType || 'Bearer',
        expires_in: result.expiresIn || 3600,
        refresh_token: result.refreshToken,
        scope: (result as any).scope || ''
      } as TokenResponse);
      isLoggedIn.value = true;
      username.value = result.username || loginForm.value.account;
      ElMessage.success('登录成功，请确认登录');
    } else {
      ElMessage.error('登录失败，未获取到令牌');
    }
  } catch (error) {
    console.error('登录失败:', error);
    ElMessage.error('登录失败，请检查用户名和密码');
  } finally {
    loginLoading.value = false;
  }
}

/**
 * 确认二维码登录
 */
async function handleConfirm() {
  if (!qrcodeId.value) {
    ElMessage.error('二维码ID不存在');
    return;
  }

  confirming.value = true;
  try {
    await confirmQRCodeApi(qrcodeId.value);
    ElMessage.success('已确认登录，请在电脑端查看');
    // 停留 2 秒后关闭或跳转到首页
    setTimeout(() => {
      router.push('/login/success');
    }, 2000);
  } catch (error) {
    console.error('确认登录失败:', error);
    ElMessage.error('确认登录失败，请刷新二维码重试');
  } finally {
    confirming.value = false;
  }
}

/**
 * 取消登录
 */
function handleCancel() {
  ElMessage.info('已取消登录');
  router.push('/login');
}
</script>

<style scoped lang="scss">
.qrcode-confirm-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  padding: 20px;

  .confirm-card {
    width: 100%;
    max-width: 420px;
    background: #fff;
    border-radius: 16px;
    padding: 40px 32px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    text-align: center;
  }

  .brand {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 24px;

    .logo {
      font-size: 40px;
      color: #409eff;
    }

    .title {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }

  .subtitle {
    font-size: 20px;
    color: #303133;
    margin: 0 0 8px;
  }

  .desc {
    font-size: 14px;
    color: #606266;
    margin-bottom: 32px;
  }

  .loading-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 0;
    color: #909399;

    .loading-icon {
      font-size: 32px;
      animation: rotating 2s linear infinite;
      margin-bottom: 12px;
    }
  }

  .login-section {
    text-align: left;

    .tip {
      text-align: center;
      color: #606266;
      font-size: 14px;
      margin-bottom: 20px;
    }

    .login-btn {
      width: 100%;
    }
  }

  .confirm-section {
    .user-info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 16px;

      .user-icon {
        font-size: 24px;
        color: #409eff;
      }

      .username {
        font-size: 16px;
        color: #303133;
        font-weight: 500;
      }
    }

    .tip {
      color: #606266;
      font-size: 14px;
      margin-bottom: 24px;
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .confirm-btn,
      .cancel-btn {
        width: 100%;
      }
    }
  }

  .footer-tip {
    margin-top: 24px;
    font-size: 12px;
    color: #909399;
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

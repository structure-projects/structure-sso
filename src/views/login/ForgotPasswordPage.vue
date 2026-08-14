<template>
  <div class="forgot-password-page">
    <ForgotPassword @back="handleBack" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import ForgotPassword from './components/ForgotPassword.vue';

const router = useRouter();

function handleBack() {
  router.push('/login');
}
</script>

<style lang="scss" scoped>
.forgot-password-page {
  width: 100%;
  max-width: 460px;
  margin: 0 auto;
  padding: 40px 32px;
  background: var(--el-bg-color);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

html.dark .forgot-password-page {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
}
</style>

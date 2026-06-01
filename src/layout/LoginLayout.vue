<template>
  <div class="login-layout">
    <header class="page-header">
      <div class="header-content">
        <div class="brand-logo">
          <span class="logo-text">{{ defaultSettings.title }}</span>
        </div>
      </div>
    </header>

    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
// 简化版本 - 移除复杂的依赖
const defaultSettings = {
  title: '统一门户系统'
}
</script>

<style lang="scss" scoped>
.login-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
}

.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--el-border-color);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand-logo {
  display: flex;
  align-items: center;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--el-color-primary);
  letter-spacing: 1px;
}

.main-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px 40px 40px;
}

@media (max-width: 768px) {
  .header-content {
    padding: 12px 20px;
  }

  .main-content {
    padding: 80px 20px 30px;
  }

  .logo-text {
    font-size: 18px;
  }
}
</style>

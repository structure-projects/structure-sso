<template>
  <div class="login-layout">
    <header class="page-header">
      <div class="header-content">
        <div class="brand-logo">
          <img src="/src/assets/logo.png" :alt="$t('layout.logoAlt')" class="logo-img" />
          <span class="logo-text">{{ $t('layout.appTitle') }}</span>
        </div>
        <div class="header-actions">
          <el-switch
            v-model="isDark"
            inline-prompt
            :active-icon="Moon"
            :inactive-icon="Sunny"
            @change="toggleTheme"
          />
          <LangSelect />
        </div>
      </div>
    </header>

    <main class="main-content">
      <router-view></router-view>
    </main>

    <footer class="page-footer">
      <div class="icp-info" v-show="icpVisible">
        <p>{{ $t('layout.copyright', { year: currentYear, company: $t('layout.companyName') }) }}</p>
        <p>{{ $t('layout.icpNumber') }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Moon, Sunny } from "@element-plus/icons-vue";
import LangSelect from "@/components/LangSelect/index.vue";

const isDark = ref(false);
const icpVisible = ref(true);
const currentYear = new Date().getFullYear();

const toggleTheme = () => {
  const html = document.documentElement;
  if (isDark.value) {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }
};
</script>

<style lang="scss" scoped>
.login-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  // background: url("/src/assets/images/login-bg.jpg") no-repeat center right;
  background-size: cover;
}

html.dark .login-layout {
  background: url("/src/assets/images/login-bg-dark.jpg") no-repeat center right;
  background-size: cover;
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

html.dark .page-header {
  background: rgba(26, 26, 46, 0.95);
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
  gap: 8px;
}

.logo-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--el-color-primary);
  letter-spacing: 1px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.main-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px 40px 60px;
}

.page-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid var(--el-border-color);
  padding: 12px 40px;
}

html.dark .page-footer {
  background: rgba(26, 26, 46, 0.95);
}

.icp-info {
  text-align: center;
  font-size: 10px;
  color: var(--el-text-color-regular);
}

.icp-info p {
  margin: 0;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .header-content {
    padding: 12px 20px;
  }

  .main-content {
    padding: 80px 20px 80px;
  }

  .logo-text {
    font-size: 18px;
  }

  .page-footer {
    padding: 12px 20px;
  }
}
</style>

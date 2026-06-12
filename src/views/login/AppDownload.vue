<template>
  <div class="app-download-page">
    <div class="download-container">
      <div class="app-info">
        <div class="app-logo">
          <img src="/src/assets/logo.png" :alt="$t('layout.appTitle')" />
        </div>
        <h1>{{ $t('appDownload.appName') }}</h1>
        <p>{{ $t('appDownload.appDesc') }}</p>
      </div>

      <div class="download-buttons">
        <a
          :href="iosDownloadUrl"
          class="download-btn ios-btn"
          @click="handleDownload('ios')"
        >
          <el-icon :size="24"><Iphone /></el-icon>
          <span>{{ $t('appDownload.downloadIOS') }}</span>
        </a>

        <a
          :href="androidDownloadUrl"
          class="download-btn android-btn"
          @click="handleDownload('android')"
        >
          <el-icon :size="24"><Monitor /></el-icon>
          <span>{{ $t('appDownload.downloadAndroid') }}</span>
        </a>
      </div>

      <div class="version-info">
        <p>{{ $t('appDownload.version') }}: {{ appVersion }}</p>
        <p>{{ $t('appDownload.updateDate') }}: {{ updateDate }}</p>
      </div>

      <div class="features">
        <h3>{{ $t('appDownload.featuresTitle') }}</h3>
        <ul>
          <li>{{ $t('appDownload.feature1') }}</li>
          <li>{{ $t('appDownload.feature2') }}</li>
          <li>{{ $t('appDownload.feature3') }}</li>
        </ul>
      </div>

      <div class="qr-section">
        <p>{{ $t('appDownload.qrHint') }}</p>
        <p class="qr-link">
          <router-link to="/login">{{ $t('appDownload.viewQRCode') }}</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Iphone, Monitor } from '@element-plus/icons-vue';

const iosDownloadUrl = ref('#');
const androidDownloadUrl = ref('#');
const appVersion = ref('1.0.0');
const updateDate = ref('2024-01-01');

const detectDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod')) {
    // iOS设备
    window.location.href = iosDownloadUrl.value;
  } else if (userAgent.includes('android')) {
    // Android设备
    window.location.href = androidDownloadUrl.value;
  }
};

const handleDownload = (platform: 'ios' | 'android') => {
  // 这里可以添加埋点或其他逻辑
  console.log(`Download ${platform} app`);
};

onMounted(() => {
  // 可以根据实际配置设置下载链接
  // iosDownloadUrl.value = 'https://apps.apple.com/cn/app/xxx/id123456789';
  // androidDownloadUrl.value = 'https://play.google.com/store/apps/details?id=com.xxx';
});
</script>

<style lang="scss" scoped>
.app-download-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.download-container {
  max-width: 480px;
  width: 100%;
  background: #fff;
  border-radius: 20px;
  padding: 48px 40px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.app-logo {
  width: 100px;
  height: 100px;
  margin: 0 auto 24px;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.app-info {
  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 12px;
  }

  p {
    font-size: 14px;
    color: #666;
    margin: 0;
    line-height: 1.6;
  }
}

.download-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 32px 0;
}

.download-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }

  &.ios-btn {
    background: #000;
    color: #fff;

    &:hover {
      background: #1a1a1a;
    }
  }

  &.android-btn {
    background: #3dc46d;
    color: #fff;

    &:hover {
      background: #2a9d4e;
    }
  }
}

.version-info {
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 24px;

  p {
    font-size: 12px;
    color: #999;
    margin: 4px 0;
  }
}

.features {
  text-align: left;
  margin-bottom: 24px;

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 12px;
  }

  ul {
    margin: 0;
    padding-left: 20px;

    li {
      font-size: 13px;
      color: #666;
      margin: 8px 0;
      line-height: 1.5;
    }
  }
}

.qr-section {
  padding-top: 24px;
  border-top: 1px solid #eee;

  p {
    font-size: 13px;
    color: #999;
    margin: 0 0 8px;
  }

  .qr-link {
    a {
      color: var(--el-color-primary);
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

@media (max-width: 480px) {
  .download-container {
    padding: 32px 24px;
  }

  .app-logo {
    width: 80px;
    height: 80px;
  }

  .app-info h1 {
    font-size: 24px;
  }
}
</style>

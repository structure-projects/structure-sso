<template>
  <div class="login-tabs-container">
    <div class="login-tabs">
      <div
        v-for="(tab, index) in tabs"
        :key="tab.key"
        :class="['login-tab', { active: activeTab === index }]"
        :tabindex="0"
        role="tab"
        :aria-selected="activeTab === index"
        @click="handleTabClick(index)"
        @keydown.enter="handleTabClick(index)"
        @keydown.space.prevent="handleTabClick(index)"
        @keydown.tab="handleTabKeydown($event, index)"
      >
        <span class="tab-icon">
          <component :is="tab.icon" />
        </span>
        <span class="tab-text">{{ tab.label }}</span>
        <div v-if="activeTab === index" class="tab-indicator"></div>
      </div>
    </div>

    <div class="login-panels" ref="panelsRef">
      <div
        v-for="(tab, index) in tabs"
        :key="tab.key + '-panel'"
        v-show="activeTab === index"
        :class="['login-panel', { 'panel-enter': panelEnter, 'panel-leave': panelLeave }]"
      >
        <component
          :is="tab.component"
          v-if="activeTab === index"
          :form-data="formDataMap[tab.key]"
          @update:form-data="(data) => handleFormDataUpdate(tab.key, data)"
          @login="handleLogin"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, shallowRef, watch, nextTick, markRaw } from 'vue';
import { FullScreen, Phone, User, Share } from '@element-plus/icons-vue';
import QRCodeLogin from './QRCodeLogin.vue';
import PhoneLogin from './PhoneLogin.vue';
import AccountLogin from './AccountLogin.vue';
import SocialLogin from './SocialLogin.vue';

interface TabItem {
  key: string;
  label: string;
  icon: any;
  component: any;
}

interface LoginFormData {
  [key: string]: any;
}

const props = defineProps<{
  defaultTab?: number;
}>();

const emit = defineEmits<{
  (e: 'login', data: any): void;
}>();

const tabs: TabItem[] = [
  { key: 'qrcode', label: '扫码登录', icon: markRaw(FullScreen), component: markRaw(QRCodeLogin) },
  { key: 'phone', label: '手机号登录', icon: markRaw(Phone), component: markRaw(PhoneLogin) },
  { key: 'account', label: '用户名/邮箱', icon: markRaw(User), component: markRaw(AccountLogin) },
  { key: 'social', label: '社交账号', icon: markRaw(Share), component: markRaw(SocialLogin) },
];

const activeTab = ref(props.defaultTab || 0);
const panelEnter = ref(false);
const panelLeave = ref(false);
const panelsRef = ref<HTMLElement>();
const formDataMap = ref<LoginFormData>({
  qrcode: {},
  phone: {},
  account: {},
  social: {},
});
const scrollPositions = ref<{ [key: string]: number }>({});

const currentDirection = ref<'left' | 'right'>('right');

function handleTabClick(index: number) {
  if (index === activeTab.value) return;

  currentDirection.value = index > activeTab.value ? 'right' : 'left';
  activeTab.value = index;

  const tabKey = tabs[index].key;
  nextTick(() => {
    if (panelsRef.value) {
      const panel = panelsRef.value.querySelector('.login-panel') as HTMLElement;
      if (panel) {
        panel.style.transform = `translateX(${currentDirection.value === 'right' ? '100px' : '-100px'})`;
        panel.style.opacity = '0';
      }
    }
  });
}

function handleTabKeydown(event: KeyboardEvent, index: number) {
  if (event.key === 'Tab' && !event.shiftKey) {
    event.preventDefault();
    const nextIndex = (index + 1) % tabs.length;
    handleTabClick(nextIndex);
    nextTick(() => {
      const nextTab = document.querySelectorAll('.login-tab')[nextIndex] as HTMLElement;
      nextTab?.focus();
    });
  }
}

function handleFormDataUpdate(key: string, data: any) {
  formDataMap.value[key] = { ...formDataMap.value[key], ...data };
}

function handleLogin(data: any) {
  emit('login', data);
}

watch(activeTab, (newIndex, oldIndex) => {
  const tabKey = tabs[oldIndex]?.key;
  if (tabKey && panelsRef.value) {
    scrollPositions.value[tabKey] = panelsRef.value.scrollTop;
  }

  if (panelsRef.value) {
    nextTick(() => {
      const panel = panelsRef.value!.querySelector('.login-panel') as HTMLElement;
      if (panel) {
        panel.style.transform = 'translateX(0)';
        panel.style.opacity = '1';
      }
    });
  }
});

defineExpose({
  activeTab,
  formDataMap,
});
</script>

<style lang="scss" scoped>
.login-tabs-container {
  width: 100%;
}

.login-tabs {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  position: relative;
  border-bottom: 1px solid var(--el-border-color);
  padding-bottom: 0;
}

.login-tab {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  font-size: 14px;
  color: var(--el-text-color-regular);
  font-weight: 400;
  outline: none;

  &:hover {
    color: var(--el-color-primary);
    background-color: var(--el-fill-color-light);
    border-radius: 4px 4px 0 0;
  }

  &:focus {
    outline: 2px solid var(--el-color-primary);
    outline-offset: -2px;
    border-radius: 4px;
  }

  &.active {
    color: var(--el-color-primary);
    font-weight: 600;
    border-bottom-color: var(--el-color-primary);

    .tab-indicator {
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--el-color-primary);
      border-radius: 2px 2px 0 0;
    }
  }

  .tab-icon {
    font-size: 16px;
    display: flex;
    align-items: center;
  }

  .tab-text {
    white-space: nowrap;
  }
}

.login-panels {
  position: relative;
  min-height: 300px;
}

.login-panel {
  transition: transform 0.3s ease, opacity 0.3s ease;
  transform: translateX(0);
  opacity: 1;
}

@media (max-width: 768px) {
  .login-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
    justify-content: flex-start;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding-bottom: 0;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .login-tab {
    flex-shrink: 0;
    padding: 10px 12px;
    font-size: 13px;

    .tab-icon {
      font-size: 14px;
    }
  }
}
</style>

<template>
  <div class="smart-tabs-container">
    <div class="tabs-scroll">
      <div
        v-for="(tab, index) in tabs"
        :key="tab.key"
        :class="['smart-tab', { active: activeTab === index }]"
        :tabindex="0"
        role="tab"
        :aria-selected="activeTab === index"
        @click="handleTabClick(index)"
        @keydown.enter="handleTabClick(index)"
        @keydown.space.prevent="handleTabClick(index)"
      >
        <div class="tab-image-container">
          <component :is="tab.icon" class="tab-svg-icon" />
        </div>
        <span class="tab-text">{{ tab.label }}</span>
        <div class="tab-indicator"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TabItem {
  key: string;
  label: string;
  icon: any;
  component?: any;
}

interface Props {
  tabs: TabItem[];
  activeTab: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:activeTab', index: number): void;
}>();

function handleTabClick(index: number) {
  emit('update:activeTab', index);
}
</script>

<style lang="scss" scoped>
.smart-tabs-container {
  display: flex;
  width: 100%;
  border-bottom: 1px solid var(--el-border-color);
}

.tabs-scroll {
  display: flex;
  width: 100%;
}

.smart-tab {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 8px;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  font-size: 14px;
  color: var(--el-text-color-regular);
  font-weight: 400;
  outline: none;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
  box-sizing: border-box;

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

    .tab-indicator {
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--el-color-primary);
      border-radius: 2px 2px 0 0;
    }
  }
}

.tab-image-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-svg-icon {
  font-size: 28px;
}

.tab-text {
  white-space: nowrap;
  font-size: 13px;
  font-weight: 400;
}

@media (max-width: 768px) {
  .smart-tab {
    padding: 12px 4px;
    gap: 4px;
  }

  .tab-svg-icon {
    font-size: 22px;
  }

  .tab-text {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .smart-tab {
    padding: 10px 2px;
    gap: 2px;
  }

  .tab-svg-icon {
    font-size: 18px;
  }

  .tab-text {
    font-size: 11px;
  }
}
</style>

<template>
  <el-dropdown trigger="click" @command="handleLanguageChange">
    <div>
      <el-icon :size="20"><OfficeBuilding /></el-icon>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item :disabled="currentLang === 'zh-cn'" command="zh-cn">
          {{ $t('langSelect.chinese') }}
        </el-dropdown-item>
        <el-dropdown-item :disabled="currentLang === 'en'" command="en">
          {{ $t('langSelect.english') }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { OfficeBuilding } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const { locale, t } = useI18n();
const currentLang = ref(locale.value);

function handleLanguageChange(lang: string) {
  locale.value = lang;
  currentLang.value = lang;
  ElMessage.success(t('langSelect.switchSuccess'));
}
</script>

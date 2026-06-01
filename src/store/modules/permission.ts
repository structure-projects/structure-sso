import { RouteRecordRaw } from "vue-router";
import { defineStore } from "pinia";
import { ref } from "vue";
import { store } from "@/store";

// 简化版本 - 不需要复杂的路由逻辑
const constantRoutes: RouteRecordRaw[] = [];

// 注释掉不兼容的部分
// const modules = import.meta.glob("../../views/**/**.vue");
// const Layout = () => import("@/layout/index.vue");

// 简化版本 - 不需要复杂的权限逻辑

// setup
export const usePermissionStore = defineStore("permission", () => {
  // state
  const routes = ref<RouteRecordRaw[]>([]);

  // actions
  function setRoutes(newRoutes: RouteRecordRaw[]) {
    routes.value = newRoutes;
  }
  /**
   * 简化版本 - 直接返回空路由
   */
  function generateRoutes(roles: string[]) {
    return Promise.resolve([] as RouteRecordRaw[]);
  }
  /**
   * 获取与激活的顶部菜单项相关的混合模式左侧菜单集合
   */
  const mixLeftMenus = ref<RouteRecordRaw[]>([]);
  function setMixLeftMenus(topMenuPath: string) {
    const matchedItem = routes.value.find((item) => item.path === topMenuPath);
    if (matchedItem && matchedItem.children) {
      mixLeftMenus.value = matchedItem.children;
    }
  }
  return {
    routes,
    setRoutes,
    generateRoutes,
    mixLeftMenus,
    setMixLeftMenus,
  };
});

// 非setup
export function usePermissionStoreHook() {
  return usePermissionStore(store);
}

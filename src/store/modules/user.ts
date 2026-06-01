import { defineStore } from "pinia";
import {
  loginApi,
  logoutApi,
  phoneLoginApi,
  socialLoginApi,
} from "@/api/auth";
import router, { resetRouter } from "@/router";
import { store } from "@/store";
import { LoginData } from "@/api/auth/types";
import { UserInfo } from "@/api/system/user/types";
import { getUserInfoApi } from "@/api/system/user";
import { md5 } from "@/utils/crypto";
import { reactive, ref } from "vue";

const STORAGE_KEYS = {
  USER_ROLES: "userRoles",
  USER_PERMS: "userPerms",
  REDIRECT_URL: "redirectUrl",
};

export const useUserStore = defineStore("user", () => {
  const user: UserInfo = reactive({
    roles: [],
    perms: [],
  });

  const isLogin = ref(false);

  function clearUserInfo() {
    user.username = "";
    user.nickname = "";
    user.avatar = "";
    user.roles = [];
    user.perms = [];
    user.phone = "";
    user.email = "";
    user.remark = "";
  }

  function saveRedirectUrl(url: string) {
    sessionStorage.setItem(STORAGE_KEYS.REDIRECT_URL, url);
  }

  function getRedirectUrl(): string {
    return sessionStorage.getItem(STORAGE_KEYS.REDIRECT_URL) || "/";
  }

  function clearRedirectUrl() {
    sessionStorage.removeItem(STORAGE_KEYS.REDIRECT_URL);
  }

  async function login(loginData: LoginData) {
    console.log('[Login] Starting login process...')
    const encryptedData: LoginData = {
      ...loginData,
      password: md5(loginData.password),
    };
    
    try {
      console.log('[Login] Calling loginApi...')
      await loginApi(encryptedData);
      console.log('[Login] loginApi succeeded, setting isLogin=true...')
      isLogin.value = true;
      
      const redirectUrl = getRedirectUrl();
      console.log('[Login] Redirect URL:', redirectUrl)
      const needAuth = redirectUrl.startsWith('http://') || redirectUrl.startsWith('https://');
      console.log('[Login] Need auth:', needAuth)
      
      console.log('[Login] Navigating to /login/success with query:', {
        redirect: redirectUrl,
        needAuth: needAuth ? 'true' : 'false',
      })
      
      router.push({
        path: '/login/success',
        query: {
          redirect: redirectUrl,
          needAuth: needAuth ? 'true' : 'false',
        },
      });
      console.log('[Login] Navigation initiated')
    } catch (error) {
      console.error('[Login] Login failed:', error)
      throw error
    }
  }

  async function loginByPhone(phone: string, code: string) {
    await phoneLoginApi({ phone, code });
    isLogin.value = true;
    
    const redirectUrl = getRedirectUrl();
    const needAuth = redirectUrl.startsWith('http://') || redirectUrl.startsWith('https://');
    
    router.push({
      path: '/login/success',
      query: {
        redirect: redirectUrl,
        needAuth: needAuth ? 'true' : 'false',
      },
    });
  }

  async function loginBySocial(appId: string, platformCode: string, authCode: string) {
    await socialLoginApi(appId, {
      platformCode,
      authCode,
    });
    isLogin.value = true;
    
    const redirectUrl = getRedirectUrl();
    const needAuth = redirectUrl.startsWith('http://') || redirectUrl.startsWith('https://');
    
    router.push({
      path: '/login/success',
      query: {
        redirect: redirectUrl,
        needAuth: needAuth ? 'true' : 'false',
      },
    });
  }

  async function getUserInfo() {
    const { data } = await getUserInfoApi();
    if (!data) {
      throw new Error("Verification failed, please Login again.");
    }
    if (!data.roles || data.roles.length <= 0) {
      throw new Error("getUserInfo: roles must be a non-null array!");
    }
    Object.assign(user, { ...data });

    return data;
  }

  async function logout() {
    await logoutApi();
    isLogin.value = false;
    clearUserInfo();
    clearRedirectUrl();
    location.reload();
  }

  function resetToken() {
    isLogin.value = false;
    clearUserInfo();
    clearRedirectUrl();
    resetRouter();
  }

  return {
    user,
    isLogin,
    clearUserInfo,
    login,
    loginByPhone,
    loginBySocial,
    getUserInfo,
    logout,
    resetToken,
    saveRedirectUrl,
    getRedirectUrl,
    clearRedirectUrl,
  };
});

export function useUserStoreHook() {
  return useUserStore(store);
}

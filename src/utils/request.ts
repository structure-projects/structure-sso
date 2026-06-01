import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { ElMessage, ElMessageBox } from "element-plus";
import { generateRequestId, generateNonce, hmacSha256 } from "./index";
import router from "@/router";

interface RequestHeadersConfig {
  signatureSecret?: string;
  defaultTenantId?: string;
}

let requestHeadersConfig: RequestHeadersConfig = {
  signatureSecret: undefined,
  defaultTenantId: "1",
};

export function setRequestHeadersConfig(config: Partial<RequestHeadersConfig>) {
  requestHeadersConfig = { ...requestHeadersConfig, ...config };
}

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API || "/web-api",
  timeout: 50000,
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
  withCredentials: true,
});

service.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const selectedOrgId = sessionStorage.getItem("selectedOrgId");
    if (selectedOrgId) {
      config.headers["X-Tenant-Id"] = selectedOrgId;
    } else if (requestHeadersConfig.defaultTenantId) {
      config.headers["X-Tenant-Id"] = requestHeadersConfig.defaultTenantId;
    }

    const deviceId = await (async () => {
      let deviceId = sessionStorage.getItem("deviceId");
      if (!deviceId) {
        const FingerprintJS = (await import("@fingerprintjs/fingerprintjs"))
          .default;
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        deviceId = result.visitorId;
        sessionStorage.setItem("deviceId", deviceId);
      }
      return deviceId;
    })();
    config.headers["X-Device-Id"] = deviceId;

    config.headers["X-Request-Id"] = generateRequestId();

    const timestamp = Date.now();
    config.headers["X-Timestamp"] = timestamp.toString();

    const nonce = generateNonce();
    config.headers["X-Nonce"] = nonce;

    if (requestHeadersConfig.signatureSecret) {
      const method = config.method?.toUpperCase() || "GET";
      const url = config.url || "";
      const signStr = `${method}${url}${timestamp}${nonce}`;
      const signature = await hmacSha256(
        signStr,
        requestHeadersConfig.signatureSecret,
      );
      config.headers["X-Signature"] = signature;
    }

    return config;
  },
  (error: any) => {
    console.log(error);
    return Promise.reject(error);
  },
);

service.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.data instanceof ArrayBuffer) {
      return response;
    }
    
    const { code, message, success, data } = response.data;
    if (success === true) {
      return data;
    }
    ElMessage.error(message || response.data.message || "Error");
    return Promise.reject(new Error(message || "Error"));
  },
  async (error: any) => {
    if (error.response && error.response.data) {
      const { code, message } = error.response.data;

      if (code === "INVALID_AUTHENTICATION" || code === "NOT_LOGGED_IN") {
        await handleTokenExpired();
        return Promise.reject(error);
      }

      if (code !== "INVALID_AUTHENTICATION" && code !== "NOT_LOGGED_IN") {
        ElMessage.error(message || "系统出错");
      }
    }
    return Promise.reject(error.message);
  },
);

async function handleTokenExpired() {
  try {
    await ElMessageBox.confirm("当前页面已失效，请重新登录", "提示", {
      confirmButtonText: "去登录",
      cancelButtonText: "访问首页",
      type: "warning",
    });
    router.push("/login");
  } catch {
    router.push("/");
  }
}

export default service;

/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@/settings' {
  const defaultSettings: {
    title: string;
    version: string;
  };
  export default defaultSettings;
}

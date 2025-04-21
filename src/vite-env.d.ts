/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PACKAGE_ID: string;
    readonly VITE_CAMPAIGN_REGISTRY_ID: string;
    readonly VITE_FEATURED_CAMPAIGNS_ID: string;
    readonly VITE_SUI_NETWORK: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  
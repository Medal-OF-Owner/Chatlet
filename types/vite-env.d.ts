interface ImportMetaEnv {
  readonly VITE_APP_TITLE?: string;
  readonly VITE_OAUTH_PORTAL_URL?: string;
  readonly VITE_APP_ID?: string;
  readonly VITE_FRONTEND_FORGE_API_KEY?: string;
  readonly VITE_FRONTEND_FORGE_API_URL?: string;
  // add other VITE_ variables used in your project here as optional strings
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 列图接口地址（部署 worker/ 后填入，或构建时注入）；留空则只用本地 + txt */
  readonly VITE_PHOTOS_API?: string
}

interface ViewTransition {
  readonly ready: Promise<void>
  readonly finished: Promise<void>
  readonly updateCallbackDone: Promise<void>
  skipTransition(): void
}

interface Document {
  startViewTransition?: (callback: () => void) => ViewTransition
}

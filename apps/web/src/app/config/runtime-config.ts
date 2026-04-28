import { environment } from '../../environments/environment';

declare global {
  interface Window {
    __APP_CONFIG__?: Partial<typeof environment>;
  }
}

const runtimeConfig = typeof window !== 'undefined' ? window.__APP_CONFIG__ : undefined;

export const appRuntimeConfig = {
  ...environment,
  ...(runtimeConfig ?? {})
};

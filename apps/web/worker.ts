import apiWorker from '../api/src/index';

type AssetBinding = {
  fetch: (request: Request) => Promise<Response>;
};

export interface Env {
  ASSETS: AssetBinding;
  APP_ORIGIN?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

const hasFileExtension = (pathname: string) => /\.[a-z0-9]+$/i.test(pathname);

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      const apiPath = url.pathname.slice(4) || '/';
      const apiRequest = new Request(new URL(`${apiPath}${url.search}`, url), request);
      return apiWorker.fetch(apiRequest, env);
    }

    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) {
      return response;
    }

    if (hasFileExtension(url.pathname)) {
      return response;
    }

    const indexRequest = new Request(new URL('/index.html', url), request);
    return env.ASSETS.fetch(indexRequest);
  }
} satisfies ExportedHandler<Env>;

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function removeApiPath(url: string): string {
  return url.replace(/\/api\/?$/, '');
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxyTarget = removeApiPath(
    env.VITE_API_PROXY_TARGET || env.VITE_API_URL || 'http://localhost:3000',
  );

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});

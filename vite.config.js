import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const normalizeBase = (value, options = {}) => {
  if (!value) return '/';
  const { treatAsRepo = false } = options;
  const rawPath = treatAsRepo && value.includes('/')
    ? value.split('/').pop()
    : value;
  const withLeading = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const baseValue = env.VITE_BASE_PATH || env.GITHUB_REPOSITORY;
  const base = baseValue
    ? normalizeBase(baseValue, { treatAsRepo: !env.VITE_BASE_PATH && !!env.GITHUB_REPOSITORY })
    : '/';

  return {
    plugins: [react()],
    base,
  };
});

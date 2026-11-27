import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// GitHub Pages 公開時はリポジトリ名に合わせる（例: /solo_base/）
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? '/solo_base/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});

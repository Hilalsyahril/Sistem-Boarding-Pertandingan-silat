import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      legacy({
        targets: ['defaults', 'ie >= 11', 'chrome >= 38', 'safari >= 9', 'samsung >= 4'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
        polyfills: true
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugin: '@emotion/babel-plugin',
      },
    }),
  ],
  server: {
    watch: {
      ignored: ['!**/node_modules/lw-math/**'],
    },
  },
  optimizeDeps: {
    exclude: ['lw-math'],
  },
});

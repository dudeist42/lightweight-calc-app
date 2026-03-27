import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: { entry: './lib/index.ts', name: 'lw-math', fileName: 'index', formats: ['es', 'cjs'] },
  },
  plugins: [dts({ tsconfigPath: './tsconfig.build.json', exclude: ['**/*.(test|spec).ts'] })],
});

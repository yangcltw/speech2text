import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: {
        main: resolve(__dirname, 'src/main/index.ts'),
        preload: resolve(__dirname, 'src/main/preload.ts')
      },
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        dir: 'dist',
        format: 'es',
        entryFileNames: (chunkInfo) => {
          return `${chunkInfo.name}/index.js`;
        },
        preserveModules: true,
        preserveModulesRoot: 'src'
      },
      external: [
        'electron',
        'ws',
        'path',
        'url',
        /node:.*/  // exclude all built-in node modules
      ]
    }
  },
  resolve: {
    // ensure correct resolution of .js extensions
    extensions: ['.ts', '.js', '.mjs']
  }
});
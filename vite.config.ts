// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import path from 'path';
// import electron from 'vite-plugin-electron';
// import renderer from 'vite-plugin-electron-renderer';

// export default defineConfig({
//   plugins: [
//     react(),
//     electron([
//       {
//         entry: 'src/main/index.ts',
//         vite: {
//           build: {
//             outDir: 'dist/main',
//             sourcemap: true,
//             lib: {
//               entry: 'src/main/index.ts',
//               formats: ['cjs'],
//               fileName: () => 'index.js'
//             },
//             rollupOptions: {
//               external: ['electron']
//             }
//           }
//         }
//       },
//       {
//         entry: 'src/main/preload.ts',
//         vite: {
//           build: {
//             outDir: 'dist/preload',
//             sourcemap: true,
//             lib: {
//               entry: 'src/main/preload.ts',
//               formats: ['cjs'],
//               fileName: () => 'preload.js'
//             },
//             rollupOptions: {
//               external: ['electron']
//             }
//           }
//         }
//       }
//     ]),
//     renderer()
//   ],
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, './src/renderer')
//     }
//   },
//   base: './',
//   build: {
//     outDir: 'dist/renderer',
//     emptyOutDir: true
//   }
// });


// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import path from 'path';
// import electron from 'vite-plugin-electron';
// import renderer from 'vite-plugin-electron-renderer';

// export default defineConfig({
//   plugins: [
//     react(),
//     electron([
//       {
//         entry: 'src/main/index.ts',
//         vite: {
//           build: {
//             outDir: 'dist/main',
//             rollupOptions: {
//               external: ['electron', 'ws']
//             },
//             sourcemap: true,
//             lib: {
//               entry: 'src/main/index.ts',
//               formats: ['es'],
//               fileName: () => '[name].js'
//             },
//           }
//         }
//       },
//       {
//         entry: 'src/main/preload.ts',
//         vite: {
//           build: {
//             outDir: 'dist/preload',
//             lib: {
//               entry: 'src/main/preload.ts',
//               formats: ['es'],
//               fileName: () => '[name].js'
//             }
//           }
//         }
//       }
//     ]),
//     renderer()
//   ],
//   server: {
//     port: 3000,
//     strictPort: true,  // 如果端口被占用就報錯
//     host: true,        // 監聽所有地址
//   },
//   build: {
//     outDir: 'dist/renderer',
//     emptyOutDir: true
//   }
// })

// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import electron from 'vite-plugin-electron';
// import renderer from 'vite-plugin-electron-renderer';
// import { fileURLToPath } from 'url';
// import { dirname, resolve } from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// export default defineConfig({
//   plugins: [
//     react(),
//     electron({
//       entry: [
//         'src/main/index.ts',
//         'src/main/preload.ts'
//       ],
//       vite: {
//         build: {
//           rollupOptions: {
//             external: ['electron', 'ws']
//           }
//         }
//       }
//     }),
//     renderer()
//   ],
//   resolve: {
//     alias: {
//       '@': resolve(__dirname, './src/renderer')
//     }
//   },
//   build: {
//     outDir: 'dist/renderer',
//     emptyOutDir: true,
//     rollupOptions: {
//       input: {
//         main: resolve(__dirname, 'index.html')
//       }
//     }
//   },
//   server: {
//     port: 3000,
//     strictPort: true
//   }
// });

// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import electron from 'vite-plugin-electron';
// import renderer from 'vite-plugin-electron-renderer';
// import { fileURLToPath } from 'url';
// import { dirname, resolve } from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// export default defineConfig({
//   plugins: [
//     react(),
//     electron({
//       entry: [
//         'src/main/index.ts',
//         'src/main/preload.ts'
//       ],
//       vite: {
//         build: {
//           outDir: 'dist',
//           rollupOptions: {
//             external: ['electron', 'ws'],
//             output: {
//               format: 'es'
//             }
//           }
//         }
//       }
//     }),
//     renderer()
//   ],
//   resolve: {
//     alias: {
//       '@': resolve(__dirname, './src/renderer')
//     }
//   },
//   build: {
//     outDir: 'dist/renderer',
//     emptyOutDir: true,
//     rollupOptions: {
//       output: {
//         format: 'es'
//       }
//     }
//   }
// });

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src/renderer')
    }
  },
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true
  },
  server: {
    port: 3000,  // 明確指定 Vite 使用的端口
    strictPort: true  // 如果端口被占用就報錯，而不是自動使用下一個可用端口
  }
});
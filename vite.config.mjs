import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  publicDir: false, // Prevents recursive copying of public directory
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },
  build: {
    outDir: 'public/js/dist',
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, 'react-src/main.jsx'),
      name: 'InktaleReact',
      formats: ['es'],
      fileName: () => 'react-bundle.js'
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'react-bundle.css';
          }
          return '[name].[ext]';
        }
      }
    }
  }
});

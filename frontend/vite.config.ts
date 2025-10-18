import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'bundle-stats.html',
      open: true, // automatisch nach Build öffnen
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  server: {
     port: 3000,
   },
  build: {
    chunkSizeWarningLimit: 1000, // Warnlimit leicht erhöht
    rollupOptions: {
      output: {
        // Intelligentes automatisches Code-Splitting
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Extrahiere den Paketnamen
            const parts = id.toString().split('node_modules/')[1].split('/');
            const pkgName = parts[0].startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
            return `vendor_${pkgName.replace('@', '').replace('/', '_')}`;
          }
        },
      },
    },
  },
});

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // Navegadores con soporte nativo de módulos: menos transpilación,
      // menos polyfills y bundles más pequeños.
      target: 'es2020',
      cssTarget: 'chrome90',
      sourcemap: false,
      assetsInlineLimit: 4096,
      reportCompressedSize: false,
      rollupOptions: {
        output: {
          // Separa las librerías del código de la app para que el navegador
          // pueda cachearlas entre despliegues.
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return undefined;
            if (/[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react';
            if (id.includes('motion') || id.includes('framer')) return 'motion';
            if (id.includes('lucide-react')) return 'icons';
            return 'vendor';
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3002,
      strictPort: true,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      host: '0.0.0.0',
      port: 3002,
      strictPort: true,
    },
  };
});

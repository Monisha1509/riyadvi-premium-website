import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  test: { environment: 'jsdom', setupFiles: './src/testSetup.js' },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('/three/') || id.includes('/three-stdlib/')) return 'three-vendor';
          if (id.includes('/@react-three/')) return 'r3f-vendor';
          if (id.includes('/gsap/')) return 'animation-vendor';
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) return 'react-vendor';
          if (id.includes('/motion/')) return 'motion-vendor';
          return undefined;
        }
      }
    }
  }
});

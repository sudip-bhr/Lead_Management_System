import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Separate Vite config for building the embeddable chatbot bundle.
 * 
 * Produces a single IIFE JS file that can be loaded via <script> on any website.
 * 
 * Build command: npx vite build --config vite.embed.config.js
 */
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    outDir: 'dist-embed',
    emptyOutDir: true,
    lib: {
      entry: 'src/embed/chatbot-embed.jsx',
      name: 'LeadMSChatbot',
      fileName: () => 'chatbot.js',
      formats: ['iife'],
    },
    rollupOptions: {
      // Bundle everything — no externals since this is a standalone script
      external: [],
      output: {
        // Ensure React is bundled into the output
        globals: {},
        inlineDynamicImports: true,
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: true },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Custom plugin to inject React Router future flags
const reactRouterFutureFlags = () => {
  return {
    name: 'react-router-future-flags',
    transform(code, id) {
      // Only transform react-router-dom files
      if (id.includes('react-router-dom') || id.includes('react-router')) {
        // Add future flags to prevent warnings
        const modifiedCode = code.replace(
          'export const UNSAFE_DataRouterContext',
          'UNSAFE_DataRouterContext.displayName = "DataRouterContext";\n' +
          'UNSAFE_DataRouterStateContext.displayName = "DataRouterStateContext";\n' +
          'export const UNSAFE_DataRouterContext'
        );
        return modifiedCode;
      }
      return code;
    },
  };
};

// Simplified build configuration to avoid dynamic import issues
const simplifiedBuildPlugin = () => {
  return {
    name: 'simplified-build',
    config(config) {
      return {
        ...config,
        build: {
          ...config.build,
          // Disable code splitting to avoid dynamic import issues
          rollupOptions: {
            output: {
              manualChunks: undefined,
            },
          },
          // Ensure clear-cache.html is included in the build
          outDir: 'dist',
          emptyOutDir: true,
        }
      };
    }
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    reactRouterFutureFlags(),
    simplifiedBuildPlugin()
  ],
  optimizeDeps: {
    exclude: ['lucide-react']
  },
  build: {
    // Improve chunk handling
    chunkSizeWarningLimit: 1000,
    // Disable code splitting to avoid dynamic import issues
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  define: {
    // Define global variables to set React Router future flags
    'process.env.ROUTER_FUTURE_FLAGS': JSON.stringify({
      v7_startTransition: true,
      v7_relativeSplatPath: true
    })
  },
  // Ensure JSON files are properly handled
  assetsInclude: ['**/*.json']
});

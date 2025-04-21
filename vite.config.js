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

// Custom plugin to handle deployment JSON files
const deploymentFilesPlugin = () => {
  return {
    name: 'deployment-files',
    // Simplify build process to avoid deployment file issues
    config(config) {
      return {
        ...config,
        build: {
          ...config.build,
          rollupOptions: {
            ...config?.build?.rollupOptions,
            input: {
              main: resolve(__dirname, 'index.html')
            }
          }
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
    deploymentFilesPlugin()
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
    // Include JSON files in optimization
    include: ['src/deployments/*.json']
  },
  build: {
    // Improve chunk handling
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      // Properly handle JSON imports
      output: {
        manualChunks(id) {
          if (id.includes('deployments')) {
            return 'deployments';
          }
        }
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

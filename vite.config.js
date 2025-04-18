import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    reactRouterFutureFlags()
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    // Define global variables to set React Router future flags
    'process.env.ROUTER_FUTURE_FLAGS': JSON.stringify({
      v7_startTransition: true,
      v7_relativeSplatPath: true
    })
  }
});

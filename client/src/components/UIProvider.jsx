import { useEffect } from 'react';
import useThemeStore from '../store/themeStore';
import { Toaster } from 'sonner';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-background text-text-main">
      <h2 className="text-3xl font-bold mb-4">Something went wrong</h2>
      <pre className="text-red-500 mb-6 bg-red-100 p-4 rounded-lg overflow-auto max-w-full">{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition"
      >
        Try again
      </button>
    </div>
  );
}

export default function UIProvider({ children }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
      <Toaster 
        richColors 
        position="top-right" 
        theme={theme}
        toastOptions={{
          style: {
            borderRadius: '12px',
            padding: '16px',
          }
        }}
      />
    </ErrorBoundary>
  );
}

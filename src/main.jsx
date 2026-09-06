import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './presentation/components/common/ErrorBoundary';
import { storageService } from './utils/storageService';
import { AuthProvider } from './context/AuthContext';
import { ServiceProvider } from './core/di/ServiceProvider';

// Initialize Enterprise Architecture DI Container
ServiceProvider.register();

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}


// Background initialization for storage migrations
storageService.init().catch((err) => {
  console.warn('[storageService] Initialization notice:', err);
});

// Enregistrement du Service Worker pour le mode 100% Offline et PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('✅ CIOB GMAO Service Worker enregistré:', registration.scope);
      })
      .catch((error) => {
        console.warn('⚠️ Erreur enregistrement Service Worker:', error);
      });
  });
}


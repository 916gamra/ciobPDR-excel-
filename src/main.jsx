import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { storageService } from './utils/storageService';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}

// Background initialization for storage migrations
storageService.init().catch((err) => {
  console.warn('[storageService] Initialization notice:', err);
});

// Enregistrement du Service Worker pour le mode 100% Offline et PWA
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
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


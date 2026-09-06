import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { storageService } from './utils/storageService';

storageService.init().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );

  // Enregistrement du Service Worker pour le mode 100% Offline et PWA
  if ('serviceWorker' in navigator) {
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
});

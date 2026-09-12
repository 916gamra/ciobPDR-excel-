import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './presentation/components/common/ErrorBoundary';
import { storageService } from './utils/storageService';
import { AuthProvider } from './context/AuthContext';
import { ServiceProvider } from './core/di/ServiceProvider';
import { Logger } from './core/logger/LoggerService';

// Initialize Enterprise Architecture DI Container
ServiceProvider.register();

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ErrorBoundary>
    </StrictMode>
  );
}


// Background initialization for storage migrations
storageService.init().catch((err) => {
  Logger.warn('Initialization notice:', err, 'storageService');
});

// Enregistrement du Service Worker pour le mode 100% Offline et PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        Logger.info(`Service Worker enregistré: ${registration.scope}`, null, 'PWA');
      })
      .catch((error) => {
        Logger.warn('Erreur enregistrement Service Worker:', error, 'PWA');
      });
  });
}


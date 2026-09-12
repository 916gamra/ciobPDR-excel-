import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Logger } from '../../../core/logger/LoggerService';
import { errorTracker } from '../../../services/ErrorTrackingService';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    Logger.error('Captured runtime error:', { error, errorInfo }, 'ErrorBoundary');
    errorTracker.captureException(error, { componentStack: errorInfo?.componentStack });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-[400px] flex items-center justify-center p-4"
        >
          <div className="max-w-md w-full bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" aria-hidden="true" />
            </div>
            <h1 className="text-base font-bold text-slate-900">Chargement de la vue temporairement interrompu</h1>
            <p className="text-xs text-slate-500">
              Un composant ou un module n'a pas pu être chargé. Vos données restent intactes et sécurisées en local.
            </p>
            {this.state.error && (
              <details className="text-left bg-slate-50 rounded-xl p-2.5 border border-slate-200">
                <summary className="text-[11px] font-semibold text-slate-700 cursor-pointer select-none">
                  Détails techniques de l'erreur
                </summary>
                <div className="mt-2 font-mono text-[11px] text-rose-700 overflow-x-auto max-h-28">
                  {this.state.error.toString()}
                </div>
              </details>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={this.handleRetry}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-hidden"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Réessayer la vue</span>
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-hidden"
              >
                <span>Recharger</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Captured runtime error:', error, errorInfo);
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
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h1 className="text-base font-bold text-slate-900">Chargement de la vue temporairement interrompu</h1>
            <p className="text-xs text-slate-500">
              Un composant ou un module n'a pas pu être chargé (coupure temporaire de réseau ou mise à jour du bundle). Vos données
              restent intactes et sécurisées en local.
            </p>
            {this.state.error && (
              <div className="p-3 bg-slate-50 rounded-xl text-left font-mono text-[11px] text-slate-700 overflow-x-auto max-h-24 border border-slate-200">
                {this.state.error.toString()}
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={this.handleRetry}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Réessayer la vue</span>
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
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

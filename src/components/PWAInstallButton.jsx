import React, { useState } from 'react';
import { Download, Share2, PlusSquare, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function PWAInstallButton({ variant = 'header' }) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  if (isInstalled) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
        <Check className="w-3.5 h-3.5 text-emerald-600" />
        <span>Application Installée</span>
      </div>
    );
  }

  const handleInstall = async () => {
    setInstalling(true);
    try {
      await install();
    } finally {
      setInstalling(false);
    }
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'sidebar') {
      return (
        <button
          onClick={handleInstall}
          disabled={installing}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-xs cursor-pointer group"
        >
          <span className="flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition" />
            <span>Installer l'App</span>
          </span>
          <span className="text-[10px] bg-emerald-800/80 px-1.5 py-0.5 rounded text-emerald-100 font-mono">
            PWA
          </span>
        </button>
      );
    }

    return (
      <button
        onClick={handleInstall}
        disabled={installing}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
        title="Installer CIOB GMAO comme application bureau/mobile"
      >
        <Download className="w-3.5 h-3.5 text-emerald-200" />
        <span>Installer l'App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-700" />
          <span>Installer sur iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Installer sur iPhone / iPad
                  </h3>
                  <p className="text-[11px] text-slate-500">Pour un accès instantané hors-ligne</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
                  <span>Appuyez sur le bouton <strong>Partager</strong> <Share2 className="w-3.5 h-3.5 inline text-blue-600" /> dans Safari.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
                  <span>Faites défiler et choisissez <strong>Sur l'écran d'accueil</strong> <PlusSquare className="w-3.5 h-3.5 inline text-emerald-700" />.</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}

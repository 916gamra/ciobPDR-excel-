import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Key,
  ArrowRight,
  Check,
  Package,
  Store,
  Lock,
  Unlock,
  AlertTriangle,
} from 'lucide-react';
import { storageService } from '../utils/storageService';
import { accessLogService } from '../utils/AccessLogService';

export default function LoginScreen({ onLoginSuccess }) {
  // Load dynamic configuration from local storage
  const [managerRole, setManagerRole] = useState(() => {
    return (
      localStorage.getItem('gmao_admin_role') || 'Gestionnaire Principal du Stock & Mouvements'
    );
  });

  const [storedPin, setStoredPin] = useState(() => {
    return localStorage.getItem('gmao_admin_pin') || null;
  });

  const [isFirstRun, setIsFirstRun] = useState(() => !localStorage.getItem('gmao_admin_pin'));
  const [confirmPin, setConfirmPin] = useState('');

  const [isOpenMode, setIsOpenMode] = useState(() => {
    return localStorage.getItem('gmao_admin_open_mode') === 'true';
  });

  // State for user input
  const [pinCode, setPinCode] = useState(() => {
    // If open mode is active, we don't need code
    const open = localStorage.getItem('gmao_admin_open_mode') === 'true';
    return open ? '' : ''; // Let the user type it if not open mode, or keep empty for real prompt
  });

  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Sync state if localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const role =
        localStorage.getItem('gmao_admin_role') || 'Gestionnaire Principal du Stock & Mouvements';
      const pinSaved = localStorage.getItem('gmao_admin_pin');
      const open = localStorage.getItem('gmao_admin_open_mode') === 'true';

      setManagerRole(role);
      if (pinSaved) {
        setStoredPin(pinSaved);
      }
      setIsOpenMode(open);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    if (isFirstRun) {
      if (!pinCode || pinCode.length < 6) {
        setErrorMsg('Le code PIN doit comporter au moins 6 caractères.');
        return;
      }
      if (pinCode !== confirmPin) {
        setErrorMsg('Les codes PIN ne correspondent pas.');
        return;
      }
      const newHash = storageService.hashPin(pinCode);
      localStorage.setItem('gmao_admin_pin', newHash);
      setStoredPin(newHash);
      setIsFirstRun(false);
    } else if (!isOpenMode) {
      if (!storageService.verifyPin(pinCode, storedPin)) {
        setErrorMsg("Code PIN d'accès incorrect. Veuillez réessayer.");
        return;
      }
    }

    const userToSave = {
      id: 'store_manager',
      name: 'Responsable du Magasin',
      titleFr: 'Responsable du Magasin',
      role: managerRole,
      zone: 'Magasin Central',
      avatar: 'RM',
    };

    if (rememberMe) {
      storageService.setItem('gmao_user_session', userToSave);
    }

    // Reset last active page on new login so user enters Dashboard
    localStorage.removeItem('gmao_active_tab');

    // Record login in access logs
    accessLogService.recordLogin(userToSave);

    onLoginSuccess(userToSave);
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-800 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden select-none">
      {/* Background Excel Grid Subtle Lines & Ambient Tones (Identical to Splash Screen) */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#107c41_1px,transparent_1px)] [background-size:20px_20px]" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden z-10 flex flex-col">
        {/* Top Header Banner - Light Theme with Emerald Excel Accent */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-800 p-6 text-white text-center relative shadow-xs">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-inner mb-3">
            <Store className="w-7 h-7 text-white" />
          </div>

          <h2 className="text-xl font-black tracking-tight text-white">CIOB GMAO LIGHT</h2>
          <p className="text-xs text-emerald-100 font-medium mt-1">
            Espace d'Accès • Gateway Sécurisée
          </p>

          <div className="absolute top-4 right-4 bg-white/15 border border-white/20 px-2.5 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
            <span className="text-[10px] font-mono font-bold text-white">100% Offline</span>
          </div>
        </div>

        {/* Content Body - Light Theme */}
        <div className="p-6 space-y-5 bg-white">
          {/* Sole Authorized Account Badge */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                Compte Autorisé
              </label>
              <span className="text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                Compte Unique
              </span>
            </div>

            {/* Fixed Store Manager Profile Card */}
            <div className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-emerald-300/80 bg-emerald-50/50 text-slate-900 shadow-xs ring-1 ring-emerald-400/30">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                  <Package className="w-5 h-5 text-emerald-100" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span>Responsable du Magasin</span>
                  </div>
                  <div className="text-[11px] text-emerald-800 font-medium mt-0.5 whitespace-pre-wrap break-words">
                    {managerRole}
                  </div>
                </div>
              </div>

              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            </div>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-xs animate-shake">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="font-medium">{errorMsg}</div>
            </div>
          )}

          {/* PIN Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider font-mono">
                Code PIN d'accès
              </label>
              {isOpenMode ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Unlock className="w-3 h-3" /> Mode Libre Activé
                </span>
              ) : (
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Lock className="w-3 h-3" /> PIN Requis
                </span>
              )}
            </div>

            {isOpenMode && !isFirstRun ? (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-center text-xs text-emerald-800 font-medium">
                <Unlock className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
                L'accès libre est configuré. Cliquez simplement sur le bouton ci-dessous pour vous
                connecter directement.
              </div>
            ) : (
              <div className="space-y-3">
                {isFirstRun && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 font-medium">
                    Bienvenue ! Veuillez configurer un nouveau code PIN (6 chiffres minimum) pour
                    sécuriser l'accès.
                  </div>
                )}
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={pinCode}
                    onChange={(e) => {
                      setPinCode(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder={
                      isFirstRun ? 'Nouveau code PIN...' : "Saisir le code PIN d'accès..."
                    }
                    maxLength={16}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-slate-900 tracking-widest focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition"
                  />
                </div>
                {isFirstRun && (
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={confirmPin}
                      onChange={(e) => {
                        setConfirmPin(e.target.value);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      placeholder="Confirmer le nouveau code PIN..."
                      maxLength={16}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-slate-900 tracking-widest focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Remember Me Option */}
          <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="font-medium text-slate-700">Mémoriser ma session</span>
            </label>
            <span className="text-[10.5px] font-mono text-slate-400">GMAO V5.0</span>
          </div>

          {/* Submit Button - Excel Green Theme */}
          <button
            type="button"
            onClick={handleLogin}
            className="w-full bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold py-3 px-4 rounded-xl text-xs transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Démarrer l'Espace Responsable du Magasin</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 font-mono">
          CIOB GMAO Light • Gestionnaire Unique du Magasin
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { ShieldCheck, Key, ArrowRight, Check, Package, Store } from 'lucide-react';
import { storageService } from '../utils/storageService';

const STORE_MANAGER_ACCOUNT = {
  id: 'store_manager',
  name: 'Responsable du Magasin',
  titleFr: 'Responsable du Magasin',
  role: 'Gestionnaire Principal du Stock & Mouvements',
  zone: 'Magasin Central',
  avatar: 'RM'
};

export default function LoginScreen({ onLoginSuccess }) {
  const [pinCode, setPinCode] = useState('1234');
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = (e) => {
    if (e) e.preventDefault();

    const userToSave = {
      id: STORE_MANAGER_ACCOUNT.id,
      name: STORE_MANAGER_ACCOUNT.name,
      titleFr: STORE_MANAGER_ACCOUNT.titleFr,
      role: STORE_MANAGER_ACCOUNT.role,
      zone: STORE_MANAGER_ACCOUNT.zone,
      avatar: STORE_MANAGER_ACCOUNT.avatar
    };

    if (rememberMe) {
      storageService.setItem('gmao_user_session', userToSave);
    }

    onLoginSuccess(userToSave);
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-800 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden select-none">
      {/* Background Subtle Excel Grid Patterns & Glows */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#107c41_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden z-10 flex flex-col">
        {/* Top Header Banner - Light Theme with Emerald Excel Accent */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-800 p-6 text-white text-center relative shadow-xs">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-inner mb-3">
            <Store className="w-7 h-7 text-white" />
          </div>

          <h2 className="text-xl font-black tracking-tight text-white">
            CIOB GMAO LIGHT
          </h2>
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
                  <div className="text-[11px] text-emerald-800 font-medium truncate mt-0.5">
                    {STORE_MANAGER_ACCOUNT.role}
                  </div>
                </div>
              </div>

              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            </div>
          </div>

          {/* PIN Input */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider font-mono mb-1.5">
              Code PIN d'accès
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="****"
                maxLength={8}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-slate-900 tracking-widest focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition"
              />
            </div>
            <p className="text-[10.5px] text-slate-500 mt-1.5 leading-snug">
              * Session locale : Le code PIN est pré-rempli pour un accès direct.
            </p>
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

import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSkeleton() {
  return (
    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4">
      <div className="w-10 h-10 rounded-2xl bg-slate-900/10 text-slate-800 flex items-center justify-center animate-spin">
        <Loader2 className="w-5 h-5 text-slate-700" />
      </div>
      <p className="text-xs font-semibold text-slate-500 tracking-wide animate-pulse">
        Chargement des données...
      </p>
    </div>
  );
}

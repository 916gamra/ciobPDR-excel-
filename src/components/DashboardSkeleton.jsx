import React from 'react';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 1. Top KPI Cards Grid (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { labelW: 'w-32', iconBg: 'bg-blue-50/70' },
          { labelW: 'w-28', iconBg: 'bg-emerald-50/70' },
          { labelW: 'w-32', iconBg: 'bg-rose-50/70' },
          { labelW: 'w-36', iconBg: 'bg-purple-50/70' },
        ].map((card, idx) => (
          <div
            key={`kpi-skel-${idx}`}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
          >
            <div className="space-y-2">
              {/* Category Label */}
              <div className={`h-3 ${card.labelW} bg-slate-200 rounded-md`} />
              {/* Main KPI Number */}
              <div className="h-7 w-16 bg-slate-200/90 rounded-lg mt-1" />
              {/* Subtitle / Details */}
              <div className="h-3 w-28 bg-slate-100 rounded-md mt-1" />
            </div>

            {/* Icon Container */}
            <div className={`w-11 h-11 rounded-2xl ${card.iconBg} flex items-center justify-center shrink-0`}>
              <div className="w-5 h-5 bg-slate-300/60 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* 2. Excel Formula Guidance Banner Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { colorBadge: 'bg-blue-100/60' },
          { colorBadge: 'bg-rose-100/60' },
          { colorBadge: 'bg-emerald-100/60' },
          { colorBadge: 'bg-amber-100/60' },
        ].map((f, idx) => (
          <div
            key={`formula-skel-${idx}`}
            className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
          >
            <div className="space-y-1.5">
              <div className="h-2.5 w-24 bg-slate-200 rounded-md" />
              <div className="h-3.5 w-36 bg-slate-200/80 rounded-md font-mono" />
            </div>
            <div className={`h-5 w-14 rounded-md ${f.colorBadge} shrink-0`} />
          </div>
        ))}
      </div>

      {/* 3. Main Dashboard Section: Watchlist Table & Recent Mouvements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Articles Sous Seuil Critique (Watchlist) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100/70 shrink-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-amber-300/70 rounded" />
              </div>
              <div className="space-y-1">
                <div className="h-4 w-48 bg-slate-200 rounded-md" />
                <div className="h-3 w-36 bg-slate-100 rounded-md" />
              </div>
            </div>
            <div className="h-4 w-28 bg-slate-200/80 rounded-md shrink-0" />
          </div>

          {/* Table Skeleton */}
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs border-collapse min-w-[550px]">
              <thead className="bg-slate-100/80 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-16"><div className="h-3 w-10 bg-slate-300/70 rounded" /></th>
                  <th className="py-2.5 px-3"><div className="h-3 w-24 bg-slate-300/70 rounded" /></th>
                  <th className="py-2.5 px-2 text-right"><div className="h-3 w-12 bg-slate-300/70 rounded ml-auto" /></th>
                  <th className="py-2.5 px-2 text-right"><div className="h-3 w-10 bg-slate-300/70 rounded ml-auto" /></th>
                  <th className="py-2.5 px-3 text-center"><div className="h-3 w-14 bg-slate-300/70 rounded mx-auto" /></th>
                  <th className="py-2.5 px-3"><div className="h-3 w-16 bg-slate-300/70 rounded" /></th>
                  <th className="py-2.5 px-3 text-center"><div className="h-3 w-12 bg-slate-300/70 rounded mx-auto" /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...Array(6)].map((_, rIdx) => (
                  <tr key={`skel-row-${rIdx}`} className="even:bg-slate-50/50 odd:bg-white">
                    <td className="py-3 px-3"><div className="h-4 w-14 bg-slate-200/80 rounded-md font-mono" /></td>
                    <td className="py-3 px-3"><div className="h-4 w-36 bg-slate-200/70 rounded-md" /></td>
                    <td className="py-3 px-2 text-right"><div className="h-4 w-8 bg-rose-200/70 rounded-md ml-auto" /></td>
                    <td className="py-3 px-2 text-right"><div className="h-4 w-8 bg-slate-200/60 rounded-md ml-auto" /></td>
                    <td className="py-3 px-3 text-center">
                      <div className="h-5 w-16 bg-amber-100/80 rounded-full mx-auto" />
                    </td>
                    <td className="py-3 px-3"><div className="h-4 w-12 bg-slate-200/60 rounded" /></td>
                    <td className="py-3 px-3 text-center">
                      <div className="h-6 w-14 bg-slate-900/10 rounded-lg mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Derniers Mouvements */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-indigo-100 rounded-md flex items-center justify-center">
                <div className="w-3 h-3 bg-indigo-400 rounded-xs" />
              </div>
              <div className="h-4 w-36 bg-slate-200 rounded-md" />
            </div>
            <div className="h-4 w-14 bg-blue-100/80 rounded-md" />
          </div>

          {/* List of 6 Movement Item Cards */}
          <div className="space-y-2.5">
            {[...Array(6)].map((_, mIdx) => (
              <div
                key={`mvt-skel-${mIdx}`}
                className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/80 flex items-center justify-between"
              >
                <div className="space-y-1.5 flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-4 w-10 rounded text-[10px] ${mIdx % 2 === 0 ? 'bg-rose-100' : 'bg-emerald-100'}`} />
                    <div className="h-4 w-20 bg-slate-200 rounded font-mono" />
                  </div>
                  <div className="h-3 w-32 bg-slate-200/80 rounded" />
                  <div className="h-2.5 w-28 bg-slate-100 rounded" />
                </div>
                <div className="h-5 w-10 bg-slate-200 rounded-md shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

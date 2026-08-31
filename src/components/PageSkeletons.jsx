import React from 'react';

// 1. Stock Actuel View Skeleton
export function StockSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Top Banner KPI Cards (4 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { labelW: 'w-24', valW: 'w-16', color: 'bg-blue-50/70' },
          { labelW: 'w-28', valW: 'w-14', color: 'bg-emerald-50/70' },
          { labelW: 'w-24', valW: 'w-12', color: 'bg-amber-50/70' },
          { labelW: 'w-20', valW: 'w-10', color: 'bg-rose-50/70' },
        ].map((card, idx) => (
          <div
            key={`stock-kpi-${idx}`}
            className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
          >
            <div className="space-y-1.5">
              <div className={`h-3 ${card.labelW} bg-slate-200 rounded`} />
              <div className={`h-6 ${card.valW} bg-slate-300 rounded-md font-mono`} />
            </div>
            <div
              className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center shrink-0`}
            >
              <div className="w-4 h-4 bg-slate-300/60 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar & Action Header */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="h-9 w-64 bg-slate-100 rounded-xl border border-slate-200" />
          <div className="h-9 w-36 bg-slate-100 rounded-xl border border-slate-200" />
          <div className="h-9 w-40 bg-slate-100 rounded-xl border border-slate-200" />
          <div className="h-9 w-32 bg-cyan-50 rounded-xl border border-cyan-200" />
        </div>
        <div className="h-9 w-36 bg-slate-900/10 rounded-xl shrink-0" />
      </div>

      {/* Main Stock Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="h-4 w-48 bg-slate-200 rounded" />
          <div className="h-3 w-64 bg-slate-200 rounded hidden lg:block" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">
                  <div className="h-3 w-6 bg-slate-300 rounded mx-auto" />
                </th>
                <th className="py-2.5 px-3">
                  <div className="h-3 w-16 bg-slate-300 rounded" />
                </th>
                <th className="py-2.5 px-3">
                  <div className="h-3 w-32 bg-slate-300 rounded" />
                </th>
                <th className="py-2.5 px-3">
                  <div className="h-3 w-20 bg-slate-300 rounded" />
                </th>
                <th className="py-2.5 px-2">
                  <div className="h-3 w-12 bg-slate-300 rounded ml-auto" />
                </th>
                <th className="py-2.5 px-2">
                  <div className="h-3 w-12 bg-slate-300 rounded ml-auto" />
                </th>
                <th className="py-2.5 px-2">
                  <div className="h-3 w-12 bg-slate-300 rounded ml-auto" />
                </th>
                <th className="py-2.5 px-2">
                  <div className="h-3 w-14 bg-slate-300 rounded ml-auto" />
                </th>
                <th className="py-2.5 px-2">
                  <div className="h-3 w-10 bg-slate-300 rounded ml-auto" />
                </th>
                <th className="py-2.5 px-3">
                  <div className="h-3 w-14 bg-slate-300 rounded mx-auto" />
                </th>
                <th className="py-2.5 px-3">
                  <div className="h-3 w-16 bg-slate-300 rounded" />
                </th>
                <th className="py-2.5 px-3">
                  <div className="h-3 w-12 bg-slate-300 rounded mx-auto" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...Array(9)].map((_, idx) => (
                <tr key={`stock-skel-row-${idx}`} className="even:bg-slate-50/60 odd:bg-white">
                  <td className="py-2.5 px-3">
                    <div className="h-3.5 w-5 bg-slate-200 rounded mx-auto" />
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="h-4 w-20 bg-slate-200 rounded" />
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="h-4 w-44 bg-slate-200 rounded" />
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="h-5 w-24 bg-cyan-50 rounded-full" />
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="h-4 w-8 bg-slate-200 ml-auto" />
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="h-4 w-8 bg-emerald-100 ml-auto" />
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="h-4 w-8 bg-rose-100 ml-auto" />
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="h-4 w-10 bg-slate-300 ml-auto" />
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="h-4 w-8 bg-slate-200 ml-auto" />
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="h-5 w-16 bg-emerald-100/80 rounded-full mx-auto" />
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="h-4 w-14 bg-slate-200 rounded" />
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="h-6 w-16 bg-slate-200 rounded-lg mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 2. Sortie Rapide / Saisie Mouvement View Skeleton
export function SortieRapideSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-slate-200 rounded shrink-0" />
            <div className="h-6 w-64 bg-slate-200 rounded" />
          </div>
          <div className="h-3 w-96 bg-slate-100 rounded" />
        </div>
      </div>

      {/* Excel Formula Guidance Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { iconColor: 'bg-rose-100/60', badgeColor: 'bg-rose-50' },
          { iconColor: 'bg-blue-100/60', badgeColor: 'bg-blue-50' },
          { iconColor: 'bg-amber-100/60', badgeColor: 'bg-amber-50' },
          { iconColor: 'bg-emerald-100/60', badgeColor: 'bg-emerald-50' },
        ].map((card, idx) => (
          <div
            key={`guide-skel-${idx}`}
            className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl ${card.iconColor} shrink-0`} />
              <div className="space-y-1.5">
                <div className="h-2.5 w-20 bg-slate-200 rounded" />
                <div className="h-3.5 w-32 bg-slate-200 rounded" />
              </div>
            </div>
            <div className={`h-5 w-12 rounded-full ${card.badgeColor} shrink-0`} />
          </div>
        ))}
      </div>

      {/* Main Grid: Form (5 cols) & History (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-indigo-100" />
              <div className="h-5 w-32 bg-slate-200 rounded" />
            </div>
            <div className="h-7 w-28 bg-slate-100 rounded-lg" />
          </div>

          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={`form-field-skel-${i}`} className="space-y-1.5">
                <div className="h-3 w-28 bg-slate-200 rounded" />
                <div className="h-9 w-full bg-slate-50 border border-slate-100 rounded-xl" />
              </div>
            ))}
          </div>

          <div className="h-11 w-full bg-indigo-600/20 rounded-xl mt-4" />
        </div>

        {/* Right History Table (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slate-200" />
              <div className="h-5 w-48 bg-slate-200 rounded" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-24 bg-slate-100 rounded-lg" />
              <div className="h-8 w-24 bg-slate-100 rounded-lg" />
            </div>
          </div>

          <div className="space-y-2">
            {[...Array(7)].map((_, idx) => (
              <div
                key={`mvt-skel-row-${idx}`}
                className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-12 bg-rose-100/60 rounded" />
                    <div className="h-4 w-28 bg-slate-200 rounded font-mono" />
                  </div>
                  <div className="h-3 w-48 bg-slate-200/80 rounded" />
                </div>
                <div className="h-6 w-16 bg-slate-200 rounded-md font-mono" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. Machines Registered View Skeleton
export function MachinesRegisteredSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Top Banner stats */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="h-5 w-48 bg-slate-200 rounded" />
          <div className="h-3.5 w-72 bg-slate-100 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-24 bg-slate-100 rounded-xl" />
          <div className="h-9 w-36 bg-slate-900/10 rounded-xl" />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="h-8 w-64 bg-white rounded-xl border border-slate-200" />
          <div className="h-8 w-36 bg-white rounded-xl border border-slate-200" />
        </div>

        <div className="p-4 space-y-3">
          {[...Array(7)].map((_, i) => (
            <div
              key={`mch-skel-${i}`}
              className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-4 w-6 bg-slate-200 rounded font-mono" />
                <div className="h-6 w-20 bg-slate-200 rounded-md font-mono" />
                <div className="h-4 w-40 bg-slate-200 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-24 bg-blue-50 rounded-full" />
                <div className="h-5 w-20 bg-emerald-50 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 4. Operations View Skeleton
export function OperationsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* 3 Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { color: 'bg-indigo-50/70', w: 'w-28' },
          { color: 'bg-emerald-50/70', w: 'w-24' },
          { color: 'bg-amber-50/70', w: 'w-20' },
        ].map((kpi, idx) => (
          <div
            key={`op-kpi-${idx}`}
            className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
          >
            <div className="space-y-1.5">
              <div className={`h-3 ${kpi.w} bg-slate-200 rounded`} />
              <div className="h-6 w-12 bg-slate-300 rounded font-mono" />
            </div>
            <div
              className={`w-10 h-10 rounded-xl ${kpi.color} flex items-center justify-center shrink-0`}
            >
              <div className="w-4 h-4 bg-slate-300/60 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Filter Header & Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-9 w-48 bg-slate-100 rounded-xl border border-slate-200" />
          <div className="h-9 w-64 bg-slate-100 rounded-xl border border-slate-200" />
          <div className="h-9 w-36 bg-slate-100 rounded-xl border border-slate-200" />
        </div>
        <div className="h-9 w-40 bg-slate-900/80 rounded-xl shrink-0" />
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={`op-skel-row-${i}`}
              className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="h-4 w-6 bg-slate-200 rounded font-mono" />
                <div className="h-6 w-20 bg-slate-200 rounded-lg font-mono" />
                <div className="h-4 w-40 bg-slate-200 rounded" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-5 w-24 bg-slate-200/80 rounded-full" />
                <div className="h-6 w-20 bg-amber-100/80 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 5. Basic Generic Table View Skeleton (Zones, Types, Diags, Families, etc.)
export function GenericTableSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Top Banner stats / Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="h-5 w-32 bg-slate-200 rounded" />
          <div className="h-3.5 w-64 bg-slate-100 rounded" />
        </div>
        <div className="h-9 w-36 bg-slate-900/80 rounded-xl" />
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200">
          <div className="h-8 w-64 bg-white rounded-xl border border-slate-200" />
        </div>
        <div className="p-4 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={`generic-skel-${i}`}
              className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="h-6 w-16 bg-slate-200 rounded-lg font-mono" />
                <div className="h-4 w-48 bg-slate-200 rounded" />
              </div>
              <div className="flex gap-2">
                <div className="h-7 w-7 bg-slate-200 rounded-lg" />
                <div className="h-7 w-7 bg-slate-200 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 6. Types & Designations View Skeleton (Formula Guidance Cards Layout)
export function GuidanceCardsTableSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 bg-slate-200 rounded shrink-0" />
            <div className="h-6 w-56 bg-slate-200 rounded" />
          </div>
          <div className="h-3.5 w-96 bg-slate-100 rounded" />
        </div>
        <div className="h-9 w-40 bg-slate-900/10 rounded-xl shrink-0" />
      </div>

      {/* Excel Formula Guidance Cards (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { badgeColor: 'bg-cyan-50', line1: 'w-24', line2: 'w-32' },
          { badgeColor: 'bg-indigo-50', line1: 'w-32', line2: 'w-48' },
          { badgeColor: 'bg-emerald-50', line1: 'w-28', line2: 'w-40' },
        ].map((card, idx) => (
          <div
            key={`form-guide-${idx}`}
            className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
          >
            <div className="space-y-2">
              <div className={`h-2.5 ${card.line1} bg-slate-200 rounded`} />
              <div className={`h-3 ${card.line2} bg-slate-200 rounded`} />
            </div>
            <div className={`h-5 w-16 rounded-md ${card.badgeColor} shrink-0`} />
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="h-9 w-full max-w-sm bg-slate-100 rounded-xl border border-slate-200" />
          <div className="h-9 w-52 bg-slate-100 rounded-xl border border-slate-200 hidden sm:block" />
        </div>
        <div className="h-4 w-32 bg-slate-200 rounded self-end sm:self-auto" />
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="h-4 w-64 bg-slate-200 rounded" />
          <div className="h-3 w-48 bg-slate-200 rounded hidden lg:block" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-12 border-r border-slate-200">
                  <div className="h-3 w-6 bg-slate-300 rounded mx-auto" />
                </th>
                <th className="py-2.5 px-3">
                  <div className="h-3 w-20 bg-slate-300 rounded" />
                </th>
                <th className="py-2.5 px-3">
                  <div className="h-3 w-32 bg-slate-300 rounded" />
                </th>
                <th className="py-2.5 px-3">
                  <div className="h-3 w-24 bg-slate-300 rounded" />
                </th>
                <th className="py-2.5 px-3 w-24">
                  <div className="h-3 w-12 bg-slate-300 rounded mx-auto" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...Array(6)].map((_, i) => (
                <tr key={`td-table-row-${i}`} className="bg-white">
                  <td className="py-2.5 px-3 border-r border-slate-100">
                    <div className="h-4 w-5 bg-slate-200 rounded mx-auto" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-4 w-24 bg-slate-200 rounded font-mono" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-4 w-48 bg-slate-200 rounded" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-6 w-20 bg-indigo-50 rounded-full" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-6 w-16 bg-emerald-50 rounded-full mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

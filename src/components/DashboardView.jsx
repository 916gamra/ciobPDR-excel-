import React, { useState, useMemo } from 'react';
import AnimatedPage from './AnimatedPage';
import SortieEntreeIcon from './SortieEntreeIcon';
import {
  Package,
  Cpu,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Boxes,
  ArrowRight,
  Plus,
  ShoppingCart,
  Truck,
  Clock,
  Check,
  RotateCcw,
  FileSpreadsheet,
  Layers,
  Wrench,
  Factory,
  UserCheck,
  Search,
  Filter,
  Calendar,
  ChevronRight,
  Info,
  Sparkles,
  Trash2,
  Edit3,
  ExternalLink,
  ShieldCheck,
  BarChart3,
  Activity,
  Zap,
  Warehouse,
} from 'lucide-react';

export default function DashboardView({
  stockItems = [],
  machines = [],
  warehouseItems = [],
  mouvements = [],
  types = [],
  diagnostics = [],
  zones = [],
  technicians = [],
  operations = [],
  stockKPIs = {
    totalArticles: 0,
    totalStockActuel: 0,
    totalEntrees: 0,
    totalSorties: 0,
    ruptures: 0,
    alertes: 0,
    ok: 0,
  },
  onNavigateToStock,
  onNavigateToMachines,
  onNavigateToWarehouse,
  onNavigateToSortie,
  onNavigateToZones,
  onNavigateToUsers,
  onNavigateToSettings,
  onQuickSortie,
  onAddMouvement,
  onUpdateMouvement,
  onDeleteMouvement,
  onExportExcel,
}) {
  // --- Modals State ---
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState({
    ref: '',
    designation: '',
    quantite: 5,
    order_nature: 'STOCK_PERMANENT', // 'STOCK_PERMANENT' | 'ACHAT_UNIQUE'
    fournisseur: '',
    technicien: '',
    id_zone: '',
    id_machine_registered: '',
    commentaire: 'Demande de réapprovisionnement',
    code_bon: '',
  });

  const [orderFilterTab, setOrderFilterTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'RECEIVED'
  const [selectedArticleForOrder, setSelectedArticleForOrder] = useState(null);

  // Filter alert & rupture items
  const alertAndRuptureItems = useMemo(() => {
    return stockItems.filter((s) => s.alerte === 'RUPTURE' || s.alerte === 'ALERTE');
  }, [stockItems]);

  // Filter purchase orders (Commandes & Réapprovisionnements)
  const allOrders = useMemo(() => {
    return mouvements.filter(
      (m) =>
        m.type === 'COMMANDE' ||
        m.action_id === 'COMMANDE' ||
        (Array.isArray(m.tags) && m.tags.includes('#COMMANDE_EN_ATTENTE')) ||
        (Array.isArray(m.tags) && m.tags.includes('#RECEPTION_VALIDE'))
    );
  }, [mouvements]);

  const pendingOrders = useMemo(() => {
    return allOrders.filter(
      (m) =>
        !Array.isArray(m.tags) ||
        !m.tags.includes('#RECEPTION_VALIDE')
    );
  }, [allOrders]);

  const completedOrders = useMemo(() => {
    return allOrders.filter(
      (m) => Array.isArray(m.tags) && m.tags.includes('#RECEPTION_VALIDE')
    );
  }, [allOrders]);

  const displayedOrders = useMemo(() => {
    if (orderFilterTab === 'PENDING') return pendingOrders;
    if (orderFilterTab === 'RECEIVED') return completedOrders;
    return allOrders;
  }, [orderFilterTab, pendingOrders, completedOrders, allOrders]);

  // Calculate analytics for GMAO actions
  const actionStats = useMemo(() => {
    const counts = {
      CORRECTIVE: 0,
      PREVENTIVE: 0,
      AMELIORATIVE: 0,
      USAGE: 0,
      REAPPRO: 0,
      RETOUR: 0,
      AUTRE: 0,
    };

    let totalSortieQty = 0;
    let totalEntreeQty = 0;

    mouvements.forEach((m) => {
      const act = String(m.action_id || '').toUpperCase();
      const type = String(m.type || '').toLowerCase();
      const q = Number(m.quantite || 0);

      if (type.includes('sort')) {
        totalSortieQty += q;
      } else if (type.includes('entr')) {
        totalEntreeQty += q;
      }

      if (counts[act] !== undefined) {
        counts[act] += 1;
      } else {
        counts.AUTRE += 1;
      }
    });

    const totalActions = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

    return {
      counts,
      totalActions,
      totalSortieQty,
      totalEntreeQty,
    };
  }, [mouvements]);

  // Top 5 consumed spare parts
  const topConsumedArticles = useMemo(() => {
    const usageByRef = {};
    mouvements.forEach((m) => {
      const type = String(m.type || '').toLowerCase();
      if (type.includes('sort')) {
        const ref = String(m.ref || '').trim();
        if (ref) {
          usageByRef[ref] = (usageByRef[ref] || 0) + Number(m.quantite || 0);
        }
      }
    });

    return Object.entries(usageByRef)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([ref, qty]) => {
        const item = stockItems.find((s) => String(s.ref).toLowerCase() === ref.toLowerCase());
        return {
          ref,
          designation: item?.designation || 'Article catalogué',
          qty,
          stockActuel: item?.stockActuel ?? 0,
          alerte: item?.alerte || 'OK',
        };
      });
  }, [mouvements, stockItems]);

  // Machine health & interventions
  const machineHealth = useMemo(() => {
    let enService = 0;
    let enMaintenance = 0;
    let arret = 0;

    machines.forEach((m) => {
      const status = String(m.status || '').toLowerCase();
      if (status.includes('maint')) {
        enMaintenance += 1;
      } else if (status.includes('arr') || status.includes('hors')) {
        arret += 1;
      } else {
        enService += 1;
      }
    });

    // Count interventions per machine
    const mchInterventions = {};
    mouvements.forEach((m) => {
      if (m.id_machine_registered) {
        const id = String(m.id_machine_registered).trim();
        mchInterventions[id] = (mchInterventions[id] || 0) + 1;
      }
    });

    const topMachines = Object.entries(mchInterventions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([id, count]) => {
        const mch = machines.find((m) => String(m.id_machine_registered) === id);
        return {
          id,
          designation: mch?.designation || id,
          zone: mch?.id_zone_default || 'Atelier',
          count,
        };
      });

    return {
      enService,
      enMaintenance,
      arret,
      total: machines.length,
      topMachines,
    };
  }, [machines, mouvements]);

  // Open Order modal for specific article
  const handleOpenOrderForArticle = (article) => {
    const needed = Math.max(1, (Number(article.seuil) || 3) * 2 - (Number(article.stockActuel) || 0));
    const nextCmdNum = `CMD-${new Date().getFullYear()}-${String(allOrders.length + 1).padStart(3, '0')}`;
    setOrderForm({
      ref: article.ref,
      designation: article.designation,
      quantite: needed,
      order_nature: 'STOCK_PERMANENT',
      fournisseur: 'Fournisseur Principal',
      technicien: technicians[0]?.nom || 'Responsable Magasin',
      id_zone: '',
      id_machine_registered: '',
      commentaire: `Réapprovisionnement pour alerte stock (${article.stockActuel}/${article.seuil})`,
      code_bon: nextCmdNum,
    });
    setSelectedArticleForOrder(article);
    setShowOrderModal(true);
  };

  // Open Generic Order Modal
  const handleOpenNewOrder = () => {
    const nextCmdNum = `CMD-${new Date().getFullYear()}-${String(allOrders.length + 1).padStart(3, '0')}`;
    setOrderForm({
      ref: stockItems[0]?.ref || '',
      designation: stockItems[0]?.designation || '',
      quantite: 5,
      order_nature: 'STOCK_PERMANENT',
      fournisseur: '',
      technicien: technicians[0]?.nom || '',
      id_zone: '',
      id_machine_registered: '',
      commentaire: "Demande d'achat magasin",
      code_bon: nextCmdNum,
    });
    setSelectedArticleForOrder(null);
    setShowOrderModal(true);
  };

  // Submit Order Creation
  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (!orderForm.ref || !orderForm.quantite) return;

    const isAchatUnique = orderForm.order_nature === 'ACHAT_UNIQUE';
    const tags = ['#COMMANDE_EN_ATTENTE'];
    if (isAchatUnique) {
      tags.push('#Achat_Unique', '#Non_Stockable');
    } else {
      tags.push('#REAPPRO', '#Stock_Permanent');
    }

    const newOrderMouvement = {
      id: crypto.randomUUID(),
      code_bon: orderForm.code_bon || `CMD-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString(),
      ref: orderForm.ref,
      designation: orderForm.designation,
      quantite: Number(orderForm.quantite) || 1,
      type: 'COMMANDE',
      action_id: 'COMMANDE',
      technicien: orderForm.technicien,
      fournisseur: orderForm.fournisseur,
      id_zone: orderForm.id_zone,
      id_machine_registered: orderForm.id_machine_registered,
      commentaire: `${isAchatUnique ? '[ACHAT UNIQUE] ' : ''}${orderForm.commentaire}`,
      tags: tags,
      is_achat_unique: isAchatUnique,
    };

    if (onAddMouvement) {
      onAddMouvement(newOrderMouvement);
    }
    setShowOrderModal(false);
  };

  // Quick Validate Reception -> Converts Order to Entrée Externe
  const handleValidateReception = (order) => {
    if (!onUpdateMouvement) return;
    const today = new Date().toISOString().split('T')[0];
    const isAchatUnique =
      order.is_achat_unique ||
      (Array.isArray(order.tags) && order.tags.includes('#Achat_Unique'));

    const tags = ['#RECEPTION_VALIDE', '#ENTREE_EXTERNE'];
    if (isAchatUnique) {
      tags.push('#Achat_Unique', '#Non_Stockable');
    }

    onUpdateMouvement(order.id, {
      type: 'Entrée Externe',
      action_id: isAchatUnique ? 'ACHAT_DIRECT' : 'REAPPRO',
      date: today,
      heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString(),
      tags: tags,
      commentaire: `${order.commentaire ? order.commentaire + ' | ' : ''}Réceptionné le ${today}`,
      is_achat_unique: isAchatUnique,
    });
  };

  return (
    <AnimatedPage className="space-y-6 select-none font-sans">
      {/* 1. Top Executive Banner & Quick Action Buttons */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200/80 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>CIOB GMAO Light Twin</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
              100% Offline Client-Side
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Tableau de Bord & Pilotage Opérationnel
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Supervision en temps réel des flux de magasin, seuils critiques de réapprovisionnement,
            état du parc machines et traçabilité intégrale des interventions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleOpenNewOrder}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>+ Nouvelle Commande</span>
          </button>

          <button
            onClick={onNavigateToSortie}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <SortieEntreeIcon className="w-4 h-4" />
            <span>+ Sortie / Entrée Rapide</span>
          </button>

          {onExportExcel && (
            <button
              onClick={onExportExcel}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exporter Excel (.xlsx)</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Catalog Articles */}
        <div
          onClick={onNavigateToStock}
          className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-blue-300 hover:shadow-sm transition group"
        >
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Articles au Catalogue
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1 font-mono tracking-tight group-hover:text-blue-600 transition">
              {stockKPIs.totalArticles}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
              <span>{types.length} catégories</span>
              <span>•</span>
              <span className="text-blue-600 font-semibold">{stockKPIs.ok} en stock normal</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Physical Stock Balance */}
        <div
          onClick={onNavigateToStock}
          className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-300 hover:shadow-sm transition group"
        >
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Unités Physiques en Stock
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1 font-mono tracking-tight group-hover:text-emerald-600 transition">
              {stockKPIs.totalStockActuel}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
              <span className="text-emerald-600 font-bold">+{stockKPIs.totalEntrees} E</span>
              <span>|</span>
              <span className="text-rose-600 font-bold">-{stockKPIs.totalSorties} S</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        {/* Critical Alerts & Ruptures */}
        <div
          onClick={onNavigateToStock}
          className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-rose-300 hover:shadow-sm transition group"
        >
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Seuils Critiques & Ruptures
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-rose-600 mt-1 font-mono tracking-tight">
              {stockKPIs.ruptures + stockKPIs.alertes}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-bold text-[10px]">
                {stockKPIs.ruptures} Ruptures
              </span>
              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                {stockKPIs.alertes} Alertes
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Machines & Asset Fleet */}
        <div
          onClick={onNavigateToMachines}
          className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-purple-300 hover:shadow-sm transition group"
        >
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Parc Machines Actif
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1 font-mono tracking-tight group-hover:text-purple-600 transition">
              {machineHealth.total}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">{machineHealth.enService} en service</span>
              <span>•</span>
              <span className="text-amber-600 font-bold">{machineHealth.enMaintenance} en maint.</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition">
            <Cpu className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Procurement & Purchase Orders Tracking Center */}
      <div className="bg-white rounded-3xl border border-amber-200 shadow-xs p-5 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base text-slate-900">
                  Suivi des Commandes & Réapprovisionnements
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
                  {pendingOrders.length} en attente
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Gérez vos demandes d'achats. Cliquez sur <b className="text-emerald-700">"Valider Réception"</b> pour convertir la commande en Entrée de Stock et incrémenter le Stock Actuel.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Tabs */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-medium">
              <button
                onClick={() => setOrderFilterTab('ALL')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  orderFilterTab === 'ALL'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Toutes ({allOrders.length})
              </button>
              <button
                onClick={() => setOrderFilterTab('PENDING')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  orderFilterTab === 'PENDING'
                    ? 'bg-white text-amber-800 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                En cours ({pendingOrders.length})
              </button>
              <button
                onClick={() => setOrderFilterTab('RECEIVED')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  orderFilterTab === 'RECEIVED'
                    ? 'bg-white text-emerald-800 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Réceptionnées ({completedOrders.length})
              </button>
            </div>

            <button
              onClick={handleOpenNewOrder}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Créer Commande</span>
            </button>
          </div>
        </div>

        {/* Order Cards Grid */}
        {displayedOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {displayedOrders.map((cmd, idx) => {
              const art = stockItems.find(
                (s) => String(s.ref).toLowerCase() === String(cmd.ref).toLowerCase()
              );
              const isReceived =
                Array.isArray(cmd.tags) && cmd.tags.includes('#RECEPTION_VALIDE');

              return (
                <div
                  key={`dash-cmd-${cmd.id ?? ''}-${cmd.ref ?? ''}-${idx}`}
                  className={`p-4 rounded-2xl border transition relative flex flex-col justify-between space-y-3 ${
                    isReceived
                      ? 'bg-emerald-50/40 border-emerald-200/90'
                      : 'bg-white border-amber-200 hover:border-amber-400 shadow-xs'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Card Top Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-extrabold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {cmd.ref}
                        </span>
                        <span className="text-[10.5px] font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
                          {cmd.code_bon || 'CMD'}
                        </span>
                        {Array.isArray(cmd.tags) && cmd.tags.includes('#Achat_Unique') ? (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">
                            Achat Unique
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                            Stock Permanent
                          </span>
                        )}
                      </div>

                      {isReceived ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Réceptionné</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>En attente</span>
                        </span>
                      )}
                    </div>

                    {/* Designation & Quantities */}
                    <div>
                      <div className="font-bold text-xs text-slate-900 line-clamp-1">
                        {art ? art.designation : cmd.designation || 'Article commandé'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-1 flex items-center justify-between">
                        <span>
                          Quantité :{' '}
                          <b className="text-slate-900 text-xs font-extrabold">
                            {cmd.quantite} pcs
                          </b>
                        </span>
                        <span>Date : {cmd.date}</span>
                      </div>
                    </div>

                    {/* Details Info Pill */}
                    {(cmd.technicien || cmd.fournisseur || cmd.id_zone) && (
                      <div className="text-[10.5px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200/70 font-mono space-y-0.5">
                        {cmd.fournisseur && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Fournisseur:</span>
                            <b className="text-slate-800">{cmd.fournisseur}</b>
                          </div>
                        )}
                        {cmd.technicien && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Demandeur:</span>
                            <b className="text-slate-800">{cmd.technicien}</b>
                          </div>
                        )}
                        {cmd.id_zone && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Destination:</span>
                            <b className="text-slate-800">
                              {cmd.id_zone}{' '}
                              {cmd.id_machine_registered ? `(${cmd.id_machine_registered})` : ''}
                            </b>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    {!isReceived ? (
                      <button
                        onClick={() => handleValidateReception(cmd)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Valider Réception (Entrée)</span>
                      </button>
                    ) : (
                      <div className="flex-1 py-1.5 text-center text-emerald-800 font-bold text-xs bg-emerald-100/60 rounded-xl">
                        ✓ Entrée de stock enregistrée
                      </div>
                    )}

                    {onDeleteMouvement && (
                      <button
                        onClick={() => onDeleteMouvement(cmd.id)}
                        className="p-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition cursor-pointer"
                        title="Supprimer la commande"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">Aucune commande répertoriée</h4>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              Initiez facilement une commande d'achat ou un réassort pour vos pièces sous seuil d'alerte en cliquant sur le bouton ci-dessous.
            </p>
            <button
              onClick={handleOpenNewOrder}
              className="mt-2 px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Créer une Commande d'Achat</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. GMAO Flux Intelligence & Action Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actions & Interventions Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Répartition des Interventions
                </h3>
                <p className="text-[11px] text-slate-500">Par type d'action GMAO</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              {mouvements.length} mvts
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Corrective */}
            <div className="space-y-1">
              <div className="flex items-center justify-between font-medium">
                <span className="text-rose-700 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Corrective (Dépannage)
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {actionStats.counts.CORRECTIVE} (
                  {Math.round((actionStats.counts.CORRECTIVE / actionStats.totalActions) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.round(
                      (actionStats.counts.CORRECTIVE / actionStats.totalActions) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Preventive */}
            <div className="space-y-1">
              <div className="flex items-center justify-between font-medium">
                <span className="text-blue-700 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Préventive (Systématique)
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {actionStats.counts.PREVENTIVE} (
                  {Math.round((actionStats.counts.PREVENTIVE / actionStats.totalActions) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.round(
                      (actionStats.counts.PREVENTIVE / actionStats.totalActions) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Usage Direct */}
            <div className="space-y-1">
              <div className="flex items-center justify-between font-medium">
                <span className="text-purple-700 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  Usage Direct / Consommables
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {actionStats.counts.USAGE} (
                  {Math.round((actionStats.counts.USAGE / actionStats.totalActions) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.round(
                      (actionStats.counts.USAGE / actionStats.totalActions) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Ameliorative */}
            <div className="space-y-1">
              <div className="flex items-center justify-between font-medium">
                <span className="text-amber-700 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Améliorative / Travaux Neufs
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {actionStats.counts.AMELIORATIVE} (
                  {Math.round((actionStats.counts.AMELIORATIVE / actionStats.totalActions) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.round(
                      (actionStats.counts.AMELIORATIVE / actionStats.totalActions) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Reapprovisionnements & Entrees */}
            <div className="space-y-1">
              <div className="flex items-center justify-between font-medium">
                <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Réapprovisionnement Magasin
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {actionStats.counts.REAPPRO} (
                  {Math.round((actionStats.counts.REAPPRO / actionStats.totalActions) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.round(
                      (actionStats.counts.REAPPRO / actionStats.totalActions) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 Most Consumed Articles */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Top 5 Pièces Consommées
                </h3>
                <p className="text-[11px] text-slate-500">Volume total de sorties</p>
              </div>
            </div>
            <button
              onClick={onNavigateToStock}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
            >
              <span>Stock</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {topConsumedArticles.length > 0 ? (
              topConsumedArticles.map((art, idx) => (
                <div
                  key={`top-art-${art.ref ?? ''}-${idx}`}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <span className="font-mono font-bold text-slate-900">{art.ref}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                      {art.designation}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-extrabold text-rose-600 text-sm">
                      -{art.qty} pcs
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Reste : {art.stockActuel}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 text-center py-6">
                Aucune sortie enregistrée pour le moment.
              </div>
            )}
          </div>
        </div>

        {/* Top Demanding Machines */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Factory className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Machines les Plus Sollicitées
                </h3>
                <p className="text-[11px] text-slate-500">Nombre d'interventions / dépannages</p>
              </div>
            </div>
            <button
              onClick={onNavigateToMachines}
              className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-0.5"
            >
              <span>Parc</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {machineHealth.topMachines.length > 0 ? (
              machineHealth.topMachines.map((mch, idx) => (
                <div
                  key={`top-mch-${mch.id ?? ''}-${idx}`}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.2 rounded border border-slate-200 text-[11px]">
                        {mch.id}
                      </span>
                      <span className="text-[11px] font-bold text-slate-700 truncate max-w-[140px]">
                        {mch.designation}
                      </span>
                    </div>
                    <div className="text-[10.5px] text-slate-400 font-mono">
                      Zone : {mch.zone}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-mono font-bold text-xs">
                      {mch.count} interventions
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 text-center py-6">
                Aucune machine associée aux sorties.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Excel Twin Guidance & Formula Architecture Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Formule Entrées (F)
            </div>
            <div className="font-mono text-xs text-blue-700 font-semibold mt-0.5">
              =SUMIFS(Qté, Ref, [@Ref], "Entrée")
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
            +
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Formule Sorties (G)
            </div>
            <div className="font-mono text-xs text-rose-700 font-semibold mt-0.5">
              =SUMIFS(Qté, Ref, [@Ref], "Sortie")
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
            -
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Formule Actuel (H)
            </div>
            <div className="font-mono text-xs text-emerald-700 font-bold mt-0.5">
              =[@[Initial]] + [@Entrees] - [@Sorties]
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
            =
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Formule Alerte (J)
            </div>
            <div className="font-mono text-xs text-amber-700 font-semibold mt-0.5">
              =IF(H&lt;=0, "RUPTURE", IF(H&lt;=I, "ALERTE", "OK"))
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
            !
          </div>
        </div>
      </div>

      {/* 6. Critical Watchlist & Recent Flux Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Watchlist Ruptures & Alertes */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Articles Sous Seuil Critique ({alertAndRuptureItems.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Pièces nécessitant un réapprovisionnement urgent
                </p>
              </div>
            </div>

            <button
              onClick={onNavigateToStock}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
            >
              <span>Voir tout le Stock</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-[10.5px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5">Ref</th>
                  <th className="py-3 px-3.5">Désignation</th>
                  <th className="py-3 px-2 text-right">Stock Actuel</th>
                  <th className="py-3 px-2 text-right">Seuil</th>
                  <th className="py-3 px-3 text-center">État</th>
                  <th className="py-3 px-3">Emplacement</th>
                  <th className="py-3 px-3 text-center">Actions Rapides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alertAndRuptureItems.slice(0, 8).map((item, idx) => (
                  <tr key={`alert-item-${item.id ?? ''}-${item.ref ?? ''}-${idx}`} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3.5 font-mono font-bold text-slate-900">{item.ref}</td>
                    <td className="py-3 px-3.5 font-medium text-slate-800">{item.designation}</td>
                    <td className="py-3 px-2 text-right font-mono font-bold text-rose-600">
                      {item.stockActuel}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-slate-500">{item.seuil}</td>
                    <td className="py-3 px-3 text-center">
                      {item.alerte === 'RUPTURE' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3" />
                          <span>RUPTURE</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" />
                          <span>ALERTE</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">{item.emplacement}</td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenOrderForArticle(item)}
                          className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
                          title="Commander réapprovisionnement"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          <span>Commander</span>
                        </button>
                        <button
                          onClick={() => onQuickSortie(item)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-black text-white text-[11px] font-bold shadow-xs transition cursor-pointer"
                          title="Faire une sortie"
                        >
                          Sortie
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Flux Feed */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold">
                <SortieEntreeIcon className="w-5 h-5 shrink-0" strokeWidth={2.25} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Derniers Mouvements</h3>
                <p className="text-[11px] text-slate-500">Flux récents de magasin</p>
              </div>
            </div>
            <button
              onClick={onNavigateToSortie}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
            >
              <span>+ Sortie</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {mouvements.slice(0, 6).map((m, idx) => {
              const art = stockItems.find(
                (s) => String(s.ref).toLowerCase() === String(m.ref).toLowerCase()
              );
              const isSortie = String(m.type || '').toLowerCase().includes('sort');

              return (
                <div
                  key={`feed-mvt-${m.id ?? ''}-${m.code_bon ?? ''}-${idx}`}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs hover:border-slate-300 transition"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.2 rounded-full font-mono ${
                          isSortie
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {m.type}
                      </span>
                      <span className="font-mono font-bold text-slate-900">{m.ref}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 truncate max-w-[170px] font-medium">
                      {art ? art.designation : m.designation || 'Article'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {m.code_bon || 'Bon'} • {m.date} • {m.technicien || 'Tech'}
                    </div>
                  </div>
                  <div className="text-right font-mono font-black text-sm">
                    {isSortie ? (
                      <span className="text-rose-600">-{m.quantite}</span>
                    ) : (
                      <span className="text-emerald-600">+{m.quantite}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 7. GMAO Shortcuts Hub */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-3">
        <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Accès Rapide aux Modules GMAO</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <button
            onClick={onNavigateToStock}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 text-left transition space-y-1 cursor-pointer group"
          >
            <Package className="w-5 h-5 text-blue-600 group-hover:scale-110 transition" />
            <div className="font-bold text-xs text-slate-900">Magasin Stock</div>
            <div className="text-[10px] text-slate-500">Gestion des articles</div>
          </button>

          <button
            onClick={onNavigateToSortie}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-300 text-left transition space-y-1 cursor-pointer group"
          >
            <SortieEntreeIcon className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition" />
            <div className="font-bold text-xs text-slate-900">Sorties & Entrées</div>
            <div className="text-[10px] text-slate-500">Enregistrer un bon</div>
          </button>

          <button
            onClick={onNavigateToMachines}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-purple-50 border border-slate-200/80 hover:border-purple-300 text-left transition space-y-1 cursor-pointer group"
          >
            <Factory className="w-5 h-5 text-purple-600 group-hover:scale-110 transition" />
            <div className="font-bold text-xs text-slate-900">Parc Machines</div>
            <div className="text-[10px] text-slate-500">Arborescence actifs</div>
          </button>

          <button
            onClick={onNavigateToWarehouse}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-teal-50 border border-slate-200/80 hover:border-teal-300 text-left transition space-y-1 cursor-pointer group"
          >
            <Warehouse className="w-5 h-5 text-teal-600 group-hover:scale-110 transition" />
            <div className="font-bold text-xs text-slate-900">Entrepôt</div>
            <div className="text-[10px] text-slate-500">Éléments & Moteurs</div>
          </button>

          <button
            onClick={onNavigateToZones}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50 border border-slate-200/80 hover:border-amber-300 text-left transition space-y-1 cursor-pointer group"
          >
            <Layers className="w-5 h-5 text-amber-600 group-hover:scale-110 transition" />
            <div className="font-bold text-xs text-slate-900">Zones & Ateliers</div>
            <div className="text-[10px] text-slate-500">Emplacements usine</div>
          </button>

          <button
            onClick={onNavigateToUsers}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-300 text-left transition space-y-1 cursor-pointer group"
          >
            <UserCheck className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition" />
            <div className="font-bold text-xs text-slate-900">Personnel GMAO</div>
            <div className="text-[10px] text-slate-500">Techniciens & Chefs</div>
          </button>

          <button
            onClick={onNavigateToSettings}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 text-left transition space-y-1 cursor-pointer group"
          >
            <FileSpreadsheet className="w-5 h-5 text-slate-700 group-hover:scale-110 transition" />
            <div className="font-bold text-xs text-slate-900">Excel Twin</div>
            <div className="text-[10px] text-slate-500">Sauvegardes & Sync</div>
          </button>
        </div>
      </div>

      {/* 8. Purchase Order Modal (BDR Light Excel Unified Modal System) */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {selectedArticleForOrder
                      ? `Commander Réappro : ${selectedArticleForOrder.ref}`
                      : "Créer une Commande d'Achat"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enregistre une commande en attente dans le flux de traçabilité
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitOrder} className="p-6 space-y-4 text-xs">
              {/* Type / Nature d'achat Toggle */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="font-bold text-slate-800 block text-xs">
                  Type & Nature de la Commande *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setOrderForm({ ...orderForm, order_nature: 'STOCK_PERMANENT' })
                    }
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      orderForm.order_nature === 'STOCK_PERMANENT'
                        ? 'bg-blue-50/90 border-blue-400 text-blue-900 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">📦 Pièce Stock Permanente</span>
                      {orderForm.order_nature === 'STOCK_PERMANENT' && (
                        <Check className="w-3.5 h-3.5 text-blue-600" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">
                      Consommable suivi avec seuils et alertes RUPTURE
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setOrderForm({ ...orderForm, order_nature: 'ACHAT_UNIQUE' })
                    }
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      orderForm.order_nature === 'ACHAT_UNIQUE'
                        ? 'bg-purple-50/90 border-purple-400 text-purple-900 ring-2 ring-purple-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">⚡ Achat Unique / Spécifique</span>
                      {orderForm.order_nature === 'ACHAT_UNIQUE' && (
                        <Check className="w-3.5 h-3.5 text-purple-600" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">
                      Non-stockable récurrent (#Achat_Unique, sans fausses alertes)
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Code / N° de Commande *</label>
                  <input
                    type="text"
                    required
                    value={orderForm.code_bon}
                    onChange={(e) => setOrderForm({ ...orderForm, code_bon: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:border-amber-500 outline-none"
                    placeholder="CMD-2026-001"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Quantité Demandée *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={orderForm.quantite}
                    onChange={(e) => setOrderForm({ ...orderForm, quantite: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Référence de l'Article *</label>
                <input
                  type="text"
                  required
                  value={orderForm.ref}
                  onChange={(e) => {
                    const r = e.target.value;
                    const matched = stockItems.find(
                      (s) => String(s.ref).toLowerCase() === r.toLowerCase()
                    );
                    setOrderForm({
                      ...orderForm,
                      ref: r,
                      designation: matched ? matched.designation : orderForm.designation,
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:border-amber-500 outline-none"
                  placeholder="Ex: ROUL-6204-2RS"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Désignation / Spécifications</label>
                <input
                  type="text"
                  value={orderForm.designation}
                  onChange={(e) => setOrderForm({ ...orderForm, designation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-amber-500 outline-none"
                  placeholder="Description détaillée de la pièce"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Fournisseur Prévu</label>
                  <input
                    type="text"
                    value={orderForm.fournisseur}
                    onChange={(e) => setOrderForm({ ...orderForm, fournisseur: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-amber-500 outline-none"
                    placeholder="Ex: SKF Maroc, Distributeur"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Demandeur / Responsable</label>
                  <select
                    value={orderForm.technicien}
                    onChange={(e) => setOrderForm({ ...orderForm, technicien: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-amber-500 outline-none"
                  >
                    <option value="">Sélectionner un responsable...</option>
                    {technicians.map((t) => (
                      <option key={t.id_technician || t.nom} value={t.nom}>
                        {t.nom} ({t.specialite || 'Tech'})
                      </option>
                    ))}
                    {operations
                      .filter((o) => o.type_profil === 'CHEF')
                      .map((c) => (
                        <option key={c.id_operation || c.nom} value={c.nom}>
                          {c.nom} (Chef)
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Notes & Justification</label>
                <textarea
                  rows="2"
                  value={orderForm.commentaire}
                  onChange={(e) => setOrderForm({ ...orderForm, commentaire: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-amber-500 outline-none"
                  placeholder="Justification de la commande..."
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmer la Commande</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
}

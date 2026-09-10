/**
 * Formula Engine & Data Utility for CIOB GMAO Light
 * Ensures safe numeric conversions, formula twin compatibility, and null/undefined handling.
 */

/**
 * Safely converts any input value to a valid finite number.
 * @param {any} val - Value to convert
 * @param {number} defaultVal - Default fallback value if val is invalid
 * @returns {number}
 */
export function safeNum(val, defaultVal = NaN) {
  if (val === null || val === undefined || val === '') return defaultVal;
  const num = Number(val);
  return Number.isFinite(num) ? num : defaultVal;
}

// Global lookup maps for O(1) search performance
let stockLookup = new Map();
let warehouseLookup = new Map();
let technicianLookup = new Map();
let zoneLookup = new Map();
let machineLookup = new Map();
let operationLookup = new Map();

/**
 * Updates lookup maps for high performance O(1) validation lookups
 */
export function updateLookups(context = {}) {
  const {
    stock = [],
    warehouseItems = [],
    technicians = [],
    zones = [],
    machines = [],
    operations = []
  } = context;

  stockLookup = new Map();
  stock.forEach((s) => {
    const key = String(s.ref || s.Ref || '').toLowerCase().trim();
    if (key) stockLookup.set(key, s);
  });

  warehouseLookup = new Map();
  warehouseItems.forEach((w) => {
    const key = String(w.code || w.ref || w.item_code || '').toLowerCase().trim();
    if (key) warehouseLookup.set(key, w);
  });

  technicianLookup = new Map();
  technicians.forEach((t) => {
    const key = String(t.nom || t.name || t.id_technician || '').toLowerCase().trim();
    if (key) technicianLookup.set(key, t);
  });

  zoneLookup = new Map();
  zones.forEach((z) => {
    const key = String(z.id_zone || z.ID_Zone || z.code_zone || z.code || '').toLowerCase().trim();
    if (key) zoneLookup.set(key, z);
  });

  machineLookup = new Map();
  machines.forEach((m) => {
    const key = String(m.id_machine_registered || m.id || '').toLowerCase().trim();
    if (key) machineLookup.set(key, m);
  });

  operationLookup = new Map();
  operations.forEach((o) => {
    const key = String(o.id_operation || o.id || o.nom || '').toLowerCase().trim();
    if (key) operationLookup.set(key, o);
  });
}

/**
 * Calculates stock balance and alert status safely according to GMAO Excel Twin formulas.
 * Formula Stock Actuel = stockInitial + entrees - sorties
 * Formula Alert = RUPTURE if stockActuel <= 0, ALERTE if stockActuel <= seuil, else OK
 * (If isAchatUnique is true, no RUPTURE/ALERTE alarms are raised when stock is 0).
 *
 * @param {number} stockInitial
 * @param {number} entrees
 * @param {number} sorties
 * @param {number} seuil
 * @param {boolean} isAchatUnique - If true, treated as one-off non-stockable purchase
 * @returns {{ stockActuel: number, stockActuelRaw: number, alerte: 'OK' | 'ALERTE' | 'RUPTURE' | 'NON_STOCKABLE' }}
 */
export function calculateStockStatus(stockInitial, entrees, sorties, seuil, isAchatUnique = false) {
  const init = safeNum(stockInitial, 0);
  const ent = safeNum(entrees, 0);
  const sor = safeNum(sorties, 0);
  const s = Math.max(0, safeNum(seuil, 0));

  // Compute raw balance (allowing negative for logging/audit purposes)
  const stockActuel = init + ent - sor;

  // Display stock floor at 0 for safe inventory representation
  const displayStock = Math.max(0, stockActuel);

  let alerte = 'OK';
  if (isAchatUnique) {
    alerte = 'NON_STOCKABLE'; // One-time purchases do not trigger false alarms
  } else if (stockActuel <= 0) {
    alerte = 'RUPTURE';
  } else if (stockActuel <= s) {
    alerte = 'ALERTE';
  }

  return {
    stockActuel: displayStock,
    stockActuelRaw: stockActuel,
    alerte,
  };
}

/**
 * Validates a movement record before saving.
 * @param {object} mvt
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateMouvement(mvt) {
  const errors = [];
  if (!mvt.ref || String(mvt.ref).trim() === '') {
    errors.push("La référence de l'article est requise.");
  }
  const qty = safeNum(mvt.quantite || mvt.quantity);
  if (Number.isNaN(qty) || qty <= 0) {
    errors.push('La quantité doit être un nombre valide et supérieur à 0.');
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a movement record with full context (foreign keys, stock availability).
 * Uses lookup maps for O(1) search instead of O(n) find()
 */
export function validateMovementWithContext(mvt, context) {
  const errors = [];

  // Update lookup maps if context is provided
  if (context) {
    updateLookups(context);
  }

  const qty = safeNum(mvt.quantite || mvt.quantity);

  // 1. Basic validation
  if (!mvt.code_bon || String(mvt.code_bon).trim() === '') {
    errors.push('Le code du bon (Code Bon) est requis.');
  }

  if (!mvt.ref || String(mvt.ref).trim() === '') {
    errors.push("La référence de l'article (Ref) est requise.");
  }

  if (qty <= 0) {
    errors.push('La quantité doit être un nombre strictement positif.');
  }

  const validTypes = [
    'Entrée',
    'Sortie',
    'Sortie Interne',
    'Entrée Interne',
    'Sortie Externe',
    'Entrée Externe',
    'Bon de Sortie',
    'COMMANDE',
    'Demande',
  ];
  if (!mvt.type || !validTypes.some((vt) => String(mvt.type).toLowerCase().includes(vt.toLowerCase()))) {
    errors.push(
      'Le type de mouvement doit être "Sortie Interne", "Entrée Interne", "Sortie Externe", "Bon de Sortie", "Entrée Externe" ou "COMMANDE".'
    );
  }

  if (!mvt.date || isNaN(Date.parse(mvt.date))) {
    errors.push('La date spécifiée est invalide ou manquante.');
  }

  // 2. Foreign Key Validations using lookup maps (O(1) instead of O(n))
  if (context) {
    const refKey = String(mvt.ref || '').toLowerCase().trim();

    // Check if article exists in stock OR warehouse items
    const articleInStock = stockLookup.get(refKey);
    const itemInWarehouse = warehouseLookup.get(refKey);

    if (!articleInStock && !itemInWarehouse && !mvt.is_custom_ref) {
      errors.push(`La référence "${mvt.ref}" n'existe ni dans le stock PDR ni dans le registre de l'entrepôt.`);
    }

    // Check technician/person existence
    if (mvt.technicien && mvt.technicien.trim() !== '') {
      const techKey = String(mvt.technicien).toLowerCase().trim();
      const techExists = technicianLookup.has(techKey);
      const opExists = operationLookup.has(techKey);
      if (!techExists && !opExists && !mvt.allow_external_technician) {
        // Allow external/custom persons if set, or record error if strict
      }
    }

    // Check zone existence
    if (mvt.id_zone && mvt.id_zone.trim() !== '') {
      const zoneKey = String(mvt.id_zone).toLowerCase().trim();
      const zoneExists = zoneLookup.has(zoneKey);
      if (!zoneExists) {
        errors.push(`La zone "${mvt.id_zone}" n'est pas enregistrée.`);
      }
    }

    // Check machine existence
    if (mvt.id_machine_registered && mvt.id_machine_registered.trim() !== '') {
      const mchKey = String(mvt.id_machine_registered).toLowerCase().trim();
      const mchExists = machineLookup.has(mchKey);
      if (!mchExists) {
        errors.push(`La machine "${mvt.id_machine_registered}" n'est pas enregistrée.`);
      }
    }

    // Check stock availability for Sortie of PDR consumables
    if (String(mvt.type).toLowerCase().includes('sortie') && articleInStock && !mvt.skip_stock_limit) {
      const currentStock = safeNum(articleInStock.stockActuel || articleInStock.stockInitial);
      if (qty > currentStock) {
        errors.push(
          `Mouvement impossible : Stock insuffisant pour la référence "${mvt.ref}". Disponible : ${currentStock}, Demandé : ${qty}.`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

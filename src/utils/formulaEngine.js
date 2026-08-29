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
export function safeNum(val, defaultVal = 0) {
  if (val === null || val === undefined || val === '') return defaultVal;
  const num = Number(val);
  return Number.isFinite(num) ? num : defaultVal;
}

/**
 * Calculates stock balance and alert status safely according to GMAO Excel Twin formulas.
 * Formula Stock Actuel = stockInitial + entrees - sorties
 * Formula Alert = RUPTURE if stockActuel <= 0, ALERTE if stockActuel <= seuil, else OK
 * 
 * @param {number} stockInitial 
 * @param {number} entrees 
 * @param {number} sorties 
 * @param {number} seuil 
 * @returns {{ stockActuel: number, alerte: 'OK' | 'ALERTE' | 'RUPTURE' }}
 */
export function calculateStockStatus(stockInitial, entrees, sorties, seuil) {
  const init = safeNum(stockInitial, 0);
  const ent = Math.max(0, safeNum(entrees, 0));
  const sor = Math.max(0, safeNum(sorties, 0));
  const s = Math.max(0, safeNum(seuil, 0));

  const stockActuel = init + ent - sor;

  let alerte = 'OK';
  if (stockActuel <= 0) {
    alerte = 'RUPTURE';
  } else if (stockActuel <= s) {
    alerte = 'ALERTE';
  }

  return {
    stockActuel,
    alerte
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
    errors.push('La référence de l\'article est requise.');
  }
  if (!mvt.quantite || safeNum(mvt.quantite) <= 0) {
    errors.push('La quantité doit être un nombre supérieur à 0.');
  }
  return {
    valid: errors.length === 0,
    errors
  };
}

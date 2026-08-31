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

  // Math.max(0, ...) prevents negative stocks
  const stockActuel = Math.max(0, init + ent - sor);

  let alerte = 'OK';
  if (stockActuel <= 0) {
    alerte = 'RUPTURE';
  } else if (stockActuel <= s) {
    alerte = 'ALERTE';
  }

  return {
    stockActuel,
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
 * @param {object} mvt - The movement record to validate
 * @param {object} context - The context containing arrays of stock, users/technicians, zones, machines
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateMovementWithContext(mvt, context) {
  const errors = [];
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
    'COMMANDE',
  ];
  if (!mvt.type || !validTypes.some((vt) => mvt.type.toLowerCase().includes(vt.toLowerCase()))) {
    errors.push(
      'Le type de mouvement doit être "Sortie Interne", "Entrée Interne", "Sortie Externe", "Entrée Externe" ou "COMMANDE".'
    );
  }

  if (!mvt.date || isNaN(Date.parse(mvt.date))) {
    errors.push('La date spécifiée est invalide ou manquante.');
  }

  // 2. Foreign Key Validations if context is provided
  if (context) {
    const { stock = [], technicians = [], operations = [], zones = [], machines = [] } = context;

    // Check if article exists in stock
    const article = stock.find(
      (s) =>
        String(s.ref || s.Ref || '')
          .toLowerCase()
          .trim() === String(mvt.ref).toLowerCase().trim()
    );
    if (!article) {
      errors.push(`La référence article "${mvt.ref}" n'existe pas dans le stock.`);
    }

    // Check technician/person existence (if specified and not empty)
    if (mvt.technicien && mvt.technicien.trim() !== '') {
      const techExists = technicians.some(
        (t) => String(t.nom).toLowerCase().trim() === String(mvt.technicien).toLowerCase().trim()
      );
      const opExists = operations.some(
        (o) => String(o.nom).toLowerCase().trim() === String(mvt.technicien).toLowerCase().trim()
      );
      if (!techExists && !opExists) {
        errors.push(`Le technicien ou intervenant "${mvt.technicien}" n'est pas enregistré.`);
      }
    }

    // Check zone existence (if specified and not empty)
    if (mvt.id_zone && mvt.id_zone.trim() !== '') {
      const zoneExists = zones.some(
        (z) =>
          String(z.id_zone || z.ID_Zone || '')
            .toLowerCase()
            .trim() === String(mvt.id_zone).toLowerCase().trim()
      );
      if (!zoneExists) {
        errors.push(`La zone "${mvt.id_zone}" n'est pas enregistrée.`);
      }
    }

    // Check machine existence (if specified and not empty)
    if (mvt.id_machine_registered && mvt.id_machine_registered.trim() !== '') {
      const mchExists = machines.some(
        (m) =>
          String(m.id_machine_registered).toLowerCase().trim() ===
          String(mvt.id_machine_registered).toLowerCase().trim()
      );
      if (!mchExists) {
        errors.push(`La machine "${mvt.id_machine_registered}" n'est pas enregistrée.`);
      }
    }

    // Check stock availability for Sortie (withdrawing items)
    if (String(mvt.type).toLowerCase().includes('sortie') && article) {
      // Calculate active stock for the article
      const currentStock = safeNum(article.stockActuel || article.stockInitial);
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

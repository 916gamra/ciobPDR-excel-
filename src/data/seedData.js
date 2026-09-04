import initialData from '../initialData.json';

export const INITIAL_TYPES = [
  { id_type: 'TYPE-MEC', libelle: 'Mécanique & Transmission' },
  { id_type: 'TYPE-FIX', libelle: 'Fixation & Visserie' },
  { id_type: 'TYPE-COU', libelle: 'Coupe & Perçage' },
  { id_type: 'TYPE-PNE', libelle: 'Pneumatique & Fluides' },
  { id_type: 'TYPE-ELE', libelle: 'Électrique & Capteurs' },
  { id_type: 'TYPE-CON', libelle: 'Consommables & Polymères' },
  { id_type: 'TYPE-OUT', libelle: "Outillage d'Atelier" },
];

export const INITIAL_DIAGNOSTICS = [
  { id_diag: 'DIAG-USURE', libelle: 'Usure / Fatigue normale', id_type: 'TYPE-MEC' },
  { id_diag: 'DIAG-VIB', libelle: 'Jeu axial / Vibration', id_type: 'TYPE-MEC' },
  { id_diag: 'DIAG-CASSE', libelle: "Rupture / Casse d'outil", id_type: 'TYPE-COU' },
  { id_diag: 'DIAG-EMOUSSE', libelle: 'Émoussage / Perte de tranchant', id_type: 'TYPE-COU' },
  { id_diag: 'DIAG-DESSERAGE', libelle: 'Desserage / Déformation filetage', id_type: 'TYPE-FIX' },
  { id_diag: 'DIAG-CORROSION', libelle: 'Corrosion / Grippage fixation', id_type: 'TYPE-FIX' },
  { id_diag: 'DIAG-FUITE', libelle: "Fuite d'air / Baisse de pression", id_type: 'TYPE-PNE' },
  { id_diag: 'DIAG-JOINT', libelle: 'Joint poreux / Dégradé', id_type: 'TYPE-PNE' },
  { id_diag: 'DIAG-SURCHAUFFE', libelle: 'Surchauffe / Résistance HS', id_type: 'TYPE-ELE' },
  { id_diag: 'DIAG-SIGNAL', libelle: 'Défaut capteur / Perte signal', id_type: 'TYPE-ELE' },
  { id_diag: 'DIAG-DECHIRURE', libelle: 'Déchirure / Érosion polymère', id_type: 'TYPE-CON' },
  { id_diag: 'DIAG-PREV', libelle: 'Remplacement préventif systématique', id_type: 'TYPE-MEC' },
];

export const INITIAL_FAMILIES = [
  { id_family: 'FAM-EMB', libelle: 'Emballage & Conditionnement' },
  { id_family: 'FAM-USI', libelle: 'Usinage & Fraisage' },
  { id_family: 'FAM-DEC', libelle: 'Découpe & Presses' },
  { id_family: 'FAM-ASSEM', libelle: 'Assemblage & Lignes' },
  { id_family: 'FAM-MOT', libelle: 'Moteurs & Motoréducteurs' },
  { id_family: 'FAM-POM', libelle: 'Pompes & Centrales Hydrauliques' },
  { id_family: 'FAM-EXT', libelle: 'Extincteurs & Sécurité Incendie' },
  { id_family: 'FAM-COUR', libelle: 'Courroies & Bandes Spéciales' },
];

export const INITIAL_TEMPLATES = [
  { id_templates: 'TPL-RCF100', libelle: 'RCF 100 B1-10', id_family: 'FAM-EMB' },
  { id_templates: 'TPL-EMB20', libelle: 'Ligne Ensacheuse 20', id_family: 'FAM-EMB' },
  { id_templates: 'TPL-USI5X', libelle: 'Fraiseuse 5-Axes CNC', id_family: 'FAM-USI' },
  { id_templates: 'TPL-TOUR', libelle: 'Tour Numérique T-300', id_family: 'FAM-USI' },
  { id_templates: 'TPL-PRS50', libelle: 'Presse Hydraulique 50T', id_family: 'FAM-DEC' },
  { id_templates: 'TPL-DECCNT', libelle: 'Découpeuse Continue D-12', id_family: 'FAM-DEC' },
  { id_templates: 'TPL-MOT380', libelle: 'Moteur Asynchrone 380V Trifasé', id_family: 'FAM-MOT' },
  { id_templates: 'TPL-MOTRED', libelle: 'Motoréducteur à Arbre Creux', id_family: 'FAM-MOT' },
  { id_templates: 'TPL-POMVAC', libelle: 'Pompe à Vide / Dépression', id_family: 'FAM-POM' },
  { id_templates: 'TPL-POMHYD', libelle: 'Pompe Hydraulique Haute Pression', id_family: 'FAM-POM' },
  { id_templates: 'TPL-EXT15', libelle: 'Extincteur Poudre ABC 15kg', id_family: 'FAM-EXT' },
  { id_templates: 'TPL-EXT50', libelle: 'Extincteur Mobile 50kg sur Roues', id_family: 'FAM-EXT' },
  { id_templates: 'TPL-COURPL', libelle: 'Courroie Plate Thermocollée 1200x50', id_family: 'FAM-COUR' },
];

export const INITIAL_WAREHOUSE_ITEMS = [
  {
    id_warehouse_item: 'MOT-01',
    stockInitial: 1,
    seuil: 0,
    designation: 'Moteur 380V 5.5kW - Entraînement Détacheuse',
    nature: 'PARTIE', // 'PARTIE' (جزء / Ensemble) or 'COMPOSANT' (مكون)
    id_family: 'FAM-MOT',
    id_templates: 'TPL-MOT380',
    id_type: '',
    id_diag: '',
    rattachement_type: 'MACHINE', // 'MACHINE' | 'ZONE' | 'ENTREPOT'
    id_machine_registered: 'MCH-001',
    id_zone: 'ZONE-DET',
    technician: 'TECH-01',
    status: 'En service',
    emplacement: 'SUR-MCH-001',
    remarques: 'Installé sur axe principal. Révision planifiée 2026.',
  },
  {
    id_warehouse_item: 'MOT-02',
    stockInitial: 1,
    seuil: 0,
    designation: 'Moteur 380V 7.5kW Réserve Atelier',
    nature: 'PARTIE',
    id_family: 'FAM-MOT',
    id_templates: 'TPL-MOT380',
    id_type: '',
    id_diag: '',
    rattachement_type: 'ENTREPOT',
    id_machine_registered: '',
    id_zone: 'ZONE-ATEL',
    technician: 'TECH-04',
    status: 'En stock (Disponible)',
    emplacement: 'E-MAG-RAYON-A02',
    remarques: 'Moteur de secours prêt à lemploi.',
  },
  {
    id_warehouse_item: 'POM-01',
    stockInitial: 1,
    seuil: 0,
    designation: 'Pompe à Vide Busch 40m3/h',
    nature: 'PARTIE',
    id_family: 'FAM-POM',
    id_templates: 'TPL-POMVAC',
    id_type: '',
    id_diag: '',
    rattachement_type: 'MACHINE',
    id_machine_registered: 'MCH-002',
    id_zone: 'ZONE-EMB',
    technician: 'TECH-02',
    status: 'En service',
    emplacement: 'SUR-MCH-002',
    remarques: 'Niveau dhuile vérifié mensuellement.',
  },
  {
    id_warehouse_item: 'POM-02',
    stockInitial: 1,
    seuil: 0,
    designation: 'Pompe Hydraulique 250 Bar Réserve',
    nature: 'PARTIE',
    id_family: 'FAM-POM',
    id_templates: 'TPL-POMHYD',
    id_type: '',
    id_diag: '',
    rattachement_type: 'ENTREPOT',
    id_machine_registered: '',
    id_zone: 'ZONE-ATEL',
    technician: 'TECH-01',
    status: 'En stock (Disponible)',
    emplacement: 'E-MAG-PAL-04',
    remarques: 'Joints neufs remplacés.',
  },
  {
    id_warehouse_item: 'COMP-FIX-01',
    stockInitial: 1,
    seuil: 0,
    designation: 'Cheville Filetée Haute Résistance 12x100',
    nature: 'COMPOSANT',
    id_family: '',
    id_templates: '',
    id_type: 'TYPE-FIX',
    id_diag: 'DIAG-DESSERAGE',
    rattachement_type: 'MACHINE',
    id_machine_registered: 'MCH-001',
    id_zone: 'ZONE-DET',
    technician: 'TECH-01',
    status: 'En service',
    emplacement: 'SUR-MCH-001',
    remarques: 'Ancrage socle lourd machine.',
  },
  {
    id_warehouse_item: 'COMP-COU-01',
    stockInitial: 1,
    seuil: 0,
    designation: 'Courroie Plate Thermocollée 1200x50 Spéciale',
    nature: 'COMPOSANT',
    id_family: '',
    id_templates: '',
    id_type: 'TYPE-MEC',
    id_diag: 'DIAG-USURE',
    rattachement_type: 'ENTREPOT',
    id_machine_registered: '',
    id_zone: 'ZONE-ATEL',
    technician: 'TECH-02',
    status: 'En révision / Externe',
    emplacement: 'R-SOUS-TRAITANT',
    remarques: 'Envoyé pour vulcanisation spéciale chez prestataire externe.',
  },
  {
    id_warehouse_item: 'COMP-PNE-01',
    stockInitial: 1,
    seuil: 0,
    designation: 'Vérin Pneumatique Compact Double Effet 50mm',
    nature: 'COMPOSANT',
    id_family: '',
    id_templates: '',
    id_type: 'TYPE-PNE',
    id_diag: 'DIAG-FUITE',
    rattachement_type: 'ZONE',
    id_machine_registered: '',
    id_zone: 'ZONE-EMB',
    technician: 'TECH-02',
    status: 'En stock (Disponible)',
    emplacement: 'E-MAG-RAYON-C04',
    remarques: 'Composant spécifique pour poussoir automatique.',
  },
];

/**
 * Auto-generates unique Warehouse Element / Component Code:
 * - If PARTIE: based on Family prefix (e.g., FAM-MOT -> MOT-01, MOT-02)
 * - If COMPOSANT: based on Type prefix (e.g., TYPE-FIX -> COMP-FIX-01, TYPE-MEC -> COMP-MEC-01)
 */
export function generateWarehouseItemCode(selectedId = '', existingItems = [], nature = 'PARTIE') {
  let prefix = '';
  if (nature === 'COMPOSANT') {
    const raw = String(selectedId || '')
      .replace(/^TYPE-?/i, '')
      .replace(/^COMP-?/i, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 4) || 'MEC';
    prefix = `COMP-${raw}`;
  } else {
    prefix =
      String(selectedId || '')
        .replace(/^FAM-?/i, '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 4) || 'MOT';
  }

  let maxIndex = 0;
  existingItems.forEach((item) => {
    // Only check items of the same nature
    if (item.nature && item.nature !== nature) return;

    const code = String(item.id_warehouse_item || item.id_element || '').toUpperCase();
    if (code.startsWith(prefix + '-')) {
      const match = code.match(/\d+$/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (num > maxIndex) maxIndex = num;
      }
    }
  });

  const nextNum = maxIndex + 1;
  return `${prefix}-${String(nextNum).padStart(2, '0')}`;
}

export const INITIAL_MACHINES_REGISTERED = [
  {
    id_machine_registered: 'MCH-001',
    designation: 'RCF 100 B1',
    id_family: 'FAM-EMB',
    id_templates: 'TPL-RCF100',
    id_zone_default: 'ZONE-DET',
    technician: 'TECH-01',
    status: 'En Service',
  },
  {
    id_machine_registered: 'MCH-002',
    designation: 'Ensacheuse Rapide E-02',
    id_family: 'FAM-EMB',
    id_templates: 'TPL-EMB20',
    id_zone_default: 'ZONE-EMB',
    technician: 'TECH-02',
    status: 'En Service',
  },
  {
    id_machine_registered: 'MCH-003',
    designation: 'Fraiseuse CNC F-01',
    id_family: 'FAM-USI',
    id_templates: 'TPL-USI5X',
    id_zone_default: 'ZONE-USI',
    technician: 'TECH-03',
    status: 'En Maintenance',
  },
  {
    id_machine_registered: 'MCH-004',
    designation: 'Tour T-300 Principal',
    id_family: 'FAM-USI',
    id_templates: 'TPL-TOUR',
    id_zone_default: 'ZONE-USI',
    technician: 'TECH-03',
    status: 'En Service',
  },
  {
    id_machine_registered: 'MCH-005',
    designation: 'Presse 50T Alpha',
    id_family: 'FAM-DEC',
    id_templates: 'TPL-PRS50',
    id_zone_default: 'ZONE-ATEL',
    technician: 'TECH-01',
    status: 'En Service',
  },
  {
    id_machine_registered: 'MCH-006',
    designation: 'Découpeuse D-12 Ligne 2',
    id_family: 'FAM-DEC',
    id_templates: 'TPL-DECCNT',
    id_zone_default: 'ZONE-DET',
    technician: 'TECH-02',
    status: 'En Service',
  },
];

export const INITIAL_ZONES = [
  { id_zone: 'ZONE-DET', libelle: 'Détacheuse 08' },
  { id_zone: 'ZONE-USI', libelle: 'Atelier Usinage CNC' },
  { id_zone: 'ZONE-EMB', libelle: 'Ligne Emballage & Tri' },
  { id_zone: 'ZONE-ATEL', libelle: 'Atelier Central Maintenance' },
];

export const INITIAL_TECHNICIANS = [
  {
    id_technician: 'TECH-01',
    nom: 'Rachid',
    id_zone: 'ZONE-DET',
    specialite: 'Mécanique & Hydraulique',
  },
  {
    id_technician: 'TECH-02',
    nom: 'Karim',
    id_zone: 'ZONE-EMB',
    specialite: 'Électromécanique & Automates',
  },
  {
    id_technician: 'TECH-03',
    nom: 'Yassine',
    id_zone: 'ZONE-USI',
    specialite: 'Usinage CNC & Outillage',
  },
  {
    id_technician: 'TECH-04',
    nom: 'Amine',
    id_zone: 'ZONE-ATEL',
    specialite: 'Pneumatique & Entretien',
  },
];

export const INITIAL_OPERATIONS = [
  { id_operation: 'OP-01', nom: 'Anas - DET', id_zone: 'ZONE-DET', type_profil: 'OPERATEUR' },
  {
    id_operation: 'OP-02',
    nom: 'Maintenance Préventive L1',
    id_zone: 'ZONE-EMB',
    type_profil: 'OPERATEUR',
  },
  {
    id_operation: 'OP-03',
    nom: 'Changement Outils Fraisage',
    id_zone: 'ZONE-USI',
    type_profil: 'OPERATEUR',
  },
  {
    id_operation: 'OP-04',
    nom: 'Contrôle Niveaux & Graissage',
    id_zone: 'ZONE-ATEL',
    type_profil: 'OPERATEUR',
  },
  {
    id_operation: 'RESP-01',
    nom: 'Ismael',
    id_zone: 'ALL',
    zones: ['ALL'],
    type_profil: 'RESPONSABLE',
    templates: ['RMG'],
    template_ids: ['RMG'],
    template_id: 'RMG',
    template_label: 'Responsable Magasin',
  },
  {
    id_operation: 'RESP-02',
    nom: 'Nabile Ghazawi',
    id_zone: 'ALL',
    zones: ['ALL'],
    type_profil: 'RESPONSABLE',
    templates: ['RMT', 'RZN'],
    template_ids: ['RMT', 'RZN'],
    template_id: 'RMT, RZN',
    template_label: 'Responsable Maintenance, Responsable Zone',
  },
  {
    id_operation: 'RESP-03',
    nom: 'Karim',
    id_zone: 'ZONE-ATEL',
    zones: ['ZONE-ATEL', 'ZONE-EMB'],
    type_profil: 'RESPONSABLE',
    templates: ['RZN'],
    template_ids: ['RZN'],
    template_id: 'RZN',
    template_label: 'Responsable Zone',
  },
  {
    id_operation: 'RESP-04',
    nom: 'Ahmed',
    id_zone: 'ZONE-DET',
    zones: ['ZONE-DET'],
    type_profil: 'RESPONSABLE',
    templates: ['RZN'],
    template_ids: ['RZN'],
    template_id: 'RZN',
    template_label: 'Responsable Zone',
  },
];

export function mapItemToTypeAndDiag(designation = '') {
  const d = designation.toLowerCase();
  if (
    d.includes('courroie') ||
    d.includes('roulement') ||
    d.includes('palier') ||
    d.includes('disque') ||
    d.includes('meule')
  ) {
    return { id_type: 'TYPE-MEC', id_diag: 'DIAG-USURE' };
  }
  if (
    d.includes('vis') ||
    d.includes('cheville') ||
    d.includes('cosse') ||
    d.includes('pastille') ||
    d.includes('ecrou') ||
    d.includes('boulon')
  ) {
    return { id_type: 'TYPE-FIX', id_diag: 'DIAG-DESSERAGE' };
  }
  if (
    d.includes('poinçon') ||
    d.includes('poincon') ||
    d.includes('foret') ||
    d.includes('outil') ||
    d.includes('lame')
  ) {
    return { id_type: 'TYPE-COU', id_diag: 'DIAG-EMOUSSE' };
  }
  if (
    d.includes('raccord') ||
    d.includes('joint') ||
    d.includes('distributeur') ||
    d.includes('vérin') ||
    d.includes('verin') ||
    d.includes('tuyau') ||
    d.includes('manomètre')
  ) {
    return { id_type: 'TYPE-PNE', id_diag: 'DIAG-FUITE' };
  }
  if (
    d.includes('resistance') ||
    d.includes('résistance') ||
    d.includes('capteur') ||
    d.includes('fin de course') ||
    d.includes('ventilateur') ||
    d.includes('pile') ||
    d.includes('lampe')
  ) {
    return { id_type: 'TYPE-ELE', id_diag: 'DIAG-SURCHAUFFE' };
  }
  if (
    d.includes('polyuréthane') ||
    d.includes('polyurethane') ||
    d.includes('brosse') ||
    d.includes('teflon') ||
    d.includes('huile') ||
    d.includes('etain')
  ) {
    return { id_type: 'TYPE-CON', id_diag: 'DIAG-DECHIRURE' };
  }
  return { id_type: 'TYPE-OUT', id_diag: 'DIAG-PREV' };
}

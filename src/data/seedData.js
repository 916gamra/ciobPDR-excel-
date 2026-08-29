import initialData from '../initialData.json';

export const INITIAL_TYPES = [
  { id_type: 'TYPE-MEC', libelle: 'Mécanique & Transmission' },
  { id_type: 'TYPE-FIX', libelle: 'Fixation & Visserie' },
  { id_type: 'TYPE-COU', libelle: 'Coupe & Perçage' },
  { id_type: 'TYPE-PNE', libelle: 'Pneumatique & Fluides' },
  { id_type: 'TYPE-ELE', libelle: 'Électrique & Capteurs' },
  { id_type: 'TYPE-CON', libelle: 'Consommables & Polymères' },
  { id_type: 'TYPE-OUT', libelle: "Outillage d'Atelier" }
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
  { id_diag: 'DIAG-PREV', libelle: 'Remplacement préventif systématique', id_type: 'TYPE-MEC' }
];

export const INITIAL_FAMILIES = [
  { id_family: 'FAM-EMB', libelle: 'Emballage' },
  { id_family: 'FAM-USI', libelle: 'Usinage & Fraisage' },
  { id_family: 'FAM-DEC', libelle: 'Découpe & Presses' },
  { id_family: 'FAM-ASSEM', libelle: 'Assemblage & Lignes' }
];

export const INITIAL_TEMPLATES = [
  { id_templates: 'TPL-RCF100', libelle: 'RCF 100 B1-10', id_family: 'FAM-EMB' },
  { id_templates: 'TPL-EMB20', libelle: 'Ligne Ensacheuse 20', id_family: 'FAM-EMB' },
  { id_templates: 'TPL-USI5X', libelle: 'Fraiseuse 5-Axes CNC', id_family: 'FAM-USI' },
  { id_templates: 'TPL-TOUR', libelle: 'Tour Numérique T-300', id_family: 'FAM-USI' },
  { id_templates: 'TPL-PRS50', libelle: 'Presse Hydraulique 50T', id_family: 'FAM-DEC' },
  { id_templates: 'TPL-DECCNT', libelle: 'Découpeuse Continue D-12', id_family: 'FAM-DEC' }
];

export const INITIAL_MACHINES_REGISTERED = [
  {
    id_machine_registered: 'MCH-001',
    designation: 'RCF 100 B1',
    id_family: 'FAM-EMB',
    id_templates: 'TPL-RCF100',
    id_zone_default: 'ZONE-DET',
    technician: 'TECH-01',
    status: 'En Service'
  },
  {
    id_machine_registered: 'MCH-002',
    designation: 'Ensacheuse Rapide E-02',
    id_family: 'FAM-EMB',
    id_templates: 'TPL-EMB20',
    id_zone_default: 'ZONE-EMB',
    technician: 'TECH-02',
    status: 'En Service'
  },
  {
    id_machine_registered: 'MCH-003',
    designation: 'Fraiseuse CNC F-01',
    id_family: 'FAM-USI',
    id_templates: 'TPL-USI5X',
    id_zone_default: 'ZONE-USI',
    technician: 'TECH-03',
    status: 'En Maintenance'
  },
  {
    id_machine_registered: 'MCH-004',
    designation: 'Tour T-300 Principal',
    id_family: 'FAM-USI',
    id_templates: 'TPL-TOUR',
    id_zone_default: 'ZONE-USI',
    technician: 'TECH-03',
    status: 'En Service'
  },
  {
    id_machine_registered: 'MCH-005',
    designation: 'Presse 50T Alpha',
    id_family: 'FAM-DEC',
    id_templates: 'TPL-PRS50',
    id_zone_default: 'ZONE-ATEL',
    technician: 'TECH-01',
    status: 'En Service'
  },
  {
    id_machine_registered: 'MCH-006',
    designation: 'Découpeuse D-12 Ligne 2',
    id_family: 'FAM-DEC',
    id_templates: 'TPL-DECCNT',
    id_zone_default: 'ZONE-DET',
    technician: 'TECH-02',
    status: 'En Service'
  }
];

export const INITIAL_ZONES = [
  { id_zone: 'ZONE-DET', libelle: 'Détacheuse 08' },
  { id_zone: 'ZONE-USI', libelle: 'Atelier Usinage CNC' },
  { id_zone: 'ZONE-EMB', libelle: 'Ligne Emballage & Tri' },
  { id_zone: 'ZONE-ATEL', libelle: 'Atelier Central Maintenance' }
];

export const INITIAL_TECHNICIANS = [
  { id_technician: 'TECH-01', nom: 'Rachid', id_zone: 'ZONE-DET', specialite: 'Mécanique & Hydraulique' },
  { id_technician: 'TECH-02', nom: 'Karim', id_zone: 'ZONE-EMB', specialite: 'Électromécanique & Automates' },
  { id_technician: 'TECH-03', nom: 'Yassine', id_zone: 'ZONE-USI', specialite: 'Usinage CNC & Outillage' },
  { id_technician: 'TECH-04', nom: 'Amine', id_zone: 'ZONE-ATEL', specialite: 'Pneumatique & Entretien' }
];

export const INITIAL_OPERATIONS = [
  { id_operation: 'OP-01', nom: 'Anas - DET', id_zone: 'ZONE-DET' },
  { id_operation: 'OP-02', nom: 'Maintenance Préventive L1', id_zone: 'ZONE-EMB' },
  { id_operation: 'OP-03', nom: 'Changement Outils Fraisage', id_zone: 'ZONE-USI' },
  { id_operation: 'OP-04', nom: 'Contrôle Niveaux & Graissage', id_zone: 'ZONE-ATEL' }
];

export function mapItemToTypeAndDiag(designation = '') {
  const d = designation.toLowerCase();
  if (d.includes('courroie') || d.includes('roulement') || d.includes('palier') || d.includes('disque') || d.includes('meule')) {
    return { id_type: 'TYPE-MEC', id_diag: 'DIAG-USURE' };
  }
  if (d.includes('vis') || d.includes('cheville') || d.includes('cosse') || d.includes('pastille') || d.includes('ecrou') || d.includes('boulon')) {
    return { id_type: 'TYPE-FIX', id_diag: 'DIAG-DESSERAGE' };
  }
  if (d.includes('poinçon') || d.includes('poincon') || d.includes('foret') || d.includes('outil') || d.includes('lame')) {
    return { id_type: 'TYPE-COU', id_diag: 'DIAG-EMOUSSE' };
  }
  if (d.includes('raccord') || d.includes('joint') || d.includes('distributeur') || d.includes('vérin') || d.includes('verin') || d.includes('tuyau') || d.includes('manomètre')) {
    return { id_type: 'TYPE-PNE', id_diag: 'DIAG-FUITE' };
  }
  if (d.includes('resistance') || d.includes('résistance') || d.includes('capteur') || d.includes('fin de course') || d.includes('ventilateur') || d.includes('pile') || d.includes('lampe')) {
    return { id_type: 'TYPE-ELE', id_diag: 'DIAG-SURCHAUFFE' };
  }
  if (d.includes('polyuréthane') || d.includes('polyurethane') || d.includes('brosse') || d.includes('teflon') || d.includes('huile') || d.includes('etain')) {
    return { id_type: 'TYPE-CON', id_diag: 'DIAG-DECHIRURE' };
  }
  return { id_type: 'TYPE-OUT', id_diag: 'DIAG-PREV' };
}

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
  { id_family: 'AMBO', libelle: 'Emboutissage & Presses Profondes', code: 'AMBO' },
  { id_family: 'POL', libelle: 'Polissage (Automatique & Manuel)', code: 'POL' },
  { id_family: 'REPO', libelle: 'Tours à Repoussage (Formage Rotatif)', code: 'REPO' },
  { id_family: 'DET', libelle: 'Détourage & Ébavurage', code: 'DET' },
  { id_family: 'SAT', libelle: 'Machines de Satinage', code: 'SAT' },
  { id_family: 'BAK', libelle: 'Presses à Injection (Bakélite)', code: 'BAK' },
  { id_family: 'COMP', libelle: "Compresseurs & Centrale d'Air", code: 'COMP' },
  { id_family: 'DIV', libelle: 'Équipements Divers & Auxiliaires', code: 'DIV' },
  { id_family: 'USI', libelle: 'Fabrication Mécanique & Usinage', code: 'USI' },
  { id_family: 'FEMB1', libelle: 'Ligne Finition Emballage 1', code: 'FEMB1' },
  { id_family: 'FEMB2', libelle: 'Ligne Finition Emballage 2', code: 'FEMB2' },
  { id_family: 'FEMB3', libelle: 'Ligne Finition Emballage 3', code: 'FEMB3' },
  { id_family: 'FEMB4', libelle: 'Ligne Finition Emballage 4', code: 'FEMB4' },
  { id_family: 'SOUD', libelle: 'Postes de Soudage & Assemblage Chaud', code: 'SOUD' },
];

export const INITIAL_TEMPLATES = [
  { id_templates: 'TPL-TRR', libelle: 'Tour à Repoussage', id_family: 'REPO', sku: 'TRR' },
  { id_templates: 'TPL-TRP', libelle: 'Tour Parallèle Standard', id_family: 'USI', sku: 'TRP' },
  { id_templates: 'TPL-PRI', libelle: 'Presse Injection Bakélite', id_family: 'BAK', sku: 'PRI' },
  { id_templates: 'TPL-SAT', libelle: 'Machine de Satinage Standard', id_family: 'SAT', sku: 'SAT' },
  { id_templates: 'TPL-RCP', libelle: 'Rectifieuse de Précision', id_family: 'USI', sku: 'RCP' },
  { id_templates: 'TPL-PER', libelle: 'Perceuse Industrielle de Fab.', id_family: 'USI', sku: 'PER' },
  { id_templates: 'TPL-PRR', libelle: 'Perceuse Radiale', id_family: 'USI', sku: 'PRR' },
  { id_templates: 'TPL-MRT', libelle: 'Mortiseuse Industrielle', id_family: 'USI', sku: 'MRT' },
  { id_templates: 'TPL-FRM', libelle: 'Fraiseuse Mécanique Standard', id_family: 'USI', sku: 'FRM' },
  { id_templates: 'TPL-MEL', libelle: 'Meuleuse Industrielle', id_family: 'USI', sku: 'MEL' },
  { id_templates: 'TPL-SCM', libelle: 'Scie Alternative Mécanique', id_family: 'USI', sku: 'SCM' },
  { id_templates: 'TPL-POA', libelle: 'Polissage Automatique', id_family: 'POL', sku: 'POA' },
  { id_templates: 'TPL-POM', libelle: 'Polissage Manuel', id_family: 'POL', sku: 'POM' },
  { id_templates: 'TPL-RVA', libelle: 'Riveteuse Automatique', id_family: 'FEMB1', sku: 'RVA' },
  { id_templates: 'TPL-RVM', libelle: 'Riveteuse Mécanique Manuelle', id_family: 'FEMB2', sku: 'RVM' },
  { id_templates: 'TPL-DET', libelle: 'Détoureuse Industrielle', id_family: 'DET', sku: 'DET' },
  { id_templates: 'TPL-AMBO', libelle: 'Presse Emboutissage 200T-400T', id_family: 'AMBO', sku: 'AMBO' },
  { id_templates: 'TPL-COMP', libelle: 'Compresseur à Vis / Piston', id_family: 'COMP', sku: 'COMP' },
  { id_templates: 'TPL-SOUD', libelle: 'Poste Soudure & Fixation', id_family: 'SOUD', sku: 'SOUD' },
];

/**
 * Level 3 Blueprints (Schémas Techniques & Plans Détaillés des Modèles de Machines)
 */
export const INITIAL_BLUEPRINTS = [
  {
    id_blueprint: 'BPT-01',
    libelle: 'Schéma Cinématique Poupée Fixe & Broche',
    id_family: 'REPO',
    id_templates: 'TPL-TRR',
    ref_plan: 'DWG-TR-001-A',
    revision: 'Rev-B',
    statut: 'Approuvé',
    type_schema: 'Mécanique',
    description: 'Architecture des roulements coniques et chaîne cinématique de rotation de la broche principale.',
    specs: {
      puissance: '7.5 kW',
      course: '850 mm',
      moteur: 'Triphasé 1450 tr/min',
      dimensions: '2200 x 1100 x 1650 mm',
    },
    components_theoriques: [
      { id_component: 'EXT-01', libelle: 'Extincteur Automatique CO2', qte: 1 },
      { id_component: 'VER-01', libelle: 'Vérin de Poupée Hydraulique', qte: 1 },
    ],
    parts_theoriques: [
      { id_part: 'VIS-M8-001', libelle: 'Vis CHC M8x30 Classe 8.8', qte: 16 },
      { id_part: 'ECR-M8-001', libelle: 'Écrou Nylstop M8', qte: 16 },
    ],
    pdr_theoriques: [
      { id_pdr: 'ROUL-6204-2RS', libelle: 'Roulement Rigide 6204-2RS', qte: 2, criticite: 'Haute' },
      { id_pdr: 'ROUL-30206', libelle: 'Roulement Conique 30206', qte: 2, criticite: 'Haute' },
      { id_pdr: 'COUR-SPA-1250', libelle: 'Courroie Trapézoïdale SPA 1250', qte: 3, criticite: 'Moyenne' },
    ],
  },
  {
    id_blueprint: 'BPT-02',
    libelle: 'Circuit de Commande Moteur & Variateur 7.5kW',
    id_family: 'REPO',
    id_templates: 'TPL-TRR',
    ref_plan: 'ELEC-TR-002-C',
    revision: 'Rev-A',
    statut: 'Approuvé',
    type_schema: 'Électrique',
    description: 'Schéma unifilaire puissance, armoire électrique et sécurité arrêt d’urgence.',
    specs: {
      puissance: '7.5 kW',
      tension: '400V Triphasé',
      variateur: 'Schneider ATV320 7.5kW',
      indicesProtection: 'IP55',
    },
    components_theoriques: [
      { id_component: 'EXT-01', libelle: 'Extincteur Automatique CO2', qte: 1 },
    ],
    parts_theoriques: [
      { id_part: 'VIS-M4-001', libelle: 'Vis Tête Cylindrique M4x16', qte: 24 },
    ],
    pdr_theoriques: [
      { id_pdr: 'FUS-16A-GG', libelle: 'Fusible Cylindrique 10x38 16A gG', qte: 6, criticite: 'Haute' },
      { id_pdr: 'CONT-LC1D18', libelle: 'Contacteur Schneider LC1D18', qte: 1, criticite: 'Moyenne' },
    ],
  },
  {
    id_blueprint: 'BPT-03',
    libelle: 'Ensemble Banc & Chariot Porte-Outils Transversal',
    id_family: 'USI',
    id_templates: 'TPL-TRP',
    ref_plan: 'DWG-TRP-010-A',
    revision: 'Rev-A',
    statut: 'Approuvé',
    type_schema: 'Mécanique',
    description: 'Guidage prismatique trempé et vis à billes axe X/Z.',
    specs: {
      puissance: '5.5 kW',
      course: '600 mm',
      moteur: 'Servo-moteur 3kW',
      dimensions: '1800 x 950 x 1500 mm',
    },
    components_theoriques: [
      { id_component: 'VER-01', libelle: 'Vérin Amortisseur de Chariot', qte: 2 },
    ],
    parts_theoriques: [
      { id_part: 'VIS-M10-001', libelle: 'Vis CHC M10x40 10.9', qte: 12 },
    ],
    pdr_theoriques: [
      { id_pdr: 'LUB-ISO-VG68', libelle: 'Huile Glissière ISO VG 68 (Bidon 5L)', qte: 1, criticite: 'Moyenne' },
      { id_pdr: 'RAC-PNEU-8MM', libelle: 'Racleur de Glissière Polyuréthane', qte: 4, criticite: 'Moyenne' },
    ],
  },
  {
    id_blueprint: 'BPT-04',
    libelle: 'Groupe Hydraulique & Circuit de Fermeture Moule',
    id_family: 'BAK',
    id_templates: 'TPL-PRI',
    ref_plan: 'HYD-PRI-104-D',
    revision: 'Rev-C',
    statut: 'Approuvé',
    type_schema: 'Hydraulique',
    description: 'Schéma de distribution haute pression 250 bars avec accumulateurs et clapets anti-retour.',
    specs: {
      puissance: '200 Tonnes',
      course: '350 mm',
      moteur: '15 kW Pompe Variable',
      dimensions: '2800 x 1600 x 2400 mm',
    },
    components_theoriques: [
      { id_component: 'VER-01', libelle: 'Vérin Principal Double Effet 250T', qte: 1 },
      { id_component: 'EXT-01', libelle: 'Extincteur Automatique CO2', qte: 2 },
    ],
    parts_theoriques: [
      { id_part: 'VIS-M12-001', libelle: 'Vis Haute Résistance M12x60 12.9', qte: 32 },
    ],
    pdr_theoriques: [
      { id_pdr: 'JOINT-HYD-120', libelle: 'Kit Joints Vérin Principal 120mm', qte: 2, criticite: 'Haute' },
      { id_pdr: 'FILT-HYD-10M', libelle: 'Cartouche Filtre Pression 10 Microns', qte: 3, criticite: 'Haute' },
    ],
  },
  {
    id_blueprint: 'BPT-05',
    libelle: 'Régulation Thermique & Colliers Chauffants Bakélite',
    id_family: 'BAK',
    id_templates: 'TPL-PRI',
    ref_plan: 'ELEC-PRI-105-B',
    revision: 'Rev-A',
    statut: 'Approuvé',
    type_schema: 'Électrique',
    description: 'Boucle PID 4 zones de chauffe fourreau et thermocouples type J.',
    specs: {
      puissance: '18 kW Chauffe',
      temperatureMax: '350 °C',
      zonesChauffe: '4 Zones Indépendantes',
    },
    components_theoriques: [
      { id_component: 'EXT-01', libelle: 'Extincteur Automatique CO2', qte: 1 },
    ],
    parts_theoriques: [
      { id_part: 'VIS-M5-001', libelle: 'Vis Inox A2 M5x20', qte: 18 },
    ],
    pdr_theoriques: [
      { id_pdr: 'COL-CHAUF-60', libelle: 'Collier Chauffant Céramique Ø60 1500W', qte: 4, criticite: 'Haute' },
      { id_pdr: 'SONDE-TC-J', libelle: 'Thermocouple Type J Baïonnette L=2m', qte: 4, criticite: 'Haute' },
    ],
  },
  {
    id_blueprint: 'BPT-06',
    libelle: 'Système d’Aspiration de Poussière & Filtration Atex',
    id_family: 'SAT',
    id_templates: 'TPL-SAT',
    ref_plan: 'PNEU-SAT-201-A',
    revision: 'Rev-B',
    statut: 'Approuvé',
    type_schema: 'Pneumatique',
    description: 'Conduits aérauliques et caisson de dépression pour particules de satinage.',
  },
  {
    id_blueprint: 'BPT-07',
    libelle: 'Arbre Tambour & Entraînement Courroie Crantée',
    id_family: 'SAT',
    id_templates: 'TPL-SAT',
    ref_plan: 'DWG-SAT-202-B',
    revision: 'Rev-A',
    statut: 'Approuvé',
    type_schema: 'Mécanique',
    description: 'Paliers auto-aligneurs à rouleaux et tensionneur dynamique.',
  },
  {
    id_blueprint: 'BPT-08',
    libelle: 'Broche Haute Fréquence 24000 tr/min & Lubrification',
    id_family: 'USI',
    id_templates: 'TPL-RCP',
    ref_plan: 'DWG-RCP-301-C',
    revision: 'Rev-C',
    statut: 'Approuvé',
    type_schema: 'Mécanique',
    description: 'Graissage micro-brouillard et roulements céramiques ultra-précision classe P4.',
  },
  {
    id_blueprint: 'BPT-09',
    libelle: 'Descente Automatique de Fourreau & Boîte d’Avances',
    id_family: 'USI',
    id_templates: 'TPL-PER',
    ref_plan: 'DWG-PER-401-A',
    revision: 'Rev-A',
    statut: 'Approuvé',
    type_schema: 'Mécanique',
    description: 'Embrayage électromagnétique et pignonnerie d’avance automatique.',
  },
  {
    id_blueprint: 'BPT-10',
    libelle: 'Bras Pivotant & Blocage Électro-Hydraulique Colonne',
    id_family: 'USI',
    id_templates: 'TPL-PRR',
    ref_plan: 'HYD-PRR-402-B',
    revision: 'Rev-B',
    statut: 'Approuvé',
    type_schema: 'Hydraulique',
    description: 'Vérin de serrage concentrique pour maintien rigide du bras radial.',
  },
  {
    id_blueprint: 'BPT-11',
    libelle: 'Coulisseau Vertical & Réglage Course Mortisage',
    id_family: 'USI',
    id_templates: 'TPL-MRT',
    ref_plan: 'DWG-MRT-501-A',
    revision: 'Rev-A',
    statut: 'Approuvé',
    type_schema: 'Mécanique',
    description: 'Mécanisme bielle-manivelle à coulisse réglable et contrepoids d’équilibrage.',
  },
  {
    id_blueprint: 'BPT-12',
    libelle: 'Tête Universelle Bi-Rotative & Pignonnerie Conique',
    id_family: 'USI',
    id_templates: 'TPL-FRM',
    ref_plan: 'DWG-FRM-601-B',
    revision: 'Rev-B',
    statut: 'Approuvé',
    type_schema: 'Mécanique',
    description: 'Engrenages spiro-coniques traités Gleason et blocage angulaire vernier.',
  },
  {
    id_blueprint: 'BPT-13',
    libelle: 'Carters de Sécurité & Équilibrage Dynamique Meules',
    id_family: 'USI',
    id_templates: 'TPL-MEL',
    ref_plan: 'DWG-MEL-701-A',
    revision: 'Rev-A',
    statut: 'Approuvé',
    type_schema: 'Mécanique',
    description: 'Protection anti-éclatement renforcée et flasques de serrage concentriques.',
  },
  {
    id_blueprint: 'BPT-14',
    libelle: 'Archet de Coupe & Amortisseur Hydraulique Descente',
    id_family: 'USI',
    id_templates: 'TPL-SCM',
    ref_plan: 'HYD-SCI-801-A',
    revision: 'Rev-A',
    statut: 'Approuvé',
    type_schema: 'Hydraulique',
    description: 'Régulateur de débit micrométrique pour contrôle précis de la vitesse de coupe.',
  },
  {
    id_blueprint: 'BPT-15',
    libelle: 'Table Indexable & Bras Multi-Postes Automatiques',
    id_family: 'POL',
    id_templates: 'TPL-POA',
    ref_plan: 'DWG-POA-901-C',
    revision: 'Rev-C',
    statut: 'Approuvé',
    type_schema: 'Pneumo-Mécanique',
    description: 'Plateau diviseur pneumatique 6 stations avec vérins de préhension pièce.',
  },
  {
    id_blueprint: 'BPT-16',
    libelle: 'Touret Polissage & Arbre Porte-Disques Feutre/Coton',
    id_family: 'POL',
    id_templates: 'TPL-POM',
    ref_plan: 'DWG-POM-902-A',
    revision: 'Rev-A',
    statut: 'Approuvé',
    type_schema: 'Mécanique',
    description: 'Broche conique filetée à gauche/droite et roulements à billes étanches 2RS.',
  },
  {
    id_blueprint: 'BPT-17',
    libelle: 'Distributeur Vibratoire de Rivets & Goulotte d’Alimentation',
    id_family: 'FEMB1',
    id_templates: 'TPL-RVA',
    ref_plan: 'PNEU-RVA-951-B',
    revision: 'Rev-B',
    statut: 'Approuvé',
    type_schema: 'Pneumatique',
    description: 'Bol vibrant électromagnétique et capteurs inductifs de présence de rivet.',
  },
  {
    id_blueprint: 'BPT-18',
    libelle: 'Bouterolle & Mécanisme de Frappe à Genouillère',
    id_family: 'FEMB2',
    id_templates: 'TPL-RVM',
    ref_plan: 'DWG-RVM-952-A',
    revision: 'Rev-A',
    statut: 'Approuvé',
    type_schema: 'Mécanique',
    description: 'Amplificateur d’effort mécanique à biellettes trempées 58 HRC.',
  },
  {
    id_blueprint: 'BPT-19',
    libelle: 'Tête Haute Vitesse Ébavurage & Table d’Appui Réglable',
    id_family: 'DET',
    id_templates: 'TPL-DET',
    ref_plan: 'DWG-DET-981-A',
    revision: 'Rev-A',
    statut: 'Approuvé',
    type_schema: 'Mécanique',
    description: 'Système de guidage de contour et évacuation copeaux aluminium.',
  },
];

/**
 * Entrepôt - Familles dédiées aux COMPOSANTS (Ensembles & Sous-systèmes d'Entrepôt)
 */
export const INITIAL_COMP_FAMILIES = [
  { id_family: 'FAM-MOT', libelle: 'Moteurs & Motoréducteurs', componentCode: 'MOT' },
  { id_family: 'FAM-POM', libelle: 'Pompes & Centrales Hydrauliques', componentCode: 'POM' },
  { id_family: 'FAM-RED', libelle: 'Réducteurs & Boîtes de Transmission', componentCode: 'RED' },
  { id_family: 'FAM-EXT', libelle: "Extrudeuses & Vis d'Extrusion", componentCode: 'EXT' },
  { id_family: 'FAM-COUR', libelle: 'Courroies & Bandes Spéciales', componentCode: 'COUR' },
  { id_family: 'FAM-CYL', libelle: 'Vérins & Cylindres Lourds', componentCode: 'CYL' },
];

/**
 * Entrepôt - Templates dédiés aux COMPOSANTS (Modèles d'Ensembles d'Entrepôt)
 */
export const INITIAL_COMP_TEMPLATES = [
  { id_templates: 'TPL-MOT380', libelle: 'Moteur Asynchrone 380V Trifasé 5.5kW/7.5kW', id_family: 'FAM-MOT' },
  { id_templates: 'TPL-MOTRED', libelle: 'Motoréducteur à Arbre Creux 1/30', id_family: 'FAM-MOT' },
  { id_templates: 'TPL-POMVAC', libelle: 'Pompe à Vide Busch 40m3/h Dépression', id_family: 'FAM-POM' },
  { id_templates: 'TPL-POMHYD', libelle: 'Pompe Hydraulique Haute Pression 250 Bar', id_family: 'FAM-POM' },
  { id_templates: 'TPL-RED-W', libelle: 'Réducteur à Roue et Vis sans fin R-80', id_family: 'FAM-RED' },
  { id_templates: 'TPL-EXT-V2', libelle: "Vis d'Extrusion Nitrurée Ø60mm", id_family: 'FAM-EXT' },
  { id_templates: 'TPL-COURPL', libelle: 'Courroie Plate Thermocollée 1200x50', id_family: 'FAM-COUR' },
];

/**
 * Entrepôt - Types dédiés aux PARTS (Catégories de Pièces Détachées d'Entrepôt)
 */
export const INITIAL_PART_TYPES = [
  { id_type: 'TYPE-FIX', libelle: 'Fixation & Visserie Industrielle' },
  { id_type: 'TYPE-MEC', libelle: 'Organes Mécaniques & Transmission' },
  { id_type: 'TYPE-PNE', libelle: 'Pneumatique & Composants Fluides' },
  { id_type: 'TYPE-ELE', libelle: 'Électrique, Relais & Capteurs' },
  { id_type: 'TYPE-HYD', libelle: 'Hydraulique, Raccords & Flexibles' },
];

/**
 * Entrepôt - Désignations dédiées aux PARTS (Catalogue de Pièces Détachées d'Entrepôt)
 */
export const INITIAL_PART_DESIGNATIONS = [
  {
    id_part: 'FIX-01',
    ref: 'FIX-01',
    designation: 'Cheville Filetée Haute Résistance 12x100',
    id_type: 'TYPE-FIX',
    id_diag: 'DIAG-DESSERAGE',
    seuil: 10,
    emplacement: 'E-MAG-RAYON-C01',
  },
  {
    id_part: 'MEC-01',
    ref: 'MEC-01',
    designation: 'Courroie Plate Thermocollée 1200x50 Spéciale',
    id_type: 'TYPE-MEC',
    id_diag: 'DIAG-USURE',
    seuil: 5,
    emplacement: 'E-MAG-RAYON-B02',
  },
  {
    id_part: 'PNE-01',
    ref: 'PNE-01',
    designation: 'Vérin Pneumatique Compact Double Effet 50mm',
    id_type: 'TYPE-PNE',
    id_diag: 'DIAG-FUITE',
    seuil: 3,
    emplacement: 'E-MAG-RAYON-C04',
  },
  {
    id_part: 'ELE-01',
    ref: 'ELE-01',
    designation: 'Capteur Inductif M12 PNP NO Blindé',
    id_type: 'TYPE-ELE',
    id_diag: 'DIAG-SIGNAL',
    seuil: 4,
    emplacement: 'E-MAG-RAYON-A01',
  },
  {
    id_part: 'HYD-01',
    ref: 'HYD-01',
    designation: 'Flexible Hydraulique 2 Tresses 1/2" 1500mm',
    id_type: 'TYPE-HYD',
    id_diag: 'DIAG-JOINT',
    seuil: 2,
    emplacement: 'E-MAG-PAL-03',
  },
];

export const INITIAL_WAREHOUSE_ITEMS = [
  {
    id_warehouse_item: 'MOT-01-01',
    stockInitial: 1,
    seuil: 0,
    designation: 'Moteur 380V 5.5kW - Entraînement Détacheuse',
    nature: 'COMPONENT', // 'COMPONENT' (Sous-système / Ensemble Machine) or 'PART' (Pièce détachée / PDR)
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
    id_warehouse_item: 'MOT-01-02',
    stockInitial: 1,
    seuil: 0,
    designation: 'Moteur 380V 7.5kW Réserve Atelier',
    nature: 'COMPONENT',
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
    id_warehouse_item: 'POM-VAC-01',
    stockInitial: 1,
    seuil: 0,
    designation: 'Pompe à Vide Busch 40m3/h',
    nature: 'COMPONENT',
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
    id_warehouse_item: 'POM-HYD-01',
    stockInitial: 1,
    seuil: 0,
    designation: 'Pompe Hydraulique 250 Bar Réserve',
    nature: 'COMPONENT',
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
    id_warehouse_item: 'FIX-01',
    stockInitial: 50,
    seuil: 10,
    designation: 'Cheville Filetée Haute Résistance 12x100',
    nature: 'PART',
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
    id_warehouse_item: 'MEC-01',
    stockInitial: 20,
    seuil: 5,
    designation: 'Courroie Plate Thermocollée 1200x50 Spéciale',
    nature: 'PART',
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
    id_warehouse_item: 'PNE-01',
    stockInitial: 15,
    seuil: 3,
    designation: 'Vérin Pneumatique Compact Double Effet 50mm',
    nature: 'PART',
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
 * - If COMPONENT (formerly PARTIE): based on Template/Family prefix (e.g., EXT-01 -> EXT-01-01, MOT-01 -> MOT-01-01)
 * - If PART (formerly COMPOSANT): based on Type prefix (e.g., VIS -> VIS-01, FIX -> FIX-01)
 */
export function generateWarehouseItemCode(selectedId = '', existingItems = [], nature = 'COMPONENT') {
  const isPart = nature === 'PART' || nature === 'COMPOSANT';
  let prefix = '';
  if (isPart) {
    const raw = String(selectedId || '')
      .replace(/^TYPE-?/i, '')
      .replace(/^COMP-?/i, '')
      .replace(/^PART-?/i, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 5) || 'PART';
    prefix = `${raw}`;
  } else {
    // COMPONENT
    const raw = String(selectedId || '')
      .replace(/^TPL-?/i, '')
      .replace(/^FAM-?/i, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 8) || 'CMP';
    prefix = `${raw}`;
  }

  let maxIndex = 0;
  existingItems.forEach((item) => {
    const itemIsPart = item.nature === 'PART' || item.nature === 'COMPOSANT';
    if (itemIsPart !== isPart) return;

    const code = String(item.id_warehouse_item || item.id_element || item.ref || '').toUpperCase();
    if (code.startsWith(prefix + '-') || code.startsWith(prefix)) {
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
  // 1. BAK Bakélite (6 machines) -> BAK / TPL-PRI
  { id_machine_registered: 'PRI-04', designation: 'Presse à Injection Bakélite 04', id_family: 'BAK', id_templates: 'TPL-PRI', id_blueprint: 'BPT-04', id_zone_default: 'BAK', technician: 'TECH-03', status: 'En Service' },
  { id_machine_registered: 'PRI-05', designation: 'Presse à Injection Bakélite 05', id_family: 'BAK', id_templates: 'TPL-PRI', id_blueprint: 'BPT-05', id_zone_default: 'BAK', technician: 'TECH-03', status: 'En Service' },
  { id_machine_registered: 'PRI-06', designation: 'Presse à Injection Bakélite 06', id_family: 'BAK', id_templates: 'TPL-PRI', id_blueprint: 'BPT-04', id_zone_default: 'BAK', technician: 'TECH-03', status: 'En Service' },
  { id_machine_registered: 'PRI-07', designation: 'Presse à Injection Bakélite 07', id_family: 'BAK', id_templates: 'TPL-PRI', id_blueprint: '', id_zone_default: 'BAK', technician: 'TECH-03', status: 'En Service' },
  { id_machine_registered: 'PRI-08', designation: 'Presse à Injection Bakélite 08', id_family: 'BAK', id_templates: 'TPL-PRI', id_blueprint: '', id_zone_default: 'BAK', technician: 'TECH-03', status: 'En Service' },
  { id_machine_registered: 'PRI-09', designation: 'Presse à Injection Bakélite 09', id_family: 'BAK', id_templates: 'TPL-PRI', id_blueprint: '', id_zone_default: 'BAK', technician: 'TECH-03', status: 'En Service' },

  // 2. DET Detourage (12 machines) -> DET & SAT
  { id_machine_registered: 'DET-01', designation: 'Détoureuse Industrielle 01', id_family: 'DET', id_templates: 'TPL-DET', id_blueprint: 'BPT-19', id_zone_default: 'DET', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'DET-03', designation: 'Détoureuse Industrielle 03', id_family: 'DET', id_templates: 'TPL-DET', id_blueprint: '', id_zone_default: 'DET', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'DET-06', designation: 'Détoureuse Industrielle 06', id_family: 'DET', id_templates: 'TPL-DET', id_blueprint: '', id_zone_default: 'DET', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'DET-11', designation: 'Détoureuse Verticale 11', id_family: 'DET', id_templates: 'TPL-DET', id_blueprint: '', id_zone_default: 'DET', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-13', designation: 'Machine Satinage Aspiration 13', id_family: 'SAT', id_templates: 'TPL-SAT', id_blueprint: 'BPT-06', id_zone_default: 'DET', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-17', designation: 'Machine Satinage Aspiration 17', id_family: 'SAT', id_templates: 'TPL-SAT', id_blueprint: 'BPT-07', id_zone_default: 'DET', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-21', designation: 'Machine Satinage Aspiration 21', id_family: 'SAT', id_templates: 'TPL-SAT', id_blueprint: 'BPT-06', id_zone_default: 'DET', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-25', designation: 'Machine Satinage Aspiration 25', id_family: 'SAT', id_templates: 'TPL-SAT', id_blueprint: '', id_zone_default: 'DET', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-26', designation: 'Machine Satinage Aspiration 26', id_family: 'SAT', id_templates: 'TPL-SAT', id_blueprint: '', id_zone_default: 'DET', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-27', designation: 'Machine Satinage Aspiration 27', id_family: 'SAT', id_templates: 'TPL-SAT', id_blueprint: '', id_zone_default: 'DET', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-36', designation: 'Machine Satinage Aspiration 36', id_family: 'SAT', id_templates: 'TPL-SAT', id_blueprint: '', id_zone_default: 'DET', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-41', designation: 'Machine Satinage Aspiration 41', id_family: 'SAT', id_templates: 'TPL-SAT', id_blueprint: '', id_zone_default: 'DET', technician: 'TECH-01', status: 'En Service' },

  // 3. AMBO Emboutissage (2 machines) -> AMBO / TPL-AMBO
  { id_machine_registered: 'AMBO-01', designation: 'Presse Hydraulique Emboutissage 400T', id_family: 'AMBO', id_templates: 'TPL-AMBO', id_blueprint: '', id_zone_default: 'AMBO', technician: 'TECH-04', status: 'En Service' },
  { id_machine_registered: 'AMBO-02', designation: 'Presse Mécanique Emboutissage 250T', id_family: 'AMBO', id_templates: 'TPL-AMBO', id_blueprint: '', id_zone_default: 'AMBO', technician: 'TECH-04', status: 'En Service' },

  // 4. USI Fabrication Mécanique (19 machines) -> USI / TPL-*
  { id_machine_registered: 'TRP-01', designation: 'Tour Parallèle 01', id_family: 'USI', id_templates: 'TPL-TRP', id_blueprint: 'BPT-03', id_zone_default: 'USI', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'TRP-04', designation: 'Tour Parallèle 04', id_family: 'USI', id_templates: 'TPL-TRP', id_blueprint: 'BPT-01', id_zone_default: 'USI', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'TRP-08', designation: 'Tour Parallèle 08', id_family: 'USI', id_templates: 'TPL-TRP', id_blueprint: 'BPT-03', id_zone_default: 'USI', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'TRP-10', designation: 'Tour Parallèle 10', id_family: 'USI', id_templates: 'TPL-TRP', id_blueprint: '', id_zone_default: 'USI', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'TRP-11', designation: 'Tour Parallèle 11', id_family: 'USI', id_templates: 'TPL-TRP', id_blueprint: '', id_zone_default: 'USI', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'TRP-12', designation: 'Tour Parallèle 12', id_family: 'USI', id_templates: 'TPL-TRP', id_blueprint: '', id_zone_default: 'USI', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'RCP-02', designation: 'Rectifieuse de Précision 02', id_family: 'USI', id_templates: 'TPL-RCP', id_blueprint: 'BPT-08', id_zone_default: 'USI', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'RCP-03', designation: 'Rectifieuse Manuelle 03', id_family: 'USI', id_templates: 'TPL-RCP', id_blueprint: 'BPT-08', id_zone_default: 'USI', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'RCP-04', designation: 'Rectifieuse de Précision 04', id_family: 'USI', id_templates: 'TPL-RCP', id_blueprint: '', id_zone_default: 'USI', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'PER-06', designation: 'Perceuse Industrielle Avancée 06', id_family: 'USI', id_templates: 'TPL-PER', id_blueprint: 'BPT-09', id_zone_default: 'USI', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'PRR-01', designation: 'Perceuse Radiale 01', id_family: 'USI', id_templates: 'TPL-PRR', id_blueprint: 'BPT-10', id_zone_default: 'USI', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'MRT-01', designation: 'Mortiseuse Industrielle 01', id_family: 'USI', id_templates: 'TPL-MRT', id_blueprint: 'BPT-11', id_zone_default: 'USI', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'FRM-01', designation: 'Fraiseuse Mécanique 01', id_family: 'USI', id_templates: 'TPL-FRM', id_blueprint: 'BPT-12', id_zone_default: 'USI', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SCM-01', designation: 'Scie Mécanique Alternative 01', id_family: 'USI', id_templates: 'TPL-SCM', id_blueprint: 'BPT-14', id_zone_default: 'USI', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'MEL-01', designation: 'Meuleuse Industrielle 01', id_family: 'USI', id_templates: 'TPL-MEL', id_blueprint: 'BPT-13', id_zone_default: 'USI', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'RVA-01', designation: 'Riveteuse Automatique V1-01', id_family: 'FEMB1', id_templates: 'TPL-RVA', id_blueprint: 'BPT-17', id_zone_default: 'USI', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'RVA-02', designation: 'Riveteuse Automatique V2-02', id_family: 'FEMB1', id_templates: 'TPL-RVA', id_blueprint: '', id_zone_default: 'USI', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'RVA-03', designation: 'Riveteuse Mécatronique V4-03', id_family: 'FEMB1', id_templates: 'TPL-RVA', id_blueprint: '', id_zone_default: 'USI', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'RVM-01', designation: 'Riveteuse Manuelle 01', id_family: 'FEMB2', id_templates: 'TPL-RVM', id_blueprint: '', id_zone_default: 'USI', technician: 'TECH-01', status: 'En Service' },

  // 5. FEMB1 Finition Emballage 1 (5 machines)
  { id_machine_registered: 'DET-04', designation: 'Détoureuse Décorative 04', id_family: 'DET', id_templates: 'TPL-DET', id_blueprint: '', id_zone_default: 'FEMB1', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'DET-05', designation: 'Détoureuse Décorative 05', id_family: 'DET', id_templates: 'TPL-DET', id_blueprint: '', id_zone_default: 'FEMB1', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'DET-08', designation: 'Détoureuse Décorative 08', id_family: 'DET', id_templates: 'TPL-DET', id_blueprint: '', id_zone_default: 'FEMB1', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'DET-09', designation: 'Détoureuse Décorative 09', id_family: 'DET', id_templates: 'TPL-DET', id_blueprint: '', id_zone_default: 'FEMB1', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'MEL-07', designation: 'Meuleuse Industrielle 07', id_family: 'USI', id_templates: 'TPL-MEL', id_blueprint: '', id_zone_default: 'FEMB1', technician: 'TECH-01', status: 'En Service' },

  // 6. FEMB2 Finition Emballage 2 (7 machines)
  { id_machine_registered: 'PER-02', designation: 'Perceuse Standard 02', id_family: 'USI', id_templates: 'TPL-PER', id_blueprint: '', id_zone_default: 'FEMB2', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'RVM-03', designation: 'Riveteuse Manuelle 03', id_family: 'FEMB2', id_templates: 'TPL-RVM', id_blueprint: '', id_zone_default: 'FEMB2', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'RVM-07', designation: 'Riveteuse Manuelle 07', id_family: 'FEMB2', id_templates: 'TPL-RVM', id_blueprint: '', id_zone_default: 'FEMB2', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'RVM-08', designation: 'Riveteuse Manuelle 08', id_family: 'FEMB2', id_templates: 'TPL-RVM', id_blueprint: '', id_zone_default: 'FEMB2', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'RVM-09', designation: 'Riveteuse Manuelle 09', id_family: 'FEMB2', id_templates: 'TPL-RVM', id_blueprint: '', id_zone_default: 'FEMB2', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'RVM-11', designation: 'Riveteuse Manuelle 11', id_family: 'FEMB2', id_templates: 'TPL-RVM', id_blueprint: '', id_zone_default: 'FEMB2', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'RVM-15', designation: 'Riveteuse Manuelle 15', id_family: 'FEMB2', id_templates: 'TPL-RVM', id_blueprint: '', id_zone_default: 'FEMB2', technician: 'TECH-01', status: 'En Service' },

  // 7. POL Polissage (15 machines) -> POL / TPL-POA / TPL-POM
  { id_machine_registered: 'POA-07', designation: 'Polisseuse Automatique V1-07', id_family: 'POL', id_templates: 'TPL-POA', id_blueprint: 'BPT-15', id_zone_default: 'POL', technician: 'TECH-02', status: 'En Service' },
  { id_machine_registered: 'POA-08', designation: 'Polisseuse Automatique V1-08', id_family: 'POL', id_templates: 'TPL-POA', id_blueprint: '', id_zone_default: 'POL', technician: 'TECH-02', status: 'En Service' },
  { id_machine_registered: 'POA-09', designation: 'Polisseuse Automatique V1-09', id_family: 'POL', id_templates: 'TPL-POA', id_blueprint: '', id_zone_default: 'POL', technician: 'TECH-02', status: 'En Service' },
  { id_machine_registered: 'POA-22', designation: 'Polisseuse Automatique V1-22', id_family: 'POL', id_templates: 'TPL-POA', id_blueprint: '', id_zone_default: 'POL', technician: 'TECH-02', status: 'En Service' },
  { id_machine_registered: 'POA-02', designation: 'Polisseuse Automatique V2-02', id_family: 'POL', id_templates: 'TPL-POA', id_blueprint: '', id_zone_default: 'POL', technician: 'TECH-02', status: 'En Service' },
  { id_machine_registered: 'POA-05', designation: 'Polisseuse Automatique V2-05', id_family: 'POL', id_templates: 'TPL-POA', id_blueprint: '', id_zone_default: 'POL', technician: 'TECH-02', status: 'En Service' },
  { id_machine_registered: 'POA-06', designation: 'Polisseuse Automatique V2-06', id_family: 'POL', id_templates: 'TPL-POA', id_blueprint: '', id_zone_default: 'POL', technician: 'TECH-02', status: 'En Service' },
  { id_machine_registered: 'POA-18', designation: 'Polisseuse Automatique V2-18', id_family: 'POL', id_templates: 'TPL-POA', id_blueprint: '', id_zone_default: 'POL', technician: 'TECH-02', status: 'En Service' },
  { id_machine_registered: 'POA-20', designation: 'Polisseuse Aspiration V3-20', id_family: 'POL', id_templates: 'TPL-POA', id_blueprint: '', id_zone_default: 'POL', technician: 'TECH-02', status: 'En Service' },
  { id_machine_registered: 'POA-21', designation: 'Polisseuse Aspiration V3-21', id_family: 'POL', id_templates: 'TPL-POA', id_blueprint: '', id_zone_default: 'POL', technician: 'TECH-02', status: 'En Service' },
  { id_machine_registered: 'POL-V4-01', designation: 'Polisseuse Double Tête V4-01', id_family: 'POL', id_templates: 'TPL-POA', id_blueprint: '', id_zone_default: 'POL', technician: 'TECH-02', status: 'En Service' },
  { id_machine_registered: 'POA-03', designation: 'Polisseuse Automatique V4-03', id_family: 'POL', id_templates: 'TPL-POA', id_blueprint: '', id_zone_default: 'POL', technician: 'TECH-02', status: 'En Service' },
  { id_machine_registered: 'POA-04', designation: 'Polisseuse Automatique V4-04', id_family: 'POL', id_templates: 'TPL-POA', id_blueprint: '', id_zone_default: 'POL', technician: 'TECH-02', status: 'En Service' },
  { id_machine_registered: 'POM-01', designation: 'Polisseuse Manuelle 01', id_family: 'POL', id_templates: 'TPL-POM', id_blueprint: 'BPT-16', id_zone_default: 'POL', technician: 'TECH-02', status: 'En Service' },
  { id_machine_registered: 'MEL-16', designation: 'Meuleuse de Finition 16', id_family: 'USI', id_templates: 'TPL-MEL', id_blueprint: '', id_zone_default: 'POL', technician: 'TECH-02', status: 'En Service' },

  // 8. REPO Repoussage (13 machines) -> REPO / TPL-TRR
  { id_machine_registered: 'TRR-02', designation: 'Tour à Repoussage 02', id_family: 'REPO', id_templates: 'TPL-TRR', id_blueprint: 'BPT-01', id_zone_default: 'REPO', technician: 'TECH-04', status: 'En Service' },
  { id_machine_registered: 'TRR-04', designation: 'Tour à Repoussage 04', id_family: 'REPO', id_templates: 'TPL-TRR', id_blueprint: 'BPT-02', id_zone_default: 'REPO', technician: 'TECH-04', status: 'En Service' },
  { id_machine_registered: 'TRR-05', designation: 'Tour à Repoussage 05', id_family: 'REPO', id_templates: 'TPL-TRR', id_blueprint: '', id_zone_default: 'REPO', technician: 'TECH-04', status: 'En Service' },
  { id_machine_registered: 'TRR-07', designation: 'Tour à Repoussage 07', id_family: 'REPO', id_templates: 'TPL-TRR', id_blueprint: '', id_zone_default: 'REPO', technician: 'TECH-04', status: 'En Service' },
  { id_machine_registered: 'TRR-08', designation: 'Tour à Repoussage 08', id_family: 'REPO', id_templates: 'TPL-TRR', id_blueprint: '', id_zone_default: 'REPO', technician: 'TECH-04', status: 'En Service' },
  { id_machine_registered: 'TRR-11', designation: 'Tour à Repoussage 11', id_family: 'REPO', id_templates: 'TPL-TRR', id_blueprint: '', id_zone_default: 'REPO', technician: 'TECH-04', status: 'En Service' },
  { id_machine_registered: 'TRR-12', designation: 'Tour à Repoussage 12', id_family: 'REPO', id_templates: 'TPL-TRR', id_blueprint: '', id_zone_default: 'REPO', technician: 'TECH-04', status: 'En Service' },
  { id_machine_registered: 'TRR-15', designation: 'Tour à Repoussage 15', id_family: 'REPO', id_templates: 'TPL-TRR', id_blueprint: '', id_zone_default: 'REPO', technician: 'TECH-04', status: 'En Service' },
  { id_machine_registered: 'TRR-16', designation: 'Tour à Repoussage 16', id_family: 'REPO', id_templates: 'TPL-TRR', id_blueprint: '', id_zone_default: 'REPO', technician: 'TECH-04', status: 'En Service' },
  { id_machine_registered: 'TRR-18', designation: 'Tour à Repoussage 18', id_family: 'REPO', id_templates: 'TPL-TRR', id_blueprint: '', id_zone_default: 'REPO', technician: 'TECH-04', status: 'En Service' },
  { id_machine_registered: 'TRR-21', designation: 'Tour à Repoussage 21', id_family: 'REPO', id_templates: 'TPL-TRR', id_blueprint: '', id_zone_default: 'REPO', technician: 'TECH-04', status: 'En Service' },
  { id_machine_registered: 'TRR-23', designation: 'Tour à Repoussage 23', id_family: 'REPO', id_templates: 'TPL-TRR', id_blueprint: '', id_zone_default: 'REPO', technician: 'TECH-04', status: 'En Service' },
  { id_machine_registered: 'MEL-02', designation: 'Meuleuse Industrielle 02', id_family: 'USI', id_templates: 'TPL-MEL', id_blueprint: '', id_zone_default: 'REPO', technician: 'TECH-04', status: 'En Service' },

  // 9. SAT Satinage (9 machines) -> SAT / TPL-SAT
  { id_machine_registered: 'SAT-03', designation: 'Machine de Satinage 03', id_family: 'SAT', id_templates: 'TPL-SAT', id_blueprint: 'BPT-06', id_zone_default: 'SAT', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-08', designation: 'Machine de Satinage 08', id_family: 'SAT', id_templates: 'TPL-SAT', id_blueprint: 'BPT-07', id_zone_default: 'SAT', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-09', designation: 'Machine de Satinage 09', id_family: 'SAT', id_templates: 'TPL-SAT', id_blueprint: '', id_zone_default: 'SAT', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-15', designation: 'Machine de Satinage 15', id_family: 'SAT', id_templates: 'TPL-SAT', id_blueprint: '', id_zone_default: 'SAT', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-20', designation: 'Machine de Satinage 20', id_family: 'SAT', id_templates: 'TPL-SAT', id_blueprint: '', id_zone_default: 'SAT', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-28', designation: 'Machine de Satinage 28', id_family: 'SAT', id_templates: 'TPL-SAT', id_blueprint: '', id_zone_default: 'SAT', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-29', designation: 'Machine de Satinage 29', id_family: 'SAT', id_templates: 'TPL-SAT', id_blueprint: '', id_zone_default: 'SAT', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-33', designation: 'Machine de Satinage 33', id_family: 'SAT', id_templates: 'TPL-SAT', id_blueprint: '', id_zone_default: 'SAT', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-34', designation: 'Machine de Satinage 34', id_family: 'SAT', id_templates: 'TPL-SAT', id_blueprint: '', id_zone_default: 'SAT', technician: 'TECH-01', status: 'En Service' },

  // 10. SOUD Soudeur (1 machine) -> USI / TPL-PER / SOUD
  { id_machine_registered: 'PER-05', designation: 'Perceuse Standard 05', id_family: 'USI', id_templates: 'TPL-PER', id_blueprint: '', id_zone_default: 'SOUD', technician: 'TECH-01', status: 'En Service' },
];

export const INITIAL_ZONES = [
  {
    code_zone: 'BAK',
    id_zone: 'BAK',
    code: 'BAK',
    libelle: 'Bakélite',
    type: 'INJECTION',
    description: "Principe d'injection plastique et bakélite — Moulage sous haute pression des pièces et accessoires pour poignées et isolants.",
  },
  {
    code_zone: 'COMP',
    id_zone: 'COMP',
    code: 'COMP',
    libelle: 'Compresseur',
    type: 'UTILITE',
    description: "Centrale pneumatique et compression d'air — Alimentation en énergie pneumatique continue du parc machines.",
  },
  {
    code_zone: 'DET',
    id_zone: 'DET',
    code: 'DET',
    libelle: 'Détourage',
    type: 'DECOUPE',
    description: "Principe de cisaillement mécanique et détourage — Élimination des bavures et excédents après formage.",
  },
  {
    code_zone: 'DIV',
    id_zone: 'DIV',
    code: 'DIV',
    libelle: 'Diver',
    type: 'RESERVE',
    description: "Secteur de réserve et opérations diverses — Zone flexible pour interventions ponctuelles.",
  },
  {
    code_zone: 'AMBO',
    id_zone: 'AMBO',
    code: 'AMBO',
    libelle: 'Emboutissage',
    type: 'FORMAGE',
    description: "Principe de déformation tridimensionnelle profonde — Transformation sous presse de flans plats en corps creux.",
  },
  {
    code_zone: 'USI',
    id_zone: 'USI',
    code: 'USI',
    libelle: 'Fabrication Mécanique',
    type: 'SUPPORT',
    description: "Usinage par enlèvement de matière (Tournage, Fraisage, Rectification) pour la fabrication et maintenance des outillages.",
  },
  {
    code_zone: 'FEMB1',
    id_zone: 'FEMB1',
    code: 'FEMB1',
    libelle: 'Finition Emballage 1',
    type: 'ASSEMBLAGE_FINAL',
    description: "Ligne 1 de finition, rivetage, montage accessoires et conditionnement final des articles.",
  },
  {
    code_zone: 'FEMB2',
    id_zone: 'FEMB2',
    code: 'FEMB2',
    libelle: 'Finition Emballage 2',
    type: 'ASSEMBLAGE_FINAL',
    description: "Ligne 2 de finition, rivetage et conditionnement dédiée aux faitouts et casseroles.",
  },
  {
    code_zone: 'FEMB3',
    id_zone: 'FEMB3',
    code: 'FEMB3',
    libelle: 'Finition Emballage 3',
    type: 'ASSEMBLAGE_FINAL',
    description: "Ligne 3 de finition et conditionnement pour bouilloires et articles spéciaux.",
  },
  {
    code_zone: 'FEMB4',
    id_zone: 'FEMB4',
    code: 'FEMB4',
    libelle: 'Finition Emballage 4',
    type: 'ASSEMBLAGE_FINAL',
    description: "Ligne 4 de finition et conditionnement de réserve pour haute cadence.",
  },
  {
    code_zone: 'POL',
    id_zone: 'POL',
    code: 'POL',
    libelle: 'Polissage',
    type: 'FINITION',
    description: "Abrasion fine et polissage miroir spéculaire pour l'inox et l'aluminium.",
  },
  {
    code_zone: 'REPO',
    id_zone: 'REPO',
    code: 'REPO',
    libelle: 'Repoussage',
    type: 'FORMAGE',
    description: "Formage rotatif par repoussage sur tours manuels et automatiques pour corps axisymétriques.",
  },
  {
    code_zone: 'SAT',
    id_zone: 'SAT',
    code: 'SAT',
    libelle: 'Satinage',
    type: 'FINITION',
    description: "Rayage contrôlé et satinage directionnel pour une finition soyeuse non spéculaire.",
  },
  {
    code_zone: 'SOUD',
    id_zone: 'SOUD',
    code: 'SOUD',
    libelle: 'Soudeur',
    type: 'SOUDAGE',
    description: "Poste de soudure et perçage d'assemblage des éléments métalliques et réparations.",
  },
];

export const INITIAL_TECHNICIANS = [
  {
    id_technician: 'TECH-01',
    nom: 'Rachid',
    id_zone: 'DET',
    specialite: 'Détourage & Maintenance Mécanique',
  },
  {
    id_technician: 'TECH-02',
    nom: 'Youssef',
    id_zone: 'POL',
    specialite: 'Polissage & Finition',
  },
  {
    id_technician: 'TECH-03',
    nom: 'Mhamed',
    id_zone: 'BAK',
    specialite: 'Presse Injection & Outillage',
  },
  {
    id_technician: 'TECH-04',
    nom: 'Ismael',
    id_zone: 'AMBO',
    specialite: 'Emboutissage & Presses',
  },
];

export const INITIAL_OPERATIONS = [
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

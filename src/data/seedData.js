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
  { id_family: 'FAM-TR', libelle: 'Tours (Moutons & Parallèles)', code: 'TR' },
  { id_family: 'FAM-PRI', libelle: 'Presses à Injection (Bakélite)', code: 'PRI' },
  { id_family: 'FAM-SAT', libelle: 'Machines de Satinage', code: 'SAT' },
  { id_family: 'FAM-RCP', libelle: 'Rectifieuses de Précision', code: 'RCP' },
  { id_family: 'FAM-PER', libelle: 'Perceuses Industrielles & Radiales', code: 'PER' },
  { id_family: 'FAM-MRT', libelle: 'Mortiseuses Industrielles', code: 'MRT' },
  { id_family: 'FAM-FRM', libelle: 'Fraiseuses Mécaniques', code: 'FRM' },
  { id_family: 'FAM-MEL', libelle: 'Meuleuses & Tourets Industriels', code: 'MEL' },
  { id_family: 'FAM-SCI', libelle: 'Sciage & Tronçonnage Mécanique', code: 'SCI' },
  { id_family: 'FAM-PO', libelle: 'Polissage (Automatique & Manuel)', code: 'PO' },
  { id_family: 'FAM-RV', libelle: 'Riveteuses (Auto & Manuelle)', code: 'RV' },
  { id_family: 'FAM-DT', libelle: 'Détourage & Ébavurage', code: 'DT' },
];

export const INITIAL_TEMPLATES = [
  { id_templates: 'TPL-TRR', libelle: 'Tour à Repoussage', id_family: 'FAM-TR', sku: 'TRR' },
  { id_templates: 'TPL-TRP', libelle: 'Tour Parallèle Standard', id_family: 'FAM-TR', sku: 'TRP' },
  { id_templates: 'TPL-PRI', libelle: 'Presse Injection Bakélite', id_family: 'FAM-PRI', sku: 'PRI' },
  { id_templates: 'TPL-SAT', libelle: 'Machine de Satinage Standard', id_family: 'FAM-SAT', sku: 'SAT' },
  { id_templates: 'TPL-RCP', libelle: 'Rectifieuse de Précision', id_family: 'FAM-RCP', sku: 'RCP' },
  { id_templates: 'TPL-PER', libelle: 'Perceuse Industrielle de Fab.', id_family: 'FAM-PER', sku: 'PER' },
  { id_templates: 'TPL-PRR', libelle: 'Perceuse Radiale', id_family: 'FAM-PER', sku: 'PRR' },
  { id_templates: 'TPL-MRT', libelle: 'Mortiseuse Industrielle', id_family: 'FAM-MRT', sku: 'MRT' },
  { id_templates: 'TPL-FRM', libelle: 'Fraiseuse Mécanique Standard', id_family: 'FAM-FRM', sku: 'FRM' },
  { id_templates: 'TPL-MEL', libelle: 'Meuleuse Industrielle', id_family: 'FAM-MEL', sku: 'MEL' },
  { id_templates: 'TPL-SCM', libelle: 'Scie Alternative Mécanique', id_family: 'FAM-SCI', sku: 'SCM' },
  { id_templates: 'TPL-POA', libelle: 'Polissage Automatique', id_family: 'FAM-PO', sku: 'POA' },
  { id_templates: 'TPL-POM', libelle: 'Polissage Manuel', id_family: 'FAM-PO', sku: 'POM' },
  { id_templates: 'TPL-RVA', libelle: 'Riveteuse Automatique', id_family: 'FAM-RV', sku: 'RVA' },
  { id_templates: 'TPL-RVM', libelle: 'Riveteuse Mécanique Manuelle', id_family: 'FAM-RV', sku: 'RVM' },
  { id_templates: 'TPL-DET', libelle: 'Détoureuse', id_family: 'FAM-DT', sku: 'DET' },
];

/**
 * Level 3 Blueprints (Schémas Techniques & Plans Détaillés des Modèles de Machines)
 */
export const INITIAL_BLUEPRINTS = [
  {
    id_blueprint: 'BPT-01',
    libelle: 'Schéma Cinématique Poupée Fixe & Broche',
    id_family: 'FAM-TR',
    id_templates: 'TPL-TRR',
    ref_plan: 'DWG-TR-001-A',
    revision: 'Rev-B',
    statut: 'Approuvé',
    type_schema: 'Mécanique',
    description: 'Architecture des roulements coniques et chaîne cinématique de rotation de la broche principale.',
  },
  {
    id_blueprint: 'BPT-02',
    libelle: 'Circuit de Commande Moteur & Variateur 7.5kW',
    id_family: 'FAM-TR',
    id_templates: 'TPL-TRR',
    ref_plan: 'ELEC-TR-002-C',
    revision: 'Rev-A',
    statut: 'Approuvé',
    type_schema: 'Électrique',
    description: 'Schéma unifilaire puissance, armoire électrique et sécurité arrêt d’urgence.',
  },
  {
    id_blueprint: 'BPT-03',
    libelle: 'Ensemble Banc & Chariot Porte-Outils Transversal',
    id_family: 'FAM-TR',
    id_templates: 'TPL-TRP',
    ref_plan: 'DWG-TRP-010-A',
    revision: 'Rev-A',
    statut: 'Approuvé',
    type_schema: 'Mécanique',
    description: 'Guidage prismatique trempé et vis à billes axe X/Z.',
  },
  {
    id_blueprint: 'BPT-04',
    libelle: 'Groupe Hydraulique & Circuit de Fermeture Moule',
    id_family: 'FAM-PRI',
    id_templates: 'TPL-PRI',
    ref_plan: 'HYD-PRI-104-D',
    revision: 'Rev-C',
    statut: 'Approuvé',
    type_schema: 'Hydraulique',
    description: 'Schéma de distribution haute pression 250 bars avec accumulateurs et clapets anti-retour.',
  },
  {
    id_blueprint: 'BPT-05',
    libelle: 'Régulation Thermique & Colliers Chauffants Bakélite',
    id_family: 'FAM-PRI',
    id_templates: 'TPL-PRI',
    ref_plan: 'ELEC-PRI-105-B',
    revision: 'Rev-A',
    statut: 'Approuvé',
    type_schema: 'Électrique',
    description: 'Boucle PID 4 zones de chauffe fourreau et thermocouples type J.',
  },
  {
    id_blueprint: 'BPT-06',
    libelle: 'Système d’Aspiration de Poussière & Filtration Atex',
    id_family: 'FAM-SAT',
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
    id_family: 'FAM-SAT',
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
    id_family: 'FAM-RCP',
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
    id_family: 'FAM-PER',
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
    id_family: 'FAM-PER',
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
    id_family: 'FAM-MRT',
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
    id_family: 'FAM-FRM',
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
    id_family: 'FAM-MEL',
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
    id_family: 'FAM-SCI',
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
    id_family: 'FAM-PO',
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
    id_family: 'FAM-PO',
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
    id_family: 'FAM-RV',
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
    id_family: 'FAM-RV',
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
    id_family: 'FAM-DT',
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
  // 1. SEC-01 Bakélite (6 machines) -> FAM-PRI / TPL-PRI
  { id_machine_registered: 'PRI-04', designation: 'Presse à Injection Bakélite 04', id_family: 'FAM-PRI', id_templates: 'TPL-PRI', id_zone_default: 'SEC-01', technician: 'TECH-03', status: 'En Service' },
  { id_machine_registered: 'PRI-05', designation: 'Presse à Injection Bakélite 05', id_family: 'FAM-PRI', id_templates: 'TPL-PRI', id_zone_default: 'SEC-01', technician: 'TECH-03', status: 'En Service' },
  { id_machine_registered: 'PRI-06', designation: 'Presse à Injection Bakélite 06', id_family: 'FAM-PRI', id_templates: 'TPL-PRI', id_zone_default: 'SEC-01', technician: 'TECH-03', status: 'En Service' },
  { id_machine_registered: 'PRI-7', designation: 'Presse à Injection Bakélite 07', id_family: 'FAM-PRI', id_templates: 'TPL-PRI', id_zone_default: 'SEC-01', technician: 'TECH-03', status: 'En Service' },
  { id_machine_registered: 'PRI-08', designation: 'Presse à Injection Bakélite 08', id_family: 'FAM-PRI', id_templates: 'TPL-PRI', id_zone_default: 'SEC-01', technician: 'TECH-03', status: 'En Service' },
  { id_machine_registered: 'PRI-09', designation: 'Presse à Injection Bakélite 09', id_family: 'FAM-PRI', id_templates: 'TPL-PRI', id_zone_default: 'SEC-01', technician: 'TECH-03', status: 'En Service' },

  // 3. SEC-03 Detourage (12 machines) -> FAM-DT & FAM-SAT
  { id_machine_registered: 'DET-01', designation: 'Détoureuse Industrielle 01', id_family: 'FAM-DT', id_templates: 'TPL-DET', id_zone_default: 'SEC-03', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'DET-03', designation: 'Détoureuse Industrielle 03', id_family: 'FAM-DT', id_templates: 'TPL-DET', id_zone_default: 'SEC-03', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'DET-06', designation: 'Détoureuse Industrielle 06', id_family: 'FAM-DT', id_templates: 'TPL-DET', id_zone_default: 'SEC-03', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'DET-11', designation: 'Détoureuse Verticale 11', id_family: 'FAM-DT', id_templates: 'TPL-DET', id_zone_default: 'SEC-03', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-13', designation: 'Machine Satinage Aspiration 13', id_family: 'FAM-SAT', id_templates: 'TPL-SAT', id_zone_default: 'SEC-03', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-17', designation: 'Machine Satinage Aspiration 17', id_family: 'FAM-SAT', id_templates: 'TPL-SAT', id_zone_default: 'SEC-03', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-21', designation: 'Machine Satinage Aspiration 21', id_family: 'FAM-SAT', id_templates: 'TPL-SAT', id_zone_default: 'SEC-03', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-25', designation: 'Machine Satinage Aspiration 25', id_family: 'FAM-SAT', id_templates: 'TPL-SAT', id_zone_default: 'SEC-03', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-26', designation: 'Machine Satinage Aspiration 26', id_family: 'FAM-SAT', id_templates: 'TPL-SAT', id_zone_default: 'SEC-03', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-27', designation: 'Machine Satinage Aspiration 27', id_family: 'FAM-SAT', id_templates: 'TPL-SAT', id_zone_default: 'SEC-03', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-36', designation: 'Machine Satinage Aspiration 36', id_family: 'FAM-SAT', id_templates: 'TPL-SAT', id_zone_default: 'SEC-03', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-41', designation: 'Machine Satinage Aspiration 41', id_family: 'FAM-SAT', id_templates: 'TPL-SAT', id_zone_default: 'SEC-03', technician: 'TECH-01', status: 'En Service' },

  // 6. SEC-06 Fabrication Mécanique (19 machines)
  { id_machine_registered: 'TRP-01', designation: 'Tour Parallèle 01', id_family: 'FAM-TR', id_templates: 'TPL-TRP', id_zone_default: 'SEC-06', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'TRP-04', designation: 'Tour Parallèle 04', id_family: 'FAM-TR', id_templates: 'TPL-TRP', id_zone_default: 'SEC-06', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'TRP-08', designation: 'Tour Parallèle 08', id_family: 'FAM-TR', id_templates: 'TPL-TRP', id_zone_default: 'SEC-06', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'TRP-10', designation: 'Tour Parallèle 10', id_family: 'FAM-TR', id_templates: 'TPL-TRP', id_zone_default: 'SEC-06', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'TRP-11', designation: 'Tour Parallèle 11', id_family: 'FAM-TR', id_templates: 'TPL-TRP', id_zone_default: 'SEC-06', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'TRP-12', designation: 'Tour Parallèle 12', id_family: 'FAM-TR', id_templates: 'TPL-TRP', id_zone_default: 'SEC-06', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'RCP-02', designation: 'Rectifieuse de Précision 02', id_family: 'FAM-RCP', id_templates: 'TPL-RCP', id_zone_default: 'SEC-06', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'RCP-03', designation: 'Rectifieuse Manuelle 03', id_family: 'FAM-RCP', id_templates: 'TPL-RCP', id_zone_default: 'SEC-06', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'RCP-04', designation: 'Rectifieuse de Précision 04', id_family: 'FAM-RCP', id_templates: 'TPL-RCP', id_zone_default: 'SEC-06', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'PER-06', designation: 'Perceuse Industrielle Avancée 06', id_family: 'FAM-PER', id_templates: 'TPL-PER', id_zone_default: 'SEC-06', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'PRR-01', designation: 'Perceuse Radiale 01', id_family: 'FAM-PER', id_templates: 'TPL-PRR', id_zone_default: 'SEC-06', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'MRT-01', designation: 'Mortiseuse Industrielle 01', id_family: 'FAM-MRT', id_templates: 'TPL-MRT', id_zone_default: 'SEC-06', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'FRM-01', designation: 'Fraiseuse Mécanique 01', id_family: 'FAM-FRM', id_templates: 'TPL-FRM', id_zone_default: 'SEC-06', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SCM-01', designation: 'Scie Mécanique Alternative 01', id_family: 'FAM-SCI', id_templates: 'TPL-SCM', id_zone_default: 'SEC-06', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'MEL-01', designation: 'Meuleuse Industrielle 01', id_family: 'FAM-MEL', id_templates: 'TPL-MEL', id_zone_default: 'SEC-06', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'RVA-01', designation: 'Riveteuse Automatique V1-01', id_family: 'FAM-RV', id_templates: 'TPL-RVA', id_zone_default: 'SEC-06', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'RVA-02', designation: 'Riveteuse Automatique V2-02', id_family: 'FAM-RV', id_templates: 'TPL-RVA', id_zone_default: 'SEC-06', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'RVA-03', designation: 'Riveteuse Mécatronique V4-03', id_family: 'FAM-RV', id_templates: 'TPL-RVA', id_zone_default: 'SEC-06', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'RVM-01', designation: 'Riveteuse Manuelle 01', id_family: 'FAM-RV', id_templates: 'TPL-RVM', id_zone_default: 'SEC-06', technician: 'TECH-01', status: 'En Service' },

  // 7. SEC-07 Finition Emballage 1 (5 machines)
  { id_machine_registered: 'DET-04', designation: 'Détoureuse Décorative 04', id_family: 'FAM-DT', id_templates: 'TPL-DET', id_zone_default: 'SEC-07', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'DET-05', designation: 'Détoureuse Décorative 05', id_family: 'FAM-DT', id_templates: 'TPL-DET', id_zone_default: 'SEC-07', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'DET-08', designation: 'Détoureuse Décorative 08', id_family: 'FAM-DT', id_templates: 'TPL-DET', id_zone_default: 'SEC-07', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'DET-09', designation: 'Détoureuse Décorative 09', id_family: 'FAM-DT', id_templates: 'TPL-DET', id_zone_default: 'SEC-07', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'MEL-07', designation: 'Meuleuse Industrielle 07', id_family: 'FAM-MEL', id_templates: 'TPL-MEL', id_zone_default: 'SEC-07', technician: 'TECH-01', status: 'En Service' },

  // 8. SEC-08 Finition Emballage 2 (7 machines)
  { id_machine_registered: 'PER-02', designation: 'Perceuse Standard 02', id_family: 'FAM-PER', id_templates: 'TPL-PER', id_zone_default: 'SEC-08', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'RVM-03', designation: 'Riveteuse Manuelle 03', id_family: 'FAM-RV', id_templates: 'TPL-RVM', id_zone_default: 'SEC-08', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'RVM-07', designation: 'Riveteuse Manuelle 07', id_family: 'FAM-RV', id_templates: 'TPL-RVM', id_zone_default: 'SEC-08', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'RVM-08', designation: 'Riveteuse Manuelle 08', id_family: 'FAM-RV', id_templates: 'TPL-RVM', id_zone_default: 'SEC-08', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'RVM-09', designation: 'Riveteuse Manuelle 09', id_family: 'FAM-RV', id_templates: 'TPL-RVM', id_zone_default: 'SEC-08', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'RVM-11', designation: 'Riveteuse Manuelle 11', id_family: 'FAM-RV', id_templates: 'TPL-RVM', id_zone_default: 'SEC-08', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'RVM-15', designation: 'Riveteuse Manuelle 15', id_family: 'FAM-RV', id_templates: 'TPL-RVM', id_zone_default: 'SEC-08', technician: 'TECH-01', status: 'En Service' },

  // 11. SEC-11 Polissage (15 machines) -> FAM-PO / TPL-POA / TPL-POM
  { id_machine_registered: 'POA-07', designation: 'Polisseuse Automatique V1-07', id_family: 'FAM-PO', id_templates: 'TPL-POA', id_zone_default: 'SEC-11', technician: 'TECH-02', status: 'En Service' },
  { id_machine_registered: 'POA-08', designation: 'Polisseuse Automatique V1-08', id_family: 'FAM-PO', id_templates: 'TPL-POA', id_zone_default: 'SEC-11', technician: 'TECH-02', status: 'En Service' },
  { id_machine_registered: 'POA-09', designation: 'Polisseuse Automatique V1-09', id_family: 'FAM-PO', id_templates: 'TPL-POA', id_zone_default: 'SEC-11', technician: 'TECH-02', status: 'En Service' },
  { id_machine_registered: 'POA-22', designation: 'Polisseuse Automatique V1-22', id_family: 'FAM-PO', id_templates: 'TPL-POA', id_zone_default: 'SEC-11', technician: 'TECH-02', status: 'En Service' },
  { id_machine_registered: 'POA-02', designation: 'Polisseuse Automatique V2-02', id_family: 'FAM-PO', id_templates: 'TPL-POA', id_zone_default: 'SEC-11', technician: 'TECH-02', status: 'En Service' },
  { id_machine_registered: 'POA-05', designation: 'Polisseuse Automatique V2-05', id_family: 'FAM-PO', id_templates: 'TPL-POA', id_zone_default: 'SEC-11', technician: 'TECH-02', status: 'En Service' },
  { id_machine_registered: 'POA-06', designation: 'Polisseuse Automatique V2-06', id_family: 'FAM-PO', id_templates: 'TPL-POA', id_zone_default: 'SEC-11', technician: 'TECH-02', status: 'En Service' },
  { id_machine_registered: 'POA-18', designation: 'Polisseuse Automatique V2-18', id_family: 'FAM-PO', id_templates: 'TPL-POA', id_zone_default: 'SEC-11', technician: 'TECH-02', status: 'En Service' },
  { id_machine_registered: 'POA-20', designation: 'Polisseuse Aspiration V3-20', id_family: 'FAM-PO', id_templates: 'TPL-POA', id_zone_default: 'SEC-11', technician: 'TECH-02', status: 'En Service' },
  { id_machine_registered: 'POA-21', designation: 'Polisseuse Aspiration V3-21', id_family: 'FAM-PO', id_templates: 'TPL-POA', id_zone_default: 'SEC-11', technician: 'TECH-02', status: 'En Service' },
  { id_machine_registered: 'POL-V4-01', designation: 'Polisseuse Double Tête V4-01', id_family: 'FAM-PO', id_templates: 'TPL-POA', id_zone_default: 'SEC-11', technician: 'TECH-02', status: 'En Service' },
  { id_machine_registered: 'POA-03', designation: 'Polisseuse Automatique V4-03', id_family: 'FAM-PO', id_templates: 'TPL-POA', id_zone_default: 'SEC-11', technician: 'TECH-02', status: 'En Service' },
  { id_machine_registered: 'POA-04', designation: 'Polisseuse Automatique V4-04', id_family: 'FAM-PO', id_templates: 'TPL-POA', id_zone_default: 'SEC-11', technician: 'TECH-02', status: 'En Service' },
  { id_machine_registered: 'POM-01', designation: 'Polisseuse Manuelle 01', id_family: 'FAM-PO', id_templates: 'TPL-POM', id_zone_default: 'SEC-11', technician: 'TECH-02', status: 'En Service' },
  { id_machine_registered: 'MEL-16', designation: 'Meuleuse de Finition 16', id_family: 'FAM-MEL', id_templates: 'TPL-MEL', id_zone_default: 'SEC-11', technician: 'TECH-02', status: 'En Service' },

  // 12. SEC-12 Repoussage (13 machines) -> FAM-TR / TPL-TRR
  { id_machine_registered: 'TRR-02', designation: 'Tour à Repoussage 02', id_family: 'FAM-TR', id_templates: 'TPL-TRR', id_zone_default: 'SEC-12', technician: 'TECH-04', status: 'En Service' },
  { id_machine_registered: 'TRR-04', designation: 'Tour à Repoussage 04', id_family: 'FAM-TR', id_templates: 'TPL-TRR', id_zone_default: 'SEC-12', technician: 'TECH-04', status: 'En Service' },
  { id_machine_registered: 'TRR-05', designation: 'Tour à Repoussage 05', id_family: 'FAM-TR', id_templates: 'TPL-TRR', id_zone_default: 'SEC-12', technician: 'TECH-04', status: 'En Service' },
  { id_machine_registered: 'TRR-07', designation: 'Tour à Repoussage 07', id_family: 'FAM-TR', id_templates: 'TPL-TRR', id_zone_default: 'SEC-12', technician: 'TECH-04', status: 'En Service' },
  { id_machine_registered: 'TRR-08', designation: 'Tour à Repoussage 08', id_family: 'FAM-TR', id_templates: 'TPL-TRR', id_zone_default: 'SEC-12', technician: 'TECH-04', status: 'En Service' },
  { id_machine_registered: 'TRR-11', designation: 'Tour à Repoussage 11', id_family: 'FAM-TR', id_templates: 'TPL-TRR', id_zone_default: 'SEC-12', technician: 'TECH-04', status: 'En Service' },
  { id_machine_registered: 'TRR-12', designation: 'Tour à Repoussage 12', id_family: 'FAM-TR', id_templates: 'TPL-TRR', id_zone_default: 'SEC-12', technician: 'TECH-04', status: 'En Service' },
  { id_machine_registered: 'TRR-15', designation: 'Tour à Repoussage 15', id_family: 'FAM-TR', id_templates: 'TPL-TRR', id_zone_default: 'SEC-12', technician: 'TECH-04', status: 'En Service' },
  { id_machine_registered: 'TRR-16', designation: 'Tour à Repoussage 16', id_family: 'FAM-TR', id_templates: 'TPL-TRR', id_zone_default: 'SEC-12', technician: 'TECH-04', status: 'En Service' },
  { id_machine_registered: 'TRR-18', designation: 'Tour à Repoussage 18', id_family: 'FAM-TR', id_templates: 'TPL-TRR', id_zone_default: 'SEC-12', technician: 'TECH-04', status: 'En Service' },
  { id_machine_registered: 'TRR-21', designation: 'Tour à Repoussage 21', id_family: 'FAM-TR', id_templates: 'TPL-TRR', id_zone_default: 'SEC-12', technician: 'TECH-04', status: 'En Service' },
  { id_machine_registered: 'TRR-23', designation: 'Tour à Repoussage 23', id_family: 'FAM-TR', id_templates: 'TPL-TRR', id_zone_default: 'SEC-12', technician: 'TECH-04', status: 'En Service' },
  { id_machine_registered: 'MEL-02', designation: 'Meuleuse Industrielle 02', id_family: 'FAM-MEL', id_templates: 'TPL-MEL', id_zone_default: 'SEC-12', technician: 'TECH-04', status: 'En Service' },

  // 13. SEC-13 Satinage (9 machines) -> FAM-SAT / TPL-SAT
  { id_machine_registered: 'SAT-03', designation: 'Machine de Satinage 03', id_family: 'FAM-SAT', id_templates: 'TPL-SAT', id_zone_default: 'SEC-13', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-08', designation: 'Machine de Satinage 08', id_family: 'FAM-SAT', id_templates: 'TPL-SAT', id_zone_default: 'SEC-13', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-09', designation: 'Machine de Satinage 09', id_family: 'FAM-SAT', id_templates: 'TPL-SAT', id_zone_default: 'SEC-13', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-15', designation: 'Machine de Satinage 15', id_family: 'FAM-SAT', id_templates: 'TPL-SAT', id_zone_default: 'SEC-13', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-20', designation: 'Machine de Satinage 20', id_family: 'FAM-SAT', id_templates: 'TPL-SAT', id_zone_default: 'SEC-13', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-28', designation: 'Machine de Satinage 28', id_family: 'FAM-SAT', id_templates: 'TPL-SAT', id_zone_default: 'SEC-13', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-29', designation: 'Machine de Satinage 29', id_family: 'FAM-SAT', id_templates: 'TPL-SAT', id_zone_default: 'SEC-13', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-33', designation: 'Machine de Satinage 33', id_family: 'FAM-SAT', id_templates: 'TPL-SAT', id_zone_default: 'SEC-13', technician: 'TECH-01', status: 'En Service' },
  { id_machine_registered: 'SAT-34', designation: 'Machine de Satinage 34', id_family: 'FAM-SAT', id_templates: 'TPL-SAT', id_zone_default: 'SEC-13', technician: 'TECH-01', status: 'En Service' },

  // 14. SEC-14 Soudeur (1 machine) -> FAM-PER / TPL-PER
  { id_machine_registered: 'PER-05', designation: 'Perceuse Standard 05', id_family: 'FAM-PER', id_templates: 'TPL-PER', id_zone_default: 'SEC-14', technician: 'TECH-01', status: 'En Service' },
];

export const INITIAL_ZONES = [
  {
    code_zone: 'SEC-01',
    id_zone: 'BAK',
    libelle: 'Bakélite',
    type: 'INJECTION',
    description: "Principe d'injection plastique et bakélite — Moulage sous haute pression des pièces et accessoires pour poignées et isolants.",
  },
  {
    code_zone: 'SEC-02',
    id_zone: 'COMP',
    libelle: 'Compresseur',
    type: 'UTILITE',
    description: "Centrale pneumatique et compression d'air — Alimentation en énergie pneumatique continue du parc machines.",
  },
  {
    code_zone: 'SEC-03',
    id_zone: 'DET',
    libelle: 'Détourage',
    type: 'DECOUPE',
    description: "Principe de cisaillement mécanique et détourage — Élimination des bavures et excédents après formage.",
  },
  {
    code_zone: 'SEC-04',
    id_zone: 'DIV',
    libelle: 'Diver',
    type: 'RESERVE',
    description: "Secteur de réserve et opérations diverses — Zone flexible pour interventions ponctuelles.",
  },
  {
    code_zone: 'SEC-05',
    id_zone: 'AMBO',
    libelle: 'Emboutissage',
    type: 'FORMAGE',
    description: "Principe de déformation tridimensionnelle profonde — Transformation sous presse de flans plats en corps creux.",
  },
  {
    code_zone: 'SEC-06',
    id_zone: 'USI',
    libelle: 'Fabrication Mécanique',
    type: 'SUPPORT',
    description: "Usinage par enlèvement de matière (Tournage, Fraisage, Rectification) pour la fabrication et maintenance des outillages.",
  },
  {
    code_zone: 'SEC-07',
    id_zone: 'FEMB1',
    libelle: 'Finition Emballage 1',
    type: 'ASSEMBLAGE_FINAL',
    description: "Ligne 1 de finition, rivetage, montage accessoires et conditionnement final des articles.",
  },
  {
    code_zone: 'SEC-08',
    id_zone: 'FEMB2',
    libelle: 'Finition Emballage 2',
    type: 'ASSEMBLAGE_FINAL',
    description: "Ligne 2 de finition, rivetage et conditionnement dédiée aux faitouts et casseroles.",
  },
  {
    code_zone: 'SEC-09',
    id_zone: 'FEMB3',
    libelle: 'Finition Emballage 3',
    type: 'ASSEMBLAGE_FINAL',
    description: "Ligne 3 de finition et conditionnement pour bouilloires et articles spéciaux.",
  },
  {
    code_zone: 'SEC-10',
    id_zone: 'FEMB4',
    libelle: 'Finition Emballage 4',
    type: 'ASSEMBLAGE_FINAL',
    description: "Ligne 4 de finition et conditionnement de réserve pour haute cadence.",
  },
  {
    code_zone: 'SEC-11',
    id_zone: 'POL',
    libelle: 'Polissage',
    type: 'FINITION',
    description: "Abrasion fine et polissage miroir spéculaire pour l'inox et l'aluminium.",
  },
  {
    code_zone: 'SEC-12',
    id_zone: 'REPO',
    libelle: 'Repoussage',
    type: 'FORMAGE',
    description: "Formage rotatif par repoussage sur tours manuels et automatiques pour corps axisymétriques.",
  },
  {
    code_zone: 'SEC-13',
    id_zone: 'SAT',
    libelle: 'Satinage',
    type: 'FINITION',
    description: "Rayage contrôlé et satinage directionnel pour une finition soyeuse non spéculaire.",
  },
  {
    code_zone: 'SEC-14',
    id_zone: 'SOUD',
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
    id_zone: 'INJ',
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

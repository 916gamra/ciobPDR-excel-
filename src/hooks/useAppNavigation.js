import { useState, startTransition } from 'react';

/**
 * Hook to manage application tab filters and smart navigation links
 */
export function useAppNavigation({ setCurrentTab }) {
  // Filter States
  const [stockSearch, setStockSearch] = useState('');
  const [stockTypeFilter, setStockTypeFilter] = useState('ALL');
  const [stockAlertOnly, setStockAlertOnly] = useState(false);

  const [mchSearch, setMchSearch] = useState('');
  const [mchFamilyFilter, setMchFamilyFilter] = useState('ALL');
  const [mchTemplateFilter, setMchTemplateFilter] = useState('ALL');
  const [mchZoneFilter, setMchZoneFilter] = useState('ALL');

  const [diagTypeFilter, setDiagTypeFilter] = useState('ALL');
  const [opZoneFilter, setOpZoneFilter] = useState('ALL');
  const [techZoneFilter, setTechZoneFilter] = useState('ALL');
  const [templateFamilyFilter, setTemplateFamilyFilter] = useState('ALL');
  const [blueprintFamilyFilter, setBlueprintFamilyFilter] = useState('ALL');
  const [blueprintTemplateFilter, setBlueprintTemplateFilter] = useState('ALL');

  // Groupe Entrepôt Filter States
  const [whFamilyFilter, setWhFamilyFilter] = useState('ALL');
  const [whTemplateFilter, setWhTemplateFilter] = useState('ALL');
  const [whTypeFilter, setWhTypeFilter] = useState('ALL');
  const [whNatureFilter, setWhNatureFilter] = useState('ALL');
  const [whSearch, setWhSearch] = useState('');
  const [compTemplateFamilyFilter, setCompTemplateFamilyFilter] = useState('');
  const [partDesignationTypeFilter, setPartDesignationTypeFilter] = useState('');

  // SMART NAVIGATION HANDLERS
  const handleNavigateToStockFiltered = (typeId) => {
    setStockTypeFilter(typeId);
    setStockAlertOnly(false);
    startTransition(() => setCurrentTab('stock'));
  };

  const handleNavigateToStockFilteredByRef = (refVal) => {
    setStockSearch(refVal);
    setStockTypeFilter('ALL');
    startTransition(() => setCurrentTab('stock'));
  };

  const handleNavigateToDesignationsFiltered = (typeId) => {
    setDiagTypeFilter(typeId);
    startTransition(() => setCurrentTab('designations'));
  };

  const handleNavigateToDiagFiltered = handleNavigateToDesignationsFiltered;

  const handleNavigateToFamilyFiltered = (familyId) => {
    setWhSearch(familyId || '');
    startTransition(() => setCurrentTab('families'));
  };

  const handleNavigateToTemplatesFiltered = (familyId) => {
    setTemplateFamilyFilter(familyId);
    startTransition(() => setCurrentTab('templates'));
  };

  const handleNavigateToMachinesByFamily = (familyId) => {
    setMchFamilyFilter(familyId);
    setMchTemplateFilter('ALL');
    startTransition(() => setCurrentTab('machines'));
  };

  const handleNavigateToMachinesByTemplate = (familyId, templateId) => {
    setMchFamilyFilter(familyId);
    setMchTemplateFilter(templateId);
    startTransition(() => setCurrentTab('machines'));
  };

  const handleNavigateToTechsByZone = (zoneId) => {
    setTechZoneFilter(zoneId);
    startTransition(() => setCurrentTab('technicians'));
  };

  const handleNavigateToOpsByZone = (zoneId) => {
    setOpZoneFilter(zoneId);
    startTransition(() => setCurrentTab('operations'));
  };

  const handleNavigateToMachinesByZone = (zoneId) => {
    setMchZoneFilter(zoneId);
    startTransition(() => setCurrentTab('machines'));
  };

  // GROUPE ENTREPÔT NAVIGATION HANDLERS
  const handleNavigateToCompTemplates = (familyId) => {
    setCompTemplateFamilyFilter(familyId || '');
    startTransition(() => setCurrentTab('comp_templates'));
  };

  const handleNavigateToCompFamilies = () => {
    startTransition(() => setCurrentTab('comp_families'));
  };

  const handleNavigateToPartDesignations = (typeId) => {
    setPartDesignationTypeFilter(typeId || '');
    startTransition(() => setCurrentTab('part_designations'));
  };

  const handleNavigateToPartTypes = () => {
    startTransition(() => setCurrentTab('part_types'));
  };

  const handleNavigateToEntrepotByComp = (familyId, templateId) => {
    setWhFamilyFilter(familyId || 'ALL');
    setWhTemplateFilter(templateId || 'ALL');
    setWhNatureFilter('COMPONENT');
    startTransition(() => setCurrentTab('entrepot'));
  };

  const handleNavigateToEntrepotByType = (typeId) => {
    setWhTypeFilter(typeId || 'ALL');
    setWhNatureFilter('PART');
    startTransition(() => setCurrentTab('entrepot'));
  };

  const handleNavigateToEntrepotByPart = (refOrPart, typeId) => {
    if (typeId) setWhTypeFilter(typeId);
    setWhSearch(refOrPart || '');
    setWhNatureFilter('PART');
    startTransition(() => setCurrentTab('entrepot'));
  };

  const handleNavigateToBlueprintsFiltered = (familyId, templateId) => {
    if (familyId) setBlueprintFamilyFilter(familyId);
    if (templateId) setBlueprintTemplateFilter(templateId);
    startTransition(() => setCurrentTab('blueprints'));
  };

  return {
    filters: {
      stockSearch,
      setStockSearch,
      stockTypeFilter,
      setStockTypeFilter,
      stockAlertOnly,
      setStockAlertOnly,
      mchSearch,
      setMchSearch,
      mchFamilyFilter,
      setMchFamilyFilter,
      mchTemplateFilter,
      setMchTemplateFilter,
      mchZoneFilter,
      setMchZoneFilter,
      diagTypeFilter,
      setDiagTypeFilter,
      opZoneFilter,
      setOpZoneFilter,
      techZoneFilter,
      setTechZoneFilter,
      templateFamilyFilter,
      setTemplateFamilyFilter,
      blueprintFamilyFilter,
      setBlueprintFamilyFilter,
      blueprintTemplateFilter,
      setBlueprintTemplateFilter,
      whFamilyFilter,
      setWhFamilyFilter,
      whTemplateFilter,
      setWhTemplateFilter,
      whTypeFilter,
      setWhTypeFilter,
      whNatureFilter,
      setWhNatureFilter,
      whSearch,
      setWhSearch,
      compTemplateFamilyFilter,
      setCompTemplateFamilyFilter,
      partDesignationTypeFilter,
      setPartDesignationTypeFilter,
    },
    navigation: {
      handleNavigateToStockFiltered,
      handleNavigateToStockFilteredByRef,
      handleNavigateToDesignationsFiltered,
      handleNavigateToDiagFiltered,
      handleNavigateToFamilyFiltered,
      handleNavigateToTemplatesFiltered,
      handleNavigateToMachinesByFamily,
      handleNavigateToMachinesByTemplate,
      handleNavigateToTechsByZone,
      handleNavigateToOpsByZone,
      handleNavigateToMachinesByZone,
      handleNavigateToCompTemplates,
      handleNavigateToCompFamilies,
      handleNavigateToPartDesignations,
      handleNavigateToPartTypes,
      handleNavigateToEntrepotByComp,
      handleNavigateToEntrepotByType,
      handleNavigateToEntrepotByPart,
      handleNavigateToBlueprintsFiltered,
    },
  };
}

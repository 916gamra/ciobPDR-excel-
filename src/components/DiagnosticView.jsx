import DesignationView from './DesignationView';

export default function DiagnosticView(props) {
  return (
    <DesignationView
      designations={props.designations || props.diagnostics}
      types={props.types}
      stockItems={props.stockItems}
      desigTypeFilter={props.desigTypeFilter || props.diagTypeFilter}
      setDesigTypeFilter={props.setDesigTypeFilter || props.setDiagTypeFilter}
      onAddDesignation={props.onAddDesignation || props.onAddDiagnostic}
      onOpenAddTypeModal={props.onOpenAddTypeModal}
      onNavigateToStockFilteredByRef={
        props.onNavigateToStockFilteredByRef || props.onNavigateToStockFilteredByDiag
      }
    />
  );
}

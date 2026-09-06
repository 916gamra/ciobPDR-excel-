import React from 'react';
import Toast from '../components/common/Toast';
import AddArticleModal from '../components/modals/AddArticleModal';
import AddMachineModal from '../components/modals/AddMachineModal';
import AddUserModal from '../components/modals/AddUserModal';
import AddZoneModal from '../components/modals/AddZoneModal';

export default function AppModals({
  showAddArticleModal, setShowAddArticleModal,
  showAddMachineModal, setShowAddMachineModal,
  showAddUserModal, setShowAddUserModal, addUserModalType, setAddUserModalType,
  showAddZoneModal, setShowAddZoneModal,
  types, effectiveFamilies, effectiveTemplates, zones, technicians, machines, operations,
  handleAddArticle, handleAddMachine, handleUpdateMachine, handleDeleteMachine,
  handleAddTechnician, handleAddOperation, handleAddZone,
  setCurrentTab,
  toast, setToast
}) {
  return (
    <>
      <AddArticleModal
        isOpen={showAddArticleModal}
        onClose={() => setShowAddArticleModal(false)}
        types={types}
        onAddArticle={handleAddArticle}
        onOpenAddTypeModal={() => {
          setShowAddArticleModal(false);
          React.startTransition(() => setCurrentTab('types'));
        }}
      />

      <AddMachineModal
        isOpen={showAddMachineModal}
        onClose={() => setShowAddMachineModal(false)}
        families={effectiveFamilies}
        templates={effectiveTemplates}
        zones={zones}
        technicians={technicians}
        machines={machines}
        onAddMachine={handleAddMachine}
        onUpdateMachine={handleUpdateMachine}
        onDeleteMachine={handleDeleteMachine}
        onOpenAddFamilyModal={() => {
          setShowAddMachineModal(false);
          React.startTransition(() => setCurrentTab('families'));
        }}
        onOpenAddTemplateModal={() => {
          setShowAddMachineModal(false);
          React.startTransition(() => setCurrentTab('templates'));
        }}
        onOpenAddZoneModal={() => {
          setShowAddMachineModal(false);
          setShowAddZoneModal(true);
        }}
        onOpenAddTechModal={() => {
          setShowAddMachineModal(false);
          setAddUserModalType('TECHNICIEN');
          setShowAddUserModal(true);
        }}
      />

      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        zones={zones}
        technicians={technicians}
        operations={operations}
        initialType={addUserModalType}
        onAddTechnician={handleAddTechnician}
        onAddOperation={handleAddOperation}
        onOpenAddZoneModal={() => {
          setShowAddUserModal(false);
          setShowAddZoneModal(true);
        }}
      />

      <AddZoneModal
        isOpen={showAddZoneModal}
        onClose={() => setShowAddZoneModal(false)}
        zones={zones}
        onAddZone={handleAddZone}
      />

      {/* Global Notification Toast */}
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}
    </>
  );
}

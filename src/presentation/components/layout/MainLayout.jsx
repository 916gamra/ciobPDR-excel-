import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { useAuth } from '../../../context/AuthContext';

export default function MainLayout({ 
  children, 
  currentTab, 
  setCurrentTab, 
  counts, 
  mobileMenuOpen, 
  setMobileMenuOpen,
  fileInputRef,
  handleImportFile,
  handleExportExcel,
  linkedFileName,
  onDirectLink,
  onDirectSave
}) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col md:pl-[270px] relative isolate select-none font-sans">
      {/* Background Excel Grid Subtle Lines & Ambient Tones (Identical to Splash Screen) */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#107c41_1px,transparent_1px)] [background-size:20px_20px] -z-10" />
      <div className="fixed -top-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed -bottom-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        counts={counts}
        currentUser={user}
        onLogout={() => {
          try {
            localStorage.setItem('gmao_active_tab', 'dashboard');
          } catch (_e) {
            /* ignore */
          }
          setCurrentTab('dashboard');
          logout();
        }}
      />
      
      {/* Header Bar */}
      <Header
        currentTab={currentTab}
        setMobileMenuOpen={setMobileMenuOpen}
        fileInputRef={fileInputRef}
        handleImportFile={handleImportFile}
        handleExportExcel={handleExportExcel}
        linkedFileName={linkedFileName}
        onDirectLink={onDirectLink}
        onDirectSave={onDirectSave}
      />
      
      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 w-full">
        {children}
      </main>
    </div>
  );
}

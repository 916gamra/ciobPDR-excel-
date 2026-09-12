import Sidebar from './Sidebar';
import Header from './Header';
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
    <div className="min-h-screen bg-[#FAFAF9] text-zinc-900 flex flex-col lg:pl-[104px] relative isolate select-none font-sans antialiased">
      {/* Subtle Background Accent Glows */}
      <div className="fixed -top-32 -right-32 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed -bottom-32 -left-32 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Fixed Floating Left Sidebar (72px wide, locked at left-4 top-4 z-40) */}
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
          } catch {
            /* ignore */
          }
          setCurrentTab('dashboard');
          logout();
        }}
      />

      {/* Sticky Top Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        setMobileMenuOpen={setMobileMenuOpen}
        fileInputRef={fileInputRef}
        handleImportFile={handleImportFile}
        handleExportExcel={handleExportExcel}
        linkedFileName={linkedFileName}
        onDirectLink={onDirectLink}
        onDirectSave={onDirectSave}
        currentUser={user}
      />

      {/* Main Page Area - Fully responsive and fluid across all screen sizes */}
      <main className="flex-1 p-4 lg:p-6 lg:pr-8 w-full min-w-0">
        {children}
      </main>
    </div>
  );
}

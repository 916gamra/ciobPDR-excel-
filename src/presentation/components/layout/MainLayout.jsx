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
    <div className="min-h-screen bg-[#FAFAF9] text-zinc-900 flex flex-col relative isolate select-none font-sans antialiased">
      {/* Subtle Background Accent Glows */}
      <div className="fixed -top-32 -right-32 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed -bottom-32 -left-32 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Sticky Top Header - Full screen width from edge to edge across top */}
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

      {/* Content Layout: Shared height space for Floating Sidebar & Main Pages under Header */}
      <div className="flex-1 flex w-full relative min-w-0">
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

        {/* Main Page Content - Padded left on desktop to leave 104px for Floating Sidebar */}
        <main className="flex-1 p-4 lg:p-6 lg:pr-8 lg:pl-[104px] w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

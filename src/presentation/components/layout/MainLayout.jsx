import { useEffect } from 'react';
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
  onDirectSave,
}) {
  const { user, logout } = useAuth();

  // Global Accessibility Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.isContentEditable) {
        return;
      }

      // Alt + Number shortcuts for quick module navigation
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.key === '1') {
          e.preventDefault();
          setCurrentTab('dashboard');
        } else if (e.key === '2') {
          e.preventDefault();
          setCurrentTab('stock');
        } else if (e.key === '3') {
          e.preventDefault();
          setCurrentTab('entrepot');
        } else if (e.key === '4') {
          e.preventDefault();
          setCurrentTab('machines');
        } else if (e.key === '5') {
          e.preventDefault();
          setCurrentTab('utilisateurs');
        } else if (e.key === '6') {
          e.preventDefault();
          setCurrentTab('settings');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCurrentTab]);

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-zinc-900 flex flex-col relative isolate select-none font-sans antialiased">
      {/* Accessible Skip Link for Keyboard & Screen-reader navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-emerald-700 focus:text-white focus:rounded-full focus:shadow-xl focus:outline-hidden font-bold text-xs tracking-tight transition"
      >
        Passer directement au contenu principal
      </a>

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
        <main
          id="main-content"
          role="main"
          tabIndex={-1}
          aria-label="Contenu principal"
          className="flex-1 p-4 lg:p-6 lg:pr-8 lg:pl-[104px] w-full min-w-0 focus:outline-hidden"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

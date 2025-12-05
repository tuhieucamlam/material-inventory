import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FlaskConical, PieChart, LogOut, Menu, X, Factory, Globe, PackageCheck, Moon, Sun, ArrowLeftRight, Maximize, Minimize } from 'lucide-react';
import { StorageService } from '../services/storage';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = StorageService.getUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    StorageService.logout();
    navigate('/');
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullScreen(true);
      }).catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullScreen(false);
        });
      }
    }
  };

  const isActive = (path: string) => location.pathname === path;

  if (location.pathname === '/') {
    return <>{children}</>;
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 relative overflow-hidden flex flex-col transition-colors duration-200">
      
      {/* Top Navigation Bar */}
      <header className="bg-white dark:bg-gray-800 h-14 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 justify-between shrink-0 z-30 shadow-sm transition-colors duration-200">
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleSidebar} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
            <FlaskConical className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
            Chemical Inventory
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Full Screen Toggle */}
          <button 
             onClick={toggleFullScreen}
             className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors hidden sm:flex"
             title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
          >
             {isFullScreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Theme Toggle */}
          <button 
             onClick={toggleTheme}
             className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
             title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
             {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Language Toggle */}
          <button 
             onClick={toggleLanguage}
             className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
             <Globe className="w-3.5 h-3.5" />
             {language === 'vi' ? 'VN' : 'EN'}
          </button>
          
          {/* User Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all hover:ring-2 hover:ring-indigo-100 dark:hover:ring-indigo-900"
            >
              {user?.PHOTO_URL ? (
                <img 
                  src={user.PHOTO_URL} 
                  alt={user.EMP_NAME} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.classList.add('bg-indigo-100', 'dark:bg-indigo-900', 'flex', 'items-center', 'justify-center', 'text-indigo-700', 'dark:text-indigo-300', 'font-bold', 'text-xs');
                    if(e.currentTarget.parentElement) e.currentTarget.parentElement.innerText = user?.EMP_NAME?.charAt(0).toUpperCase() || 'U';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                  {user?.EMP_NAME?.charAt(0).toUpperCase()}
                </div>
              )}
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsProfileOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="font-bold text-gray-800 dark:text-white truncate text-sm">
                      {user?.EMP_NAME}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                      {user?.DEPT_NM}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 font-mono">
                      ID: {user?.EMP_ID}
                    </p>
                  </div>
                  
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('logout')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-r border-gray-100 dark:border-gray-700 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between h-14">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white px-2">{t('menu')}</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => { navigate('/home'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive('/home') ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            {t('dashboard')}
          </button>
          
          <button
            onClick={() => { navigate('/inventory'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive('/inventory') ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <FlaskConical className="w-5 h-5" />
            {t('inventory')}
          </button>

          <button
            onClick={() => { navigate('/operations'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive('/operations') ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <ArrowLeftRight className="w-5 h-5" />
            Nhập / Xuất
          </button>

          <button
            onClick={() => { navigate('/production'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive('/production') ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Factory className="w-5 h-5" />
            {t('production')}
          </button>

          <button
            onClick={() => { navigate('/production-inventory'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive('/production-inventory') ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <PackageCheck className="w-5 h-5" />
            {t('prodInventory')}
          </button>

          <button
            onClick={() => { navigate('/statistics'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive('/statistics') ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <PieChart className="w-5 h-5" />
            {t('statistics')}
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Main Content - Full Screen */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        <div className="flex-1 overflow-auto p-4 w-full h-full">
           {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
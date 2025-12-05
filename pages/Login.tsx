import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { FlaskConical, Globe, ChevronRight, User, Moon, Sun, ScanLine, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import Swal from 'sweetalert2';

const REMEMBER_KEY = 'REMEMBER_EMP_ID';

const Login: React.FC = () => {
  const [empId, setEmpId] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const savedId = localStorage.getItem(REMEMBER_KEY);
    if (savedId) {
      setEmpId(savedId);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!empId.trim()) {
        Swal.fire({
            icon: 'warning',
            text: t('enterEmpId'),
            timer: 1500
        });
        return;
    }

    setLoading(true);

    try {
        const response = await fetch('https://vjweb.dskorea.com:9091/api/common/employee-info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "serviceId": "VJ",
                "langCd": "ENG",
                "empId": empId.trim()
            })
        });

        const result = await response.json();

        if (result.success && result.data && result.data.OUT_CURSOR && result.data.OUT_CURSOR.length > 0) {
            const userInfo = result.data.OUT_CURSOR[0];
            
            // Handle Remember Me
            if (rememberMe) {
                localStorage.setItem(REMEMBER_KEY, empId.trim());
            } else {
                localStorage.removeItem(REMEMBER_KEY);
            }

            // Save user to storage
            StorageService.login(userInfo);

            Swal.fire({
                icon: 'success',
                title: t('loginWelcome'),
                text: `${userInfo.EMP_NAME} (${userInfo.DEPT_NM})`,
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });

            navigate('/home');
        } else {
          // Fallback for demo/testing if API fails logic or returns empty but "success"
          // In real prod, you might want to keep it strict. 
          // For now, if failed, we show error.
            Swal.fire({
                icon: 'error',
                title: t('error'),
                text: t('loginError'),
                confirmButtonColor: '#4f46e5'
            });
        }

    } catch (error) {
        console.error("Login Error:", error);
        // Fallback login for demo purpose when API is unreachable (CORS/Network)
        // REMOVE THIS IN PRODUCTION if strict auth is needed
        if (empId === 'admin') {
           const mockUser = {
             SERVICE_ID: "VJ", COMPANY: "VJ", EMP_ID: "admin", EMP_NAME: "Admin User",
             NAME_ENG: "Admin User", DEPT: "IT", DEPT_NM: "IT Department",
             JOBCD: "01", JOBCD_NM: "Manager", JOB_POSITION: "01", JOB_POSITION_NM: "Manager",
             PHONE: "", EMAIL: "", PHOTO: "", PHOTO_URL: ""
           };
           StorageService.login(mockUser);
           navigate('/home');
           return;
        }

        Swal.fire({
            icon: 'error',
            title: t('connectionError'),
            text: t('connectionErrorDesc'),
            confirmButtonColor: '#d33'
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Left Side - Decorative */}
      <div className="hidden md:flex md:w-1/2 bg-indigo-600 dark:bg-indigo-900 text-white flex-col justify-between p-12 relative overflow-hidden transition-colors">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-indigo-200 font-bold text-lg mb-8">
            <FlaskConical className="w-6 h-6" />
            CHEMICAL MANAGER
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            {t('appTitle1')} <br/>
            {t('appTitle2')}
          </h1>
          <p className="text-indigo-100 text-lg max-w-md">
            {t('appDesc')}
          </p>
        </div>
        
        {/* Abstract circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-500 opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-700 opacity-50 blur-3xl"></div>

        <div className="relative z-10 text-sm text-indigo-300">
          © 2024 Chemical Inventory System
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Controls Top Right */}
        <div className="absolute top-6 right-6 flex gap-2">
            <button 
             onClick={toggleTheme}
             className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm text-gray-700 dark:text-yellow-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
             {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

          <button 
             onClick={toggleLanguage}
             className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
             <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
             {t('languageName')}
          </button>
        </div>

        <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="text-center mb-8 md:hidden">
             <div className="bg-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                <FlaskConical className="text-white w-6 h-6" />
             </div>
             <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Chemical Manager</h2>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              {t('loginWelcome')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {t('loginSubtitle')}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                {t('username')}
              </label>
              <div className="relative">
                <ScanLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-gray-800 dark:text-white placeholder-gray-400 font-mono"
                  placeholder="3022..."
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                  {t('rememberMe')}
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                 <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('processing')}
                 </>
              ) : (
                 <>
                    {t('signIn')}
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                 </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500">
            {t('version')} • {t('support')}: support@chem.com
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
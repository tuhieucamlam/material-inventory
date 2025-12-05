import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-6 text-center transition-colors duration-200">
      <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 max-w-lg w-full">
        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
           <FileQuestion className="w-10 h-10" />
        </div>
        
        <h1 className="text-6xl font-black text-gray-800 dark:text-white mb-2">404</h1>
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4">{t('notFoundTitle')}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          {t('notFoundDesc')}
        </p>

        <button 
          onClick={() => navigate('/')}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          {t('backHome')}
        </button>
      </div>
    </div>
  );
};

export default NotFound;
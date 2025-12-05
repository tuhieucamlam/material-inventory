import React, { useRef, useState } from 'react';
import { StorageService } from '../services/storage';
import { Download, Upload, Database, AlertTriangle, FileJson, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Swal from 'sweetalert2';

const Backup: React.FC = () => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleExport = () => {
    const dataStr = StorageService.exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const date = new Date().toISOString().split('T')[0];
    const a = document.createElement('a');
    a.href = url;
    a.download = `chemical_inventory_backup_${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Warning confirmation
    Swal.fire({
      title: t('warning'),
      text: t('restoreWarning'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: t('confirm'),
      cancelButtonText: t('cancel')
    }).then((result) => {
      if (result.isConfirmed) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const success = StorageService.importData(content);
          
          if (success) {
            Swal.fire({
              icon: 'success',
              title: t('success'),
              text: t('restoreSuccess'),
              confirmButtonColor: '#4f46e5'
            }).then(() => {
                window.location.reload(); // Reload to reflect changes
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: t('error'),
              text: t('restoreError'),
              confirmButtonColor: '#d33'
            });
          }
        };
        reader.readAsText(file);
      }
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Database className="text-indigo-600 dark:text-indigo-400" />
          {t('backupTitle')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('backupSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* EXPORT CARD */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-full transition-colors">
          <div className="p-8 flex flex-col items-center text-center flex-1">
             <div className="w-20 h-20 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <Download className="w-10 h-10 text-green-600 dark:text-green-400" />
             </div>
             <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{t('exportData')}</h3>
             <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-xs mx-auto">
                {t('exportDesc')}
             </p>
             
             <div className="w-full bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-dashed border-gray-300 dark:border-gray-600 flex items-center gap-3 text-left">
                <FileJson className="w-8 h-8 text-gray-400" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">chemical_inventory_backup.json</p>
                    <p className="text-xs text-gray-400">~15 KB</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
             </div>
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700">
             <button 
               onClick={handleExport}
               className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-200 dark:shadow-none flex items-center justify-center gap-2 transition-all"
             >
                <Download className="w-5 h-5" />
                {t('downloadBackup')}
             </button>
          </div>
        </div>

        {/* IMPORT CARD */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-full transition-colors">
          <div className="p-8 flex flex-col items-center text-center flex-1">
             <div className="w-20 h-20 bg-orange-50 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-6">
                <Upload className="w-10 h-10 text-orange-600 dark:text-orange-400" />
             </div>
             <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{t('importData')}</h3>
             <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-xs mx-auto">
                {t('importDesc')}
             </p>

             <div className={`w-full bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-dashed flex items-center gap-3 text-left transition-colors ${isHovering ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10' : 'border-gray-300 dark:border-gray-600'}`}>
                <AlertTriangle className="w-8 h-8 text-orange-400" />
                <div className="flex-1">
                    <p className="text-xs font-medium text-orange-600 dark:text-orange-400">Warning</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Dữ liệu cũ sẽ bị thay thế hoàn toàn.</p>
                </div>
             </div>
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700">
             <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".json"
                onChange={handleFileChange}
             />
             <button 
               onClick={handleImportClick}
               onMouseEnter={() => setIsHovering(true)}
               onMouseLeave={() => setIsHovering(false)}
               className="w-full py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-white border border-gray-200 dark:border-gray-600 hover:border-orange-500 dark:hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
             >
                <Upload className="w-5 h-5" />
                {t('selectFile')}
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Backup;
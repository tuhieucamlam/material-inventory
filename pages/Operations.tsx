import React, { useState, useEffect, useMemo } from 'react';
import { StorageService } from '../services/storage';
import { InventoryItem, TransactionType } from '../types';
import { ArrowDownCircle, ArrowUpCircle, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2';
import { useLanguage } from '../contexts/LanguageContext';

const Operations: React.FC = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>(TransactionType.IN);
  
  // Form State
  const [selectedCode, setSelectedCode] = useState(''); // New: Step 1
  const [selectedItemId, setSelectedItemId] = useState(''); // Step 2
  const [quantity, setQuantity] = useState<number>(1);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setItems(StorageService.getItems());
  }, []);

  // --- Derived Data for 2-Step Selection ---
  const uniqueCodes = useMemo(() => {
    return Array.from(new Set(items.map(i => i.itemCode))).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!selectedCode) return [];
    return items.filter(i => i.itemCode === selectedCode);
  }, [selectedCode, items]);

  const openModal = (type: TransactionType) => {
    setModalType(type);
    setQuantity(1);
    setNote('');
    setSelectedCode('');
    setSelectedItemId('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || quantity <= 0) return;

    setLoading(true);
    const item = items.find(i => i.id === selectedItemId);
    
    // Check stock for OUT transaction
    if (modalType === TransactionType.OUT && item && quantity > item.stockIn) {
        setLoading(false);
        Swal.fire({
            icon: 'error',
            title: t('stockErrorTitle'),
            text: t('stockErrorDesc').replace('{current}', item.stockIn.toString()).replace('{request}', quantity.toString()),
        });
        return;
    }

    // Simulate slight delay for "Processing" feel
    setTimeout(() => {
      const transaction = {
        id: uuidv4(),
        itemId: selectedItemId,
        itemName: item?.materialName || 'Unknown',
        type: modalType,
        quantity: quantity,
        date: new Date().toISOString(),
        note: note
      };

      StorageService.addTransaction(transaction);
      setLoading(false);
      
      // Update local items state
      const updatedItems = StorageService.getItems();
      setItems(updatedItems);
      
      // Close Modal and Show Success
      setIsModalOpen(false);
      
      const typeStr = modalType === TransactionType.IN ? t('typeIn') : t('typeOut');
      Swal.fire({
          icon: 'success',
          title: t('success'),
          text: t('opSuccessDesc').replace('{type}', typeStr),
          timer: 1500,
          showConfirmButton: false
      });

      // Reset form slightly
      setQuantity(1);
      setNote('');
      setSelectedItemId(''); 
    }, 500);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('opsTitle')}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('opsSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Incoming Card */}
        <button
          onClick={() => openModal(TransactionType.IN)}
          className="group relative overflow-hidden bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all text-left"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 dark:bg-green-900/20 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-6">
              <ArrowDownCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t('inbound')}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{t('inboundDesc')}</p>
            <span className="inline-flex items-center text-green-600 dark:text-green-400 font-medium">
              {t('createIn')} &rarr;
            </span>
          </div>
        </button>

        {/* Outgoing Card */}
        <button
          onClick={() => openModal(TransactionType.OUT)}
          className="group relative overflow-hidden bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all text-left"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 dark:bg-orange-900/20 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center mb-6">
              <ArrowUpCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t('outbound')}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{t('outboundDesc')}</p>
            <span className="inline-flex items-center text-orange-600 dark:text-orange-400 font-medium">
              {t('createOut')} &rarr;
            </span>
          </div>
        </button>
      </div>

      {/* Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className={`px-6 py-4 flex items-center justify-between ${modalType === TransactionType.IN ? 'bg-green-600' : 'bg-orange-600'}`}>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {modalType === TransactionType.IN ? <ArrowDownCircle /> : <ArrowUpCircle />}
                {modalType === TransactionType.IN ? t('inbound') : t('outbound')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Step 1: Code Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('selectCode')}</label>
                    <select
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white"
                      value={selectedCode}
                      onChange={(e) => {
                          setSelectedCode(e.target.value);
                          setSelectedItemId(''); // Reset item when code changes
                      }}
                    >
                      <option value="">-- {t('itemCode')} --</option>
                      {uniqueCodes.map(code => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </select>
                  </div>

                  {/* Step 2: Item Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('selectDetail')}</label>
                    <select
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500"
                      value={selectedItemId}
                      onChange={(e) => setSelectedItemId(e.target.value)}
                      disabled={!selectedCode}
                    >
                      <option value="">-- {t('materialName')} --</option>
                      {filteredItems.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.materialName.substring(0, 40)}... ({t('stock')}: {item.stockIn} {item.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('quantity')}</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.01"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      value={quantity}
                      onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('note')}</label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                      placeholder=""
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading || !selectedItemId}
                      className={`w-full py-3 rounded-lg font-bold text-white transition-all shadow-md ${
                        modalType === TransactionType.IN 
                          ? 'bg-green-600 hover:bg-green-700 shadow-green-200 dark:shadow-none' 
                          : 'bg-orange-600 hover:bg-orange-700 shadow-orange-200 dark:shadow-none'
                      } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {loading ? t('processing') : (modalType === TransactionType.IN ? t('confirmIn') : t('confirmOut'))}
                    </button>
                  </div>
                </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Operations;
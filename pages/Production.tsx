import React, { useState, useEffect, useMemo } from 'react';
import { StorageService } from '../services/storage';
import { InventoryItem, TransactionType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Factory, Plus, Trash2, ArrowRightCircle, Calculator, Box, Warehouse, Tag } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2';

// Mock Master Data Generator
const generateMasterProducts = () => [
  { id: 'm1', code: 'MST-CHM-001', name: 'Dung dịch tẩy rửa công nghiệp A1', unit: 'L', color: 'Blue', colorCode: 'BLU', factory: 'KHO-A' },
  { id: 'm2', code: 'MST-CHM-002', name: 'Sơn chống thấm ngoài trời X-Pro', unit: 'KG', color: 'Grey', colorCode: 'GRY', factory: 'KHO-B' },
  { id: 'm3', code: 'MST-CHM-003', name: 'Hỗn hợp phụ gia bê tông R7', unit: 'L', color: 'Clear', colorCode: 'CLR', factory: 'KHO-A' },
  { id: 'm4', code: 'MST-CHM-004', name: 'Keo dán gỗ Epoxy E200', unit: 'KG', color: 'Yellow', colorCode: 'YEL', factory: 'KHO-C' },
  { id: 'm5', code: 'MST-CHM-005', name: 'Chất làm mềm vải công nghiệp', unit: 'L', color: 'Pink', colorCode: 'PNK', factory: 'KHO-B' },
];

interface SourceEntry {
  tempId: string;
  itemId: string;
  qty: number;
}

const Production: React.FC = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [masters] = useState(generateMasterProducts());
  
  const [loading, setLoading] = useState(false);

  // 1. Target Selection State
  const [selectedMasterId, setSelectedMasterId] = useState('');

  // 2. Source Materials State
  const [sourceEntries, setSourceEntries] = useState<SourceEntry[]>([]);
  
  // Temp state for "Add Source" inputs
  const [tempSourceCode, setTempSourceCode] = useState(''); // Step 2.1: Code
  const [tempSourceId, setTempSourceId] = useState('');     // Step 2.2: Specific Item
  const [tempSourceQty, setTempSourceQty] = useState<string>('');

  // 3. Calculation & Destination State
  const [adjustment, setAdjustment] = useState<string>('0');
  const [destFactory, setDestFactory] = useState<string>(''); 

  useEffect(() => {
    setItems(StorageService.getItems());
  }, []);

  // Update dest factory when master changes
  useEffect(() => {
      if (selectedMasterId) {
          const m = masters.find(x => x.id === selectedMasterId);
          if (m) setDestFactory(m.factory);
      }
  }, [selectedMasterId, masters]);

  // --- Derived Data for Step 2 ---
  const materialItems = useMemo(() => items.filter(i => i.type !== 'PRODUCT'), [items]);
  
  const uniqueMaterialCodes = useMemo(() => {
    return Array.from(new Set(materialItems.map(i => i.itemCode))).sort();
  }, [materialItems]);

  const filteredSourceItems = useMemo(() => {
    if (!tempSourceCode) return [];
    return materialItems.filter(i => i.itemCode === tempSourceCode);
  }, [tempSourceCode, materialItems]);

  const selectedMaster = masters.find(m => m.id === selectedMasterId);
  
  // Get unique factories from both existing items AND master definitions
  const uniqueFactories = useMemo(() => {
    const fromItems = items.map(i => i.factoryCode);
    const fromMasters = masters.map(m => m.factory);
    return Array.from(new Set([...fromItems, ...fromMasters])).filter(Boolean).sort();
  }, [items, masters]);
  
  const calculateTotalSource = useMemo(() => {
    return sourceEntries.reduce((sum, entry) => sum + entry.qty, 0);
  }, [sourceEntries]);

  const finalOutput = useMemo(() => {
    const adj = parseFloat(adjustment) || 0;
    return Math.max(0, calculateTotalSource + adj);
  }, [calculateTotalSource, adjustment]);

  const handleAddSource = () => {
    if (!tempSourceId || !tempSourceQty) return;
    const qty = parseFloat(tempSourceQty);
    if (qty <= 0) return;

    const item = items.find(i => i.id === tempSourceId);
    if (!item) return;
    if (qty > item.stockIn) {
      Swal.fire({
        icon: 'error',
        title: t('errorStock'),
        text: t('errorStockDetail').replace('{current}', item.stockIn.toString()).replace('{unit}', item.unit).replace('{request}', qty.toString()),
        confirmButtonColor: '#d33',
      });
      return;
    }

    setSourceEntries(prev => [
      ...prev, 
      { tempId: uuidv4(), itemId: tempSourceId, qty }
    ]);
    
    setTempSourceId('');
    setTempSourceQty('');
  };

  const handleRemoveSource = (tempId: string) => {
    setSourceEntries(prev => prev.filter(e => e.tempId !== tempId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMaster || sourceEntries.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: t('missingInfo'),
        text: t('fillAll'),
        confirmButtonColor: '#f59e0b',
      });
      return;
    }

    if (finalOutput <= 0) {
      Swal.fire({
        icon: 'error',
        title: t('error'),
        text: t('invalidOutput'),
        confirmButtonColor: '#d33',
      });
      return;
    }

    if (!destFactory) {
      Swal.fire({
        icon: 'warning',
        title: t('missingInfo'),
        text: t('selectDestFactory'),
        confirmButtonColor: '#f59e0b',
      });
      return;
    }

    // Confirmation Dialog
    Swal.fire({
      title: t('confirmProdTitle'),
      html: t('confirmProdHtml').replace('{qty}', finalOutput.toString()).replace('{unit}', selectedMaster.unit).replace('{name}', selectedMaster.name),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#d33',
      confirmButtonText: t('confirm'),
      cancelButtonText: t('cancel')
    }).then((result) => {
      if (result.isConfirmed) {
        processProduction();
      }
    });
  };

  const processProduction = () => {
    setLoading(true);

    setTimeout(() => {
      const date = new Date().toISOString();
      const newProductId = uuidv4();

      // 1. Process Transaction OUT for ALL sources
      sourceEntries.forEach(entry => {
        const sourceItem = items.find(i => i.id === entry.itemId);
        if (sourceItem) {
          const outTransaction = {
            id: uuidv4(),
            itemId: sourceItem.id,
            itemName: sourceItem.materialName,
            type: TransactionType.OUT,
            quantity: entry.qty,
            date: date,
            note: `Used for producing: ${selectedMaster!.code}`
          };
          StorageService.addTransaction(outTransaction);
        }
      });

      // 2. CREATE New Item based on Master
      const newItem: InventoryItem = {
        id: newProductId,
        materialName: selectedMaster!.name,
        itemCode: selectedMaster!.code,
        colorName: selectedMaster!.color,
        colorCode: selectedMaster!.colorCode,
        unit: selectedMaster!.unit,
        requiredQty: 0,
        stockIn: 0, 
        factoryCode: destFactory, 
        type: 'PRODUCT'
      };
      StorageService.addItem(newItem);

      // 3. Process Transaction IN for Target
      const inTransaction = {
        id: uuidv4(),
        itemId: newItem.id,
        itemName: newItem.materialName,
        type: TransactionType.IN,
        quantity: finalOutput,
        date: date,
        note: `Produced from ${sourceEntries.length} sources. Adj: ${adjustment}kg`
      };
      StorageService.addTransaction(inTransaction);

      setLoading(false);
      
      Swal.fire({
        icon: 'success',
        title: t('successTransform'),
        text: t('successTransformDetail').replace('{qty}', finalOutput.toString()).replace('{unit}', selectedMaster!.unit),
        timer: 2000,
        showConfirmButton: false
      });

      // Reset Form
      setSelectedMasterId('');
      setSourceEntries([]);
      setAdjustment('0');
      
      // Refresh Data
      setItems(StorageService.getItems());
    }, 800);
  };

  return (
    <div className="w-full px-6 space-y-6 pb-20">
       <div>
         <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Factory className="text-indigo-600 dark:text-indigo-400" />
            {t('productionTitle')}
         </h1>
         <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {t('productionSubtitle')}
         </p>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Input Steps */}
          <div className="lg:col-span-8 space-y-6">
             
             {/* STEP 1: TARGET (Master) */}
             <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold">1</div>
                  <h3 className="font-bold text-gray-800 dark:text-gray-200">{t('step1Title')}</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('masterName')}</label>
                    <div className="relative">
                      <Box className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select 
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 outline-none appearance-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        value={selectedMasterId}
                        onChange={(e) => setSelectedMasterId(e.target.value)}
                      >
                        <option value="">{t('selectMaster')}</option>
                        {masters.map(m => (
                          <option key={m.id} value={m.id}>{m.code} - {m.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedMaster && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase">{t('masterCode')}</span>
                        <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400">{selectedMaster.code}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase">{t('unit')}</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">{selectedMaster.unit}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase">{t('color')}</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">{selectedMaster.color} ({selectedMaster.colorCode})</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase">{t('factory')}</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">{selectedMaster.factory}</span>
                      </div>
                    </div>
                  )}
                </div>
             </div>

             {/* STEP 2: SOURCES (Multiple) */}
             <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">2</div>
                  <h3 className="font-bold text-gray-800 dark:text-gray-200">{t('step2Title')}</h3>
                </div>

                {/* Add Source Form */}
                <div className="flex flex-col gap-3 mb-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Step 2.1: Code */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">{t('itemCode')}</label>
                        <div className="relative">
                            <Tag className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                            <select 
                                className="w-full pl-7 pr-2 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 outline-none text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                value={tempSourceCode}
                                onChange={(e) => {
                                    setTempSourceCode(e.target.value);
                                    setTempSourceId(''); // Reset Item when Code changes
                                }}
                            >
                                <option value="">-- Code --</option>
                                {uniqueMaterialCodes.map(code => (
                                    <option key={code} value={code}>{code}</option>
                                ))}
                            </select>
                        </div>
                      </div>

                      {/* Step 2.2: Specific Item */}
                      <div>
                         <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">{t('materialName')}</label>
                         <select 
                            className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 outline-none text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400"
                            value={tempSourceId}
                            onChange={(e) => setTempSourceId(e.target.value)}
                            disabled={!tempSourceCode}
                        >
                            <option value="">{t('selectMaterial')}</option>
                            {filteredSourceItems.map(i => (
                                <option key={i.id} value={i.id}>
                                    {i.materialName.substring(0, 30)}... ({t('stock')}: {i.stockIn})
                                </option>
                            ))}
                        </select>
                      </div>
                   </div>

                   <div className="flex gap-3">
                      <div className="flex-1">
                        {/* Placeholder for alignment or extra info */}
                      </div>
                      <div className="w-32">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">{t('usedQty')}</label>
                        <input 
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none text-sm font-semibold"
                        value={tempSourceQty}
                        onChange={(e) => setTempSourceQty(e.target.value)}
                        />
                      </div>
                      <div className="flex items-end">
                        <button 
                            type="button"
                            onClick={handleAddSource}
                            disabled={!tempSourceId || !tempSourceQty}
                            className="px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-1"
                        >
                            <Plus className="w-4 h-4" /> {t('addSourceBtn')}
                        </button>
                      </div>
                   </div>
                </div>

                {/* Source List Table */}
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                      <tr>
                        <th className="px-4 py-2">{t('materialName')}</th>
                        <th className="px-4 py-2 text-right">{t('usedQty')} (KG/L)</th>
                        <th className="px-4 py-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {sourceEntries.length > 0 ? (
                        sourceEntries.map(entry => {
                          const item = items.find(i => i.id === entry.itemId);
                          return (
                            <tr key={entry.tempId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="px-4 py-2">
                                <div className="font-medium text-gray-800 dark:text-gray-200">{item?.itemCode}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{item?.materialName}</div>
                              </td>
                              <td className="px-4 py-2 text-right font-bold text-gray-800 dark:text-gray-200">{entry.qty}</td>
                              <td className="px-4 py-2 text-center">
                                <button 
                                  onClick={() => handleRemoveSource(entry.tempId)}
                                  className="text-red-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-gray-400 italic">
                            {t('noSourceSelected')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
             </div>
          </div>

          {/* RIGHT COLUMN: Calculation Summary */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-indigo-100 dark:border-gray-700 sticky top-4 transition-colors">
                <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 flex items-center justify-center font-bold">3</div>
                  <h3 className="font-bold text-gray-800 dark:text-gray-200">{t('step3Title')}</h3>
                </div>

                <div className="space-y-6">
                  {/* Destination Warehouse */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('destWarehouse')}</label>
                    <div className="relative">
                        <Warehouse className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-indigo-500 outline-none font-semibold bg-white dark:bg-gray-700 text-gray-800 dark:text-white appearance-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                          value={destFactory}
                          onChange={(e) => setDestFactory(e.target.value)}
                        >
                          <option value="">-- {t('factory')} --</option>
                          {uniqueFactories.map(f => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                    </div>
                  </div>

                  {/* Total Source */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{t('totalSourceWeight')}</span>
                    <span className="font-bold text-lg text-gray-800 dark:text-gray-200">{calculateTotalSource.toLocaleString()} <span className="text-xs font-normal text-gray-400">KG/L</span></span>
                  </div>

                  {/* Adjustment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('adjustment')}</label>
                    <div className="flex items-center gap-2">
                       <Calculator className="text-gray-400 w-5 h-5" />
                       <input 
                        type="number"
                        step="0.01"
                        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-indigo-500 outline-none font-medium text-right"
                        value={adjustment}
                        onChange={(e) => setAdjustment(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('adjustmentHint')}</p>
                  </div>

                  <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-4"></div>

                  {/* Final Output */}
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <span className="block text-sm text-green-700 dark:text-green-400 mb-1 font-medium">{t('finalOutput')}</span>
                    <div className="text-3xl font-bold text-green-800 dark:text-green-300 flex items-baseline gap-1">
                      {finalOutput.toLocaleString()} 
                      <span className="text-base font-medium">KG/L</span>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={loading || !selectedMaster || sourceEntries.length === 0}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                        <span className="flex items-center gap-2">{t('processing')}</span>
                    ) : (
                        <>
                            <ArrowRightCircle className="w-5 h-5" />
                            {t('transformBtn')}
                        </>
                    )}
                  </button>
                </div>
             </div>
          </div>

       </div>
    </div>
  );
};

export default Production;
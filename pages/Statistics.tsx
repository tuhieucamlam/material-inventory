import React, { useState, useEffect, useMemo } from 'react';
import { StorageService } from '../services/storage';
import { Transaction, TransactionType, InventoryItem } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, AlertCircle, Package, Factory, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ListFilter, Tag } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const Statistics: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'MATERIAL' | 'PRODUCT'>('ALL');
  const [filterFactory, setFilterFactory] = useState('');
  
  // 2-Step Item Filter
  const [filterItemCode, setFilterItemCode] = useState('');
  const [filterItemId, setFilterItemId] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number | 'all'>(10);

  useEffect(() => {
    setTransactions(StorageService.getTransactions());
    setItems(StorageService.getItems());
    // Default to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, filterType, filterFactory, filterItemCode, filterItemId, rowsPerPage]);

  // Map Item IDs to details for quick lookup
  const itemMap = useMemo(() => {
    return items.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {} as Record<string, InventoryItem>);
  }, [items]);

  // Unique Factories
  const uniqueFactories = useMemo(() => {
    const factories = new Set(items.map(item => item.factoryCode).filter(Boolean));
    return Array.from(factories).sort();
  }, [items]);

  // Items for Select (Based on Type Filter)
  const availableItems = useMemo(() => {
      return items.filter(item => {
          if (filterType === 'MATERIAL') return item.type !== 'PRODUCT';
          if (filterType === 'PRODUCT') return item.type === 'PRODUCT';
          return true;
      });
  }, [items, filterType]);

  // Unique Item Codes from available items
  const uniqueItemCodes = useMemo(() => {
      return Array.from(new Set(availableItems.map(i => i.itemCode))).sort();
  }, [availableItems]);

  // Items filtered by selected Code
  const filteredItemsByCode = useMemo(() => {
      if (!filterItemCode) return [];
      return availableItems.filter(i => i.itemCode === filterItemCode);
  }, [filterItemCode, availableItems]);


  const filteredTransactions = useMemo(() => {
    if (!startDate || !endDate) return transactions;
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); 

    return transactions.filter(t => {
      const tDate = new Date(t.date);
      // Date Filter
      if (tDate < start || tDate > end) return false;

      // Resolve Item Details
      const item = itemMap[t.itemId];
      if (!item) return false; // Skip if item deleted or unknown

      // Type Filter
      const isProduct = item.type === 'PRODUCT';
      if (filterType === 'MATERIAL' && isProduct) return false;
      if (filterType === 'PRODUCT' && !isProduct) return false;

      // Factory Filter
      if (filterFactory && item.factoryCode !== filterFactory) return false;

      // Item Code Filter
      if (filterItemCode && item.itemCode !== filterItemCode) return false;

      // Specific Item Filter
      if (filterItemId && t.itemId !== filterItemId) return false;

      return true;
    });
  }, [transactions, startDate, endDate, filterType, filterFactory, filterItemCode, filterItemId, itemMap]);

  // Aggregate data for chart
  const chartData = useMemo(() => {
    const data: any = [];
    // Group by date
    const groups = filteredTransactions.reduce((acc, curr) => {
      const date = curr.date.split('T')[0];
      if (!acc[date]) acc[date] = { date, IN: 0, OUT: 0 };
      if (curr.type === TransactionType.IN) acc[date].IN += curr.quantity;
      else acc[date].OUT += curr.quantity;
      return acc;
    }, {} as any);
    return Object.values(groups).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredTransactions]);

  // --- Pagination Logic ---
  const paginatedData = useMemo(() => {
    const sortedData = [...filteredTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (rowsPerPage === 'all') {
      return sortedData;
    }
    
    const startIndex = (currentPage - 1) * (rowsPerPage as number);
    const endIndex = startIndex + (rowsPerPage as number);
    return sortedData.slice(startIndex, endIndex);
  }, [filteredTransactions, currentPage, rowsPerPage]);

  const totalPages = rowsPerPage === 'all' ? 1 : Math.ceil(filteredTransactions.length / (rowsPerPage as number));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            {t('statsTitle')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('statsSubtitle')}</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-4 transition-colors">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
             
             {/* 1. Warehouse Filter (Moved to First) */}
             <div className="relative">
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                     <Factory className="w-4 h-4" />
                 </div>
                 <select 
                    className="w-full h-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm font-medium outline-none focus:border-indigo-500 appearance-none text-gray-800 dark:text-gray-200"
                    value={filterFactory}
                    onChange={e => setFilterFactory(e.target.value)}
                 >
                     <option value="">{t('allFactories')}</option>
                     {uniqueFactories.map(f => (
                         <option key={f} value={f}>{t('factory')} {f}</option>
                     ))}
                 </select>
             </div>

             {/* 2. Type Filter */}
             <div className="relative">
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                     <ListFilter className="w-4 h-4" />
                 </div>
                 <select 
                    className="w-full h-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm font-medium outline-none focus:border-indigo-500 appearance-none text-gray-800 dark:text-gray-200"
                    value={filterType}
                    onChange={e => {
                        setFilterType(e.target.value as any);
                        setFilterItemCode(''); // Reset Code on Type Change
                        setFilterItemId(''); // Reset Item on Type Change
                    }}
                 >
                     <option value="ALL">{t('typeAll')}</option>
                     <option value="MATERIAL">{t('typeMaterial')}</option>
                     <option value="PRODUCT">{t('typeProduct')}</option>
                 </select>
             </div>

             {/* 3. Item Code Filter (Step 1) */}
             <div className="relative">
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                     <Tag className="w-4 h-4" />
                 </div>
                 <select 
                    className="w-full h-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm font-medium outline-none focus:border-indigo-500 appearance-none text-gray-800 dark:text-gray-200"
                    value={filterItemCode}
                    onChange={e => {
                        setFilterItemCode(e.target.value);
                        setFilterItemId(''); // Reset specific item when code changes
                    }}
                 >
                     <option value="">-- {t('itemCode')} --</option>
                     {uniqueItemCodes.map(code => (
                         <option key={code} value={code}>{code}</option>
                     ))}
                 </select>
             </div>

             {/* 4. Specific Item Filter (Step 2) */}
             <div className="relative">
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                     <Package className="w-4 h-4" />
                 </div>
                 <select 
                    className="w-full h-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm font-medium outline-none focus:border-indigo-500 appearance-none disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 text-gray-800 dark:text-gray-200"
                    value={filterItemId}
                    onChange={e => setFilterItemId(e.target.value)}
                    disabled={!filterItemCode}
                 >
                     <option value="">-- {t('materialName')} --</option>
                     {filteredItemsByCode.map(i => (
                         <option key={i.id} value={i.id}>
                            {i.materialName.substring(0, 30)}...
                         </option>
                     ))}
                 </select>
             </div>

             {/* 5. Date Range */}
             <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="flex flex-col w-full">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold">{t('filterDateFrom')}</span>
                    <input type="date" className="bg-transparent text-sm outline-none w-full font-medium text-gray-800 dark:text-gray-200 dark:[color-scheme:dark]" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                <div className="flex flex-col w-full">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold">{t('filterDateTo')}</span>
                    <input type="date" className="bg-transparent text-sm outline-none w-full font-medium text-gray-800 dark:text-gray-200 dark:[color-scheme:dark]" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
             </div>

         </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6">{t('chartTitle')}</h3>
          <div className="h-72 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                  <XAxis dataKey="date" tick={{fontSize: 12, fill: theme === 'dark' ? '#9ca3af' : '#6b7280'}} />
                  <YAxis tick={{fontSize: 12, fill: theme === 'dark' ? '#9ca3af' : '#6b7280'}} />
                  <Tooltip 
                    contentStyle={{
                        borderRadius: '8px', 
                        border: 'none', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                        color: theme === 'dark' ? '#f3f4f6' : '#1f2937'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="IN" name="Nhập kho" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="OUT" name="Xuất kho" fill="#ea580c" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                <p>{t('noTrans')}</p>
              </div>
            )}
          </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/30">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <ListFilter className="w-4 h-4" /> {t('transDetail')}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2 py-1 rounded-md font-medium shadow-sm">
            Total: {filteredTransactions.length}
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Thời gian</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Loại</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Sản phẩm</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Kho</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase text-right">Số lượng</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {paginatedData.length > 0 ? (
                paginatedData.map((t) => {
                    const item = itemMap[t.itemId];
                    return (
                      <tr key={t.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-mono">
                          {new Date(t.date).toLocaleString('vi-VN')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                            t.type === TransactionType.IN 
                              ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' 
                              : 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800'
                          }`}>
                            {t.type === TransactionType.IN ? 'NHẬP' : 'XUẤT'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{t.itemName}</div>
                            {item && <div className="text-[10px] text-gray-400 dark:text-gray-500">{item.itemCode}</div>}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                             {item?.factoryCode || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-bold text-gray-800 dark:text-gray-200">
                          {t.type === TransactionType.IN ? '+' : '-'}{t.quantity.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 italic max-w-xs truncate">
                          {t.note || '-'}
                        </td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 flex flex-col items-center">
                    <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                    {t('noTrans')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 dark:bg-gray-900/30">
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('show')}</span>
                <select 
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm outline-none focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    value={rowsPerPage}
                    onChange={(e) => {
                        const val = e.target.value;
                        setRowsPerPage(val === 'all' ? 'all' : Number(val));
                        setCurrentPage(1); // Reset to page 1
                    }}
                >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value="all">All</option>
                </select>
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('rowsPerPage')}</span>
            </div>

            <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('page')} <strong>{rowsPerPage === 'all' ? 1 : currentPage}</strong> / <strong>{totalPages}</strong>
                </span>
                
                <div className="flex rounded-md shadow-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                    <button 
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1 || rowsPerPage === 'all'}
                        className="px-2 py-1.5 border-r border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                    >
                        <ChevronsLeft className="w-4 h-4"/>
                    </button>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1 || rowsPerPage === 'all'}
                        className="px-2 py-1.5 border-r border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                    >
                        <ChevronLeft className="w-4 h-4"/>
                    </button>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages || rowsPerPage === 'all'}
                        className="px-2 py-1.5 border-r border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                    >
                        <ChevronRight className="w-4 h-4"/>
                    </button>
                    <button 
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages || rowsPerPage === 'all'}
                        className="px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                    >
                        <ChevronsRight className="w-4 h-4"/>
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
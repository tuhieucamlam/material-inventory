import React, { useEffect, useState, useMemo } from 'react';
import { StorageService } from '../services/storage';
import { InventoryItem, TransactionType } from '../types';
import { PackageCheck, Search, ChevronLeft, ChevronRight, Filter, Truck, X, Layers, Tag } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnFiltersState,
  PaginationState
} from '@tanstack/react-table';
import { useLanguage } from '../contexts/LanguageContext';
import Swal from 'sweetalert2';

// Extended Type for Grouped Display
interface GroupedInventoryItem extends InventoryItem {
  subItems: InventoryItem[]; // Keep track of individual batches
  batchCount: number;
}

const ProductionInventory: React.FC = () => {
  const { t } = useLanguage();
  const [groupedItems, setGroupedItems] = useState<GroupedInventoryItem[]>([]);
  const [refresher, setRefresher] = useState(0);
  const [rawItems, setRawItems] = useState<InventoryItem[]>([]); // Keep raw items for factory filtering list

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupedInventoryItem | null>(null);
  const [exportQty, setExportQty] = useState<number>(0);
  const [exportNote, setExportNote] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  
  // Table State
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const allItems = StorageService.getItems();
    // 1. Filter PRODUCTs
    const productItems = allItems.filter(item => item.type === 'PRODUCT');
    setRawItems(productItems);

    const groups: Record<string, GroupedInventoryItem> = {};
    
    productItems.forEach(item => {
      const key = `${item.itemCode}_${item.factoryCode}`;
      
      if (!groups[key]) {
        groups[key] = {
          ...item,
          stockIn: 0,
          subItems: [],
          batchCount: 0
        };
      }
      
      // Sum the stock
      groups[key].stockIn += item.stockIn;
      // Add reference to list
      if (item.stockIn > 0) {
        groups[key].subItems.push(item);
      }
      groups[key].batchCount += 1;
    });

    setGroupedItems(Object.values(groups));
  }, [refresher]);

  // Unique factories from the PRODUCTS list
  const uniqueFactories = useMemo(() => {
    const factories = new Set(rawItems.map(item => item.factoryCode).filter(Boolean));
    return Array.from(factories).sort();
  }, [rawItems]);

  // Unique Codes
  const uniqueCodes = useMemo(() => {
    const codes = new Set(groupedItems.map(item => item.itemCode).filter(Boolean));
    return Array.from(codes).sort();
  }, [groupedItems]);

  const handleSearch = () => setGlobalFilter(searchInput);
  
  // --- EXPORT LOGIC (Distributed) ---
  const openExportModal = (group: GroupedInventoryItem) => {
    setSelectedGroup(group);
    setExportQty(0);
    setExportNote('');
    setIsModalOpen(true);
  };

  const handleExportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || exportQty <= 0) return;
    if (exportQty > selectedGroup.stockIn) {
        Swal.fire({
            icon: 'error',
            title: t('stockErrorTitle'),
            text: t('exportStockError').replace('{current}', selectedGroup.stockIn.toString()).replace('{unit}', selectedGroup.unit),
            confirmButtonColor: '#d33',
        });
        return;
    }

    setModalLoading(true);

    setTimeout(() => {
        let remainingQtyToExport = exportQty;
        const date = new Date().toISOString();
        
        const subItems = [...selectedGroup.subItems]; // Copy array
        
        for (const item of subItems) {
            if (remainingQtyToExport <= 0) break;
            
            const available = item.stockIn; 
            
            if (available > 0) {
                const deduct = Math.min(available, remainingQtyToExport);
                
                // Create Transaction for this SPECIFIC Item ID
                const transaction = {
                    id: uuidv4(),
                    itemId: item.id,
                    itemName: item.materialName,
                    type: TransactionType.OUT,
                    quantity: deduct,
                    date: date,
                    note: `EXPORT DISTRIBUTED: ${exportNote} (Batch ID: ${item.id.slice(0,4)}...)`
                };
                StorageService.addTransaction(transaction);
                
                remainingQtyToExport -= deduct;
            }
        }
        
        setModalLoading(false);
        setRefresher(prev => prev + 1); // Reload data to re-calculate groups
        setIsModalOpen(false);

        Swal.fire({
            icon: 'success',
            title: t('success'),
            text: t('exportSuccessDetail').replace('{qty}', exportQty.toString()).replace('{unit}', selectedGroup.unit),
            timer: 1500,
            showConfirmButton: false
        });

    }, 800);
  };

  // --- TABLE COLUMNS ---
  const columnHelper = createColumnHelper<GroupedInventoryItem>();
  const columns = useMemo(() => [
    columnHelper.accessor('itemCode', {
      id: 'itemCode',
      header: t('itemCode'),
      size: 100,
      cell: info => <span className="font-mono text-xs font-semibold text-indigo-700 dark:text-indigo-400">{info.getValue()}</span>,
      filterFn: 'equals',
    }),
    columnHelper.accessor('materialName', {
      header: t('materialName'),
      size: 300,
      cell: info => (
        <div className="max-w-md">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2">{info.getValue()}</p>
          <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
             <Layers className="w-3 h-3"/> {info.row.original.batchCount} lô hàng
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('factoryCode', {
      id: 'factoryCode',
      header: t('factory'),
      size: 80,
      cell: info => <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">{info.getValue()}</span>,
      filterFn: 'equals',
    }),
    columnHelper.accessor('unit', {
        header: t('unit'),
        size: 60,
        cell: info => <span className="text-xs text-gray-500 dark:text-gray-400">{info.getValue()}</span>,
    }),
    columnHelper.accessor('stockIn', {
      header: () => <span className="flex items-center gap-1">{t('stock')} (Tổng)</span>,
      size: 100,
      cell: info => {
        const value = info.getValue();
        return (
          <span className={`font-bold text-sm ${value <= 0 ? 'text-gray-400' : 'text-blue-600 dark:text-blue-400'}`}>
            {value.toLocaleString()}
          </span>
        );
      },
    }),
    // ACTION COLUMN
    columnHelper.display({
        id: 'actions',
        header: t('exportOut'),
        size: 100,
        cell: info => (
            <button
                onClick={() => openExportModal(info.row.original)}
                disabled={info.row.original.stockIn <= 0}
                className="flex items-center gap-1 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 rounded-lg border border-teal-200 dark:border-teal-800 transition-colors text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Truck className="w-4 h-4" /> {t('exportOut')}
            </button>
        )
    })
  ], [columnHelper, t]);

  const table = useReactTable({
    data: groupedItems,
    columns,
    state: { sorting, columnFilters, globalFilter, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="flex flex-col h-full gap-4 relative">
      <div className="shrink-0 flex flex-col gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <PackageCheck className="text-indigo-600 dark:text-indigo-400" />
            {t('prodInventoryTitle')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('prodInventorySubtitle')}</p>
        </div>
        
        {/* Search & Filter */}
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-12 gap-3 items-center transition-colors">
            {/* Factory Filter */}
            <div className="md:col-span-2 relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 outline-none text-sm bg-gray-50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 cursor-pointer text-gray-800 dark:text-gray-200"
                  value={(table.getColumn('factoryCode')?.getFilterValue() as string) ?? ''}
                  onChange={e => table.getColumn('factoryCode')?.setFilterValue(e.target.value || undefined)}
                >
                  <option value="">{t('allFactories')}</option>
                  {uniqueFactories.map(code => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
            </div>

            {/* Item Code Filter */}
            <div className="md:col-span-3 relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 focus:border-indigo-500 outline-none text-sm bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200"
                  value={(table.getColumn('itemCode')?.getFilterValue() as string) ?? ''}
                  onChange={e => table.getColumn('itemCode')?.setFilterValue(e.target.value || undefined)}
                >
                  <option value="">-- {t('itemCode')} --</option>
                  {uniqueCodes.map(code => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
            </div>

            <div className="md:col-span-7 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 focus:border-indigo-500 outline-none text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button onClick={handleSearch} className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-sm whitespace-nowrap">
                {t('searchBtn')}
              </button>
            </div>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col min-h-0 transition-colors">
        <div className="overflow-auto flex-1 w-full">
          <table className="w-full text-left relative border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} style={{ width: header.getSize() }} className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 bg-gray-50 dark:bg-gray-900/50" onClick={header.column.getToggleSortingHandler()}>
                      <div className="flex items-center gap-1">{flexRender(header.column.columnDef.header, header.getContext())}</div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-colors">
                    {row.getVisibleCells().map(cell => <td key={cell.id} className="px-4 py-3 align-middle">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
                  </tr>
                ))
              ) : (
                <tr><td colSpan={columns.length} className="px-6 py-20 text-center text-gray-500 dark:text-gray-400">{t('noData')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination controls */}
        <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-900/30 flex justify-end gap-2 text-gray-600 dark:text-gray-400">
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"><ChevronLeft/></button>
            <span className="text-sm self-center">Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"><ChevronRight/></button>
        </div>
      </div>

      {/* EXPORT MODAL */}
      {isModalOpen && selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transition-colors">
                <div className="px-6 py-4 bg-teal-600 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Truck className="w-5 h-5"/> {t('exportTitle')}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white"><X className="w-6 h-6"/></button>
                </div>
                <div className="p-6">
                    <form onSubmit={handleExportSubmit} className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{selectedGroup.materialName}</p>
                            <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
                                <span>Code: <span className="font-mono font-semibold">{selectedGroup.itemCode}</span></span>
                                <span>Total Stock: <span className="font-bold">{selectedGroup.stockIn} {selectedGroup.unit}</span></span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                                    <span>Factory: {selectedGroup.factoryCode}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('exportQty')}</label>
                            <input type="number" required min="0.01" max={selectedGroup.stockIn} step="0.01" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none text-lg font-semibold" value={exportQty} onChange={e => setExportQty(parseFloat(e.target.value) || 0)} autoFocus />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('exportReason')}</label>
                            <textarea rows={2} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none resize-none text-sm" value={exportNote} onChange={e => setExportNote(e.target.value)}></textarea>
                        </div>
                        <button type="submit" disabled={modalLoading} className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold shadow-md shadow-teal-200 dark:shadow-none flex justify-center items-center gap-2 disabled:opacity-70">
                            {modalLoading ? t('processing') : <>{t('confirmExport')} <Truck className="w-5 h-5"/></>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ProductionInventory;
import React, { useEffect, useState, useMemo } from 'react';
import { StorageService } from '../services/storage';
import { InventoryItem } from '../types';
import { Package, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter, Tag } from 'lucide-react';
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

const Inventory: React.FC = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState<InventoryItem[]>([]);
  
  // States for TanStack Table
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Local state for search
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    // FILTER: Only show MATERIAL items
    const allItems = StorageService.getItems();
    const materialItems = allItems.filter(i => i.type !== 'PRODUCT');
    setItems(materialItems);
  }, []);

  // Unique factories
  const uniqueFactories = useMemo(() => {
    const factories = new Set(items.map(item => item.factoryCode).filter(Boolean));
    return Array.from(factories).sort();
  }, [items]);

  // Unique Item Codes for Filter
  const uniqueCodes = useMemo(() => {
    const codes = new Set(items.map(item => item.itemCode).filter(Boolean));
    return Array.from(codes).sort();
  }, [items]);

  const handleSearch = () => {
    setGlobalFilter(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setGlobalFilter('');
  };

  const columnHelper = createColumnHelper<InventoryItem>();

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
        <div className="max-w-md" title={info.getValue()}>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2">
            {info.getValue()}
          </p>
        </div>
      ),
    }),
    columnHelper.accessor('colorName', {
      header: t('color'),
      size: 150,
      cell: info => (
        <div className="flex flex-col">
          <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{info.getValue()}</span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">{info.row.original.colorCode}</span>
        </div>
      ),
    }),
    columnHelper.accessor('unit', {
      header: t('unit'),
      size: 60,
      cell: info => <span className="text-xs text-gray-500 dark:text-gray-400">{info.getValue()}</span>,
    }),
    columnHelper.accessor('factoryCode', {
      id: 'factoryCode',
      header: t('factory'),
      size: 80,
      cell: info => <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">{info.getValue()}</span>,
      filterFn: 'equals',
    }),
    columnHelper.accessor('stockIn', {
      header: t('stock'),
      size: 100,
      cell: info => {
        const value = info.getValue();
        return (
          <span className={`font-bold text-sm ${value < 10 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {value.toLocaleString()}
          </span>
        );
      },
    }),
  ], [columnHelper, t]);

  const table = useReactTable({
    data: items,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'all') {
      table.setPageSize(items.length > 0 ? items.length : 10);
    } else {
      table.setPageSize(Number(val));
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header & Filter Section */}
      <div className="shrink-0 flex flex-col gap-4">
        <div className="flex items-center justify-between">
           <div>
             <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Package className="text-indigo-600 dark:text-indigo-400" />
              {t('inventoryTitle')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {t('totalItems')}: <span className="font-semibold text-gray-800 dark:text-gray-200">{items.length}</span>
            </p>
           </div>
        </div>
        
        {/* Search Bar with Split Comboboxes */}
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-12 gap-3 items-center transition-colors">
            
            {/* Factory Filter */}
            <div className="md:col-span-2 relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 focus:border-indigo-500 outline-none text-sm bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200"
                  value={(table.getColumn('factoryCode')?.getFilterValue() as string) ?? ''}
                  onChange={e => table.getColumn('factoryCode')?.setFilterValue(e.target.value || undefined)}
                >
                  <option value="">{t('allFactories')}</option>
                  {uniqueFactories.map(code => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
            </div>

            {/* Item Code Filter (Step 1) */}
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

            {/* Text Search (Step 2/General) */}
            <div className="md:col-span-7 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 outline-none text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                {searchInput && (
                   <button onClick={handleClearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 w-6 h-6 flex items-center justify-center">
                     <span className="text-xs font-bold">✕</span>
                   </button>
                )}
              </div>
              <button onClick={handleSearch} className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-sm whitespace-nowrap">
                {t('searchBtn')}
              </button>
            </div>
        </div>
      </div>

      {/* Full Height Table Container */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col min-h-0 transition-colors">
        <div className="overflow-auto flex-1 w-full">
          <table className="w-full text-left relative border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id} 
                      style={{ width: header.getSize() }}
                      className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors select-none whitespace-nowrap bg-gray-50 dark:bg-gray-900/50"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{ asc: ' 🔼', desc: ' 🔽' }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-colors group">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-3 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-20 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" />
                      <p>{t('noData')}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-900/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
             <span className="text-gray-600 dark:text-gray-400">{t('show')}</span>
             <select
               value={pagination.pageSize === items.length ? 'all' : pagination.pageSize}
               onChange={handlePageSizeChange}
               className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
             >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="50">50</option>
                <option value="all">All</option>
             </select>
             <span className="text-gray-600 dark:text-gray-400 ml-2">{t('rowsPerPage')}</span>
          </div>

          <div className="flex items-center gap-3">
             <span className="text-gray-600 dark:text-gray-400">
               {t('page')} <strong>{table.getState().pagination.pageIndex + 1}</strong> / <strong>{table.getPageCount()}</strong>
             </span>
             
             <div className="flex items-center rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm">
                <button
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 border-r border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 border-r border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 border-r border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 text-gray-600 dark:text-gray-300"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
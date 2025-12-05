import { InventoryItem, Transaction, TransactionType, User } from '../types';

const KEYS = {
  ITEMS: 'inventory_items',
  TRANSACTIONS: 'inventory_transactions',
  USER: 'inventory_user'
};

export const MOCK_DATA: InventoryItem[] = [
  {
    id: '1',
    materialName: '280D/3PLY, BONDED THREAD NY LUBRICATED/CHALK(13B)',
    colorCode: '1013B',
    colorName: 'CHALK(13B)',
    itemCode: 'FQ7261-113',
    unit: 'CON',
    requiredQty: 17.33,
    stockIn: 18,
    factoryCode: '514G',
    type: 'MATERIAL'
  },
  {
    id: '2',
    materialName: '210D/3PLY, BONDED THREAD, NY, LUBRICATED/ORANGE CHALK(79A)',
    colorCode: '1079A',
    colorName: 'ORANGE CHALK(79A)',
    itemCode: 'IQ7166-800',
    unit: 'CON',
    requiredQty: 24,
    stockIn: 27,
    factoryCode: '514G',
    type: 'MATERIAL'
  },
  {
    id: '3',
    materialName: '120D/2PLY, M120, SYLKO, POLY, LUBRICATED/CHALK(13B)',
    colorCode: '1013B',
    colorName: 'CHALK(13B)',
    itemCode: 'FQ7261-113',
    unit: 'CON',
    requiredQty: 9,
    stockIn: 0,
    factoryCode: '514G',
    type: 'MATERIAL'
  },
  {
    id: '4',
    materialName: '200D/1PLY, POLY/CHALK(13B)',
    colorCode: '1013B',
    colorName: 'CHALK(13B)',
    itemCode: 'FQ7261-113',
    unit: 'CON',
    requiredQty: 3.78,
    stockIn: 0,
    factoryCode: '514G',
    type: 'MATERIAL'
  },
  {
    id: '5',
    materialName: '150D/3PLY, POLY/CHALK(13B)',
    colorCode: '1013B',
    colorName: 'CHALK(13B)',
    itemCode: 'FQ7261-113',
    unit: 'CON',
    requiredQty: 5,
    stockIn: 0,
    factoryCode: '514G',
    type: 'MATERIAL'
  },
  {
    id: '6',
    materialName: '5MM, FLAT, POLY, 1TONE, REC, SJL-21040/100CM/CHALK(13B)',
    colorCode: '1013B',
    colorName: 'CHALK(13B)',
    itemCode: 'FQ7261-113',
    unit: 'EA',
    requiredQty: 3000,
    stockIn: 0,
    factoryCode: '514G',
    type: 'MATERIAL'
  },
  {
    id: '7',
    materialName: '5MM, FLAT, POLY, 1TONE, REC, SJL-21040/105CM/CHALK(13B)',
    colorCode: '1013B',
    colorName: 'CHALK(13B)',
    itemCode: 'FQ7261-113',
    unit: 'EA',
    requiredQty: 2000,
    stockIn: 0,
    factoryCode: '514G',
    type: 'MATERIAL'
  },
  {
    id: '8',
    materialName: 'NSW VOMERO PREMIUM (W)/LACE/105CM/6MM, FLAT, 2TONE, SC 1TONE, MB, REC, QQ1091V+TIP 3TONE/ORANGE CHALK(79A)/SAIL(11K)/BLACK(00A)/WHITE(10A)/MULTI-COLOR(92A)',
    colorCode: 'C4465',
    colorName: 'ORANGE CHALK(79A)/SAIL(11K)/BLACK(00A)/WHITE(10A)/MULTI-COLOR(92A)',
    itemCode: 'IQ7166-800',
    unit: 'EA',
    requiredQty: 424,
    stockIn: 0,
    factoryCode: '514G',
    type: 'MATERIAL'
  },
  {
    id: '9',
    materialName: 'NSW VOMERO PREMIUM (W)/LACE/110CM/6MM, FLAT, 2TONE, SC 1TONE, MB, REC, QQ1091V+TIP 3TONE/ORANGE CHALK(79A)/SAIL(11K)/BLACK(00A)/WHITE(10A)/MULTI-COLOR(92A)',
    colorCode: 'C4465',
    colorName: 'ORANGE CHALK(79A)/SAIL(11K)/BLACK(00A)/WHITE(10A)/MULTI-COLOR(92A)',
    itemCode: 'IQ7166-800',
    unit: 'EA',
    requiredQty: 4416,
    stockIn: 0,
    factoryCode: '514G',
    type: 'MATERIAL'
  },
  {
    id: '10',
    materialName: 'NSW VOMERO PREMIUM (W)/LACE/115CM/6MM, FLAT, 2TONE, SC 1TONE, MB, REC, QQ1091V+TIP 3TONE/ORANGE CHALK(79A)/SAIL(11K)/BLACK(00A)/WHITE(10A)/MULTI-COLOR(92A)',
    colorCode: 'C4465',
    colorName: 'ORANGE CHALK(79A)/SAIL(11K)/BLACK(00A)/WHITE(10A)/MULTI-COLOR(92A)',
    itemCode: 'IQ7166-800',
    unit: 'EA',
    requiredQty: 1958,
    stockIn: 0,
    factoryCode: '514G',
    type: 'MATERIAL'
  },
  {
    id: '11',
    materialName: 'ELASTIC TAPE 10MM, NYLON/SPANDEX, BLACK(00A)',
    colorCode: '00A',
    colorName: 'BLACK(00A)',
    itemCode: 'ET-1001',
    unit: 'M',
    requiredQty: 500,
    stockIn: 500,
    factoryCode: '514G',
    type: 'MATERIAL'
  },
  {
    id: '12',
    materialName: 'VELCRO HOOK 20MM, POLYESTER, WHITE(10A)',
    colorCode: '10A',
    colorName: 'WHITE(10A)',
    itemCode: 'VH-2002',
    unit: 'M',
    requiredQty: 250,
    stockIn: 100,
    factoryCode: '514G',
    type: 'MATERIAL'
  },
  {
    id: '13',
    materialName: 'VELCRO LOOP 20MM, POLYESTER, WHITE(10A)',
    colorCode: '10A',
    colorName: 'WHITE(10A)',
    itemCode: 'VL-2002',
    unit: 'M',
    requiredQty: 250,
    stockIn: 100,
    factoryCode: '514G',
    type: 'MATERIAL'
  },
  {
    id: '14',
    materialName: 'ZIPPER #5, METAL, CLOSED END, 20CM, NAVY(42B)',
    colorCode: '42B',
    colorName: 'NAVY(42B)',
    itemCode: 'ZP-5005',
    unit: 'EA',
    requiredQty: 1200,
    stockIn: 1200,
    factoryCode: '514G',
    type: 'MATERIAL'
  },
  {
    id: '15',
    materialName: 'BUTTON 4 HOLE, 18L, PLASTIC, RED(20C)',
    colorCode: '20C',
    colorName: 'RED(20C)',
    itemCode: 'BT-1804',
    unit: 'GRS',
    requiredQty: 50,
    stockIn: 0,
    factoryCode: '514G',
    type: 'MATERIAL'
  },
  {
    id: '16',
    materialName: 'INTERLINING, WOVEN, FUSIBLE, 50G/M2, GREY(80D)',
    colorCode: '80D',
    colorName: 'GREY(80D)',
    itemCode: 'IL-5006',
    unit: 'M',
    requiredQty: 1000,
    stockIn: 500,
    factoryCode: '514G',
    type: 'MATERIAL'
  },
  {
    id: '17',
    materialName: 'LABEL, WOVEN, MAIN LABEL, 50X20MM',
    colorCode: 'N/A',
    colorName: 'MULTI',
    itemCode: 'LB-0001',
    unit: 'EA',
    requiredQty: 5000,
    stockIn: 4500,
    factoryCode: '514G',
    type: 'MATERIAL'
  },
  {
    id: '18',
    materialName: 'PACKING BAG, PE, CLEAR, 30X40CM',
    colorCode: 'CLR',
    colorName: 'CLEAR',
    itemCode: 'PB-3040',
    unit: 'EA',
    requiredQty: 2000,
    stockIn: 2000,
    factoryCode: '514G',
    type: 'MATERIAL'
  },
  {
    id: '19',
    materialName: 'CARTON BOX, 5 PLY, 60X40X40CM',
    colorCode: 'BRN',
    colorName: 'BROWN',
    itemCode: 'CB-6040',
    unit: 'EA',
    requiredQty: 150,
    stockIn: 50,
    factoryCode: '514G',
    type: 'MATERIAL'
  },
  {
    id: '20',
    materialName: 'HANGTAG, PAPER, 300GSM, 40X90MM',
    colorCode: 'N/A',
    colorName: 'WHITE',
    itemCode: 'HT-0002',
    unit: 'EA',
    requiredQty: 5000,
    stockIn: 0,
    factoryCode: '514G',
    type: 'MATERIAL'
  },
];

// Seed initial data if empty
const seedData = () => {
  if (!localStorage.getItem(KEYS.ITEMS)) {
    localStorage.setItem(KEYS.ITEMS, JSON.stringify(MOCK_DATA));
  }
  if (!localStorage.getItem(KEYS.TRANSACTIONS)) {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify([]));
  }
};

seedData();

export const StorageService = {
  getItems: (): InventoryItem[] => {
    const data = localStorage.getItem(KEYS.ITEMS);
    return data ? JSON.parse(data) : [];
  },

  addItem: (item: InventoryItem) => {
    const items = StorageService.getItems();
    items.push(item);
    localStorage.setItem(KEYS.ITEMS, JSON.stringify(items));
  },

  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },

  addTransaction: (transaction: Transaction) => {
    // 1. Save Transaction
    const transactions = StorageService.getTransactions();
    transactions.push(transaction);
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));

    // 2. Update Inventory Quantity (stockIn)
    const items = StorageService.getItems();
    const itemIndex = items.findIndex(i => i.id === transaction.itemId);
    
    if (itemIndex > -1) {
      if (transaction.type === TransactionType.IN) {
        items[itemIndex].stockIn += transaction.quantity;
      } else {
        items[itemIndex].stockIn -= transaction.quantity;
      }
      localStorage.setItem(KEYS.ITEMS, JSON.stringify(items));
    }
  },

  login: (user: User): boolean => {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
    return true;
  },

  logout: () => {
    localStorage.removeItem(KEYS.USER);
  },

  getUser: (): User | null => {
    const data = localStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  }
};
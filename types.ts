
export enum TransactionType {
  IN = 'IN',   // Nhập kho
  OUT = 'OUT'  // Xuất kho
}

export interface InventoryItem {
  id: string;
  materialName: string;
  colorCode: string;
  colorName: string;
  itemCode: string;
  unit: string;
  requiredQty: number;
  stockIn: number; // Số lượng tồn kho hiện tại
  factoryCode: string;
  location?: string; // Vị trí kho (A1-A100)
  type?: 'MATERIAL' | 'PRODUCT'; // Phân loại: Nguyên liệu hoặc Thành phẩm
}

export interface Transaction {
  id: string;
  itemId: string;
  itemName: string;
  type: TransactionType;
  quantity: number;
  date: string; // ISO string
  note: string;
}

export interface User {
  SERVICE_ID: string;
  COMPANY: string;
  EMP_ID: string;
  EMP_NAME: string;
  NAME_ENG: string;
  DEPT: string;
  DEPT_NM: string;
  JOBCD: string;
  JOBCD_NM: string;
  JOB_POSITION: string;
  JOB_POSITION_NM: string;
  PHONE: string | null;
  EMAIL: string | null;
  PHOTO: string | null;
  PHOTO_URL: string | null;
}
import React, { createContext, useContext, useState } from 'react';

type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  vi: {
    // Common Alerts
    success: "Thành công",
    error: "Lỗi",
    warning: "Cảnh báo",
    info: "Thông tin",
    confirm: "Xác nhận",
    cancel: "Hủy",
    processing: "Đang xử lý...",
    missingInfo: "Thiếu thông tin",
    connectionError: "Lỗi kết nối",
    connectionErrorDesc: "Không thể kết nối đến máy chủ xác thực.",
    
    // Login
    loginWelcome: "Xin chào!",
    loginSubtitle: "Quẹt thẻ hoặc nhập mã nhân viên.",
    username: "Mã nhân viên (ID)",
    password: "Mật khẩu",
    signIn: "Đăng nhập",
    loginError: "Mã nhân viên không tồn tại hoặc lỗi kết nối.",
    loginSuccess: "Đăng nhập thành công!",
    enterEmpId: "Vui lòng nhập mã nhân viên",
    rememberMe: "Ghi nhớ mã nhân viên",
    appTitle1: "Quản lý Tồn kho",
    appTitle2: "& Sản xuất",
    appDesc: "Hệ thống theo dõi nhập xuất, định mức pha chế và báo cáo tồn kho hóa chất chính xác.",
    version: "Phiên bản 1.3.0",
    support: "Hỗ trợ",
    languageName: "Tiếng Việt",

    // Operations
    opsTitle: "Nhập / Xuất Kho",
    opsSubtitle: "Tạo phiếu nhập hàng hoặc xuất hàng",
    inbound: "Nhập Kho",
    outbound: "Xuất Kho",
    inboundDesc: "Nhập thêm hàng hóa vào kho. Số lượng tồn kho sẽ tăng lên.",
    outboundDesc: "Xuất hàng hóa khỏi kho. Số lượng tồn kho sẽ giảm đi.",
    createIn: "Tạo phiếu nhập",
    createOut: "Tạo phiếu xuất",
    selectCode: "1. Chọn Mã hàng",
    selectDetail: "2. Chọn Tên chi tiết",
    quantity: "Số lượng",
    note: "Ghi chú (tùy chọn)",
    confirmIn: "Xác nhận Nhập kho",
    confirmOut: "Xác nhận Xuất kho",
    stockErrorTitle: "Lỗi Tồn Kho",
    stockErrorDesc: "Tồn kho hiện tại ({current}) không đủ để xuất {request}.",
    opSuccessDesc: "Đã {type} kho thành công.",
    typeIn: "nhập",
    typeOut: "xuất",

    // Menu
    dashboard: "Tổng quan",
    inventory: "Kho Hóa chất",
    production: "Pha chế & Sản xuất",
    prodInventory: "Kho Thành Phẩm",
    statistics: "Thống kê",
    logout: "Đăng xuất",
    menu: "Danh mục",
    
    // Inventory
    inventoryTitle: "Danh mục Hóa chất",
    inventorySubtitle: "Quản lý nguyên liệu hóa chất đầu vào",
    searchPlaceholder: "Tìm mã CAS, tên hóa chất...",
    searchBtn: "Tìm kiếm",
    filterFactory: "Lọc theo Kho/Xưởng",
    allFactories: "Tất cả kho",
    totalItems: "Tổng mã",
    itemCode: "Mã Hóa chất",
    materialName: "Tên Hóa chất / Sản phẩm",
    color: "Đặc tính/Màu",
    unit: "ĐVT",
    factory: "Kho lưu trữ",
    required: "Định mức",
    stock: "Tồn kho",
    noData: "Không tìm thấy dữ liệu phù hợp.",
    rowsPerPage: "dòng / trang",
    show: "Hiển thị",
    page: "Trang",

    // Production Inventory (New)
    prodInventoryTitle: "Tồn kho Thành Phẩm",
    prodInventorySubtitle: "Quản lý và xuất bán thành phẩm hóa chất",
    exportOut: "Xuất hàng",
    exportTitle: "Xuất Kho Thành Phẩm",
    exportReason: "Lý do / Khách hàng",
    exportQty: "Số lượng xuất",
    confirmExport: "Xác nhận Xuất",
    exportSuccess: "Đã xuất hàng thành công!",
    exportStockError: "Tồn kho chỉ còn {current} {unit}.",
    exportSuccessDetail: "Đã xuất {qty} {unit} thành công!",

    // Production
    productionTitle: "Pha chế & Sản xuất",
    productionSubtitle: "Tạo thành phẩm từ các loại hóa chất",
    
    // Step 1: Target
    step1Title: "1. Chọn Thành Phẩm (Đích)",
    selectMaster: "-- Chọn Công thức Master --",
    masterName: "Tên Thành phẩm",
    masterCode: "Mã Công thức",
    
    // Step 2: Source
    step2Title: "2. Chọn Hóa chất (Nguồn)",
    addSourceBtn: "Thêm Hóa chất",
    sourceList: "Danh sách hóa chất đã chọn",
    remove: "Xóa",
    noSourceSelected: "Chưa chọn hóa chất nào.",
    
    // Step 3: Calculation
    step3Title: "3. Tổng hợp & Kết quả",
    totalSourceWeight: "Tổng trọng lượng nguồn",
    adjustment: "Điều chỉnh (+/- Kg/L)",
    adjustmentHint: "Nhập số âm nếu bay hơi, số dương nếu thêm dung môi phụ",
    finalOutput: "Thành phẩm tạo ra",
    destWarehouse: "Kho Nhập (Thành phẩm)",
    
    // General Production
    selectMaterial: "-- Chọn hóa chất --",
    currentStock: "Tồn",
    usedQty: "Sử dụng",
    factoryCode: "Mã kho",
    transformBtn: "Xác nhận Pha chế",
    successTransform: "Sản xuất thành công!",
    successTransformDetail: "Đã nhập kho {qty} {unit} thành phẩm.",
    errorStock: "Số lượng sử dụng vượt quá tồn kho!",
    errorStockDetail: "Tồn kho hiện tại: {current} {unit}. Bạn đang nhập: {request}.",
    fillAll: "Vui lòng chọn thành phẩm và ít nhất 1 hóa chất thành phần",
    invalidOutput: "Khối lượng thành phẩm phải lớn hơn 0",
    selectDestFactory: "Vui lòng chọn Kho Nhập",
    confirmProdTitle: "Xác nhận sản xuất?",
    confirmProdHtml: "Bạn sẽ tạo ra <b>{qty} {unit}</b> <br/> {name}",
    
    // Home
    welcome: "Quản lý Tồn kho Hóa chất",
    systemDesc: "Hệ thống theo dõi nhập xuất và tồn kho hóa chất chính xác",
    cardInventory: "Tra cứu Hóa chất",
    cardStats: "Báo cáo chi tiết",
    cardProd: "Pha chế",
    cardProdDesc: "Tạo thành phẩm mới",
    cardProdInv: "Kho Thành Phẩm",
    cardProdInvDesc: "Xem tồn và Xuất hàng",

    // Statistics (Updated)
    statsTitle: "Thống kê chi tiết",
    statsSubtitle: "Lịch sử nhập xuất và báo cáo",
    typeAll: "Tất cả",
    typeMaterial: "Hóa chất (Nguyên liệu)",
    typeProduct: "Thành phẩm (Pha chế)",
    selectItem: "-- Tất cả Mã hàng --",
    filterDateFrom: "Từ:",
    filterDateTo: "Đến:",
    chartTitle: "Biểu đồ Nhập / Xuất",
    transDetail: "Chi tiết giao dịch",
    noTrans: "Không có giao dịch nào phù hợp.",
    aiAnalysis: "AI Phân Tích",
    aiHint: "Bấm nút bên dưới để AI phân tích xu hướng kho hàng dựa trên dữ liệu lọc hiện tại.",
    aiBtn: "Phân tích ngay",
    aiThinking: "Đang suy nghĩ...",

    // 404 Not Found
    notFoundTitle: "Không tìm thấy trang",
    notFoundDesc: "Trang bạn tìm kiếm không tồn tại hoặc đã bị xóa.",
    backHome: "Về Trang chủ",
  },
  en: {
    // Common Alerts
    success: "Success",
    error: "Error",
    warning: "Warning",
    info: "Info",
    confirm: "Confirm",
    cancel: "Cancel",
    processing: "Processing...",
    missingInfo: "Missing Information",
    connectionError: "Connection Error",
    connectionErrorDesc: "Cannot connect to authentication server.",

    // Login
    loginWelcome: "Welcome back!",
    loginSubtitle: "Please scan your card or enter Employee ID.",
    username: "Employee ID",
    password: "Password",
    signIn: "Sign In",
    loginError: "Invalid Employee ID or connection error.",
    loginSuccess: "Login Successful!",
    enterEmpId: "Please enter Employee ID",
    rememberMe: "Remember ID",
    appTitle1: "Inventory Management",
    appTitle2: "& Production",
    appDesc: "Precise system for tracking import/export, mixing formulas, and chemical inventory reporting.",
    version: "Version 1.3.0",
    support: "Support",
    languageName: "English",

    // Operations
    opsTitle: "Inbound / Outbound",
    opsSubtitle: "Create stock in or stock out tickets",
    inbound: "Inbound",
    outbound: "Outbound",
    inboundDesc: "Add items to inventory. Stock levels will increase.",
    outboundDesc: "Remove items from inventory. Stock levels will decrease.",
    createIn: "Create In-Ticket",
    createOut: "Create Out-Ticket",
    selectCode: "1. Select Item Code",
    selectDetail: "2. Select Detail Item",
    quantity: "Quantity",
    note: "Note (Optional)",
    confirmIn: "Confirm Inbound",
    confirmOut: "Confirm Outbound",
    stockErrorTitle: "Stock Error",
    stockErrorDesc: "Current stock ({current}) is insufficient for request {request}.",
    opSuccessDesc: "Successfully {type} items.",
    typeIn: "imported",
    typeOut: "exported",

    // Menu
    dashboard: "Dashboard",
    inventory: "Chemical Inventory",
    production: "Mixing & Production",
    prodInventory: "Finished Goods",
    statistics: "Statistics",
    logout: "Logout",
    menu: "Menu",

    // Inventory
    inventoryTitle: "Chemical Inventory",
    inventorySubtitle: "Manage raw chemical materials",
    searchPlaceholder: "Search CAS, name...",
    searchBtn: "Search",
    filterFactory: "Filter by Warehouse",
    allFactories: "All Warehouses",
    totalItems: "Total Items",
    itemCode: "Chemical Code",
    materialName: "Chemical / Product Name",
    color: "Properties/Color",
    unit: "Unit",
    factory: "Warehouse",
    required: "Required",
    stock: "Stock",
    noData: "No matching data found.",
    rowsPerPage: "rows / page",
    show: "Show",
    page: "Page",

    // Production Inventory (New)
    prodInventoryTitle: "Finished Goods Inventory",
    prodInventorySubtitle: "Manage and export produced chemicals",
    exportOut: "Export Out",
    exportTitle: "Export Finished Goods",
    exportReason: "Reason / Customer",
    exportQty: "Export Quantity",
    confirmExport: "Confirm Export",
    exportSuccess: "Exported successfully!",
    exportStockError: "Stock only has {current} {unit} remaining.",
    exportSuccessDetail: "Successfully exported {qty} {unit}!",

    // Production
    productionTitle: "Mixing & Production",
    productionSubtitle: "Create finished products from chemicals",

    // Step 1: Target
    step1Title: "1. Select Target Product",
    selectMaster: "-- Select Master Formula --",
    masterName: "Product Name",
    masterCode: "Formula Code",

    // Step 2: Source
    step2Title: "2. Select Source Chemicals",
    addSourceBtn: "Add Chemical",
    sourceList: "Selected Chemicals",
    remove: "Remove",
    noSourceSelected: "No chemicals selected yet.",

    // Step 3: Calculation
    step3Title: "3. Summary & Result",
    totalSourceWeight: "Total Source Weight",
    adjustment: "Adjustment (+/- Kg/L)",
    adjustmentHint: "Negative for evaporation, positive for additives",
    finalOutput: "Final Output Quantity",
    destWarehouse: "Dest. Warehouse",

    // General Production
    selectMaterial: "-- Select Chemical --",
    currentStock: "Stock",
    usedQty: "Used",
    factoryCode: "Warehouse Code",
    transformBtn: "Confirm Mixing",
    successTransform: "Production Successful!",
    successTransformDetail: "Stocked in {qty} {unit} of finished product.",
    errorStock: "Usage quantity exceeds current stock!",
    errorStockDetail: "Current stock: {current} {unit}. You requested: {request}.",
    fillAll: "Please select a target and at least 1 source chemical",
    invalidOutput: "Output quantity must be greater than 0",
    selectDestFactory: "Please select Destination Warehouse",
    confirmProdTitle: "Confirm Production?",
    confirmProdHtml: "You are about to produce <b>{qty} {unit}</b> <br/> {name}",

    // Home
    welcome: "Chemical Inventory",
    systemDesc: "Precise chemical tracking and management system",
    cardInventory: "Check Chemicals",
    cardStats: "Detailed Reports",
    cardProd: "Mixing",
    cardProdDesc: "Create new products",
    cardProdInv: "Finished Goods",
    cardProdInvDesc: "Check stock & Export",

    // Statistics (Updated)
    statsTitle: "Detailed Statistics",
    statsSubtitle: "Transaction history and reports",
    typeAll: "All",
    typeMaterial: "Chemicals (Raw)",
    typeProduct: "Products (Finished)",
    selectItem: "-- All Items --",
    filterDateFrom: "From:",
    filterDateTo: "To:",
    chartTitle: "Import / Export Chart",
    transDetail: "Transaction Details",
    noTrans: "No matching transactions found.",
    aiAnalysis: "AI Analysis",
    aiHint: "Click below to let AI analyze inventory trends based on current filters.",
    aiBtn: "Analyze Now",
    aiThinking: "Thinking...",

    // 404 Not Found
    notFoundTitle: "Page Not Found",
    notFoundDesc: "The page you are looking for does not exist or has been removed.",
    backHome: "Go to Home",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('vi');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'vi' ? 'en' : 'vi');
  };

  const t = (key: string) => {
    // @ts-ignore
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
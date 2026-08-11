export type TableStatus = 'EMPTY' | 'OCCUPIED' | 'WAITING_PAYMENT' | 'RESERVED';

export interface Table {
  id: string;
  name: string; // e.g. "Bàn 01", "Bàn VIP 2"
  floor: string; // "Tầng 1", "Tầng 2", "Sân thượng", "Mang về"
  seats: number;
  status: TableStatus;
  currentOrderId?: string;
  updatedAt: string;
}

export interface ToppingOption {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  code: string;
  price: number;
  category: string;
  imageUrl: string;
  compressedSizeKb?: number;
  isBestSeller?: boolean;
  isAvailable: boolean;
  rank: number;
  options?: {
    title: string;
    choices: ToppingOption[];
  }[];
}

export interface SelectedTopping {
  optionTitle: string;
  topping: ToppingOption;
}

export interface OrderItem {
  id: string; // Unique instance ID in order
  menuItemId: string;
  name: string;
  basePrice: number;
  quantity: number;
  selectedToppings: SelectedTopping[];
  unitPrice: number; // basePrice + toppings total
  totalPrice: number; // unitPrice * quantity
  note?: string;
}

export type OrderStatus = 'PENDING' | 'PREPARING' | 'SERVED' | 'PAID' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'VIETQR' | 'CARD';

export interface Order {
  id: string;
  code: string; // e.g. "HD-1029"
  tableId: string;
  tableName: string;
  customerCount: number;
  items: OrderItem[];
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  discountPercent: number;
  discountAmount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  createdAt: string;
  paidAt?: string;
  kitchenPrintedAt?: string;
  invoicePrintedAt?: string;
  isCachedInDailyLog: boolean; // Flag for Tiered Storage inspection
  customerPhone?: string;
  earnedPoints?: number;
}

export interface PermanentRevenueAggregate {
  date: string; // YYYY-MM-DD
  totalRevenue: number;
  totalOrders: number;
  cashRevenue: number;
  qrRevenue: number;
  cardRevenue: number;
  lastPurgeTime?: string;
}

export interface SystemMetrics {
  calculationLatencyMs: number;
  renderLatencyMs: number;
  cachedOrdersCount: number;
  permanentRevenueTotal: number;
  activeAsyncJobs: number;
  lastAutoPurgeAt?: string;
}

export interface PrintSettings {
  restaurantName: string;
  address: string;
  phone: string;
  wifiName?: string;
  wifiPassword?: string;
  paperSize: 'K80' | 'K57';
  tempPaperSize?: 'K80' | 'K57';
  shiftPaperSize?: 'K80' | 'K57';
  connectionType?: 'USB' | 'WIFI_LAN';
  usbDeviceName?: string;
  lanIpAddress?: string;
  fontSizePx?: number; // 10, 11, 12, 13, 14, 15
  invoiceCopies?: number; // Default 2
  tempInvoiceCopies?: number; // Default 1
  shiftCopies?: number; // Default 1
  optimizeReceiptLength?: boolean; // True to compress receipt margins & blank lines
  enableAutoCut?: boolean; // Tự động cắt bill sau khi in
  useAsciiGridTable?: boolean; // Hiển thị khung bảng +-----+----+-----+ siêu ngắn gọn
  headerNote: string;
  footerNote: string;
  showVat: boolean;
  showQrCode: boolean;
  bankAccount: {
    bankName: string;
    accountNo: string;
    accountName: string;
  };
}

export interface Customer {
  id: string;
  phone: string;
  name: string;
  points: number;
  totalSpent: number;
  ordersCount: number;
  createdAt: string;
}

export interface ShiftRecord {
  id: string;
  cashierName: string;
  startTime: string;
  endTime?: string;
  initialCash: number;
  expectedCashRevenue: number;
  actualCashDrawer: number;
  difference: number;
  totalOrdersInShift: number;
  totalShiftRevenue: number;
  note?: string;
  status: 'OPEN' | 'CLOSED';
}

export interface GameQuestion {
  id: string;
  prompt: string; // e.g. "Khách gọi: 2 Chả Giò Hải Sản + 1 Cà Phê Sữa"
  targetItemIds: string[];
  optionsChoices: string[];
  correctItemId: string;
  timeLimitSec: number;
}

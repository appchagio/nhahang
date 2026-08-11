import {
  Order,
  PermanentRevenueAggregate,
  Table,
  MenuItem,
  PrintSettings,
  SystemMetrics
} from '../types';
import { INITIAL_TABLES, INITIAL_MENU_ITEMS, INITIAL_PRINT_SETTINGS } from '../data/initialData';

const STORAGE_KEYS = {
  TABLES: 'pos_tables_v1',
  MENU: 'pos_menu_v4',
  CACHED_ORDERS: 'pos_cached_orders_v1',
  PERMANENT_REVENUE: 'pos_permanent_revenue_v1',
  PRINT_SETTINGS: 'pos_print_settings_v1',
  LAST_PURGE: 'pos_last_purge_time_v1',
};

// Seed initial orders for today and historical revenue
const INITIAL_PERMANENT_REVENUE: PermanentRevenueAggregate[] = [
  {
    date: '2026-08-08',
    totalRevenue: 14250000,
    totalOrders: 48,
    cashRevenue: 6200000,
    qrRevenue: 6050000,
    cardRevenue: 2000000,
    lastPurgeTime: '2026-08-08T24:00:00.000Z'
  },
  {
    date: '2026-08-09',
    totalRevenue: 18900000,
    totalOrders: 62,
    cashRevenue: 7500000,
    qrRevenue: 9400000,
    cardRevenue: 2000000,
    lastPurgeTime: '2026-08-09T24:00:00.000Z'
  }
];

// Seed active cached orders for today
const INITIAL_CACHED_ORDERS: Order[] = [
  {
    id: 'ord-101',
    code: 'HD-1001',
    tableId: 't1',
    tableName: 'Bàn 01',
    customerCount: 3,
    items: [
      {
        id: 'i1',
        menuItemId: 'm1',
        name: 'Phở Bò Đặc Biệt',
        basePrice: 65000,
        quantity: 2,
        selectedToppings: [{ optionTitle: 'Thêm Topping Bò', topping: { id: 'top-1', name: 'Thêm Tái/Nạm', price: 15000 } }],
        unitPrice: 80000,
        totalPrice: 160000,
        note: 'Ít bánh phở, thêm ngò'
      },
      {
        id: 'i2',
        menuItemId: 'm5',
        name: 'Cà Phê Sữa Đá Sài Gòn',
        basePrice: 29000,
        quantity: 3,
        selectedToppings: [],
        unitPrice: 29000,
        totalPrice: 87000,
        note: 'Đậm đà'
      }
    ],
    subtotal: 247000,
    taxPercent: 8,
    taxAmount: 19760,
    discountPercent: 0,
    discountAmount: 0,
    totalAmount: 266760,
    status: 'PREPARING',
    createdAt: new Date().toISOString(),
    isCachedInDailyLog: true
  },
  {
    id: 'ord-102',
    code: 'HD-1002',
    tableId: 't2',
    tableName: 'Bàn 02',
    customerCount: 2,
    items: [
      {
        id: 'i3',
        menuItemId: 'm2',
        name: 'Bún Chả Hà Nội Classic',
        basePrice: 55000,
        quantity: 2,
        selectedToppings: [{ optionTitle: 'Thêm Nem Rán', topping: { id: 'top-4', name: 'Thêm 1 Nem Cua Bể', price: 20000 } }],
        unitPrice: 75000,
        totalPrice: 150000,
        note: 'Nước chấm ấm'
      },
      {
        id: 'i4',
        menuItemId: 'm6',
        name: 'Trà Đào Cam Sả Tươi',
        basePrice: 39000,
        quantity: 2,
        selectedToppings: [],
        unitPrice: 39000,
        totalPrice: 78000
      }
    ],
    subtotal: 228000,
    taxPercent: 8,
    taxAmount: 18240,
    discountPercent: 5,
    discountAmount: 11400,
    totalAmount: 234840,
    status: 'SERVED',
    createdAt: new Date().toISOString(),
    isCachedInDailyLog: true
  }
];

export class POSStorageEngine {
  // Get Tables
  static getTables(): Table[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TABLES);
    if (!raw) {
      this.saveTables(INITIAL_TABLES);
      return INITIAL_TABLES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_TABLES;
    }
  }

  static saveTables(tables: Table[]): void {
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
  }

  // Get Menu Items
  static getMenu(): MenuItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MENU);
    if (!raw) {
      this.saveMenu(INITIAL_MENU_ITEMS);
      return INITIAL_MENU_ITEMS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_MENU_ITEMS;
    }
  }

  static saveMenu(menu: MenuItem[]): void {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu));
  }

  // Get Cached Daily Orders
  static getCachedOrders(): Order[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CACHED_ORDERS);
    if (!raw) {
      this.saveCachedOrders(INITIAL_CACHED_ORDERS);
      return INITIAL_CACHED_ORDERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CACHED_ORDERS;
    }
  }

  static saveCachedOrders(orders: Order[]): void {
    localStorage.setItem(STORAGE_KEYS.CACHED_ORDERS, JSON.stringify(orders));
  }

  // Get Permanent Revenue Records
  static getPermanentRevenue(): PermanentRevenueAggregate[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PERMANENT_REVENUE);
    if (!raw) {
      this.savePermanentRevenue(INITIAL_PERMANENT_REVENUE);
      return INITIAL_PERMANENT_REVENUE;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PERMANENT_REVENUE;
    }
  }

  static savePermanentRevenue(records: PermanentRevenueAggregate[]): void {
    localStorage.setItem(STORAGE_KEYS.PERMANENT_REVENUE, JSON.stringify(records));
  }

  // Delete permanent revenue by specific date (e.g. "2026-08-11")
  static deleteRevenueByDate(dateStr: string): PermanentRevenueAggregate[] {
    const records = this.getPermanentRevenue();
    const updated = records.filter((r) => r.date !== dateStr);
    this.savePermanentRevenue(updated);
    return updated;
  }

  // Delete permanent revenue by month (e.g. "2026-08")
  static deleteRevenueByMonth(yearMonthStr: string): PermanentRevenueAggregate[] {
    const records = this.getPermanentRevenue();
    const updated = records.filter((r) => !r.date.startsWith(yearMonthStr));
    this.savePermanentRevenue(updated);
    return updated;
  }

  // Delete permanent revenue by year (e.g. "2026")
  static deleteRevenueByYear(yearStr: string): PermanentRevenueAggregate[] {
    const records = this.getPermanentRevenue();
    const updated = records.filter((r) => !r.date.startsWith(yearStr));
    this.savePermanentRevenue(updated);
    return updated;
  }

  // Get Print Settings
  static getPrintSettings(): PrintSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.PRINT_SETTINGS);
    if (!raw) {
      this.savePrintSettings(INITIAL_PRINT_SETTINGS);
      return INITIAL_PRINT_SETTINGS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PRINT_SETTINGS;
    }
  }

  static savePrintSettings(settings: PrintSettings): void {
    localStorage.setItem(STORAGE_KEYS.PRINT_SETTINGS, JSON.stringify(settings));
  }

  // Save or Update a single Order
  static saveOrder(order: Order): void {
    const orders = this.getCachedOrders();
    const index = orders.findIndex((o) => o.id === order.id);
    if (index >= 0) {
      orders[index] = order;
    } else {
      orders.push(order);
    }
    this.saveCachedOrders(orders);

    // If order is paid, update permanent revenue aggregate
    if (order.status === 'PAID') {
      this.aggregatePaidOrderToPermanentStorage(order);
    }
  }

  // Aggregate paid order into Permanent Storage without relying on detailed order log retention
  private static aggregatePaidOrderToPermanentStorage(order: Order): void {
    const today = new Date().toISOString().split('T')[0];
    const revenueRecords = this.getPermanentRevenue();
    let todayRecord = revenueRecords.find((r) => r.date === today);

    if (!todayRecord) {
      todayRecord = {
        date: today,
        totalRevenue: 0,
        totalOrders: 0,
        cashRevenue: 0,
        qrRevenue: 0,
        cardRevenue: 0,
      };
      revenueRecords.push(todayRecord);
    }

    todayRecord.totalRevenue += order.totalAmount;
    todayRecord.totalOrders += 1;

    if (order.paymentMethod === 'CASH') todayRecord.cashRevenue += order.totalAmount;
    else if (order.paymentMethod === 'VIETQR') todayRecord.qrRevenue += order.totalAmount;
    else if (order.paymentMethod === 'CARD') todayRecord.cardRevenue += order.totalAmount;

    this.savePermanentRevenue(revenueRecords);
  }

  /**
   * AUTO-PURGE BACKGROUND JOB (24:00 Purge Mechanism)
   * Purges short-term cached order details (item logs) from RAM/LocalStorage Cache,
   * keeping ONLY the permanent revenue totals intact.
   */
  static executeAutoPurge(): { purgedCount: number; purgedBytesEst: number; purgeTime: string } {
    const orders = this.getCachedOrders();
    const totalPaidOrders = orders.filter((o) => o.status === 'PAID');
    const bytesBefore = JSON.stringify(orders).length;

    // Retain only currently unpaid active table orders (if any)
    const activeUnpaidOrders = orders.filter((o) => o.status !== 'PAID' && o.status !== 'CANCELLED');
    this.saveCachedOrders(activeUnpaidOrders);

    const bytesAfter = JSON.stringify(activeUnpaidOrders).length;
    const purgeTime = new Date().toISOString();

    localStorage.setItem(STORAGE_KEYS.LAST_PURGE, purgeTime);

    return {
      purgedCount: totalPaidOrders.length,
      purgedBytesEst: Math.max(0, bytesBefore - bytesAfter),
      purgeTime,
    };
  }

  static getLastPurgeTime(): string | null {
    return localStorage.getItem(STORAGE_KEYS.LAST_PURGE);
  }

  // Calculate System Performance & Storage Metrics
  static getSystemMetrics(calcLatencyMs: number = 0.12): SystemMetrics {
    const cachedOrders = this.getCachedOrders();
    const permanentRevenue = this.getPermanentRevenue();
    const totalRevenueSum = permanentRevenue.reduce((sum, r) => sum + r.totalRevenue, 0);

    return {
      calculationLatencyMs: calcLatencyMs,
      renderLatencyMs: 0,
      cachedOrdersCount: cachedOrders.length,
      permanentRevenueTotal: totalRevenueSum,
      activeAsyncJobs: 0,
      lastAutoPurgeAt: this.getLastPurgeTime() || undefined,
    };
  }
}

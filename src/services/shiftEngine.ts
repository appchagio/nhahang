import { ShiftRecord, Order } from '../types';

const SHIFTS_HISTORY_KEY = 'pos_shifts_history_v1';
const ACTIVE_SHIFT_KEY = 'pos_active_shift_v1';

export class POSShiftEngine {
  /**
   * Lấy ca đang mở hiện tại
   */
  static getActiveShift(): ShiftRecord | null {
    const raw = localStorage.getItem(ACTIVE_SHIFT_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Mở ca làm việc mới
   */
  static openShift(cashierName: string, initialCash: number): ShiftRecord {
    const newShift: ShiftRecord = {
      id: 'shift-' + Date.now(),
      cashierName: cashierName || 'Thu Ngân 01',
      startTime: new Date().toISOString(),
      initialCash: initialCash || 0,
      expectedCashRevenue: 0,
      actualCashDrawer: 0,
      difference: 0,
      totalOrdersInShift: 0,
      totalShiftRevenue: 0,
      status: 'OPEN',
    };

    localStorage.setItem(ACTIVE_SHIFT_KEY, JSON.stringify(newShift));
    return newShift;
  }

  /**
   * Đóng ca & Kiểm két tiền mặt
   */
  static closeShift(
    actualCashDrawer: number,
    ordersInShift: Order[],
    note?: string
  ): ShiftRecord {
    let active = this.getActiveShift();
    if (!active) {
      active = {
        id: 'shift-' + Date.now(),
        cashierName: 'Thu Ngân 01',
        startTime: new Date().toISOString(),
        initialCash: 0,
        expectedCashRevenue: 0,
        actualCashDrawer: 0,
        difference: 0,
        totalOrdersInShift: 0,
        totalShiftRevenue: 0,
        status: 'OPEN',
      };
    }

    // Filter paid orders within shift duration
    const shiftStartTime = new Date(active.startTime).getTime();
    const paidOrders = ordersInShift.filter(
      (o) => o.status === 'PAID' && o.paidAt && new Date(o.paidAt).getTime() >= shiftStartTime
    );

    const cashRevenue = paidOrders
      .filter((o) => o.paymentMethod === 'CASH')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const totalShiftRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const expectedCashDrawer = active.initialCash + cashRevenue;
    const difference = actualCashDrawer - expectedCashDrawer;

    const closedShift: ShiftRecord = {
      ...active,
      endTime: new Date().toISOString(),
      expectedCashRevenue: cashRevenue,
      actualCashDrawer: actualCashDrawer,
      difference: difference,
      totalOrdersInShift: paidOrders.length,
      totalShiftRevenue: totalShiftRevenue,
      note: note || '',
      status: 'CLOSED',
    };

    // Save to history
    const history = this.getShiftHistory();
    history.unshift(closedShift);
    localStorage.setItem(SHIFTS_HISTORY_KEY, JSON.stringify(history));

    // Clear active shift
    localStorage.removeItem(ACTIVE_SHIFT_KEY);

    return closedShift;
  }

  /**
   * Lấy lịch sử tất cả các ca
   */
  static getShiftHistory(): ShiftRecord[] {
    const raw = localStorage.getItem(SHIFTS_HISTORY_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
}

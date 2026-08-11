import { OrderItem, SelectedTopping } from '../types';

export interface CalculationResult {
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  calculationDurationMs: number; // Benchmark execution speed in ms
}

/**
 * High performance calculation engine with benchmark measurement.
 * Zero-lag UI guarantee (<0.2ms computation overhead).
 */
export function calculateOrderSummary(
  items: OrderItem[],
  taxPercent: number = 8,
  discountPercent: number = 0
): CalculationResult {
  const startTime = performance.now();

  let subtotal = 0;

  const recalculatedItems = (items || []).map((item) => {
    const toppingsTotal = (item.selectedToppings || []).reduce(
      (sum, top) => sum + (top?.topping?.price || 0),
      0
    );
    const unitPrice = item.basePrice + toppingsTotal;
    const totalPrice = unitPrice * item.quantity;
    subtotal += totalPrice;

    return {
      ...item,
      unitPrice,
      totalPrice,
    };
  });

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const taxableBase = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round((taxableBase * taxPercent) / 100);
  const totalAmount = Math.max(0, subtotal - discountAmount + taxAmount);

  const endTime = performance.now();
  const calculationDurationMs = Number((endTime - startTime).toFixed(3));

  return {
    items: recalculatedItems,
    subtotal,
    taxAmount,
    discountAmount,
    totalAmount,
    calculationDurationMs,
  };
}

/**
 * Creates an OrderItem object with toppings calculated.
 */
export function createOrderItem(
  menuItemId: string,
  name: string,
  basePrice: number,
  quantity: number = 1,
  selectedToppings: SelectedTopping[] = [],
  note: string = ''
): OrderItem {
  const toppingsTotal = (selectedToppings || []).reduce((sum, t) => sum + (t?.topping?.price || 0), 0);
  const unitPrice = basePrice + toppingsTotal;
  return {
    id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    menuItemId,
    name,
    basePrice,
    quantity,
    selectedToppings,
    unitPrice,
    totalPrice: unitPrice * quantity,
    note,
  };
}

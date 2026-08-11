import { Customer } from '../types';

const CUSTOMERS_KEY = 'pos_customers_v1';

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    phone: '0908111222',
    name: 'Nguyễn Văn An',
    points: 150,
    totalSpent: 1500000,
    ordersCount: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cust-2',
    phone: '0912333444',
    name: 'Trần Thị Mai',
    points: 280,
    totalSpent: 2800000,
    ordersCount: 8,
    createdAt: new Date().toISOString(),
  },
];

export class POSLoyaltyEngine {
  static getCustomers(): Customer[] {
    const raw = localStorage.getItem(CUSTOMERS_KEY);
    if (!raw) {
      this.saveCustomers(INITIAL_CUSTOMERS);
      return INITIAL_CUSTOMERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CUSTOMERS;
    }
  }

  static saveCustomers(customers: Customer[]): void {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  }

  static findCustomerByPhone(phone: string): Customer | null {
    if (!phone || !phone.trim()) return null;
    const cleanPhone = phone.trim();
    const list = this.getCustomers();
    return list.find((c) => c.phone === cleanPhone) || null;
  }

  static addOrUpdateCustomer(phone: string, name?: string): Customer {
    const list = this.getCustomers();
    const cleanPhone = phone.trim();
    let existing = list.find((c) => c.phone === cleanPhone);

    if (existing) {
      if (name && name.trim()) existing.name = name.trim();
    } else {
      existing = {
        id: 'cust-' + Date.now(),
        phone: cleanPhone,
        name: name || `Khách hàng ${cleanPhone.slice(-4)}`,
        points: 0,
        totalSpent: 0,
        ordersCount: 0,
        createdAt: new Date().toISOString(),
      };
      list.push(existing);
    }

    this.saveCustomers(list);
    return existing;
  }

  /**
   * Tích điểm tự động: 10.000đ = 1 điểm
   */
  static addPointsForPaidOrder(
    phone: string,
    totalAmount: number
  ): { customer: Customer; pointsEarned: number } {
    const customer = this.addOrUpdateCustomer(phone);
    const pointsEarned = Math.floor(totalAmount / 10000);

    customer.points += pointsEarned;
    customer.totalSpent += totalAmount;
    customer.ordersCount += 1;

    const list = this.getCustomers();
    const index = list.findIndex((c) => c.id === customer.id);
    if (index >= 0) list[index] = customer;
    this.saveCustomers(list);

    return { customer, pointsEarned };
  }
}

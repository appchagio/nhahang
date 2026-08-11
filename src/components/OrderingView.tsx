import React, { useState, useMemo } from 'react';
import {
  Table,
  MenuItem,
  Order,
  OrderItem,
  SelectedTopping,
  ToppingOption,
  PrintSettings,
  PaymentMethod
} from '../types';
import { calculateOrderSummary, createOrderItem } from '../services/calcEngine';
import { printDirectUsbEscPos, removeVietnameseAccents } from '../services/usbPrinterService';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Utensils,
  Flame,
  CheckCircle2,
  X,
  Zap,
  MessageSquare,
  ShoppingBag
} from 'lucide-react';

interface OrderingViewProps {
  tables?: Table[];
  menu?: MenuItem[];
  activeTableId?: string;
  onSelectTable?: (tableId: string) => void;
  activeOrder?: Order | null;
  printSettings?: PrintSettings;
  onUpdateOrder?: (order: Order) => void;
  onConfirmPayment?: (orderId: string, method: PaymentMethod) => void;
}

export const OrderingView: React.FC<OrderingViewProps> = ({
  tables = [],
  menu = [],
  activeTableId = 't1',
  onSelectTable,
  activeOrder = null,
  printSettings = {
    restaurantName: 'CHA GIO BAP QUANG NGAI',
    address: '87, Hung Vuong, Phuong Ba Ria, TP HCM',
    phone: '0972371722',
    paperSize: 'K80',
    headerNote: 'Chào mừng quý khách!',
    footerNote: 'CAM ON VA HEN GAP LAI QUY KHACH!',
    showVat: false,
    showQrCode: false,
    invoiceCopies: 2,
    fontSizePx: 26,
    bankAccount: { bankName: 'MBBANK', accountNo: '0972371722', accountName: 'CHA GIO BAP QUANG NGAI' }
  },
  onUpdateOrder,
  onConfirmPayment,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [lastPaidOrderForPrint, setLastPaidOrderForPrint] = useState<Order | null>(null);

  // Modal topping state
  const [toppingItem, setToppingItem] = useState<MenuItem | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<SelectedTopping[]>([]);
  const [itemNote, setItemNote] = useState<string>('');

  // Active table
  const currentTable = useMemo(() => {
    const list = tables || [];
    return list.find((t) => t.id === activeTableId) || list[0] || { id: 't1', name: 'Bán Mang Về' };
  }, [tables, activeTableId]);

  // Current items in current order
  const currentItems = useMemo(() => {
    return activeOrder?.items || [];
  }, [activeOrder]);

  const calcSummary = useMemo(() => {
    return calculateOrderSummary(currentItems, taxPercent, discountPercent);
  }, [currentItems, taxPercent, discountPercent]);

  // Categories list
  const categories = useMemo(() => {
    const rawMenu = menu || [];
    const set = new Set(rawMenu.map((m) => m?.category).filter(Boolean));
    return ['Tất cả', ...Array.from(set)];
  }, [menu]);

  // Filtered menu
  const filteredMenu = useMemo(() => {
    const rawMenu = menu || [];
    return rawMenu.filter((item) => {
      if (!item) return false;
      const matchCat = selectedCategory === 'Tất cả' || item.category === selectedCategory;
      const matchSearch =
        (item.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        (item.code || '').toLowerCase().includes((searchQuery || '').toLowerCase());
      return matchCat && matchSearch && item.isAvailable;
    });
  }, [menu, selectedCategory, searchQuery]);

  // Handle One-touch add item to order
  const handleAddItemToCart = (item: MenuItem) => {
    if (!item) return;
    if (item.options && item.options.length > 0) {
      setToppingItem(item);
      setSelectedToppings([]);
      setItemNote('');
      return;
    }

    const newItem = createOrderItem(item.id, item.name, item.price, 1, [], '');
    addOrMergeOrderItem(newItem);
  };

  const handleConfirmToppings = () => {
    if (!toppingItem) return;
    const newItem = createOrderItem(
      toppingItem.id,
      toppingItem.name,
      toppingItem.price,
      1,
      selectedToppings,
      itemNote
    );
    addOrMergeOrderItem(newItem);
    setToppingItem(null);
  };

  const addOrMergeOrderItem = (newItem: OrderItem) => {
    let updatedItems = [...currentItems];
    
    const existingIndex = updatedItems.findIndex(
      (i) =>
        i &&
        i.menuItemId === newItem.menuItemId &&
        JSON.stringify(i.selectedToppings || []) === JSON.stringify(newItem.selectedToppings || []) &&
        (i.note || '') === (newItem.note || '')
    );

    if (existingIndex >= 0) {
      const existing = updatedItems[existingIndex];
      const newQty = (existing.quantity || 1) + 1;
      const unitPrice = existing.unitPrice || newItem.unitPrice || 0;
      updatedItems[existingIndex] = {
        ...existing,
        quantity: newQty,
        totalPrice: unitPrice * newQty,
      };
    } else {
      updatedItems.push(newItem);
    }

    saveCurrentOrderWithItems(updatedItems);
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    let updatedItems = currentItems
      .map((item) => {
        if (!item) return null;
        if (item.id === itemId) {
          const newQty = (item.quantity || 1) + delta;
          if (newQty <= 0) return null;
          const unitPrice = item.unitPrice || 0;
          return {
            ...item,
            quantity: newQty,
            totalPrice: unitPrice * newQty,
          };
        }
        return item;
      })
      .filter(Boolean) as OrderItem[];

    saveCurrentOrderWithItems(updatedItems);
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedItems = currentItems.filter((i) => i && i.id !== itemId);
    saveCurrentOrderWithItems(updatedItems);
  };

  const saveCurrentOrderWithItems = (items: OrderItem[]) => {
    const safeItems = (items || []).filter(Boolean);
    const summary = calculateOrderSummary(safeItems, taxPercent, discountPercent);
    const updatedOrder: Order = {
      id: activeOrder?.id || `ord-${Date.now()}`,
      code: activeOrder?.code || `HD-${Math.floor(1000 + Math.random() * 9000)}`,
      tableId: activeTableId || 't1',
      tableName: currentTable?.name || 'Bán Mang Về',
      items: safeItems,
      subtotal: summary.subtotal || 0,
      discountPercent: discountPercent || 0,
      discountAmount: summary.discountAmount || 0,
      taxPercent: taxPercent || 0,
      taxAmount: summary.taxAmount || 0,
      totalAmount: summary.totalAmount || 0,
      status: activeOrder?.status || 'PREPARING',
      createdAt: activeOrder?.createdAt || new Date().toISOString(),
      isCachedInDailyLog: true,
    };

    if (onUpdateOrder) {
      onUpdateOrder(updatedOrder);
    }
  };

  // ONE-TOUCH DIRECT CHECKOUT & AUTO 2-BILL THERMAL PRINT (SUNMI D2 DIRECT USB + BROWSER FALLBACK)
  const handleDirectCheckoutAndPrint = async () => {
    if (!activeOrder || currentItems.length === 0) return;

    const copies = printSettings?.invoiceCopies || 2;
    // Snapshot current order safely
    const orderSnapshot: Order = JSON.parse(JSON.stringify(activeOrder));
    setLastPaidOrderForPrint(orderSnapshot);

    // 1. Confirm Payment Immediately
    if (onConfirmPayment) {
      onConfirmPayment(orderSnapshot.id, 'CASH');
    }

    // 2. Try Direct USB ESC/POS Hardware Printing (Sunmi D2 Direct USB / WebUSB / WebSerial - No Driver Needed)
    const printedDirectUsb = await printDirectUsbEscPos(orderSnapshot, printSettings || {});

    // 3. Fallback to Window Print if Direct USB output is not active
    if (!printedDirectUsb) {
      setTimeout(() => {
        window.print();
      }, 100);
    }

    // 4. Clear Cart & Reset for next sale
    saveCurrentOrderWithItems([]);

    // 5. Show Notification Toast
    setSuccessToast(`✔ Thanh Toán Thành Công! Máy in USB Sunmi D2 đang tự động in ${copies} bill.`);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3500);
  };

  const toggleToppingSelection = (optionTitle: string, topping: ToppingOption) => {
    if (!topping) return;
    const exists = selectedToppings.some(
      (t) => t.optionTitle === optionTitle && t.topping?.id === topping.id
    );

    if (exists) {
      setSelectedToppings((prev) =>
        prev.filter((t) => !(t.optionTitle === optionTitle && t.topping?.id === topping.id))
      );
    } else {
      setSelectedToppings((prev) => [...prev, { optionTitle, topping }]);
    }
  };

  const orderForPrinting = lastPaidOrderForPrint || activeOrder;
  const currentFontSize = printSettings?.fontSizePx || 26;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-[#F1F5F9] overflow-hidden select-none">
      
      {/* LEFT COLUMN: Search & Menu Grid */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200">
        
        {/* Success Toast Bar */}
        {successToast && (
          <div className="p-3 bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-between shadow-md animate-in slide-in-from-top duration-200">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast(null)} className="text-white hover:text-emerald-200 font-bold text-sm">
              ✕
            </button>
          </div>
        )}

        {/* Search & Category Filter */}
        <div className="p-3 bg-white border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm món nhanh theo tên hoặc mã món (VD: CHẢ GIÒ, NEM)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>

            <div className="hidden sm:flex items-center space-x-1.5 text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg shrink-0 font-bold">
              <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Cắm USB Sunmi D2 In Trực Tiếp</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {(categories || []).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Cards Grid */}
        <div className="flex-1 p-4 overflow-y-auto bg-[#F8FAFC]">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {(filteredMenu || []).map((item) => (
              <div
                key={item.id}
                onClick={() => handleAddItemToCart(item)}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-emerald-500 hover:shadow-lg transition duration-150 cursor-pointer flex flex-col justify-between group active:scale-95 select-none"
              >
                {/* DISH IMAGE THUMBNAIL */}
                <div className="relative w-full h-28 bg-slate-100 overflow-hidden shrink-0">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-emerald-50/60 text-emerald-800 font-extrabold text-[11px] p-2 text-center">
                      CHẢ GIÒ QUẢNG NGÃI
                    </div>
                  )}

                  <div className="absolute top-2 left-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-900/80 backdrop-blur-sm text-white shadow-sm">
                      {item.code}
                    </span>
                  </div>

                  {item.isPopular && (
                    <div className="absolute top-2 right-2">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-rose-600 text-white shadow-sm flex items-center space-x-0.5">
                        <Flame className="w-3 h-3" />
                        <span>HOT</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between">
                  <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-700 transition line-clamp-2 leading-tight">
                    {item.name}
                  </h4>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-mono text-sm font-black text-emerald-600">
                      {(item.price || 0).toLocaleString('vi-VN')} đ
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition shadow-sm">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(filteredMenu || []).length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Utensils className="w-10 h-10 mb-2 text-slate-300" />
              <p className="font-medium">Không tìm thấy món ăn phù hợp</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Order Cart */}
      <div className="w-full lg:w-96 xl:w-[420px] bg-white flex flex-col h-full border-l border-slate-200 shadow-xl">
        
        {/* Cart Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-extrabold text-slate-800">Đơn Hàng Mang Về</h3>
              <span className="text-xs px-2 py-0.5 rounded font-mono bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                Mang Về
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center space-x-1">
              <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
              <span>Mã HD: {activeOrder?.code || 'HD-NEW'}</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 block">Số lượng món</span>
            <span className="font-mono text-sm font-bold text-emerald-600">
              {(currentItems || []).reduce((acc, i) => acc + (i?.quantity || 0), 0)} món
            </span>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
          {(currentItems || []).map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-2">
                  <h5 className="text-sm font-bold text-slate-800">{item.name}</h5>
                  
                  {item.selectedToppings && item.selectedToppings.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {(item.selectedToppings || []).map((st, idx) => (
                        <p key={idx} className="text-[11px] text-blue-600/90 flex items-center space-x-1">
                          <span className="w-1 h-1 rounded-full bg-blue-600 inline-block" />
                          <span>{st.topping?.name || 'Topping'} (+{(st.topping?.price || 0).toLocaleString('vi-VN')}đ)</span>
                        </p>
                      ))}
                    </div>
                  )}

                  {item.note && (
                    <p className="text-[11px] text-slate-500 italic mt-1 flex items-center space-x-1">
                      <MessageSquare className="w-3 h-3 text-slate-400" />
                      <span>{item.note}</span>
                    </p>
                  )}

                  <p className="text-xs font-mono text-slate-500 mt-1">
                    {(item.unitPrice || 0).toLocaleString('vi-VN')} đ
                  </p>
                </div>

                <span className="font-mono text-sm font-bold text-slate-900">
                  {(item.totalPrice || 0).toLocaleString('vi-VN')} đ
                </span>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition"
                  title="Xóa món"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded-lg border border-slate-200">
                  <button
                    onClick={() => handleQuantityChange(item.id, -1)}
                    className="p-1 text-slate-600 hover:text-blue-600 rounded transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-xs font-bold text-slate-800 w-6 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item.id, 1)}
                    className="p-1 text-slate-600 hover:text-blue-600 rounded transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {(currentItems || []).length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Utensils className="w-12 h-12 mb-3 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">Đơn mang về đang trống</p>
              <p className="text-xs text-slate-400 mt-1">
                Chạm món ở danh mục bên trái để thêm vào đơn
              </p>
            </div>
          )}
        </div>

        {/* Order Summary Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span className="font-mono text-slate-800 font-bold">{(calcSummary?.subtotal || 0).toLocaleString('vi-VN')} đ</span>
            </div>

            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span className="text-emerald-700 font-extrabold">TỔNG CỘNG:</span>
              <span className="font-mono text-emerald-600 text-xl font-black">
                {(calcSummary?.totalAmount || 0).toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>

          {/* ONE-TOUCH DIRECT CHECKOUT & AUTO 2-BILL THERMAL PRINT BUTTON */}
          <div className="pt-2">
            <button
              disabled={(currentItems || []).length === 0}
              onClick={handleDirectCheckoutAndPrint}
              className="w-full py-4 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-emerald-200 transition transform active:scale-95 cursor-pointer"
            >
              <CreditCard className="w-5 h-5 stroke-[2.5]" />
              <span>THANH TOÁN ĐƠN HÀNG (IN {printSettings?.invoiceCopies || 2} BILL)</span>
            </button>
          </div>

        </div>

      </div>

      {/* TOPPING MODAL */}
      {toppingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-800">{toppingItem.name}</h3>
                <p className="text-xs font-mono text-emerald-600 font-bold mt-0.5">
                  Giá gốc: {(toppingItem.price || 0).toLocaleString('vi-VN')} đ
                </p>
              </div>
              <button
                onClick={() => setToppingItem(null)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {(toppingItem.options || []).map((group, gIdx) => (
                <div key={gIdx} className="space-y-2">
                  <h5 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                    {group.title}
                  </h5>

                  <div className="grid grid-cols-1 gap-2">
                    {(group.items || []).map((tp) => {
                      const isSelected = selectedToppings.some(
                        (t) => t.optionTitle === group.title && t.topping?.id === tp.id
                      );
                      return (
                        <div
                          key={tp.id}
                          onClick={() => toggleToppingSelection(group.title, tp)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-xs">{tp.name}</span>
                          <span className="font-mono text-xs text-slate-500">
                            +{(tp.price || 0).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-700 block">Ghi chú cho món:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Ít cay, không hành..."
                  value={itemNote}
                  onChange={(e) => setItemNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2">
              <button
                onClick={() => setToppingItem(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmToppings}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                Xác Nhận Thêm Vào Đơn
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DIRECT THERMAL RECEIPT WRAPPER */}
      {orderForPrinting && (
        <div id="printable-receipt-wrapper" className="hidden print:block">
          {Array.from({ length: printSettings?.invoiceCopies || 2 }).map((_, copyIdx) => (
            <div
              key={copyIdx}
              className="receipt-copy text-black bg-white font-serif p-0 leading-tight border-b border-dashed border-black pb-2 mb-2"
              style={{ fontSize: `${currentFontSize}px`, fontFamily: '"Times New Roman", Times, Georgia, serif' }}
            >
              
              {/* Header */}
              <div className="text-center border-b border-dashed border-black pb-1 mb-1">
                <h4 className="font-black text-[1.4em] uppercase tracking-tight">{printSettings?.restaurantName || 'CHẢ GIÒ BẮP QUẢNG NGÃI'}</h4>
                <p className="text-[1.1em] font-bold text-black leading-tight">{printSettings?.address || '87, Hùng Vương, Phường Bà Rịa, TP. Hồ Chí Minh'}</p>
                <p className="text-[1.1em] font-extrabold text-black leading-tight">SDT: {printSettings?.phone || '0972371722'}</p>
                {printSettings?.wifiName && (
                  <p className="text-[1.1em] font-bold text-black leading-tight">Wifi: {printSettings.wifiName} - MK: {printSettings.wifiPassword || '0914683351'}</p>
                )}
              </div>

              {/* Title & Info */}
              <div className="text-center my-1">
                <h3 className="font-black text-[1.5em] uppercase tracking-tight">HÓA ĐƠN THANH TOÁN</h3>
                <p className="text-[1.2em] font-serif font-black text-black">Mã HD: {orderForPrinting.code || 'HD-NEW'}</p>
                <p className="text-[1.1em] font-serif font-bold text-black">
                  Ngày: {new Date(orderForPrinting.createdAt || Date.now()).toLocaleTimeString('vi-VN')} {new Date(orderForPrinting.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                </p>
                <p className="text-[1.2em] font-black uppercase text-black">(LIÊN {copyIdx + 1})</p>
              </div>

              {/* HTML GRID TABLE MATCHING USER'S EXACT DRAWING 100% */}
              <table className="w-full border-collapse border-2 border-black text-black font-sans my-2 select-none">
                <thead>
                  <tr className="border-b-2 border-black font-normal text-[1.0em]">
                    <th className="border-r-2 border-black p-1 w-[45%] text-center font-normal">Ten mon</th>
                    <th className="border-r-2 border-black p-1 w-[15%] text-center font-normal">SL</th>
                    <th className="p-1 w-[40%] text-center font-normal">T.Tien</th>
                  </tr>
                </thead>
                <tbody>
                  {(orderForPrinting.items || []).map((item, idx) => (
                    <tr key={idx} className="border-b-2 border-black font-black uppercase">
                      <td className="border-r-2 border-black p-1 text-left font-black text-[0.85em] uppercase tracking-tight font-sans leading-tight">
                        {removeVietnameseAccents(item?.name || 'MON').toUpperCase()}
                      </td>
                      <td className="border-r-2 border-black p-1 text-center font-black text-[0.9em]">
                        {item?.quantity || 1}
                      </td>
                      <td className="p-1 text-right font-black text-[0.9em]">
                        {(item?.totalPrice || 0).toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  ))}
                  <tr className="text-[1.55em]">
                    <td className="border-r-2 border-black p-1"></td>
                    <td className="border-r-2 border-black p-1 text-right font-normal text-[0.8em] align-middle">Tổng</td>
                    <td className="p-1 text-right font-black text-[1.1em]">{(orderForPrinting.totalAmount || 0).toLocaleString('vi-VN')}</td>
                  </tr>
                </tbody>
              </table>

              {/* Footer */}
              <div className="text-center mt-2 pt-1 border-t border-dashed border-black font-bold text-[1.1em] uppercase">
                <p>{printSettings?.footerNote || 'CẢM ƠN VÀ HẸN GẶP LẠI QUÝ KHÁCH!'}</p>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  Table,
  MenuItem,
  Order,
  OrderItem,
  SelectedTopping,
  ToppingOption
} from '../types';
import { calculateOrderSummary, createOrderItem } from '../services/calcEngine';
import { POSLoyaltyEngine } from '../services/loyaltyEngine';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  CreditCard,
  Utensils,
  ChevronRight,
  Flame,
  CheckCircle2,
  X,
  Zap,
  Tag,
  MessageSquare,
  Users,
  Award,
  Phone,
  Gift,
  ShoppingBag
} from 'lucide-react';

interface OrderingViewProps {
  tables: Table[];
  menu: MenuItem[];
  activeTableId: string;
  onSelectTable: (tableId: string) => void;
  activeOrder: Order | null;
  onUpdateOrder: (order: Order) => void;
  onOpenCheckout: (order: Order) => void;
  onPrintKitchenTicket: (order: Order) => void;
}

export const OrderingView: React.FC<OrderingViewProps> = ({
  tables,
  menu,
  activeTableId,
  onSelectTable,
  activeOrder,
  onUpdateOrder,
  onOpenCheckout,
  onPrintKitchenTicket,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(8);
  const [customerPhoneInput, setCustomerPhoneInput] = useState<string>('');

  // Topping Modal state
  const [toppingItem, setToppingItem] = useState<MenuItem | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<SelectedTopping[]>([]);
  const [itemNote, setItemNote] = useState<string>('');

  // Active table
  const currentTable = useMemo(() => {
    if (!tables || tables.length === 0) return null;
    return tables.find((t) => t.id === activeTableId) || tables[0] || null;
  }, [tables, activeTableId]);

  // Categories list
  const categories = useMemo(() => {
    const cats = Array.from(new Set(menu.map((m) => m.category)));
    return ['Tất cả', 'Best-seller 🔥', ...cats];
  }, [menu]);

  // Filtered menu
  const filteredMenu = useMemo(() => {
    return menu.filter((item) => {
      if (!item.isAvailable) return false;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === 'Tất cả') return true;
      if (selectedCategory === 'Best-seller 🔥') return item.isBestSeller;
      return item.category === selectedCategory;
    });
  }, [menu, searchQuery, selectedCategory]);

  // Real-time calculated summary for current order
  const currentItems = activeOrder?.items || [];
  const calcSummary = useMemo(() => {
    return calculateOrderSummary(currentItems, taxPercent, discountPercent);
  }, [currentItems, taxPercent, discountPercent]);

  // Handle One-touch add item to order
  const handleAddItemToCart = (item: MenuItem) => {
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
        i.menuItemId === newItem.menuItemId &&
        JSON.stringify(i.selectedToppings) === JSON.stringify(newItem.selectedToppings) &&
        i.note === newItem.note
    );

    if (existingIndex >= 0) {
      updatedItems[existingIndex].quantity += 1;
      updatedItems[existingIndex].totalPrice =
        updatedItems[existingIndex].unitPrice * updatedItems[existingIndex].quantity;
    } else {
      updatedItems.push(newItem);
    }

    saveCurrentOrderWithItems(updatedItems);
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    let updatedItems = currentItems
      .map((item) => {
        if (item.id === itemId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return {
            ...item,
            quantity: newQty,
            totalPrice: item.unitPrice * newQty,
          };
        }
        return item;
      })
      .filter(Boolean) as OrderItem[];

    saveCurrentOrderWithItems(updatedItems);
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedItems = currentItems.filter((i) => i.id !== itemId);
    saveCurrentOrderWithItems(updatedItems);
  };

  const saveCurrentOrderWithItems = (items: OrderItem[]) => {
    const summary = calculateOrderSummary(items, taxPercent, discountPercent);
    const updatedOrder: Order = {
      id: activeOrder?.id || `ord-${Date.now()}`,
      code: activeOrder?.code || `HD-${Math.floor(1000 + Math.random() * 9000)}`,
      tableId: currentTable?.id || activeTableId || 't1',
      tableName: currentTable?.name || 'Bàn 01',
      customerCount: activeOrder?.customerCount || 2,
      items: summary.items,
      subtotal: summary.subtotal,
      taxPercent,
      taxAmount: summary.taxAmount,
      discountPercent,
      discountAmount: summary.discountAmount,
      totalAmount: summary.totalAmount,
      status: activeOrder?.status || 'PREPARING',
      createdAt: activeOrder?.createdAt || new Date().toISOString(),
      isCachedInDailyLog: true,
    };

    onUpdateOrder(updatedOrder);
  };

  const toggleToppingSelection = (optionTitle: string, topping: ToppingOption) => {
    const exists = selectedToppings.some(
      (t) => t.optionTitle === optionTitle && t.topping.id === topping.id
    );

    if (exists) {
      setSelectedToppings((prev) =>
        prev.filter((t) => !(t.optionTitle === optionTitle && t.topping.id === topping.id))
      );
    } else {
      setSelectedToppings((prev) => [...prev, { optionTitle, topping }]);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-[#F1F5F9] overflow-hidden">
      
      {/* LEFT COLUMN: Table Quick Bar + Menu Grid */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200">
        


        {/* Search & Category Filter */}
        <div className="p-3 bg-white border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm món nhanh theo tên hoặc mã món (VD: PHỞ, MON01)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>

            <div className="hidden sm:flex items-center space-x-1.5 text-[11px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1.5 rounded-lg shrink-0">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>Calc Engine: {calcSummary.calculationDurationMs}ms</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 content-start">
          {filteredMenu.map((item) => (
            <div
              key={item.id}
              onClick={() => handleAddItemToCart(item)}
              className="group relative bg-white border border-slate-200 hover:border-blue-500 rounded-xl overflow-hidden cursor-pointer transition duration-150 flex flex-col justify-between shadow-sm hover:shadow-md active:scale-[0.98] select-none"
            >
              <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-slate-100">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                {item.isBestSeller && (
                  <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center space-x-0.5 shadow-md">
                    <Flame className="w-3 h-3 text-white fill-white" />
                    <span>BEST SELLER</span>
                  </span>
                )}

                <span className="absolute bottom-2 left-2 text-[10px] font-mono text-white bg-slate-900/70 backdrop-blur px-1.5 py-0.5 rounded border border-white/20">
                  {item.code}
                </span>

                {item.compressedSizeKb && (
                  <span className="absolute bottom-2 right-2 text-[9px] font-mono text-emerald-300 bg-slate-900/70 backdrop-blur px-1.5 py-0.5 rounded border border-emerald-400/30">
                    {item.compressedSizeKb}KB
                  </span>
                )}
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition line-clamp-1 uppercase tracking-tight">
                    {item.name}
                  </h4>
                  <p className="text-xs font-mono font-bold text-blue-600 mt-1">
                    {item.price.toLocaleString('vi-VN')} đ
                  </p>
                </div>

                <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">
                    {item.options ? `${item.options.length} tùy chọn` : '1-Touch'}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition">
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredMenu.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400">
              <Utensils className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Không tìm thấy món ăn phù hợp</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Order Cart */}
      <div className="w-full lg:w-96 xl:w-[420px] bg-white flex flex-col h-full border-l border-slate-200 shadow-xl">
        
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
            <span className="font-mono text-sm font-bold text-blue-600">
              {currentItems.reduce((acc, i) => acc + i.quantity, 0)} món
            </span>
          </div>
        </div>

        <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
          {currentItems.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-2">
                  <h5 className="text-sm font-bold text-slate-800">{item.name}</h5>
                  
                  {item.selectedToppings.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {item.selectedToppings.map((st, idx) => (
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
                    {item.unitPrice.toLocaleString('vi-VN')} đ / món
                  </p>
                </div>

                <div className="text-right font-mono text-sm font-bold text-blue-600">
                  {item.totalPrice.toLocaleString('vi-VN')} đ
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition"
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

          {currentItems.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Utensils className="w-12 h-12 mb-3 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">Bàn đang trống order</p>
              <p className="text-xs text-slate-400 mt-1">
                Chạm món ở danh mục bên trái để thêm vào đơn
              </p>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          
          {/* Customer Loyalty Input */}
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <input
              type="text"
              placeholder="SĐT Khách hàng tích điểm..."
              value={customerPhoneInput}
              onChange={(e) => setCustomerPhoneInput(e.target.value)}
              className="w-full bg-transparent font-mono text-slate-800 focus:outline-none text-xs"
            />
            {customerPhoneInput && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded shrink-0 flex items-center space-x-1">
                <Gift className="w-3 h-3 text-emerald-600" />
                <span>+{(calcSummary.totalAmount / 10000).toFixed(0)} điểm</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Giảm (%):</span>
              </span>
              <select
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="bg-white text-blue-600 font-mono font-bold border border-slate-200 rounded px-1 py-0.5 focus:outline-none"
              >
                <option value={0}>0%</option>
                <option value={5}>5%</option>
                <option value={10}>10%</option>
                <option value={15}>15%</option>
                <option value={20}>20%</option>
              </select>
            </div>

            <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
              <span className="text-slate-500">Thuế VAT:</span>
              <select
                value={taxPercent}
                onChange={(e) => setTaxPercent(Number(e.target.value))}
                className="bg-white text-slate-800 font-mono font-bold border border-slate-200 rounded px-1 py-0.5 focus:outline-none"
              >
                <option value={0}>0%</option>
                <option value={8}>8%</option>
                <option value={10}>10%</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-500 font-medium pt-1">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span className="font-mono text-slate-800">{calcSummary.subtotal.toLocaleString('vi-VN')} đ</span>
            </div>
            {calcSummary.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Giảm giá ({discountPercent}%):</span>
                <span className="font-mono">-{calcSummary.discountAmount.toLocaleString('vi-VN')} đ</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Thuế GTGT ({taxPercent}%):</span>
              <span className="font-mono text-slate-800">{calcSummary.taxAmount.toLocaleString('vi-VN')} đ</span>
            </div>

            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span className="text-blue-600 font-bold">TỔNG CỘNG:</span>
              <span className="font-mono text-blue-600 text-xl font-black">
                {calcSummary.totalAmount.toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              disabled={currentItems.length === 0}
              onClick={() => activeOrder && onOpenCheckout(activeOrder)}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-emerald-200 transition transform active:scale-95 cursor-pointer"
            >
              <CreditCard className="w-5 h-5 stroke-[2.5]" />
              <span>Thanh Toán Đơn Hàng</span>
            </button>
          </div>

        </div>

      </div>

      {toppingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-800">{toppingItem.name}</h3>
                <p className="text-xs font-mono text-blue-600 font-bold mt-0.5">
                  Giá gốc: {toppingItem.price.toLocaleString('vi-VN')} đ
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
              {toppingItem.options?.map((group, gIdx) => (
                <div key={gIdx} className="space-y-2">
                  <h5 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                    {group.title}
                  </h5>
                  <div className="space-y-1.5">
                    {group.choices.map((choice) => {
                      const isSelected = selectedToppings.some(
                        (t) => t.optionTitle === group.title && t.topping.id === choice.id
                      );
                      return (
                        <div
                          key={choice.id}
                          onClick={() => toggleToppingSelection(group.title, choice)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                            isSelected
                              ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                              isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                            }`}>
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </div>
                            <span className="text-sm font-medium">{choice.name}</span>
                          </div>
                          <span className="font-mono text-xs text-blue-600 font-bold">
                            +{choice.price.toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider block">
                  Ghi chú cho Bếp / Bar:
                </label>
                <input
                  type="text"
                  placeholder="VD: Ít đá, không hành, cay nhẹ..."
                  value={itemNote}
                  onChange={(e) => setItemNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">Đã chọn topping</span>
              <button
                onClick={handleConfirmToppings}
                className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-md"
              >
                Thêm vào đơn
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

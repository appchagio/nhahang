import { Table, MenuItem, PrintSettings } from '../types';

export const INITIAL_TABLES: Table[] = [
  { id: 't1', name: 'Bàn 01', floor: 'Tầng 1', seats: 4, status: 'OCCUPIED', currentOrderId: 'ord-101', updatedAt: new Date().toISOString() },
  { id: 't2', name: 'Bàn 02', floor: 'Tầng 1', seats: 4, status: 'WAITING_PAYMENT', currentOrderId: 'ord-102', updatedAt: new Date().toISOString() },
  { id: 't3', name: 'Bàn 03', floor: 'Tầng 1', seats: 2, status: 'EMPTY', updatedAt: new Date().toISOString() },
  { id: 't4', name: 'Bàn 04', floor: 'Tầng 1', seats: 6, status: 'EMPTY', updatedAt: new Date().toISOString() },
  { id: 't5', name: 'Bàn VIP 01', floor: 'Tầng 2', seats: 8, status: 'RESERVED', updatedAt: new Date().toISOString() },
  { id: 't6', name: 'Bàn 05', floor: 'Tầng 2', seats: 4, status: 'EMPTY', updatedAt: new Date().toISOString() },
  { id: 't7', name: 'Bàn 06', floor: 'Tầng 2', seats: 4, status: 'EMPTY', updatedAt: new Date().toISOString() },
  { id: 't8', name: 'Bàn ST 01', floor: 'Sân thượng', seats: 4, status: 'OCCUPIED', currentOrderId: 'ord-103', updatedAt: new Date().toISOString() },
  { id: 't9', name: 'Bàn ST 02', floor: 'Sân thượng', seats: 2, status: 'EMPTY', updatedAt: new Date().toISOString() },
  { id: 'mv1', name: 'Mang về #01', floor: 'Mang về', seats: 1, status: 'EMPTY', updatedAt: new Date().toISOString() },
  { id: 'mv2', name: 'Mang về #02', floor: 'Mang về', seats: 1, status: 'EMPTY', updatedAt: new Date().toISOString() },
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'm1',
    code: 'MON01',
    name: 'Phở Bò Đặc Biệt',
    price: 65000,
    category: 'Món chính',
    imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80',
    compressedSizeKb: 38,
    isBestSeller: true,
    isAvailable: true,
    rank: 1,
    options: [
      {
        title: 'Thêm Topping Bò',
        choices: [
          { id: 'top-1', name: 'Thêm Tái/Nạm', price: 15000 },
          { id: 'top-2', name: 'Thêm Trứng Chèn', price: 10000 },
          { id: 'top-3', name: 'Thêm Quẩy Crispy (2 cái)', price: 8000 },
        ]
      }
    ]
  },
  {
    id: 'm2',
    code: 'MON02',
    name: 'Bún Chả Hà Nội Classic',
    price: 55000,
    category: 'Món chính',
    imageUrl: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80',
    compressedSizeKb: 42,
    isBestSeller: true,
    isAvailable: true,
    rank: 2,
    options: [
      {
        title: 'Thêm Nem Rán',
        choices: [
          { id: 'top-4', name: 'Thêm 1 Nem Cua Bể', price: 20000 },
          { id: 'top-5', name: 'Thêm Bún Tươi', price: 5000 },
        ]
      }
    ]
  },
  {
    id: 'm3',
    code: 'MON03',
    name: 'Bò Lúc Lắc Sốt Tiêu Đen',
    price: 125000,
    category: 'Món chính',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    compressedSizeKb: 45,
    isBestSeller: false,
    isAvailable: true,
    rank: 3,
    options: [
      {
        title: 'Món ăn kèm',
        choices: [
          { id: 'top-6', name: 'Đổi sang Khoai Tây Chiên', price: 15000 },
          { id: 'top-7', name: 'Thêm Cơm Trắng Phủ Tỏi', price: 10000 },
        ]
      }
    ]
  },
  {
    id: 'm4',
    code: 'MON04',
    name: 'Cơm Tấm Sườn Bì Chả VIP',
    price: 68000,
    category: 'Món chính',
    imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
    compressedSizeKb: 36,
    isBestSeller: true,
    isAvailable: true,
    rank: 4,
    options: [
      {
        title: 'Topping Cơm Tấm',
        choices: [
          { id: 'top-8', name: 'Thêm Ốp La Lòng Đào', price: 10000 },
          { id: 'top-9', name: 'Thêm Mỡ Hành Chảo', price: 5000 },
        ]
      }
    ]
  },
  {
    id: 'm5',
    code: 'DUA01',
    name: 'Cà Phê Sữa Đá Sài Gòn',
    price: 29000,
    category: 'Đồ uống & Trà',
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
    compressedSizeKb: 25,
    isBestSeller: true,
    isAvailable: true,
    rank: 5,
    options: [
      {
        title: 'Mức Đá & Đường',
        choices: [
          { id: 'top-10', name: 'Đậm đắng ít đường', price: 0 },
          { id: 'top-11', name: 'Thêm Shot Espresso', price: 12000 },
        ]
      }
    ]
  },
  {
    id: 'm6',
    code: 'DUA02',
    name: 'Trà Đào Cam Sả Tươi',
    price: 39000,
    category: 'Đồ uống & Trà',
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
    compressedSizeKb: 31,
    isBestSeller: true,
    isAvailable: true,
    rank: 6,
    options: [
      {
        title: 'Extra Topping',
        choices: [
          { id: 'top-12', name: 'Thêm 2 Miếng Đào Giòn', price: 12000 },
          { id: 'top-13', name: 'Thêm Thạch Trái Cây', price: 8000 },
        ]
      }
    ]
  },
  {
    id: 'm7',
    code: 'DUA03',
    name: 'Nước Ép Dưa Hấu Tươi',
    price: 35000,
    category: 'Đồ uống & Trà',
    imageUrl: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=600&q=80',
    compressedSizeKb: 28,
    isBestSeller: false,
    isAvailable: true,
    rank: 7
  },
  {
    id: 'm8',
    code: 'ANV01',
    name: 'Chả Giò Hải Sản Sốt Mayonnaise',
    price: 49000,
    category: 'Món ăn vặt',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    compressedSizeKb: 33,
    isBestSeller: false,
    isAvailable: true,
    rank: 8
  },
  {
    id: 'm9',
    code: 'ANV02',
    name: 'Khoai Tây Lắc Phô Mai',
    price: 35000,
    category: 'Món ăn vặt',
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    compressedSizeKb: 29,
    isBestSeller: false,
    isAvailable: true,
    rank: 9
  },
  {
    id: 'm10',
    code: 'TM01',
    name: 'Chè Khúc Bạch Trái Cây',
    price: 35000,
    category: 'Tráng miệng',
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
    compressedSizeKb: 30,
    isBestSeller: false,
    isAvailable: true,
    rank: 10
  }
];

export const INITIAL_PRINT_SETTINGS: PrintSettings = {
  restaurantName: 'CHẢ GIÒ QUẢNG NGÃI',
  address: '128 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
  phone: '0908 123 456 - 028 3822 9999',
  paperSize: 'K80',
  headerNote: 'Chào mừng quý khách đến với Chả Giò Quảng Ngãi!',
  footerNote: 'Cảm ơn và hẹn gặp lại quý khách!',
  showVat: true,
  showQrCode: true,
  bankAccount: {
    bankName: 'MBBANK',
    accountNo: '0908123456',
    accountName: 'CHA GIO QUANG NGAI'
  }
};

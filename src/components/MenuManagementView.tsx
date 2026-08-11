// MenuManagementView Component
import React, { useState } from 'react';
import { MenuItem, ToppingOption } from '../types';
import { compressImageFile } from '../services/imageOptimizer';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Flame,
  UploadCloud,
  CheckCircle,
  X,
  FileImage,
  ArrowUpDown,
  Sparkles
} from 'lucide-react';

interface MenuManagementViewProps {
  menu: MenuItem[];
  onSaveMenu: (newMenu: MenuItem[]) => void;
}

export const MenuManagementView: React.FC<MenuManagementViewProps> = ({
  menu,
  onSaveMenu,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressionInfo, setCompressionInfo] = useState<{
    originalKb: number;
    compressedKb: number;
    ratioPercent: number;
  } | null>(null);

  const categories = Array.from(new Set(menu.map((m) => m.category)));

  const filteredMenu = menu.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedCategory === 'Tất cả') return true;
    return m.category === selectedCategory;
  });

  const handleAddNewItem = () => {
    setEditingItem({
      id: `m-${Date.now()}`,
      code: `MON${Math.floor(10 + Math.random() * 90)}`,
      name: '',
      price: 45000,
      category: categories[0] || 'Món chính',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      compressedSizeKb: 35,
      isBestSeller: false,
      isAvailable: true,
      rank: menu.length + 1,
      options: [],
    });
    setCompressionInfo(null);
  };

  const handleSaveItem = () => {
    if (!editingItem || !editingItem.name) return;

    let updatedMenu = [...menu];
    const index = updatedMenu.findIndex((m) => m.id === editingItem.id);

    const fullItem: MenuItem = {
      id: editingItem.id || `m-${Date.now()}`,
      code: editingItem.code || 'MON00',
      name: editingItem.name,
      price: Number(editingItem.price) || 0,
      category: editingItem.category || 'Món chính',
      imageUrl: editingItem.imageUrl || '',
      compressedSizeKb: editingItem.compressedSizeKb || 35,
      isBestSeller: Boolean(editingItem.isBestSeller),
      isAvailable: Boolean(editingItem.isAvailable),
      rank: Number(editingItem.rank) || 1,
      options: editingItem.options || [],
    };

    if (index >= 0) {
      updatedMenu[index] = fullItem;
    } else {
      updatedMenu.push(fullItem);
    }

    onSaveMenu(updatedMenu);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa món ăn này khỏi thực đơn?')) {
      const updated = menu.filter((m) => m.id !== id);
      onSaveMenu(updated);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const result = await compressImageFile(file, 800, 800, 0.75);
      setEditingItem((prev) => ({
        ...prev,
        imageUrl: result.dataUrl,
        compressedSizeKb: result.compressedSizeKb,
      }));
      setCompressionInfo({
        originalKb: result.originalSizeKb,
        compressedKb: result.compressedSizeKb,
        ratioPercent: result.compressionRatioPercent,
      });
    } catch (err) {
      alert('Không thể nén ảnh. Vui lòng chọn ảnh khác.');
    } finally {
      setIsCompressing(false);
    }
  };

  const toggleBestSeller = (id: string) => {
    const updated = menu.map((m) =>
      m.id === id ? { ...m, isBestSeller: !m.isBestSeller } : m
    );
    onSaveMenu(updated);
  };

  const toggleAvailability = (id: string) => {
    const updated = menu.map((m) =>
      m.id === id ? { ...m, isAvailable: !m.isAvailable } : m
    );
    onSaveMenu(updated);
  };

  return (
    <div className="p-6 bg-[#F1F5F9] min-h-[calc(100vh-4rem)] text-slate-800 select-none">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <span>Quản trị Thực đơn & Tự động Nén ảnh</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Thêm món, thiết lập Best-seller, tự động nén ảnh giữ nguyên độ nét cho POS
            </p>
          </div>

          <button
            onClick={handleAddNewItem}
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition flex items-center justify-center space-x-2 shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm món mới</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc mã món..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto scrollbar-none">
            <button
              onClick={() => setSelectedCategory('Tất cả')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedCategory === 'Tất cả'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              Tất cả ({menu.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-4">Hình ảnh</th>
                  <th className="p-4">Mã & Tên món</th>
                  <th className="p-4">Danh mục</th>
                  <th className="p-4">Đơn giá</th>
                  <th className="p-4">Dung lượng nén</th>
                  <th className="p-4">Nổi bật</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredMenu.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-100"
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <span className="font-mono text-xs text-blue-600 font-bold">{item.code}</span>
                    </td>
                    <td className="p-4 text-xs">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-900">
                      {item.price.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="p-4 font-mono text-xs text-emerald-600 font-bold">
                      {item.compressedSizeKb ? `${item.compressedSizeKb} KB` : '~35 KB'}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleBestSeller(item.id)}
                        className={`p-1.5 rounded-lg border text-xs font-bold flex items-center space-x-1 transition ${
                          item.isBestSeller
                            ? 'bg-blue-50 text-blue-600 border-blue-200'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        <span>Best-seller</span>
                      </button>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleAvailability(item.id)}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                          item.isAvailable
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }`}
                      >
                        {item.isAvailable ? 'Còn hàng' : 'Tạm hết'}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* EDIT / ADD MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-800">
                {editingItem.id ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              
              {/* Name & Code */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1 space-y-1">
                  <label className="text-slate-500 font-bold block">Mã món:</label>
                  <input
                    type="text"
                    value={editingItem.code || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-slate-500 font-bold block">Tên món ăn:</label>
                  <input
                    type="text"
                    value={editingItem.name || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-semibold"
                  />
                </div>
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold block">Đơn giá (VNĐ):</label>
                  <input
                    type="number"
                    value={editingItem.price || 0}
                    onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono text-blue-600 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-bold block">Danh mục:</label>
                  <select
                    value={editingItem.category || 'Món chính'}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium"
                  >
                    <option value="Món chính">Món chính</option>
                    <option value="Đồ uống & Trà">Đồ uống & Trà</option>
                    <option value="Món ăn vặt">Món ăn vặt</option>
                    <option value="Tráng miệng">Tráng miệng</option>
                  </select>
                </div>
              </div>

              {/* Image Upload & Automated Compression Pipeline */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="text-slate-700 font-bold flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Hình ảnh & Bộ lọc Auto-Compression (Image Optimization):</span>
                </label>

                <div className="flex items-center space-x-4">
                  <img
                    src={editingItem.imageUrl}
                    alt="Preview"
                    className="w-20 h-20 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0"
                  />

                  <div className="flex-1 space-y-2">
                    <label className="cursor-pointer py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl border border-slate-200 flex items-center space-x-2 w-fit transition">
                      <UploadCloud className="w-4 h-4 text-blue-600" />
                      <span>{isCompressing ? 'Đang nén ảnh...' : 'Tải ảnh từ máy'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>

                    {compressionInfo && (
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg font-mono text-[11px] text-emerald-700 space-y-0.5">
                        <p>Kích thước gốc: {compressionInfo.originalKb} KB</p>
                        <p>Sau khi tự động nén: <strong>{compressionInfo.compressedKb} KB</strong> (Giảm {compressionInfo.ratioPercent}%)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center space-x-6 pt-3 border-t border-slate-200">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isBestSeller || false}
                    onChange={(e) => setEditingItem({ ...editingItem, isBestSeller: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                  <span className="font-semibold text-slate-700">Đánh dấu Best-seller 🔥</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isAvailable !== false}
                    onChange={(e) => setEditingItem({ ...editingItem, isAvailable: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <span className="font-semibold text-slate-700">Đang phục vụ (Còn hàng)</span>
                </label>
              </div>

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3">
              <button
                onClick={() => setEditingItem(null)}
                className="py-2 px-4 rounded-xl text-slate-500 hover:text-slate-800 font-medium"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveItem}
                className="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md"
              >
                Lưu món ăn
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { Table, Order } from '../types';
import {
  LayoutGrid,
  Users,
  Clock,
  ArrowRightLeft,
  CheckCircle,
  PlusCircle,
  UtensilsCrossed,
  Receipt
} from 'lucide-react';

interface TableLayoutViewProps {
  tables: Table[];
  orders: Order[];
  onSelectTable: (tableId: string) => void;
  onUpdateTableStatus: (tableId: string, newStatus: Table['status']) => void;
  onTransferTableOrder: (fromTableId: string, toTableId: string) => void;
}

export const TableLayoutView: React.FC<TableLayoutViewProps> = ({
  tables,
  orders,
  onSelectTable,
  onUpdateTableStatus,
  onTransferTableOrder,
}) => {
  const [selectedFloor, setSelectedFloor] = useState<string>('Tất cả');
  const [transferFromId, setTransferFromId] = useState<string | null>(null);

  const floors = useMemo(() => {
    const fls = Array.from(new Set(tables.map((t) => t.floor)));
    return ['Tất cả', ...fls];
  }, [tables]);

  const filteredTables = useMemo(() => {
    if (selectedFloor === 'Tất cả') return tables;
    return tables.filter((t) => t.floor === selectedFloor);
  }, [tables, selectedFloor]);

  const totalTables = tables.length;
  const occupiedTables = tables.filter((t) => t.status === 'OCCUPIED' || t.status === 'WAITING_PAYMENT').length;
  const emptyTables = tables.filter((t) => t.status === 'EMPTY').length;
  const occupancyRate = Math.round((occupiedTables / totalTables) * 100);

  const handleStartTransfer = (e: React.MouseEvent, tableId: string) => {
    e.stopPropagation();
    if (transferFromId === tableId) {
      setTransferFromId(null);
    } else {
      setTransferFromId(tableId);
    }
  };

  const handleTargetTransfer = (targetTableId: string) => {
    if (transferFromId && transferFromId !== targetTableId) {
      onTransferTableOrder(transferFromId, targetTableId);
      setTransferFromId(null);
    }
  };

  return (
    <div className="p-6 bg-[#F1F5F9] min-h-[calc(100vh-4rem)] text-slate-800 select-none">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
              <LayoutGrid className="w-6 h-6 text-blue-600" />
              <span>Sơ đồ Bàn & Khu vực Nhà hàng</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Quản lý trạng thái bàn, chuyển bàn, ghép đơn thời gian thực
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 font-medium block">Tỷ lệ Lấp đầy</span>
              <span className="text-lg font-bold font-mono text-blue-600">{occupancyRate}%</span>
            </div>

            <div className="px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 font-medium block">Đang Có Khách</span>
              <span className="text-lg font-bold font-mono text-blue-600">{occupiedTables} bàn</span>
            </div>

            <div className="px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 font-medium block">Bàn Trống</span>
              <span className="text-lg font-bold font-mono text-emerald-600">{emptyTables} bàn</span>
            </div>
          </div>
        </div>

        {transferFromId && (
          <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl flex items-center justify-between text-blue-700 text-sm animate-pulse">
            <div className="flex items-center space-x-2">
              <ArrowRightLeft className="w-5 h-5 text-blue-600" />
              <span>
                Đang trong chế độ chuyển bàn. Chạm vào <strong>bàn đích</strong> để di chuyển order.
              </span>
            </div>
            <button
              onClick={() => setTransferFromId(null)}
              className="text-xs font-bold uppercase underline hover:text-blue-900"
            >
              Hủy chế độ
            </button>
          </div>
        )}

        <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none">
          {floors.map((fl) => (
            <button
              key={fl}
              onClick={() => setSelectedFloor(fl)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                selectedFloor === fl
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {fl}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredTables.map((tbl) => {
            const tableOrder = orders.find((o) => o.tableId === tbl.id && o.status !== 'PAID');
            const isTransferringFromThis = transferFromId === tbl.id;

            let cardBg = 'bg-white border-slate-200 hover:border-blue-500';
            let badgeBg = 'bg-emerald-100 text-emerald-700 border-emerald-200';
            let statusText = 'Bàn Trống';

            if (tbl.status === 'OCCUPIED') {
              cardBg = 'bg-blue-50/70 border-blue-200 hover:border-blue-500';
              badgeBg = 'bg-blue-100 text-blue-700 border-blue-200';
              statusText = 'Có Khách';
            } else if (tbl.status === 'WAITING_PAYMENT') {
              cardBg = 'bg-amber-50/70 border-amber-200 hover:border-amber-500';
              badgeBg = 'bg-amber-100 text-amber-700 border-amber-200';
              statusText = 'Chờ TT';
            } else if (tbl.status === 'RESERVED') {
              cardBg = 'bg-purple-50/70 border-purple-200 hover:border-purple-500';
              badgeBg = 'bg-purple-100 text-purple-700 border-purple-200';
              statusText = 'Đặt Trước';
            }

            if (isTransferringFromThis) {
              cardBg = 'bg-blue-100 border-blue-500 ring-2 ring-blue-500/50';
            }

            return (
              <div
                key={tbl.id}
                onClick={() => {
                  if (transferFromId) {
                    handleTargetTransfer(tbl.id);
                  } else {
                    onSelectTable(tbl.id);
                  }
                }}
                className={`p-4 rounded-2xl border transition duration-200 cursor-pointer flex flex-col justify-between h-44 shadow-sm hover:shadow-md relative group ${cardBg}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-slate-800 group-hover:text-blue-600 transition">
                      {tbl.name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeBg}`}>
                      {statusText}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center space-x-1">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span>{tbl.seats} chỗ ngồi • {tbl.floor}</span>
                  </p>
                </div>

                <div className="my-2">
                  {tableOrder ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Tổng hóa đơn:</span>
                        <span className="font-mono font-bold text-blue-600 text-sm">
                          {tableOrder.totalAmount.toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Số món:</span>
                        <span className="font-mono font-medium text-slate-700">
                          {tableOrder.items.reduce((sum, i) => sum + i.quantity, 0)} món
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-slate-400 text-xs">
                      <UtensilsCrossed className="w-5 h-5 mx-auto mb-1 opacity-40" />
                      <span>Sẵn sàng phục vụ</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTable(tbl.id);
                    }}
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center space-x-1"
                  >
                    <span>{tableOrder ? 'Xem đơn' : 'Mở bàn'}</span>
                  </button>

                  {tableOrder && (
                    <button
                      onClick={(e) => handleStartTransfer(e, tbl.id)}
                      title="Đổi/Chuyển bàn"
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

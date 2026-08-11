import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  MenuItem,
  Order,
  PermanentRevenueAggregate,
  PrintSettings,
  PaymentMethod,
  SystemMetrics
} from './types';
import { POSStorageEngine } from './services/storageEngine';
import { calculateOrderSummary } from './services/calcEngine';
import { GoogleSheetsService } from './services/googleSheetsService';
import { initAutoUsbPrinterReconnection } from './services/usbPrinterService';

// Components
import { Navbar } from './components/Navbar';
import { OrderingView } from './components/OrderingView';
import { TableLayoutView } from './components/TableLayoutView';
import { MenuManagementView } from './components/MenuManagementView';
import { InvoicesLogView } from './components/InvoicesLogView';
import { ArchitectDashboard } from './components/ArchitectDashboard';
import { AnalyticsDashboardView } from './components/AnalyticsDashboardView';
import { BillingPrintModal } from './components/BillingPrintModal';
import { PrintTemplateSettingsModal } from './components/PrintTemplateSettingsModal';
import { GoogleSheetsSyncModal } from './components/GoogleSheetsSyncModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { ShiftManagementModal } from './components/ShiftManagementModal';
import { OrderSpeedGameModal } from './components/OrderSpeedGameModal';
import { GeminiApiKeyModal } from './components/GeminiApiKeyModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'ORDERING' | 'TABLES' | 'MENU' | 'INVOICES' | 'ARCHITECT' | 'ANALYTICS'>('ORDERING');

  // Auto-connect paired USB thermal printer on app launch / printer power ON
  useEffect(() => {
    initAutoUsbPrinterReconnection();
  }, []);
  
  // Core State
  const [tables, setTables] = useState<Table[]>(() => POSStorageEngine.getTables());
  const [menu, setMenu] = useState<MenuItem[]>(() => POSStorageEngine.getMenu());
  const [cachedOrders, setCachedOrders] = useState<Order[]>(() => POSStorageEngine.getCachedOrders());
  const [revenueRecords, setRevenueRecords] = useState<PermanentRevenueAggregate[]>(() => POSStorageEngine.getPermanentRevenue());
  const [printSettings, setPrintSettings] = useState<PrintSettings>(() => POSStorageEngine.getPrintSettings());
  const [activeTableId, setActiveTableId] = useState<string>('t1');

  // Modals state
  const [billingModalOrder, setBillingModalOrder] = useState<Order | null>(null);
  const [billingModalMode, setBillingModalMode] = useState<'CHECKOUT' | 'KITCHEN_TICKET' | 'INVOICE_PREVIEW'>('CHECKOUT');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState<boolean>(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);
  const [isShiftManagerOpen, setIsShiftManagerOpen] = useState<boolean>(false);
  const [isSpeedGameOpen, setIsSpeedGameOpen] = useState<boolean>(false);
  const [isGeminiKeyModalOpen, setIsGeminiKeyModalOpen] = useState<boolean>(false);

  // Benchmarking calculation timing
  const [calcLatencyMs, setCalcLatencyMs] = useState<number>(0.14);

  // Initialize data on load
  useEffect(() => {
    refreshAllData();
  }, []);

  const refreshAllData = () => {
    const loadedTables = POSStorageEngine.getTables();
    const loadedMenu = POSStorageEngine.getMenu();
    const loadedOrders = POSStorageEngine.getCachedOrders();
    const loadedRevenue = POSStorageEngine.getPermanentRevenue();
    const loadedSettings = POSStorageEngine.getPrintSettings();

    setTables(loadedTables);
    setMenu(loadedMenu);
    setCachedOrders(loadedOrders);
    setRevenueRecords(loadedRevenue);
    setPrintSettings(loadedSettings);
  };

  // Active Order for the currently selected table
  const activeOrder = useMemo(() => {
    return cachedOrders.find(
      (o) => o.tableId === activeTableId && o.status !== 'PAID' && o.status !== 'CANCELLED'
    ) || null;
  }, [cachedOrders, activeTableId]);

  // System telemetry metrics
  const systemMetrics = useMemo(() => {
    return POSStorageEngine.getSystemMetrics(calcLatencyMs);
  }, [calcLatencyMs, cachedOrders, revenueRecords]);

  // Select Table Handler
  const handleSelectTable = (tableId: string) => {
    setActiveTableId(tableId);
  };

  // Update Order Handler (from One-Touch POS)
  const handleUpdateOrder = (updatedOrder: Order) => {
    // Measure computation latency for telemetry
    const startTime = performance.now();
    
    POSStorageEngine.saveOrder(updatedOrder);

    // Update Table status to OCCUPIED if it was empty
    const updatedTables = tables.map((t) => {
      if (t.id === updatedOrder.tableId) {
        return {
          ...t,
          status: 'OCCUPIED' as Table['status'],
          currentOrderId: updatedOrder.id,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    POSStorageEngine.saveTables(updatedTables);
    setTables(updatedTables);
    setCachedOrders(POSStorageEngine.getCachedOrders());

    const endTime = performance.now();
    setCalcLatencyMs(Number((endTime - startTime).toFixed(3)));
  };

  // Transfer Table Order Handler
  const handleTransferTableOrder = (fromTableId: string, toTableId: string) => {
    const orderToTransfer = cachedOrders.find(
      (o) => o.tableId === fromTableId && o.status !== 'PAID'
    );

    if (!orderToTransfer) return;

    const toTable = tables.find((t) => t.id === toTableId);
    if (!toTable) return;

    const updatedOrder: Order = {
      ...orderToTransfer,
      tableId: toTable.id,
      tableName: toTable.name,
    };

    POSStorageEngine.saveOrder(updatedOrder);

    const updatedTables = tables.map((t) => {
      if (t.id === fromTableId) {
        return { ...t, status: 'EMPTY' as Table['status'], currentOrderId: undefined };
      }
      if (t.id === toTableId) {
        return { ...t, status: 'OCCUPIED' as Table['status'], currentOrderId: updatedOrder.id };
      }
      return t;
    });

    POSStorageEngine.saveTables(updatedTables);
    setTables(updatedTables);
    setCachedOrders(POSStorageEngine.getCachedOrders());
    setActiveTableId(toTableId);
  };

  // Confirm Payment Handler (Async Execution)
  const handleConfirmPayment = (orderId: string, method: PaymentMethod) => {
    const targetOrder = cachedOrders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const paidOrder: Order = {
      ...targetOrder,
      status: 'PAID',
      paymentMethod: method,
      paidAt: new Date().toISOString(),
    };

    // Save paid order -> Automatically updates Permanent Revenue Store
    POSStorageEngine.saveOrder(paidOrder);

    // Reset Table Status to EMPTY
    const updatedTables = tables.map((t) => {
      if (t.id === paidOrder.tableId) {
        return {
          ...t,
          status: 'EMPTY' as Table['status'],
          currentOrderId: undefined,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    POSStorageEngine.saveTables(updatedTables);
    refreshAllData();

    // Trigger auto-sync to Google Sheets if enabled
    const gsConfig = GoogleSheetsService.getConfig();
    if (gsConfig.autoSync && gsConfig.webAppUrl) {
      GoogleSheetsService.pushRevenueToGoogleSheets(POSStorageEngine.getPermanentRevenue()).catch(
        (err) => console.warn('Auto-sync to Google Sheets failed:', err)
      );
    }
  };

  // Mark Order Printed Handler
  const handleMarkPrinted = (orderId: string, type: 'KITCHEN' | 'INVOICE') => {
    const targetOrder = cachedOrders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const updatedOrder: Order = {
      ...targetOrder,
      kitchenPrintedAt: type === 'KITCHEN' ? new Date().toISOString() : targetOrder.kitchenPrintedAt,
      invoicePrintedAt: type === 'INVOICE' ? new Date().toISOString() : targetOrder.invoicePrintedAt,
    };

    POSStorageEngine.saveOrder(updatedOrder);
    setCachedOrders(POSStorageEngine.getCachedOrders());
  };

  // Save Menu Changes Handler
  const handleSaveMenu = (newMenu: MenuItem[]) => {
    POSStorageEngine.saveMenu(newMenu);
    setMenu(newMenu);
  };

  // Save Print Settings Handler
  const handleSavePrintSettings = (newSettings: PrintSettings) => {
    POSStorageEngine.savePrintSettings(newSettings);
    setPrintSettings(newSettings);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans antialiased text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metrics={systemMetrics}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGoogleSheets={() => setIsGoogleSheetsModalOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onOpenShiftManager={() => setIsShiftManagerOpen(true)}
        onOpenSpeedGame={() => setIsSpeedGameOpen(true)}
        onOpenGeminiKeyModal={() => setIsGeminiKeyModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'ORDERING' && (
          <OrderingView
            tables={tables}
            menu={menu}
            activeTableId={activeTableId}
            onSelectTable={handleSelectTable}
            activeOrder={activeOrder}
            printSettings={printSettings}
            onUpdateOrder={handleUpdateOrder}
            onConfirmPayment={handleConfirmPayment}
          />
        )}

        {activeTab === 'TABLES' && (
          <TableLayoutView
            tables={tables}
            orders={cachedOrders}
            onSelectTable={(tId) => {
              setActiveTableId(tId);
              setActiveTab('ORDERING');
            }}
            onUpdateTableStatus={(tId, newStatus) => {
              const updated = tables.map((t) => (t.id === tId ? { ...t, status: newStatus } : t));
              POSStorageEngine.saveTables(updated);
              setTables(updated);
            }}
            onTransferTableOrder={handleTransferTableOrder}
          />
        )}

        {activeTab === 'MENU' && (
          <MenuManagementView
            menu={menu}
            onSaveMenu={handleSaveMenu}
          />
        )}

        {activeTab === 'INVOICES' && (
          <InvoicesLogView
            orders={cachedOrders}
            printSettings={printSettings}
            onPreviewInvoice={(ord) => {
              setBillingModalOrder(ord);
              setBillingModalMode('INVOICE_PREVIEW');
            }}
          />
        )}

        {activeTab === 'ANALYTICS' && (
          <AnalyticsDashboardView
            revenueRecords={revenueRecords}
            orders={cachedOrders}
            menu={menu}
            printSettings={printSettings}
            onUpdateRevenueRecords={(newRecords) => setRevenueRecords(newRecords)}
          />
        )}

        {activeTab === 'ARCHITECT' && (
          <ArchitectDashboard
            metrics={systemMetrics}
            cachedOrders={cachedOrders}
            revenueRecords={revenueRecords}
            onRefreshData={refreshAllData}
            onOpenGoogleSheets={() => setIsGoogleSheetsModalOpen(true)}
          />
        )}
      </main>

      {/* Telemetry Status Footer */}
      <footer className="bg-slate-900 px-6 py-2.5 border-t border-slate-800 text-white text-[10px] tracking-wider font-mono uppercase flex flex-wrap items-center justify-between gap-2 select-none">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">CHẢ GIÒ QUẢNG NGÃI POS Core: Ready</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-slate-400">Calc Engine: {systemMetrics.calculationLatencyMs}ms</span>
          </div>
          <div className="hidden sm:flex items-center space-x-1.5">
            <span className="text-slate-400">Daily Cache: {systemMetrics.cachedOrdersCount} HD</span>
          </div>
        </div>
        <div className="text-slate-400 font-sans normal-case text-xs font-semibold">
          CHẢ GIÒ QUẢNG NGÃI • Hệ Thống Quản Lý Bán Hàng & Doanh Thu Google Sheets
        </div>
      </footer>

      {/* BILLING & PRINT MODAL */}
      {billingModalOrder && (
        <BillingPrintModal
          order={billingModalOrder}
          printSettings={printSettings}
          mode={billingModalMode}
          onClose={() => setBillingModalOrder(null)}
          onConfirmPayment={handleConfirmPayment}
          onMarkPrinted={handleMarkPrinted}
        />
      )}

      {/* PRINT SETTINGS MODAL */}
      {isSettingsOpen && (
        <PrintTemplateSettingsModal
          settings={printSettings}
          onSave={handleSavePrintSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* GOOGLE SHEETS SYNC MODAL */}
      {isGoogleSheetsModalOpen && (
        <GoogleSheetsSyncModal
          onClose={() => setIsGoogleSheetsModalOpen(false)}
          onDataSyncSuccess={refreshAllData}
        />
      )}

      {/* AI ASSISTANT MODAL */}
      {isAiAssistantOpen && (
        <AiAssistantModal
          onClose={() => setIsAiAssistantOpen(false)}
          orders={cachedOrders}
          revenueRecords={revenueRecords}
          menu={menu}
          onOpenApiKeyModal={() => setIsGeminiKeyModalOpen(true)}
        />
      )}

      {/* SHIFT MANAGEMENT MODAL */}
      {isShiftManagerOpen && (
        <ShiftManagementModal
          onClose={() => setIsShiftManagerOpen(false)}
          orders={cachedOrders}
        />
      )}

      {/* SPEED ORDER MINIGAME MODAL */}
      {isSpeedGameOpen && (
        <OrderSpeedGameModal
          onClose={() => setIsSpeedGameOpen(false)}
          menu={menu}
        />
      )}

      {/* GEMINI API KEY MODAL */}
      {isGeminiKeyModalOpen && (
        <GeminiApiKeyModal
          onClose={() => setIsGeminiKeyModalOpen(false)}
        />
      )}

    </div>
  );
}

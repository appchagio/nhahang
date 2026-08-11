import { PermanentRevenueAggregate } from '../types';

export interface GoogleSheetsConfig {
  webAppUrl: string;
  autoSync: boolean;
  lastSyncTime: string | null;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastMessage: string | null;
}

const CONFIG_KEY = 'pos_google_sheets_config_v1';

const DEFAULT_CONFIG: GoogleSheetsConfig = {
  webAppUrl: '',
  autoSync: true,
  lastSyncTime: null,
  status: 'DISCONNECTED',
  lastMessage: 'Chưa cấu hình URL Google Sheets Apps Script Web App',
};

export class GoogleSheetsService {
  /**
   * Lấy cấu hình Google Sheets từ LocalStorage
   */
  static getConfig(): GoogleSheetsConfig {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return DEFAULT_CONFIG;
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_CONFIG;
    }
  }

  /**
   * Lưu cấu hình Google Sheets vào LocalStorage
   */
  static saveConfig(config: GoogleSheetsConfig): void {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }

  /**
   * Đẩy danh sách doanh thu theo ngày từ POS lên Google Sheets
   */
  static async pushRevenueToGoogleSheets(
    records: PermanentRevenueAggregate[]
  ): Promise<{ success: boolean; message: string; count?: number }> {
    const config = this.getConfig();
    if (!config.webAppUrl || !config.webAppUrl.trim()) {
      const errState: GoogleSheetsConfig = {
        ...config,
        status: 'DISCONNECTED',
        lastMessage: 'Chưa nhập Web App URL Google Sheets',
      };
      this.saveConfig(errState);
      return { success: false, message: 'Vui lòng cấu hình Web App URL của Google Sheets.' };
    }

    try {
      // POST request to Google Apps Script Web App
      const response = await fetch(config.webAppUrl.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // Prevents CORS preflight issues with Apps Script
        },
        body: JSON.stringify({
          action: 'sync_revenue',
          appName: 'CHẢ GIÒ QUẢNG NGÃI',
          timestamp: new Date().toISOString(),
          records: records,
        }),
      });

      const resText = await response.text();
      let resJson: any;
      try {
        resJson = JSON.parse(resText);
      } catch {
        resJson = { status: 'success', raw: resText };
      }

      if (resJson.status === 'error') {
        const errorConfig: GoogleSheetsConfig = {
          ...config,
          status: 'ERROR',
          lastMessage: resJson.message || 'Lỗi xử lý từ Google Apps Script',
        };
        this.saveConfig(errorConfig);
        return { success: false, message: resJson.message || 'Lỗi kết nối Google Sheets' };
      }

      const now = new Date().toISOString();
      const updatedConfig: GoogleSheetsConfig = {
        ...config,
        status: 'CONNECTED',
        lastSyncTime: now,
        lastMessage: `Đã đồng bộ thành công ${records.length} bản ghi ngày`,
      };
      this.saveConfig(updatedConfig);

      return {
        success: true,
        message: `Đã đồng bộ thành công ${records.length} bản ghi tổng doanh thu theo ngày lên Google Sheets.`,
        count: records.length,
      };
    } catch (err: any) {
      const errorConfig: GoogleSheetsConfig = {
        ...config,
        status: 'ERROR',
        lastMessage: err.message || 'Lỗi kết nối mạng hoặc CORS',
      };
      this.saveConfig(errorConfig);
      return {
        success: false,
        message: `Lỗi đồng bộ: ${err.message || 'Không thể kết nối đến Google Sheets Web App.'}`,
      };
    }
  }

  /**
   * Tháo gỡ / Tải danh sách doanh thu trực tuyến từ Google Sheets về POS
   */
  static async pullRevenueFromGoogleSheets(): Promise<{
    success: boolean;
    message: string;
    records?: PermanentRevenueAggregate[];
  }> {
    const config = this.getConfig();
    if (!config.webAppUrl || !config.webAppUrl.trim()) {
      return { success: false, message: 'Vui lòng cấu hình Web App URL của Google Sheets.' };
    }

    try {
      const response = await fetch(config.webAppUrl.trim(), { method: 'GET' });
      const resText = await response.text();
      const resJson = JSON.parse(resText);

      if (resJson.status === 'success' && Array.isArray(resJson.records)) {
        const fetchedRecords: PermanentRevenueAggregate[] = resJson.records.map((r: any) => ({
          date: String(r.date),
          totalRevenue: Number(r.totalRevenue || 0),
          totalOrders: Number(r.totalOrders || 0),
          cashRevenue: Number(r.cashRevenue || 0),
          qrRevenue: Number(r.qrRevenue || 0),
          cardRevenue: Number(r.cardRevenue || 0),
          lastPurgeTime: r.lastPurgeTime || new Date().toISOString(),
        }));

        const now = new Date().toISOString();
        this.saveConfig({
          ...config,
          status: 'CONNECTED',
          lastSyncTime: now,
          lastMessage: `Đã tải về ${fetchedRecords.length} ngày doanh thu từ Google Sheets`,
        });

        return {
          success: true,
          message: `Đã tải thành công ${fetchedRecords.length} bản ghi doanh thu từ Google Sheets.`,
          records: fetchedRecords,
        };
      } else {
        return {
          success: false,
          message: resJson.message || 'Dữ liệu trả về từ Google Sheets không đúng định dạng.',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Không thể đọc dữ liệu từ Google Sheets: ${err.message || 'Lỗi mạng'}`,
      };
    }
  }

  /**
   * Tạo đoạn mã Google Apps Script tự động để người dùng dán vào Google Sheets
   */
  static getAppsScriptTemplate(): string {
    return `/**
 * Google Apps Script Backend cho CHẢ GIÒ QUẢNG NGÃI POS
 * Tự động tạo bảng & lưu trữ Tổng doanh thu theo ngày
 */

function doGet(e) {
  var sheet = getOrCreateSheet();
  var data = sheet.getDataRange().getValues();
  var records = [];
  
  if (data.length > 1) {
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (row[0]) {
        var dateStr = row[0] instanceof Date 
          ? Utilities.formatDate(row[0], Session.getScriptTimeZone(), "yyyy-MM-dd") 
          : String(row[0]);
          
        records.push({
          date: dateStr,
          totalRevenue: Number(row[1] || 0),
          totalOrders: Number(row[2] || 0),
          cashRevenue: Number(row[3] || 0),
          qrRevenue: Number(row[4] || 0),
          cardRevenue: Number(row[5] || 0),
          lastPurgeTime: row[6] ? String(row[6]) : ""
        });
      }
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: "success", records: records }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var sheet = getOrCreateSheet();
    var records = contents.records || [];
    
    var existingData = sheet.getDataRange().getValues();
    var dateRowMap = {};
    
    for (var i = 1; i < existingData.length; i++) {
      var d = existingData[i][0];
      var dateKey = d instanceof Date 
        ? Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd") 
        : String(d);
      dateRowMap[dateKey] = i + 1; // Line number 1-indexed
    }
    
    for (var j = 0; j < records.length; j++) {
      var r = records[j];
      var dateStr = String(r.date);
      var rowValues = [
        dateStr,
        r.totalRevenue,
        r.totalOrders,
        r.cashRevenue,
        r.qrRevenue,
        r.cardRevenue,
        r.lastPurgeTime || new Date().toISOString()
      ];
      
      if (dateRowMap[dateStr]) {
        var rowIndex = dateRowMap[dateStr];
        sheet.getRange(rowIndex, 1, 1, 7).setValues([rowValues]);
      } else {
        sheet.appendRow(rowValues);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      message: "Đã cập nhật " + records.length + " ngày doanh thu thành công!",
      count: records.length 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("DoanhThuNgay");
  if (!sheet) {
    sheet = ss.insertSheet("DoanhThuNgay");
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Ngày (YYYY-MM-DD)", 
      "Tổng Doanh Thu (VNĐ)", 
      "Số Đơn Hàng", 
      "Doanh Thu Tiền Mặt", 
      "Doanh Thu VietQR", 
      "Doanh Thu Thẻ", 
      "Lần Cập Nhật Cuối"
    ]);
    sheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#dbeafe").setFontColor("#1e40af");
    sheet.setFrozenRows(1);
  }
  return sheet;
}
`;
  }
}

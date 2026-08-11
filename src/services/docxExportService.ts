import { PermanentRevenueAggregate, Order, MenuItem, PrintSettings } from '../types';

export class DocxExportService {
  /**
   * Xuất Báo Cáo Doanh Thu Tổng Hợp ra file .docx
   */
  static exportRevenueReportDocx(
    revenueRecords: PermanentRevenueAggregate[],
    printSettings: PrintSettings
  ): void {
    const today = new Date().toLocaleDateString('vi-VN');
    const totalRevenueSum = revenueRecords.reduce((acc, r) => acc + r.totalRevenue, 0);
    const totalOrdersSum = revenueRecords.reduce((acc, r) => acc + r.totalOrders, 0);

    const tableRows = revenueRecords
      .map(
        (r) => `
      <tr>
        <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${r.date}</td>
        <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right; font-weight: bold; color: #047857;">${r.totalRevenue.toLocaleString('vi-VN')} đ</td>
        <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${r.totalOrders} đơn</td>
        <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">${r.cashRevenue.toLocaleString('vi-VN')} đ</td>
        <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">${r.qrRevenue.toLocaleString('vi-VN')} đ</td>
        <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">${r.cardRevenue.toLocaleString('vi-VN')} đ</td>
      </tr>
    `
      )
      .join('');

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Báo Cáo Doanh Thu - ${printSettings.restaurantName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 30px; color: #1e293b; }
          h1 { color: #047857; text-align: center; margin-bottom: 5px; }
          h3 { text-align: center; color: #475569; font-weight: normal; margin-top: 0; }
          .summary-box { background-color: #f1f5f9; border-left: 4px solid #047857; padding: 12px 18px; margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background-color: #047857; color: white; border: 1px solid #047857; padding: 10px; text-align: center; }
          .footer { margin-top: 40px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <h1>${printSettings.restaurantName}</h1>
        <h3>BÁO CÁO TỔNG HỢP DOANH THU THEO NGÀY</h3>
        <p style="text-align: center; font-size: 12px; color: #64748b;">Địa chỉ: ${printSettings.address} | SĐT: ${printSettings.phone}</p>
        <hr style="border: 0; border-top: 1px solid #cbd5e1;" />

        <div class="summary-box">
          <p><strong>Ngày xuất báo cáo:</strong> ${today}</p>
          <p><strong>Tổng số ngày lưu trữ:</strong> ${revenueRecords.length} ngày</p>
          <p><strong>Tổng số đơn hàng:</strong> ${totalOrdersSum.toLocaleString('vi-VN')} đơn</p>
          <p><strong>TỔNG DOANH THU:</strong> <span style="font-size: 18px; color: #047857; font-weight: bold;">${totalRevenueSum.toLocaleString('vi-VN')} VNĐ</span></p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Tổng Doanh Thu</th>
              <th>Số Đơn</th>
              <th>Tiền Mặt</th>
              <th>VietQR</th>
              <th>Thẻ POS</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div class="footer">
          <p>Báo cáo được xuất tự động từ Hệ Thống POS <strong>${printSettings.restaurantName}</strong></p>
        </div>
      </body>
      </html>
    `;

    this.downloadDocxFile(htmlContent, `BaoCaoDoanhThu_${printSettings.restaurantName.replace(/\s+/g, '_')}_${Date.now()}.docx`);
  }

  /**
   * Xuất Bảng Giá Thực Đơn Chuẩn In Ấn ra file .docx
   */
  static exportMenuCatalogDocx(menu: MenuItem[], printSettings: PrintSettings): void {
    const categories = Array.from(new Set(menu.map((m) => m.category)));

    const categoriesHtml = categories
      .map((cat) => {
        const catItems = menu.filter((m) => m.category === cat);
        const itemRows = catItems
          .map(
            (item) => `
        <tr>
          <td style="border-bottom: 1px solid #e2e8f0; padding: 10px; font-weight: bold; width: 60%;">${item.name}</td>
          <td style="border-bottom: 1px solid #e2e8f0; padding: 10px; font-mono: bold; text-align: right; color: #1e40af; width: 40%; font-size: 14px;">${item.price.toLocaleString('vi-VN')} đ</td>
        </tr>
      `
          )
          .join('');

        return `
        <h2 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 4px; margin-top: 25px;">${cat}</h2>
        <table style="width: 100%; border-collapse: collapse;">
          ${itemRows}
        </table>
      `;
      })
      .join('');

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>THỰC ĐƠN - ${printSettings.restaurantName}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #0f172a; }
          h1 { color: #1e40af; text-align: center; font-size: 26px; text-transform: uppercase; margin-bottom: 4px; }
          .sub { text-align: center; color: #475569; font-style: italic; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>${printSettings.restaurantName}</h1>
        <div class="sub">CHUYÊN CHẢ GIÒ QUẢNG NGÃI & MÓN ĂN VIỆT</div>
        <p style="text-align: center; font-size: 12px; color: #64748b;">Địa chỉ: ${printSettings.address} | Hotline: ${printSettings.phone}</p>
        <hr style="border: 0; border-top: 2px solid #1e40af;" />

        ${categoriesHtml}

        <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #64748b; font-style: italic;">
          ${printSettings.headerNote}
        </div>
      </body>
      </html>
    `;

    this.downloadDocxFile(htmlContent, `ThucDon_${printSettings.restaurantName.replace(/\s+/g, '_')}.docx`);
  }

  private static downloadDocxFile(htmlContent: string, filename: string): void {
    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// USB & Serial ESC/POS Direct Hardware Printer Driver for Rongta RP355UL & Sunmi D2 POS
import { Order, PrintSettings } from '../types';

// Convert Vietnamese accented text to clean ESC/POS friendly ASCII text (Prevents font corruption on Rongta RP355UL / Sunmi D2 hardware ROM)
export function removeVietnameseAccents(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

// Generate Raw ESC/POS Buffer for 80mm Rongta RP355UL Thermal Printer matching user's exact photo 100%
export function generateEscPosBuffer(order: Order, settings: PrintSettings): Uint8Array {
  const encoder = new TextEncoder();
  const bytes: number[] = [];

  const addBytes = (arr: number[]) => bytes.push(...arr);
  const addStr = (str: string) => {
    const encoded = encoder.encode(str);
    encoded.forEach((b) => bytes.push(b));
  };

  // 1. Initialize Printer (ESC @)
  addBytes([0x1b, 0x40]);

  // 2. Select Standard ASCII Code Page (ESC t 0)
  addBytes([0x1b, 0x74, 0x00]);

  // 3. Center Align (ESC a 1)
  addBytes([0x1b, 0x61, 0x01]);

  // Double Height & Width for Restaurant Name
  addBytes([0x1d, 0x21, 0x11]);
  addStr(`${removeVietnameseAccents(settings.restaurantName || 'CHA GIO BAP QUANG NGAI')}\n`);

  // Normal Font size for Address & Phone
  addBytes([0x1d, 0x21, 0x00]);
  addStr(`${removeVietnameseAccents(settings.address || '87, Hung Vuong, Phuong Ba Ria, TP HCM')}\n`);
  addStr(`SDT: ${settings.phone || '0972371722'}\n`);
  if (settings.wifiName) {
    addStr(`Wifi: ${removeVietnameseAccents(settings.wifiName)} - MK: ${settings.wifiPassword || '0914683351'}\n`);
  }

  addStr('------------------------------------------------\n');

  // Title: HOA DON THANH TOAN
  addBytes([0x1d, 0x21, 0x01]); // Enlarge Height & Bold for Title
  addStr('HOA DON THANH TOAN\n');
  addBytes([0x1d, 0x21, 0x00]);
  addStr(`Ma HD: ${order.code || 'HD-NEW'}\n`);
  const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN');
  addStr(`Ngay: ${removeVietnameseAccents(dateStr)}\n`);

  addStr('------------------------------------------------\n');

  // ASCII Table Grid with SL column FIRST
  addBytes([0x1b, 0x61, 0x00]); // Left Align
  addStr('+----+-----------------------+----------+\n');
  addStr('| SL |Ten mon                |   T.Tien |\n');
  addStr('+----+-----------------------+----------+\n');

  // Items List - SL column first, Double Height for SL and Dish Name
  (order.items || []).forEach((item) => {
    const rawName = removeVietnameseAccents(item.name || 'MON').toUpperCase();
    const paddedName = rawName.length > 23 ? rawName.substring(0, 23) : rawName.padEnd(23, ' ');
    const qtyStr = String(item.quantity || 1).padStart(2, ' ');
    const priceStr = `${(item.totalPrice || 0).toLocaleString('vi-VN')} d`.padStart(9, ' ');

    addBytes([0x1d, 0x21, 0x01]); // Double Height font enlarge (+75% size enlarge)
    addBytes([0x1b, 0x45, 0x00]); // Normal (No bold)
    addStr(`| ${qtyStr} |${paddedName}|${priceStr} |\n`);
    addBytes([0x1d, 0x21, 0x00]); // Reset font size
    addStr('+----+-----------------------+----------+\n'); // Solid Cell Border Line for each dish!
  });

  // Total Row spanning columns
  addStr(`|        Tong                |${(`${(order.totalAmount || 0).toLocaleString('vi-VN')} d`).padStart(10, ' ')}|\n`);
  addStr('+----+-----------------------+----------+\n');

  // Right Align for Total
  addBytes([0x1b, 0x61, 0x02]);
  addBytes([0x1d, 0x21, 0x01]); // Bold for Total
  addStr(`Tong cong: ${(order.totalAmount || 0).toLocaleString('vi-VN')} d\n`);
  addBytes([0x1d, 0x21, 0x00]);

  addStr('------------------------------------------------\n');

  // Center Align Footer
  addBytes([0x1b, 0x61, 0x01]);
  addStr(`${removeVietnameseAccents(settings.footerNote || 'CAM ON VA HEN GAP LAI QUY KHACH!')}\n\n\n\n`);

  // Full Paper Cut Command for Rongta RP355UL (GS V 0)
  addBytes([0x1d, 0x56, 0x00]);

  return new Uint8Array(bytes);
}

// Request and Pair WebUSB Rongta RP355UL Thermal Printer Device
export async function pairUsbPrinterDevice(): Promise<{ success: boolean; deviceName?: string; error?: string }> {
  try {
    if (!('usb' in navigator)) {
      return { success: false, error: 'Trình duyệt không hỗ trợ WebUSB. Hãy sử dụng Chrome / Sunmi Browser.' };
    }

    const device = await (navigator as any).usb.requestDevice({
      filters: [
        { vendorId: 0x0fe6 }, // Rongta Tech Vendor ID
        { vendorId: 0x04b8 }, // Epson / Generic POS
        { vendorId: 0x0483 }, // STMicroelectronics POS
        { vendorId: 0x1a86 }, // CH340 USB Serial
      ]
    }).catch(() => {
      // Fallback request without filters
      return (navigator as any).usb.requestDevice({ filters: [] });
    });

    if (device) {
      localStorage.setItem('sunmi_usb_printer_paired', 'true');
      localStorage.setItem('sunmi_usb_vendor_id', String(device.vendorId));
      localStorage.setItem('rongta_rp355ul_connected', 'true');

      try {
        if (!device.opened) await device.open();
        if (device.configuration === null) await device.selectConfiguration(1);
      } catch (e) {
        console.log('USB initial connect notice:', e);
      }

      return {
        success: true,
        deviceName: `Máy in Rongta RP355UL (USB VendorID: ${device.vendorId.toString(16)})`
      };
    }

    return { success: false, error: 'Không tìm thấy thiết bị USB Rongta RP355UL.' };
  } catch (err: any) {
    console.warn('Pair WebUSB printer error:', err);
    return { success: false, error: err.message || 'Lỗi ghép nối USB' };
  }
}

// Safe Helper to Connect Rongta RP355UL USB Device
async function connectAndClaimUsbDevice(device: any): Promise<{ interfaceNumber: number; endpointNumber: number }> {
  if (!device.opened) {
    await device.open();
  }
  if (device.configuration === null) {
    await device.selectConfiguration(1);
  }

  let interfaceNumber = 0;
  let endpointNumber = 1;

  if (device.configuration && device.configuration.interfaces) {
    for (const iface of device.configuration.interfaces) {
      for (const alt of iface.alternates) {
        if (alt.interfaceClass === 7 || alt.interfaceClass === 255 || alt.interfaceClass === 0) {
          interfaceNumber = iface.interfaceNumber;
          for (const ep of alt.endpoints) {
            if (ep.direction === 'out') {
              endpointNumber = ep.endpointNumber;
              break;
            }
          }
        }
      }
    }
  }

  try {
    await device.claimInterface(interfaceNumber);
  } catch (e) {
    console.log('USB interface claim notice:', e);
  }

  return { interfaceNumber, endpointNumber };
}

// Initialize Instant Automatic Background Reconnection to Rongta RP355UL USB Printer
export function initAutoUsbPrinterReconnection(): void {
  if (typeof window === 'undefined' || !('usb' in navigator)) return;

  // Auto-bind when Rongta RP355UL printer is powered ON or USB cable plugged in
  (navigator as any).usb.addEventListener('connect', async (event: any) => {
    console.log('Rongta RP355UL Printer plugged in / powered ON:', event.device);
    try {
      if (event.device) {
        await connectAndClaimUsbDevice(event.device);
        localStorage.setItem('sunmi_usb_printer_paired', 'true');
        localStorage.setItem('rongta_rp355ul_connected', 'true');
      }
    } catch (err) {
      console.warn('Auto USB connect handler notice:', err);
    }
  });

  // Auto connect paired devices instantly on startup
  (navigator as any).usb.getDevices().then((devices: any[]) => {
    if (devices && devices.length > 0) {
      devices.forEach(async (device) => {
        try {
          await connectAndClaimUsbDevice(device);
          localStorage.setItem('sunmi_usb_printer_paired', 'true');
          localStorage.setItem('rongta_rp355ul_connected', 'true');
        } catch (e) {
          console.log('Startup USB auto-connect notice:', e);
        }
      });
    }
  }).catch((err: any) => {
    console.warn('Auto getDevices notice:', err);
  });
}

// Direct WebUSB Hardware Printer Output Function for Rongta RP355UL (Zero Prompts Needed!)
export async function printDirectUsbEscPos(order: Order, settings: PrintSettings): Promise<boolean> {
  const maxRetries = 2;

  // 1. Attempt WebUSB Direct Hardware Output to Rongta RP355UL
  if ('usb' in navigator) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const devices = await (navigator as any).usb.getDevices();
        if (devices && devices.length > 0) {
          const device = devices[0];
          
          const { interfaceNumber, endpointNumber } = await connectAndClaimUsbDevice(device);

          const copies = settings.invoiceCopies || 2;
          for (let i = 0; i < copies; i++) {
            const rawBuffer = generateEscPosBuffer(order, settings);
            await device.transferOut(endpointNumber, rawBuffer);
          }

          try {
            await device.releaseInterface(interfaceNumber);
            await device.close();
          } catch (e) {
            // Ignore close notice
          }

          return true; // Printing to Rongta RP355UL successful!
        }
      } catch (err) {
        console.warn(`Rongta RP355UL Print attempt ${attempt + 1} failed, retrying...`, err);
        await new Promise((res) => setTimeout(res, 200));
      }
    }
  }

  // 2. Attempt WebSerial Output
  if ('serial' in navigator) {
    try {
      const ports = await (navigator as any).serial.getPorts();
      if (ports && ports.length > 0) {
        const port = ports[0];
        await port.open({ baudRate: 9600 });
        const writer = port.writable.getWriter();
        
        const copies = settings.invoiceCopies || 2;
        for (let i = 0; i < copies; i++) {
          const rawBuffer = generateEscPosBuffer(order, settings);
          await writer.write(rawBuffer);
        }

        writer.releaseLock();
        await port.close();
        return true;
      }
    } catch (err) {
      console.warn('Serial print notice:', err);
    }
  }

  return false;
}

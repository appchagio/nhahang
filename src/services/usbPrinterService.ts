// USB & Serial ESC/POS Direct Hardware Printer Driver for Sunmi D2 & Android/Windows POS
import { Order, PrintSettings } from '../types';

// Convert Vietnamese accented text to clean ESC/POS friendly ASCII text (Prevents font corruption on Sunmi D2 hardware ROM)
export function removeVietnameseAccents(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

// Generate Raw ESC/POS Buffer for 80mm Sunmi D2 Thermal Printer matching user's exact photo 100%
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

  // ASCII Table Grid matching uploaded photo 100% with solid cell borders for every dish item
  addBytes([0x1b, 0x61, 0x00]); // Left Align
  addStr('+-----------------------+----+----------+\n');
  addStr('|Ten mon                | SL |   T.Tien |\n');
  addStr('+-----------------------+----+----------+\n');

  // Items List - Super Bold & Large Uppercase Dish Names with Solid Line Separator for Each Item
  (order.items || []).forEach((item) => {
    const rawName = removeVietnameseAccents(item.name || 'MON').toUpperCase();
    const paddedName = rawName.length > 23 ? rawName.substring(0, 23) : rawName.padEnd(23, ' ');
    const qtyStr = String(item.quantity || 1).padStart(2, ' ');
    const priceStr = `${(item.totalPrice || 0).toLocaleString('vi-VN')} d`.padStart(9, ' ');

    addBytes([0x1d, 0x21, 0x00]); // Standard height & width font (60% size of double height)
    addBytes([0x1b, 0x45, 0x01]); // ESC E 1: Bold text
    addStr(`|${paddedName}| ${qtyStr} |${priceStr} |\n`);
    addBytes([0x1b, 0x45, 0x00]); // Reset bold
    addStr('+-----------------------+----+----------+\n'); // Solid Cell Border Line for each dish!
  });

  // Right Align for Total
  addBytes([0x1b, 0x61, 0x02]);
  addBytes([0x1d, 0x21, 0x01]); // Bold for Total
  addStr(`Tong cong: ${(order.totalAmount || 0).toLocaleString('vi-VN')} d\n`);
  addBytes([0x1d, 0x21, 0x00]);

  addStr('------------------------------------------------\n');

  // Center Align Footer
  addBytes([0x1b, 0x61, 0x01]);
  addStr(`${removeVietnameseAccents(settings.footerNote || 'CAM ON VA HEN GAP LAI QUY KHACH!')}\n\n\n\n`);

  // Full Paper Cut Command (GS V 0)
  addBytes([0x1d, 0x56, 0x00]);

  return new Uint8Array(bytes);
}

// Request and Save WebUSB Device Permission (Direct USB Sunmi D2 / RONGTA)
export async function pairUsbPrinterDevice(): Promise<{ success: boolean; deviceName?: string; error?: string }> {
  try {
    if (!('usb' in navigator)) {
      return { success: false, error: 'Trình duyệt không hỗ trợ WebUSB. Hãy sử dụng Chrome/Sunmi Browser.' };
    }

    const device = await (navigator as any).usb.requestDevice({
      filters: []
    });

    if (device) {
      await device.open();
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }
      return {
        success: true,
        deviceName: `${device.productName || 'Máy in USB POS'} (VendorID: ${device.vendorId.toString(16)})`
      };
    }

    return { success: false, error: 'Không tìm thấy thiết bị USB.' };
  } catch (err: any) {
    console.warn('Pair WebUSB printer error:', err);
    return { success: false, error: err.message || 'Lỗi ghép nối USB' };
  }
}

// Direct WebUSB Hardware Printer Output Function (Zero Drivers Needed!)
export async function printDirectUsbEscPos(order: Order, settings: PrintSettings): Promise<boolean> {
  try {
    if ('usb' in navigator) {
      const devices = await (navigator as any).usb.getDevices();
      if (devices && devices.length > 0) {
        const device = devices[0];
        await device.open();
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

        await device.claimInterface(interfaceNumber);

        const copies = settings.invoiceCopies || 2;
        for (let i = 0; i < copies; i++) {
          const rawBuffer = generateEscPosBuffer(order, settings);
          await device.transferOut(endpointNumber, rawBuffer);
        }

        await device.releaseInterface(interfaceNumber);
        await device.close();
        return true;
      }
    }

    if ('serial' in navigator) {
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
    }
  } catch (err) {
    console.warn('Direct USB ESC/POS print failed, falling back to window.print()', err);
  }

  return false;
}

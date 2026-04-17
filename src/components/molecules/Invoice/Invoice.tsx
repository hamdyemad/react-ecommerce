/**
 * Invoice utility - generates a self-contained HTML string for PDF generation.
 * Uses inline styles so it works perfectly with html2pdf's html2canvas capture.
 */

interface InvoiceOrder {
  order_number: string;
  created_at: string;
  customer?: { name: string; phone: string; email: string; address: string };
  location?: { city_name: string; region_name: string; country_name: string };
  vendors_stages?: { vendor_id: number; vendor_name: string; stage_name: string }[];
  products?: any[];
  pricing?: {
    total_product_price: number;
    total_tax: number;
    shipping: number;
    total_price: number;
  };
  promo?: { code: string; discount_amount: number };
}

export function generateInvoiceHTML(order: InvoiceOrder, lang: string = 'en', logoUrl?: string): string {
  const isRTL = lang === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';
  const currency = isRTL ? 'جنيه' : 'EGP';
  const textAlign = isRTL ? 'right' : 'left';
  const textAlignEnd = isRTL ? 'left' : 'right';

  const L = {
    invoice: isRTL ? 'فاتورة' : 'INVOICE',
    orderDetails: isRTL ? 'تفاصيل الطلب' : 'ORDER DETAILS',
    customer: isRTL ? 'العميل' : 'CUSTOMER',
    shipping: isRTL ? 'الشحن' : 'SHIPPING',
    invoiceNo: isRTL ? 'رقم الفاتورة' : 'Invoice No.',
    date: isRTL ? 'التاريخ' : 'Date',
    status: isRTL ? 'الحالة' : 'Status',
    name: isRTL ? 'الاسم' : 'Name',
    phone: isRTL ? 'الهاتف' : 'Phone',
    email: isRTL ? 'البريد' : 'Email',
    address: isRTL ? 'العنوان' : 'Address',
    city: isRTL ? 'المدينة' : 'City',
    region: isRTL ? 'المنطقة' : 'Region',
    country: isRTL ? 'الدولة' : 'Country',
    orderItems: isRTL ? 'أصناف الطلب' : 'ORDER ITEMS',
    product: isRTL ? 'المنتج' : 'PRODUCT',
    price: isRTL ? 'السعر' : 'PRICE',
    taxes: isRTL ? 'الضرائب' : 'TAXES',
    priceIncTax: isRTL ? 'شامل الضريبة' : 'PRICE INC. TAX',
    qty: isRTL ? 'الكمية' : 'QTY',
    total: isRTL ? 'الإجمالي' : 'TOTAL',
    subtotal: isRTL ? 'الإجمالي قبل الضريبة' : 'Subtotal',
    pricesIncTax: isRTL ? 'شامل الضريبة' : 'Prices Inc. Tax',
    shippingFee: isRTL ? 'الشحن' : 'Shipping',
    totalWithShipping: isRTL ? 'شامل الشحن' : 'Total with Shipping',
    grandTotal: isRTL ? 'الإجمالي النهائي' : 'Total',
    promoDiscount: isRTL ? 'خصم الكود' : 'Promo Discount',
    thankYou: isRTL ? 'شكراً لطلبك!' : 'Thank you for your order!',
  };

  const stageName = order.vendors_stages?.[0]?.stage_name || 'N/A';
  const totalProductPrice = order.pricing?.total_product_price || 0;
  const totalTax = order.pricing?.total_tax || 0;
  const shippingCost = order.pricing?.shipping || 0;
  const totalPrice = order.pricing?.total_price || 0;
  const pricesIncTax = totalProductPrice + totalTax;

  // Build product rows
  const productRows = (order.products || []).map((item: any, index: number) => {
    const unitPrice = item.unit_price_without_taxes || 0;
    const taxAmount = item.taxes?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0;
    const unitPriceAfterTax = item.unit_price_after_taxes || 0;
    const taxBadges = (item.taxes || []).map((tax: any) =>
      `<span style="display:inline-block;background:#eef;padding:1px 5px;border-radius:3px;font-size:7px;color:#0056B7;margin:1px;font-weight:600;">${tax.tax_name} ${tax.percentage}%</span>`
    ).join('');

    return `<tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:11px;text-align:center;color:#999;">${index + 1}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;">
        <div style="font-weight:700;font-size:11px;color:#1a1a2e;margin-bottom:2px;">${item.product?.name || ''}</div>
        ${item.vendor?.name ? `<div style="font-size:8px;color:#667eea;margin-bottom:2px;">${item.vendor.name}</div>` : ''}
        ${item.variant?.sku || item.variant?.name ? `<span style="display:inline-block;background:rgba(0,86,183,0.08);padding:1px 6px;border-radius:3px;font-size:8px;color:#0056B7;font-weight:600;">${item.variant?.sku || item.variant?.name}</span>` : ''}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:11px;">${unitPrice.toFixed(2)} ${currency}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">
        <div style="font-size:9px;">${taxAmount.toFixed(2)} ${currency}</div>
        ${taxBadges ? `<div style="margin-top:2px;">${taxBadges}</div>` : ''}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:11px;">${unitPriceAfterTax.toFixed(2)} ${currency}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:11px;font-weight:700;">${item.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:${textAlignEnd};font-size:12px;font-weight:700;color:#1a1a2e;">${(item.total || 0).toFixed(2)} ${currency}</td>
    </tr>`;
  }).join('');

  // Promo discount row
  const promoRow = order.promo?.discount_amount && order.promo.discount_amount > 0
    ? `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed rgba(0,0,0,0.06);">
         <span style="font-size:12px;color:#666;">${L.promoDiscount} (${order.promo.code})</span>
         <span style="font-size:12px;font-weight:600;color:#e74c3c;">-${order.promo.discount_amount.toFixed(2)} ${currency}</span>
       </div>`
    : '';

  // Logo section
  const logoSection = logoUrl
    ? `<img src="${logoUrl}" alt="Anibal" style="height:50px;object-fit:contain;" crossorigin="anonymous" />`
    : `<div style="font-family:cursive,serif;font-size:28px;font-weight:700;color:#1a1a2e;font-style:italic;">Anibal</div>`;

  // Info row helper
  const infoRow = (label: string, value: string, isLast = false) => `
    <div style="display:flex;justify-content:space-between;padding:5px 0;${isLast ? '' : 'border-bottom:1px dashed rgba(0,0,0,0.05);'}">
      <span style="font-size:11px;color:#888;font-weight:500;">${label}</span>
      <span style="font-size:11px;font-weight:600;color:#1a1a2e;text-align:${textAlignEnd};max-width:130px;">${value}</span>
    </div>`;

  // Section header helper
  const sectionHeader = (icon: string, title: string) => `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:8px;border-bottom:2px solid rgba(0,86,183,0.1);">
      <div style="width:26px;height:26px;background:linear-gradient(135deg,#0056B7,#003a7a);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;">${icon}</div>
      <span style="font-size:10px;font-weight:700;color:#0056B7;text-transform:uppercase;letter-spacing:1px;">${title}</span>
    </div>`;

  // Summary row helper
  const summaryRow = (label: string, value: string, isBold = false) => `
    <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px dashed rgba(0,0,0,0.06);">
      <span style="font-size:11px;color:#666;${isBold ? 'font-weight:700;' : ''}">${label}</span>
      <span style="font-size:11px;font-weight:600;color:#1a1a2e;">${value}</span>
    </div>`;

  return `<div dir="${dir}" style="width:780px; min-height:1040px; margin:0; padding:0; background:#fff; font-family:Arial,Helvetica,sans-serif; color:#1a1a2e; line-height:1.4; font-size:12px; display:flex; flex-direction:column; justify-content:space-between;">
  
  <div>
    <!-- Invoice Badge -->
    <div style="padding:20px 30px 8px;text-align:center;">
      <div style="background:linear-gradient(to right,#0056B7,#cb1037);padding:12px 20px;border-radius:14px;text-align:center;">
        <span style="font-size:16px;font-weight:800;color:#fff;letter-spacing:4px;text-transform:uppercase;">${L.invoice}</span>
      </div>
      <div style="margin-top:10px;">
        <div style="font-size:14px;font-weight:700;color:#1a1a2e;margin-bottom:3px;">Anibal - ${L.invoice} #${order.order_number}</div>
        <div style="font-size:11px;color:#888;">${order.created_at}</div>
      </div>
    </div>

    <!-- Logo -->
    <div style="padding:8px 30px 18px;display:flex;justify-content:center;align-items:center;border-bottom:1px solid #f0f0f0;">
      ${logoSection}
    </div>

    <!-- Content -->
    <div style="padding:20px 30px;">
      
      <!-- Info Grid -->
      <div style="background:linear-gradient(135deg,#f8f9ff 0%,#f0f4ff 100%);border-radius:12px;padding:18px;border:1px solid rgba(0,86,183,0.1);margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <!-- Order Details -->
            <td style="width:33%;vertical-align:top;padding-right:${isRTL ? '0' : '15px'};padding-left:${isRTL ? '15px' : '0'};border-${isRTL ? 'left' : 'right'}:1px dashed rgba(0,86,183,0.2);">
              ${sectionHeader('📋', L.orderDetails)}
              ${infoRow(L.invoiceNo, '#' + order.order_number)}
              ${infoRow(L.date, order.created_at)}
              <div style="display:flex;justify-content:space-between;padding:5px 0;">
                <span style="font-size:11px;color:#888;font-weight:500;">${L.status}</span>
                <span style="display:inline-block;padding:2px 10px;border-radius:10px;font-size:9px;font-weight:700;text-transform:uppercase;background:#0056B7;color:#fff;">${stageName}</span>
              </div>
            </td>
            <!-- Customer -->
            <td style="width:33%;vertical-align:top;padding:0 15px;border-${isRTL ? 'left' : 'right'}:1px dashed rgba(0,86,183,0.2);">
              ${sectionHeader('👤', L.customer)}
              ${infoRow(L.name, order.customer?.name || '-')}
              ${infoRow(L.phone, order.customer?.phone || '-')}
              ${infoRow(L.email, order.customer?.email || '-', true)}
            </td>
            <!-- Shipping -->
            <td style="width:33%;vertical-align:top;padding-left:${isRTL ? '0' : '15px'};padding-right:${isRTL ? '15px' : '0'};">
              ${sectionHeader('📍', L.shipping)}
              ${infoRow(L.address, order.customer?.address || '-')}
              ${infoRow(L.city, order.location?.city_name || '-')}
              ${infoRow(L.region, order.location?.region_name || '-')}
              ${infoRow(L.country, order.location?.country_name || 'Egypt', true)}
            </td>
          </tr>
        </table>
      </div>

      <!-- Products Table -->
      <div style="margin-bottom:15px;">
        <div style="font-size:11px;font-weight:700;color:#0056B7;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;padding-bottom:5px;border-bottom:2px solid rgba(0,86,183,0.15);">
          ● ${L.orderItems}
        </div>
        <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;">
          <thead>
            <tr style="background:linear-gradient(to right,#0056B7,#cb1037);">
              <th style="padding:10px 12px;text-align:center;font-size:10px;font-weight:600;color:#fff;text-transform:uppercase;letter-spacing:0.5px;width:5%;">#</th>
              <th style="padding:10px 12px;text-align:${textAlign};font-size:10px;font-weight:600;color:#fff;text-transform:uppercase;letter-spacing:0.5px;width:28%;">${L.product}</th>
              <th style="padding:10px 12px;text-align:center;font-size:10px;font-weight:600;color:#fff;text-transform:uppercase;letter-spacing:0.5px;width:12%;">${L.price}</th>
              <th style="padding:10px 12px;text-align:center;font-size:10px;font-weight:600;color:#fff;text-transform:uppercase;letter-spacing:0.5px;width:15%;">${L.taxes}</th>
              <th style="padding:10px 12px;text-align:center;font-size:10px;font-weight:600;color:#fff;text-transform:uppercase;letter-spacing:0.5px;width:13%;">${L.priceIncTax}</th>
              <th style="padding:10px 12px;text-align:center;font-size:10px;font-weight:600;color:#fff;text-transform:uppercase;letter-spacing:0.5px;width:8%;">${L.qty}</th>
              <th style="padding:10px 12px;text-align:${textAlignEnd};font-size:10px;font-weight:600;color:#fff;text-transform:uppercase;letter-spacing:0.5px;width:17%;">${L.total}</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
        </table>
      </div>

      <!-- Summary -->
      <div style="display:flex;justify-content:flex-${isRTL ? 'start' : 'end'};margin-top:15px;">
        <div style="min-width:260px;background:linear-gradient(135deg,#f8f9ff 0%,#f0f4ff 100%);border-radius:12px;padding:15px;border:1px solid rgba(0,86,183,0.1);">
          ${summaryRow(L.subtotal, totalProductPrice.toFixed(2) + ' ' + currency)}
          ${summaryRow(L.taxes, totalTax.toFixed(2) + ' ' + currency)}
          ${summaryRow(L.pricesIncTax, pricesIncTax.toFixed(2) + ' ' + currency)}
          ${summaryRow(L.shippingFee, shippingCost.toFixed(2) + ' ' + currency)}
          ${summaryRow(L.totalWithShipping, (pricesIncTax + shippingCost).toFixed(2) + ' ' + currency)}
          ${promoRow}
          <div style="margin-top:8px;padding-top:10px;border-top:2px solid #0056B7;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:14px;font-weight:700;color:#1a1a2e;">${L.grandTotal}</span>
            <span style="font-size:18px;font-weight:800;color:#0056B7;">${totalPrice.toFixed(2)} ${currency}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div style="background:linear-gradient(135deg,#f8f9ff 0%,#f0f4ff 100%);padding:15px 30px;text-align:center;border-top:1px solid rgba(0,86,183,0.1);margin-top:auto;">
    <span style="font-size:12px;font-weight:500;color:#888;">${L.thankYou}</span>
  </div>
</div>`;
}

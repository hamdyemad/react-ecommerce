import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDirection } from '../../../hooks/useDirection';
import logoEn from '../../../assets/logos/logo_en.png';
import logoAr from '../../../assets/logos/logo_ar.png';

interface InvoiceProps {
  order: any;
}

export function Invoice({ order }: InvoiceProps) {
  const { t, i18n } = useTranslation();
  const { selectedCountry } = useDirection();
  const isRTL = i18n.language === 'ar';
  const currency = selectedCountry?.currency?.code || 'EGP';

  if (!order) return null;

  return (
    <div className="invoice-print-wrapper" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="invoice-container">
        {/* Invoice Title */}
        <div className="invoice-title-section">
          <div className="invoice-badge">
            <h1>{isRTL ? 'فاتورة' : 'Invoice'}</h1>
          </div>
          <div className="invoice-order-info">
            <div className="invoice-order-number">Anibal - {isRTL ? 'فاتورة' : 'Invoice'} #{order.order_number}</div>
            <div className="invoice-order-date">{order.created_at || new Date().toLocaleDateString()}</div>
          </div>
        </div>
        
        {/* Header */}
        <div className="invoice-header">
          <div className="logo-section">
            <img src={isRTL ? logoAr : logoEn} alt="Anibal" />
          </div>
        </div>

        {/* Content */}
        <div className="invoice-content">
          {/* Combined Info Box */}
          <div className="info-box">
            <div className="info-box-grid">
              {/* Order Details */}
              <div className="info-section">
                <div className="info-section-header">
                  <div className="info-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                    </svg>
                  </div>
                  <span className="info-section-title">{isRTL ? 'تفاصيل الطلب' : 'Order Details'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">{isRTL ? 'رقم الفاتورة' : 'Invoice No.'}</span>
                  <span className="info-value">#{order.order_number}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">{isRTL ? 'التاريخ' : 'Date'}</span>
                  <span className="info-value">{order.created_at || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">{isRTL ? 'الحالة' : 'Status'}</span>
                  <span className="status-badge">{order.current_stage?.name || 'N/A'}</span>
                </div>
              </div>

              {/* Customer */}
              <div className="info-section">
                <div className="info-section-header">
                  <div className="info-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                    </svg>
                  </div>
                  <span className="info-section-title">{isRTL ? 'العميل' : 'Customer'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">{isRTL ? 'الاسم' : 'Name'}</span>
                  <span className="info-value">{order.customer_name || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">{isRTL ? 'الهاتف' : 'Phone'}</span>
                  <span className="info-value">{order.customer_phone || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">{isRTL ? 'البريد' : 'Email'}</span>
                  <span className="info-value">{order.customer_email || '-'}</span>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="info-section">
                <div className="info-section-header">
                  <div className="info-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                    </svg>
                  </div>
                  <span className="info-section-title">{isRTL ? 'الشحن' : 'Shipping'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">{isRTL ? 'العنوان' : 'Address'}</span>
                  <span className="info-value">{order.customer_address || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">{isRTL ? 'الدولة' : 'Country'}</span>
                  <span className="info-value">{selectedCountry?.name || 'Egypt'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="products-section">
            <div className="section-title">{isRTL ? 'أصناف الطلب' : 'Order Items'}</div>
            <table className="products-table">
              <thead>
                <tr>
                  <th style={{ width: '5%' }}>#</th>
                  <th style={{ width: '45%' }}>{isRTL ? 'المنتج' : 'Product'}</th>
                  <th className="text-center" style={{ width: '15%' }}>{isRTL ? 'السعر' : 'Price'}</th>
                  <th className="text-center" style={{ width: '10%' }}>{isRTL ? 'الكمية' : 'Qty'}</th>
                  <th className="text-right" style={{ width: '25%' }}>{isRTL ? 'الإجمالي' : 'Total'}</th>
                </tr>
              </thead>
              <tbody>
                {order.products?.map((item: any, index: number) => (
                  <tr key={item.id}>
                    <td className="text-center">{index + 1}</td>
                    <td>
                      <div className="product-name">{item.product?.name}</div>
                      <div className="product-sku">{item.product?.sku || 'N/A'}</div>
                    </td>
                    <td className="text-center">{item.price} {currency}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">{item.total} {currency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="summary-section">
            <div className="summary-card">
              <div className="summary-row">
                <span className="summary-label">{isRTL ? 'الإجمالي الفرعي' : 'Subtotal'}</span>
                <span className="summary-value">{order.total_product_price || order.total} {currency}</span>
              </div>
              {order.total_tax > 0 && (
                <div className="summary-row">
                  <span className="summary-label">{isRTL ? 'الضرائب' : 'Taxes'}</span>
                  <span className="summary-value">{order.total_tax} {currency}</span>
                </div>
              )}
              {order.shipping > 0 && (
                <div className="summary-row">
                  <span className="summary-label">{isRTL ? 'الشحن' : 'Shipping'}</span>
                  <span className="summary-value">{order.shipping} {currency}</span>
                </div>
              )}
              {order.promo_discount > 0 && (
                <div className="summary-row">
                  <span className="summary-label">{isRTL ? 'خصم الكود' : 'Promo Discount'}</span>
                  <span className="summary-value discount-value">-{order.promo_discount} {currency}</span>
                </div>
              )}
              <div className="summary-row total">
                <span className="summary-label">{isRTL ? 'الإجمالي' : 'Total'}</span>
                <span className="summary-value">{order.total_price || order.total} {currency}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="invoice-footer">
          <span className="footer-text">{isRTL ? 'شكراً لطلبك!' : 'Thank you for your order!'}</span>
        </div>
      </div>
    </div>
  );
}

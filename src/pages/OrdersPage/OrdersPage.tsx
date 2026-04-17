import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { BreadCrumb } from '../../components/molecules/BreadCrumb';
import { CurrencyDisplay } from '../../components/atoms/CurrencyDisplay';
import { tokens } from '../../tokens';
import { orderService } from '../../services/orderService';
import { generateInvoiceHTML } from '../../components/molecules/Invoice/Invoice';
import { Button } from '../../components/atoms/Button';
import { toast } from 'react-hot-toast';
import { ProductThumbnail } from '../../components/molecules/ProductThumbnail';
import logoEn from '../../assets/logos/logo_en.png';
import logoAr from '../../assets/logos/logo_ar.png';

export function OrdersPage() {
  const { mode } = useTheme();
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const loaderRef = useRef<HTMLDivElement>(null);

  const downloadPDF = useCallback(async () => {
    if (!selectedOrder) return;
    
    const loadingToast = toast.loading(t('generatingInvoice', 'Generating Invoice...'));

    try {
      // @ts-ignore
      const html2pdf = window.html2pdf;
      if (!html2pdf) {
        throw new Error('html2pdf.js not loaded');
      }

      // Generate invoice HTML string with inline styles
      const logoUrl = new URL(i18n.language === 'ar' ? logoAr : logoEn, window.location.origin).href;
      const invoiceHTML = generateInvoiceHTML(selectedOrder, i18n.language, logoUrl);

      // Create a temporary container in the DOM
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = invoiceHTML;
      tempContainer.style.position = 'fixed';
      tempContainer.style.top = '0';
      tempContainer.style.left = '0';
      tempContainer.style.zIndex = '-9999';
      tempContainer.style.background = 'white';
      document.body.appendChild(tempContainer);

      // Wait for images/fonts to load
      await new Promise(resolve => setTimeout(resolve, 500));

      const opt = {
        margin: [5, 5, 10, 5],
        filename: `Invoice-${selectedOrder.order_number}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          allowTaint: true,
          logging: false
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(tempContainer.firstElementChild).save();
      toast.success(t('invoiceDownloaded', 'Invoice downloaded successfully'), { id: loadingToast });

      // Clean up
      document.body.removeChild(tempContainer);
    } catch (err) {
      console.error('PDF generation failed:', err);
      toast.error(t('invoiceDownloadFailed', 'Failed to download invoice'), { id: loadingToast });
    }
  }, [selectedOrder, t, i18n]);

  const fetchOrders = useCallback(async (page: number, append: boolean = false) => {
    if (page > 1) setLoadingMore(true);
    else setLoading(true);

    try {
      const res = await orderService.getOrders(page);
      if (res.status) {
        if (append) {
          setOrders(prev => [...prev, ...(res.data || [])]);
        } else {
          setOrders(res.data || []);
        }
        
        // Handle pagination metadata if exists, otherwise assume no more if data is empty or less than typical page size
        if (res.pagination) {
          setHasMore(res.pagination.current_page < res.pagination.last_page);
        } else {
          setHasMore(res.data && res.data.length >= 10); // Fallback
        }
      } else {
        toast.error(res.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchOrders(nextPage, true);
      }
    }, { threshold: 0.1 });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, currentPage, fetchOrders]);

  const handleViewDetails = async (orderId: number) => {
    setLoadingDetails(true);
    try {
      const res = await orderService.getOrder(orderId);
      if (res.status) {
        setSelectedOrder(res.data);
      } else {
        toast.error(res.message || 'Failed to load order details');
      }
    } catch (err) {
      toast.error('Failed to load order details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const getStatusColor = (order: any) => {
    // Check first vendor's stage if available
    const stage = order.vendors_stages?.[0] || order.current_stage;
    return stage?.stage_color || stage?.color || tokens.colors[mode].primary.DEFAULT;
  };

  const getStatusName = (order: any) => {
    const stage = order.vendors_stages?.[0] || order.current_stage;
    return stage?.stage_name || stage?.name || t('pending');
  };

  const getStatusIcon = (order: any) => {
    const stage = order.vendors_stages?.[0] || order.current_stage;
    const type = stage?.stage_type || stage?.type;
    switch (type) {
      case 'deliver': return '✅';
      case 'shipping': return '🚚';
      case 'in_progress': return '⏳';
      case 'new': return '🆕';
      case 'cancel': return '❌';
      default: return '📦';
    }
  };

  return (
    <div className="py-8">
      <div className="no-print">
        <BreadCrumb 
          items={[
            { label: t('home'), path: '/' },
            { label: t('account'), path: '/profile' },
            { label: t('myOrdersPageTitle'), path: '/profile/orders' }
          ]}
        />

        {/* Header */}
        <div className="mb-12 px-2">
          <h1 className="text-3xl sm:text-5xl font-black mb-4" style={{ color: tokens.colors[mode].text.primary }}>
            📦 {t('myOrdersPageTitle')}
          </h1>
          <p className="text-lg sm:text-xl font-bold opacity-70" style={{ color: tokens.colors[mode].text.secondary }}>
            {t('trackManageOrders')}
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-6 sm:space-y-8 px-2 max-w-6xl">
          {loading && orders.length === 0 ? (
            <div className="p-20 text-center animate-pulse">
               <span className="text-6xl mb-4 block">📦</span>
               <p className="text-xl font-bold opacity-50">{t('loadingOrders', 'Loading your orders...')}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-20 text-center rounded-[50px] bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800">
               <span className="text-6xl mb-4 block">📭</span>
               <p className="text-2xl font-black mb-2">{t('noOrdersYet', 'No orders yet')}</p>
               <p className="opacity-60 mb-8">{t('startShoppingToSeeOrders', 'Start shopping to see your orders here!')}</p>
               <Button onClick={() => window.location.href = '/'} variant="primary" size="lg" className="rounded-2xl px-10">
                 {t('shopNow')}
               </Button>
            </div>
          ) : (
            <>
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-6 sm:p-10 rounded-[35px] sm:rounded-[45px] transition-all duration-500 hover:scale-[1.01] shadow-xl sm:shadow-2xl relative overflow-hidden group"
                  style={{
                    background: tokens.colors[mode].surface.elevated,
                    border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
                  }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-10">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                        <h3 className="text-2xl sm:text-3xl font-black" style={{ color: tokens.colors[mode].text.primary }}>
                          #{order.order_number}
                        </h3>
                        <span 
                          className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center gap-2 sm:gap-3"
                          style={{ background: `${getStatusColor(order)}15`, color: getStatusColor(order) }}
                        >
                          <span>{getStatusIcon(order)}</span> {getStatusName(order)}
                        </span>
                      </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 mb-8 sm:mb-10">
                          <div>
                            <p className="text-[10px] sm:text-sm font-black uppercase opacity-40 mb-2">{t('orderDate')}</p>
                            <p className="text-lg sm:text-xl font-bold">{order.created_at}</p>
                          </div>
                          <div>
                            <p className="text-[10px] sm:text-sm font-black uppercase opacity-40 mb-2">{t('totalAmount')}</p>
                            <p className="font-black text-xl sm:text-2xl" style={{ color: tokens.colors[mode].primary.DEFAULT }}>
                              <CurrencyDisplay amount={order.total_price} size="lg" />
                            </p>
                          </div>
                        </div>

                      {/* Vendors & Products */}
                      <div className="space-y-6 mb-8">
                        <div>
                          <p className="text-[10px] font-black uppercase opacity-40 mb-3 tracking-widest">{t('vendor', 'Vendor')}</p>
                          {order.vendors_stages?.map((vs: any) => (
                            <div key={vs.vendor_id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 w-fit">
                              <img src={vs.vendor_logo} alt={vs.vendor_name} className="w-8 h-8 rounded-full border border-slate-200 object-contain bg-white p-1" />
                              <span className="font-black text-sm">{vs.vendor_name}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div>
                           <p className="text-[10px] font-black uppercase opacity-40 mb-3 tracking-widest">{t('items', 'Items')}</p>
                           <div className="flex flex-col gap-3">
                              {order.products?.map((p: any) => (
                                <div key={p.id} className="flex items-center gap-4 group/prod">
                                   <div className="relative">
                                      <ProductThumbnail 
                                        image={p.product?.image} 
                                        name={p.product?.name} 
                                        size="sm" 
                                        className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-800"
                                      />
                                      <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                                        {p.quantity}
                                      </span>
                                   </div>
                                   <div className="flex-1">
                                      <p className="text-sm font-black opacity-80 group-hover/prod:text-primary transition-colors">
                                        {p.product?.name}
                                      </p>
                                      {p.variant?.name && (
                                        <p className="text-[10px] font-bold opacity-40 uppercase">{p.variant.name}</p>
                                      )}
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0 lg:min-w-[220px]">
                      <Button 
                        variant="primary" 
                        size="lg" 
                        className="w-full rounded-2xl py-3 sm:py-4 font-black shadow-xl"
                        onClick={() => handleViewDetails(order.id)}
                        loading={loadingDetails && selectedOrder?.id === order.id}
                      >
                        {t('viewDetails')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loader for infinite scroll */}
              <div ref={loaderRef} className="py-10 text-center">
                {loadingMore && (
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <span className="font-bold opacity-50">{t('loadingMore', 'Loading more orders...')}</span>
                  </div>
                )}
                {!hasMore && orders.length > 0 && (
                   <p className="text-sm font-bold opacity-30 uppercase tracking-[0.2em]">{t('allOrdersLoaded', 'No more orders to show')}</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Order Details Modal/View */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 no-print">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div 
            className="relative w-full max-w-4xl max-h-[95vh] overflow-hidden rounded-[40px] sm:rounded-[50px] shadow-2xl flex flex-col"
            style={{ background: tokens.colors[mode].surface.elevated }}
          >
            <div className="p-6 sm:p-8 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl sm:text-3xl font-black">{t('orderDetails', 'Order Details')} - {selectedOrder.order_number}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-2xl sm:text-3xl opacity-50 hover:opacity-100">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
               {/* Quick Summary in Modal */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-12">
                  <div className="p-4 sm:p-6 rounded-3xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] sm:text-xs font-black uppercase opacity-40 mb-2">{t('customer')}</p>
                    <p className="font-bold text-sm sm:text-base">{selectedOrder.customer?.name}</p>
                    <p className="text-xs sm:text-sm opacity-60">{selectedOrder.customer?.phone}</p>
                    <p className="text-[10px] opacity-40 mt-1">{selectedOrder.location?.city_name}, {selectedOrder.location?.country_name}</p>
                  </div>
                  <div className="p-4 sm:p-6 rounded-3xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] sm:text-xs font-black uppercase opacity-40 mb-2">{t('status')}</p>
                    <p className="font-bold text-sm sm:text-base uppercase tracking-widest">{getStatusName(selectedOrder)}</p>
                  </div>
                  <div className="p-4 sm:p-6 rounded-3xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] sm:text-xs font-black uppercase opacity-40 mb-2">{t('total')}</p>
                    <p className="font-black text-lg sm:text-xl text-primary">{selectedOrder.pricing?.total_price} {t('egp')}</p>
                  </div>
               </div>

               {/* Products */}
               <div className="space-y-4 sm:space-y-6">
                 <h4 className="text-lg font-black px-2">{t('products')}</h4>
                 {selectedOrder.products?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-black/5">
                       <ProductThumbnail 
                          image={item.product?.image} 
                          name={item.product?.name || ''}
                          size="sm"
                          className="w-16 h-16 sm:w-20 sm:h-20"
                       />
                       <div className="flex-1 min-w-0">
                         <p className="font-bold text-base sm:text-lg truncate">{item.product?.name}</p>
                         <p className="text-xs sm:text-sm opacity-60">{item.quantity} x {item.unit_price_after_taxes} {t('egp')}</p>
                         {item.variant?.name && (
                           <p className="text-[10px] font-bold opacity-40 uppercase mt-1">{item.variant.name}</p>
                         )}
                       </div>
                       <p className="font-black text-base sm:text-lg whitespace-nowrap">{item.total} {t('egp')}</p>
                    </div>
                 ))}
               </div>

               {/* Price Breakdown in Modal */}
               <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800 space-y-4 max-w-md ml-auto">
                  <div className="flex justify-between items-center opacity-60">
                    <span className="font-bold">{t('subtotal')}</span>
                    <span className="font-black">{selectedOrder.pricing?.total_product_price} {t('egp')}</span>
                  </div>
                  <div className="flex justify-between items-center opacity-60">
                    <span className="font-bold">{t('tax', 'Taxes')}</span>
                    <span className="font-black">+{selectedOrder.pricing?.total_tax} {t('egp')}</span>
                  </div>
                  <div className="flex justify-between items-center opacity-60">
                    <span className="font-bold">{t('shipping')}</span>
                    <span className="font-black">+{selectedOrder.pricing?.shipping} {t('egp')}</span>
                  </div>
                  {selectedOrder.promo?.discount_amount > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span className="font-bold">{t('discount')}</span>
                      <span className="font-black">-{selectedOrder.promo.discount_amount} {t('egp')}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xl font-black">{t('total')}</span>
                    <span className="text-2xl font-black text-primary">{selectedOrder.pricing?.total_price} {t('egp')}</span>
                  </div>
               </div>
            </div>

            <div className="p-6 sm:p-8 border-t border-white/10 flex flex-col sm:flex-row gap-3 sm:gap-4 bg-white/5">
              <Button 
                variant="outline" 
                size="lg" 
                className="flex-1 rounded-2xl font-black order-2 sm:order-1"
                onClick={() => setSelectedOrder(null)}
              >
                {t('close')}
              </Button>
              <Button 
                variant="primary" 
                size="lg" 
                className="flex-1 rounded-2xl font-black shadow-xl order-1 sm:order-2"
                onClick={downloadPDF}
              >
                🖨️ {t('printInvoice', 'Print Invoice')}
              </Button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

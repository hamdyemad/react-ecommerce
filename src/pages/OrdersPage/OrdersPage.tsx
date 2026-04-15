import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { BreadCrumb } from '../../components/molecules/BreadCrumb';
import { CurrencyDisplay } from '../../components/atoms/CurrencyDisplay';
import { tokens } from '../../tokens';
import { orderService } from '../../services/orderService';
import { Invoice } from '../../components/molecules/Invoice/Invoice';
import { Button } from '../../components/atoms/Button';
import { toast } from 'react-hot-toast';
import { ProductThumbnail } from '../../components/molecules/ProductThumbnail';

export function OrdersPage() {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  // For Demo/Reference: I'll keep the mock structure but fetch if we have an API
  // In a real app, we would fetch orders here:
  // useEffect(() => { fetchOrders(); }, []);

  const mockOrders = [
    {
      id: 659,
      order_number: '#ORD-000004',
      date: 'Feb 10, 2024',
      status: 'delivered',
      total: 790,
      items: 2,
      products: [
        { name: 'Product 1', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop', product: { image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop', name: 'Product 1' } },
      ]
    }
  ];

  useEffect(() => {
    // Simulating initial load
    setTimeout(() => {
        setOrders(mockOrders);
    }, 500);
  }, []);

  const handleViewDetails = async (orderId: number) => {
    setLoadingOrder(true);
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
      setLoadingOrder(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return tokens.colors[mode].success.DEFAULT;
      case 'shipped': return tokens.colors[mode].primary.DEFAULT;
      case 'processing': return tokens.colors[mode].warning.DEFAULT;
      case 'pending': return tokens.colors[mode].text.tertiary;
      case 'cancelled': return tokens.colors[mode].error.DEFAULT;
      default: return tokens.colors[mode].text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return '✅';
      case 'shipped': return '🚚';
      case 'processing': return '⏳';
      case 'pending': return '⏸️';
      case 'cancelled': return '❌';
      default: return '📦';
    }
  };

  return (
    <div className="min-h-screen py-8">
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
          <h1 className="text-5xl font-black mb-4" style={{ color: tokens.colors[mode].text.primary }}>
            📦 {t('myOrdersPageTitle')}
          </h1>
          <p className="text-xl font-bold opacity-70" style={{ color: tokens.colors[mode].text.secondary }}>
            {t('trackManageOrders')}
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-8 px-2 max-w-6xl">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-10 rounded-[45px] transition-all duration-500 hover:scale-[1.01] shadow-2xl relative overflow-hidden group"
              style={{
                background: tokens.colors[mode].surface.elevated,
                border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
              }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-6 mb-8">
                    <h3 className="text-3xl font-black" style={{ color: tokens.colors[mode].text.primary }}>
                      {order.order_number}
                    </h3>
                    <span 
                      className="px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3"
                      style={{ background: `${getStatusColor(order.status)}15`, color: getStatusColor(order.status) }}
                    >
                      <span>{getStatusIcon(order.status)}</span> {t(order.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-10">
                    <div>
                      <p className="text-sm font-black uppercase opacity-40 mb-2">{t('orderDate')}</p>
                      <p className="text-xl font-bold">{order.date}</p>
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase opacity-40 mb-2">{t('totalAmount')}</p>
                      <p className="font-black text-2xl" style={{ color: tokens.colors[mode].primary.DEFAULT }}>
                        <CurrencyDisplay amount={order.total} size="lg" />
                      </p>
                    </div>
                  </div>
                </div>

                <div className="min-w-[220px]">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="w-full rounded-2xl py-4 font-black shadow-xl"
                    onClick={() => handleViewDetails(order.id)}
                    loading={loadingOrder && selectedOrder?.id === order.id}
                  >
                    {t('viewDetails')}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Details Modal/View */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 no-print">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div 
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[50px] shadow-2xl flex flex-col"
            style={{ background: tokens.colors[mode].surface.elevated }}
          >
            <div className="p-8 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-3xl font-black">{t('orderDetails')} - {selectedOrder.order_number}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-3xl opacity-50 hover:opacity-100">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
               {/* Quick Summary in Modal */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
                    <p className="text-xs font-black uppercase opacity-40 mb-2">{t('customer')}</p>
                    <p className="font-bold">{selectedOrder.customer_name}</p>
                    <p className="text-sm opacity-60">{selectedOrder.customer_phone}</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
                    <p className="text-xs font-black uppercase opacity-40 mb-2">{t('status')}</p>
                    <p className="font-bold uppercase tracking-widest">{selectedOrder.current_stage?.name}</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
                    <p className="text-xs font-black uppercase opacity-40 mb-2">{t('total')}</p>
                    <p className="font-black text-xl text-primary">{selectedOrder.total_price} {t('egp')}</p>
                  </div>
               </div>

               {/* Products */}
               <div className="space-y-6">
                 {selectedOrder.products?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-6 p-6 rounded-3xl bg-black/5">
                       <ProductThumbnail 
                          image={item.product?.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'} 
                          name={item.product?.name || ''}
                          size="sm"
                       />
                       <div className="flex-1">
                         <p className="font-bold text-lg">{item.product?.name}</p>
                         <p className="opacity-60">{item.quantity} x {item.price} {t('egp')}</p>
                       </div>
                       <p className="font-black text-lg">{item.total} {t('egp')}</p>
                    </div>
                 ))}
               </div>
            </div>

            <div className="p-8 border-t border-white/10 flex gap-4 bg-white/5">
              <Button 
                variant="outline" 
                size="lg" 
                className="flex-1 rounded-2xl font-black"
                onClick={() => setSelectedOrder(null)}
              >
                {t('close')}
              </Button>
              <Button 
                variant="primary" 
                size="lg" 
                className="flex-1 rounded-2xl font-black shadow-xl"
                onClick={() => window.print()}
              >
                🖨️ {t('printInvoice', 'Print Invoice')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Invoice for Printing */}
      <Invoice order={selectedOrder} />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../tokens';
import { useTheme } from '../../hooks/useTheme';
import { useDirection } from '../../hooks/useDirection';
import { orderService } from '../../services/orderService';
import { SEO } from '../../components/atoms/SEO';
import { BreadCrumb } from '../../components/molecules/BreadCrumb';
import { Button } from '../../components/atoms/Button';

export function TrackOrderPage() {
  const { reference } = useParams<{ reference: string }>();
  const navigate = useNavigate();
  const { mode } = useTheme();
  const { t, i18n } = useTranslation();
  const { selectedCountry } = useDirection();
  const isRTL = i18n.language === 'ar';
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!reference) {
        setLoading(false);
        setOrder(null);
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);
      
      // Sanitizing reference (common issue with spaces/hyphens)
      const sanitizedRef = reference.trim().replace(/\s+/g, '-');
      
      try {
        console.log('Tracking order with reference:', sanitizedRef);
        const res = await orderService.trackOrder(sanitizedRef);
        console.log('Track Order Response:', res);
        
        if (res && res.status) {
          setOrder(res.data);
        } else {
          setError(res?.message || 'Order not found');
        }
      } catch (err: any) {
        console.error('Track Order Error:', err);
        setError(err.response?.data?.message || 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [reference]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      // Ensure we navigate to the sanitized URL
      const cleanInput = searchInput.trim().replace(/\s+/g, '-');
      navigate(`/track-order/${cleanInput}`);
    }
  };

  const currency = selectedCountry?.currency?.code || 'EGP';

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-black opacity-60">{t('loadingOrderDetails', 'Loading order details...')}</p>
        </div>
      </div>
    );
  }

  // Search State (When no reference is provided or order not found)
  if (!reference || error || (!loading && !order)) {
    return (
      <div className="min-h-screen py-8">
        <SEO title={t('common:trackOrder', 'Track Order')} />
        <BreadCrumb 
          items={[
            { label: t('home'), path: '/' },
            { label: t('common:trackOrder', 'Track Order'), path: '#' }
          ]}
        />
        <div className="max-w-xl mx-auto px-6 mt-20 text-center">
          <div className="w-24 h-24 bg-primary/10 rounded-[35px] flex items-center justify-center text-5xl mb-8 mx-auto shadow-xl">
            🚚
          </div>
          <h1 className="text-5xl font-black mb-4" style={{ color: tokens.colors[mode].text.primary }}>
            {t('common:trackOrder', 'Track Order')}
          </h1>
          <p className="text-lg opacity-60 font-bold mb-10">
            {error 
              ? (isRTL ? 'لم نتمكن من العثور على هذا الطلب، يرجى المحاولة مرة أخرى.' : 'We couldn\'t find that order. Please check the number and try again.')
              : (isRTL ? 'أدخل رقم طلبك لمتابعة حالته وتتبع الشحنة.' : 'Enter your order number to check its status and track the shipment.')}
          </p>

          <form onSubmit={handleSearch} className="relative group">
            <input
              type="text"
              placeholder={isRTL ? 'أدخل رقم الطلب (مثلاً ORD-000001)' : 'Enter Order ID (e.g. ORD-000001)'}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-10 py-6 pr-32 rounded-[30px] font-black text-xl transition-all focus:ring-8 outline-none shadow-2xl hover:shadow-primary/10"
              style={{
                background: tokens.colors[mode].surface.elevated,
                color: tokens.colors[mode].text.primary,
                border: `2px solid ${error ? tokens.colors[mode].error.DEFAULT : tokens.colors[mode].border.DEFAULT}`,
                '--tw-ring-color': `${tokens.colors[mode].primary.DEFAULT}10`
              } as any}
            />
            <button
              type="submit"
              className="absolute right-3 top-3 bottom-3 px-8 rounded-2xl bg-primary text-white font-black transition-all hover:scale-[1.03] active:scale-95 shadow-xl"
            >
              {t('common:track', 'Track')}
            </button>
          </form>
          
          {error && (
            <p className="mt-6 text-sm font-black text-error animate-bounce">
              ⚠️ {error}
            </p>
          )}

          <div className="mt-16 p-8 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800">
             <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-4">{t('needHelp', 'Need Help?')}</p>
             <p className="text-sm font-bold opacity-60 leading-relaxed">
               {isRTL ? 'إذا كنت تواجه مشكلة، يرجى التواصل مع فريق الدعم.' : 'If you are having trouble finding your order, please contact our support team.'}
             </p>
             <Link to="/contact" className="inline-block mt-4 text-primary font-black hover:underline underline-offset-4 transition-all">
               {isRTL ? 'تواصل معنا' : 'Contact Support'} →
             </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <SEO title={`${t('common:trackOrder', 'Track Order')} - ${order.order_number}`} />
      <BreadCrumb 
        items={[
          { label: t('home'), path: '/' },
          { label: t('common:trackOrder', 'Track Order'), path: '#' }
        ]}
      />

      <div className="max-w-4xl mx-auto px-6 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black mb-2" style={{ color: tokens.colors[mode].text.primary }}>
              {t('common:trackOrder', 'Track Order')}
            </h1>
            <p className="text-lg opacity-60 font-bold">
              {t('orderNumberLabel', 'Order Number:') || (isRTL ? 'رقم الطلب:' : 'Order Number:')} <span className="text-primary">#{order.order_number}</span>
            </p>
          </div>
          <div className="px-6 py-4 rounded-[30px] shadow-xl border border-[var(--color-border-DEFAULT)]" style={{ background: tokens.colors[mode].surface.elevated }}>
            <span className="block opacity-60 font-bold text-xs uppercase tracking-wider mb-1">{t('totalAmount', 'Total Amount')}</span>
            <span className="text-2xl font-black text-primary">{order.total} {currency}</span>
          </div>
        </div>

        {/* Global Progress */}
        <div className="p-10 rounded-[45px] shadow-2xl border border-[var(--color-border-DEFAULT)] mb-12" style={{ background: tokens.colors[mode].surface.elevated }}>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: `${order?.current_stage?.color || '#3b82f6'}15` }}>
              📦
            </div>
            <div>
              <h2 className="text-2xl font-black" style={{ color: tokens.colors[mode].text.primary }}>
                {t('currentStatus', 'Current Order Status')}
              </h2>
              <span className="font-black text-lg" style={{ color: order?.current_stage?.color || '#3b82f6' }}>{order?.current_stage?.name}</span>
            </div>
          </div>

          {/* Vendors Tracking Section */}
          <div className="space-y-12">
            {order.vendors_tracking?.map((vendorTrack: any, vIdx: number) => (
              <div key={vIdx} className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm">🏪</div>
                  <h3 className="text-xl font-black opacity-80">{vendorTrack.vendor.name}</h3>
                </div>

                {/* Timeline */}
                <div className="relative pl-8 space-y-12 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-1 before:bg-slate-100 dark:before:bg-slate-800">
                  {vendorTrack.stage_history?.map((history: any, hIdx: number) => (
                    <div key={history.id} className="relative">
                      {/* Timeline Dot */}
                      <div 
                        className={`absolute -left-[27px] top-1 w-4 h-4 rounded-full border-4 ${hIdx === 0 ? 'animate-pulse' : ''}`}
                        style={{ 
                          background: hIdx === 0 ? (vendorTrack?.current_stage?.color || '#3b82f6') : 'transparent',
                          borderColor: hIdx === 0 ? (vendorTrack?.current_stage?.color || '#3b82f6') : tokens.colors[mode].border.DEFAULT
                        }}
                      />
                      
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div>
                          <h4 className={`text-lg font-black ${hIdx === 0 ? 'text-primary' : 'opacity-60'}`}>
                            {history.new_stage.name}
                          </h4>
                          {history.notes && (
                            <p className="text-sm opacity-60 font-bold mt-1">{history.notes}</p>
                          )}
                          <p className="text-xs opacity-40 font-bold mt-2 uppercase tracking-tighter">
                            By {history.changed_by}
                          </p>
                        </div>
                        <div className="text-start sm:text-end shrink-0">
                          <span className="text-sm font-black opacity-60">{history.changed_at}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/" className="flex-1">
            <Button variant="outline" size="lg" className="w-full rounded-2xl py-4 font-black">
              🏠 {t('continueShopping', 'Continue Shopping')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';

import { CartItem } from '../../components/molecules/CartItem';
import { EmptyCartState } from '../../components/molecules/EmptyCartState';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../tokens';
import { BreadCrumb } from '../../components/molecules/BreadCrumb';
import { SEO } from '../../components/atoms/SEO';
import { OrderSummary } from '../../components/organisms';

interface CartItemType {
  id: string;
  image: string;
  title: string;
  variant?: string;
  price: number;
  quantity: number;
}

interface CartPageProps {
  items: CartItemType[];
  subtotal: number;
  total: number;
  appliedPromo: any;
  setAppliedPromo: (promo: any) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout?: () => void;
}

export function CartPage({
  items,
  subtotal,
  total,
  appliedPromo,
  setAppliedPromo,
  onQuantityChange,
  onRemoveItem,
  onCheckout,
}: CartPageProps) {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-4 md:py-8">
        <SEO title={t('common:cart')} />
        <BreadCrumb 
          items={[
            { label: t('home'), path: '/' },
            { label: t('shoppingCart'), path: '/cart' }
          ]}
        />
        <div className="max-w-7xl mx-auto px-3 sm:px-6 mt-4 md:mt-8">
          <h1 
            className="text-3xl sm:text-5xl md:text-6xl font-black mb-8 md:mb-12"
            style={{ color: tokens.colors[mode].text.primary }}
          >
            {t('shoppingCart')}
          </h1>
          <EmptyCartState onAction={() => navigate('/')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 md:py-8">
      <SEO title={t('common:cart')} />
      <BreadCrumb 
        items={[
          { label: t('home'), path: '/' },
          { label: t('shoppingCart'), path: '/cart' }
        ]}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 mt-4 md:mt-8">
        {/* Header */}
        <div className="mb-5 md:mb-16">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h1 
              className="text-xl sm:text-4xl md:text-6xl font-black leading-tight"
              style={{ color: tokens.colors[mode].text.primary }}
            >
              {t('shoppingCart')}
            </h1>
            <Link
              to="/"
              className="px-3 sm:px-8 py-2 sm:py-4 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-sm sm:shadow-xl flex items-center gap-1.5 sm:gap-3 text-xs sm:text-base"
              style={{
                background: tokens.colors[mode].surface.elevated,
                color: tokens.colors[mode].text.primary,
                border: `1.5px solid ${tokens.colors[mode].border.DEFAULT}`
              }}
            >
              <span>←</span> {t('continueShopping')}
            </Link>
          </div>
          <p className="text-sm opacity-40 mt-1" style={{ color: tokens.colors[mode].text.primary }}>
            {items.reduce((sum, item) => sum + item.quantity, 0)} {items.reduce((sum, item) => sum + item.quantity, 0) <= 1 ? t('item') : t('items')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 md:gap-12">
          {/* Cart Items - Left Side */}
          <div className="lg:col-span-2 space-y-4 md:space-y-8">
            <div 
              className="rounded-[20px] sm:rounded-[35px] md:rounded-[45px] p-4 sm:p-6 md:p-10 shadow-lg md:shadow-2xl relative overflow-hidden group"
              style={{
                background: tokens.colors[mode].surface.elevated,
                backdropFilter: 'blur(30px)',
                border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
              }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-1000" />
              
              <h2 
                className="text-xl sm:text-2xl md:text-3xl font-black mb-4 sm:mb-6 md:mb-10 relative z-10 flex items-center gap-2 sm:gap-4"
                style={{ color: tokens.colors[mode].text.primary }}
              >
                📦 {t('cartItems')}
              </h2>
              <div className="space-y-3 sm:space-y-5 md:space-y-8 relative z-10">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 sm:p-5 md:p-8 rounded-[16px] sm:rounded-[25px] md:rounded-[35px] transition-all duration-300 hover:scale-[1.01]"
                    style={{
                      background: tokens.colors[mode].surface.base,
                      border: `1px solid ${tokens.colors[mode].border.DEFAULT}`
                    }}
                  >
                    <CartItem
                      {...item}
                      onQuantityChange={onQuantityChange}
                      onRemove={onRemoveItem}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reusable Order Summary Component */}
          <div className="lg:col-span-1">
            <OrderSummary
              items={items}
              subtotal={subtotal}
              total={total}
              appliedPromo={appliedPromo}
              setAppliedPromo={setAppliedPromo}
              onAction={onCheckout || (() => {})}
              actionLabel={"🛒 " + t('proceedToCheckout')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

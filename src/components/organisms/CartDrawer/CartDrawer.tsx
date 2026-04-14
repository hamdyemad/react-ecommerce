import { Button } from '../../atoms/Button';
import { CartItem } from '../../molecules/CartItem';
import { PriceBreakdown } from '../../molecules/PriceBreakdown';
import { EmptyCartState } from '../../molecules/EmptyCartState';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface CartItemType {
  id: string;
  image: string;
  title: string;
  variant?: string;
  price: number;
  quantity: number;
}

interface CartDrawerProps {
  items: CartItemType[];
  subtotal: number;
  total: number;
  onClose: () => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout?: () => void;
  isLoading?: boolean;
}

export function CartDrawer({
  items,
  subtotal,
  total,
  onClose,
  onQuantityChange,
  onRemoveItem,
  onCheckout,
  isLoading,
}: CartDrawerProps) {
  const { t } = useTranslation();

  if (items.length === 0) {
    return (
      <div 
        className="fixed inset-0 z-[9999] flex justify-end"
        style={{
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.3s ease-out'
        }}
        onClick={onClose}
      >
        <div 
          className="w-full max-w-md h-full overflow-y-auto"
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.2)',
            animation: 'slideInRight 0.3s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {t('shoppingCart')}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{
                  background: '#f1f5f9',
                  color: '#0f172a'
                }}
                aria-label="Close cart"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <EmptyCartState onAction={onClose} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] flex justify-end"
      style={{
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md h-full overflow-y-auto flex flex-col"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.2)',
          animation: 'slideInRight 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {t('shoppingCart')} ({items.length})
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 flex-shrink-0"
              style={{
                background: '#f1f5f9',
                color: '#0f172a'
              }}
              aria-label="Close cart"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Items */}
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            {items.map((item) => (
              <CartItem
                key={item.id}
                {...item}
                onQuantityChange={onQuantityChange}
                onRemove={onRemoveItem}
                loading={isLoading}
                disabled={isLoading}
              />
            ))}
          </div>
        </div>

        {/* Floating Bottom Section */}
        <div className="p-4 sm:p-6 bg-white border-t border-slate-100 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
          {/* View Full Cart Link */}
          <Link
            to="/cart"
            onClick={onClose}
            className="block w-full py-2.5 sm:py-3 px-4 rounded-xl font-bold text-center mb-3 sm:mb-4 transition-all duration-300 hover:scale-[1.02] active:scale-95 text-sm sm:text-base"
            style={{
              background: '#f1f5f9',
              color: '#0f172a',
              border: '2px solid #e2e8f0'
            }}
          >
            📋 {t('viewFullCart', 'View Full Cart')}
          </Link>

          {/* Price Breakdown */}
          <div 
            className="p-3 sm:p-5 rounded-2xl mb-3 sm:mb-4"
            style={{
              background: 'rgba(248, 250, 252, 0.8)',
              border: '1px solid #e2e8f0'
            }}
          >
            <PriceBreakdown
              subtotal={subtotal}
              total={total}
            />
          </div>

          {/* Checkout Button */}
          <Button
            variant="primary"
            size="lg"
            className="w-full text-sm sm:text-base py-3 sm:py-4 transition-all duration-500 hover:scale-[1.02] active:scale-95"
            onClick={onCheckout}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#ffffff',
              fontWeight: 'bold',
              borderRadius: '1rem',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)'
            }}
          >
            🛒 {t('proceedToCheckout')}
          </Button>
        </div>
      </div>
    </div>
  );
}

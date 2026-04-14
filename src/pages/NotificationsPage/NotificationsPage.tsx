import { useTheme } from '../../hooks/useTheme';
import { BreadCrumb } from '../../components/molecules/BreadCrumb';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../tokens';

export function NotificationsPage() {
  const { mode } = useTheme();
  const { t } = useTranslation();

  const notifications = [
    { id: 1, type: 'order', title: 'Order Delivered', message: 'Your order #ORD-2024-001 has been delivered', time: '2 hours ago', read: false },
    { id: 2, type: 'promo', title: 'Special Offer', message: '50% off on selected items. Limited time only!', time: '1 day ago', read: false },
    { id: 3, type: 'order', title: 'Order Shipped', message: 'Your order #ORD-2024-002 is on the way', time: '2 days ago', read: true }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return '📦';
      case 'promo': return '🎉';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  return (
    <div className="min-h-screen py-8">
      <BreadCrumb 
        items={[
          { label: t('home'), path: '/' },
          { label: t('account'), path: '/profile' },
          { label: t('notifications'), path: '/profile/notifications' }
        ]}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 px-2">
        <div>
          <h1 
            className="text-5xl font-black mb-4 flex items-center gap-4"
            style={{ color: tokens.colors[mode].text.primary }}
          >
            🔔 {t('notifications')}
          </h1>
          <p 
            className="text-xl font-bold opacity-70"
            style={{ color: tokens.colors[mode].text.secondary }}
          >
            {notifications.filter(n => !n.read).length} {t('unreadNotifications')}
          </p>
        </div>
        <button 
          className="px-8 py-3.5 rounded-2xl font-black transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl"
          style={{
            background: tokens.colors[mode].surface.elevated,
            color: tokens.colors[mode].primary.DEFAULT,
            border: `1px solid ${tokens.colors[mode].border.DEFAULT}`
          }}
        >
          {t('markAllAsRead')}
        </button>
      </div>

      <div className="space-y-6 px-2 max-w-5xl">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="p-8 rounded-[35px] transition-all duration-500 hover:scale-[1.01] cursor-pointer relative group overflow-hidden"
              style={{
                background: notification.read
                  ? tokens.colors[mode].surface.elevated
                  : mode === 'light' ? 'rgba(99, 102, 241, 0.03)' : 'rgba(99, 102, 241, 0.08)',
                backdropFilter: 'blur(30px)',
                border: notification.read
                  ? `1px solid ${tokens.colors[mode].border.DEFAULT}`
                  : `2px solid ${tokens.colors[mode].primary.DEFAULT}`,
                boxShadow: notification.read ? '0 10px 30px rgba(0, 0, 0, 0.02)' : '0 20px 40px rgba(99, 102, 241, 0.1)'
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
              
              <div className="flex gap-6 relative z-10">
                <div 
                  className="w-16 h-16 rounded-[22px] flex items-center justify-center flex-shrink-0 shadow-lg transform group-hover:rotate-6 transition-transform"
                  style={{
                    background: tokens.gradients.primary
                  }}
                >
                  <span className="text-3xl">{getIcon(notification.type)}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 
                      className="text-2xl font-black transition-colors"
                      style={{ color: tokens.colors[mode].text.primary }}
                    >
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <span 
                        className="w-4 h-4 rounded-full shadow-lg shadow-primary/50 animate-pulse"
                        style={{ background: tokens.colors[mode].primary.DEFAULT }}
                      />
                    )}
                  </div>
                  <p 
                    className="text-lg mb-4 font-bold opacity-80"
                    style={{ color: tokens.colors[mode].text.secondary }}
                  >
                    {notification.message}
                  </p>
                  <p 
                    className="text-sm font-black opacity-40 uppercase tracking-widest"
                    style={{ color: tokens.colors[mode].text.tertiary }}
                  >
                    🕒 {notification.time}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-surface-elevated rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="text-8xl mb-6 opacity-20">📭</div>
            <p className="text-2xl font-black opacity-30">{t('noNotifications')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useTheme } from '../../hooks/useTheme';
import { BreadCrumb } from '../../components/molecules/BreadCrumb';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../tokens';
import { useDirection } from '../../hooks/useDirection';
import { useAuth } from '@/hooks/useAuth';
import { pointsService } from '../../services/pointsService';
import type { PointsSummary, PointTransaction } from '../../types/points';
import { CurrencyDisplay } from '../../components/atoms/CurrencyDisplay';

export function PointsPage() {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const { direction } = useDirection();
  const { user } = useAuth();
  
  const [summary, setSummary] = useState<PointsSummary | null>(null);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await pointsService.getMyPoints();
        if (res.status && res.data) {
          setSummary(res.data);
        }
      } catch (error) {
        console.error('Error fetching points summary:', error);
      }
    };

    const fetchTransactions = async () => {
      try {
        const res = await pointsService.getTransactions();
        if (res.status && res.data) {
          setTransactions(res.data.items || []);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
    fetchTransactions();
  }, []);

  const menuItems = [
    { id: 'account', label: t('accountInformation'), icon: '👤', path: '/profile' },
    { id: 'orders', label: t('orders'), icon: '📦', path: '/profile/orders' },
    { id: 'points', label: t('myPoints', 'My Points'), icon: '💰', path: '/profile/points' },
    { id: 'reviews', label: t('reviews'), icon: '⭐', path: '/profile/reviews' },
    { id: 'wishlist', label: t('wishlist'), icon: '❤️', path: '/wishlist' },
    { id: 'addresses', label: t('addresses'), icon: '📍', path: '/profile/addresses' }
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen py-8">
      <BreadCrumb 
        items={[
          { label: t('home'), path: '/' },
          { label: t('profile'), path: '/profile' },
          { label: t('myPoints', 'My Points'), path: '/profile/points' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div 
            className="rounded-[35px] overflow-hidden"
            style={{
              background: tokens.gradients.surface[mode],
              border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
              boxShadow: tokens.shadows.md
            }}
          >
            <div className="p-6 border-b" style={{ borderColor: tokens.colors[mode].border.DEFAULT }}>
              <h3 className="text-xl font-black" style={{ color: tokens.colors[mode].text.primary }}>
                {t('accountMenu')}
              </h3>
            </div>
            <nav className="p-3">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className="flex items-center justify-between px-5 py-4 rounded-2xl mb-1.5 transition-all duration-300 group"
                  style={{
                    background: item.id === 'points'
                      ? `${tokens.colors[mode].primary.DEFAULT}1A`
                      : 'transparent',
                    color: item.id === 'points'
                      ? tokens.colors[mode].primary.DEFAULT
                      : tokens.colors[mode].text.secondary
                  }}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl transition-transform group-hover:scale-125">{item.icon}</span>
                    <span className="font-black">{item.label}</span>
                  </div>
                  {item.id === 'points' && (
                    <svg className={`w-5 h-5 ${direction === 'rtl' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Points Header Card */}
          <div 
            className="p-10 rounded-[40px] relative overflow-hidden"
            style={{
              background: tokens.gradients.primary,
              boxShadow: `0 20px 50px ${tokens.colors[mode].primary.DEFAULT}4D`
            }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h1 className="text-4xl font-black text-white mb-2">{t('myPoints', 'My Points')}</h1>
                <p className="text-white/80 text-lg font-bold">{t('pointsSubtitle', 'Earn more points by shopping and completing tasks')}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-xl p-8 rounded-[30px] text-center min-w-[200px] border border-white/30">
                <span className="block text-white/70 text-sm font-black uppercase tracking-widest mb-2">{t('availablePoints', 'Available Points')}</span>
                <span className="text-6xl font-black text-white">{summary?.available_points || 0}</span>
                <div className="mt-4 pt-4 border-t border-white/20">
                    <span className="text-white font-bold text-sm">
                        ≈ <CurrencyDisplay amount={summary?.points_value || 0} />
                    </span>
                </div>
              </div>
            </div>
          </div>

          {/* Expiring Soon Banner */}
          {summary?.expiring_soon && summary.expiring_soon.length > 0 && (
            <div 
              className="p-6 rounded-[30px] flex items-center justify-between gap-4 border-2 border-dashed animate-pulse"
              style={{ 
                borderColor: `${tokens.colors[mode].error.DEFAULT}40`,
                background: `${tokens.colors[mode].error.DEFAULT}05`
              }}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">⚠️</span>
                <div>
                  <h4 className="font-black text-lg" style={{ color: tokens.colors[mode].error.DEFAULT }}>
                    {t('expiringSoon', 'Points Expiring Soon!')}
                  </h4>
                  <p className="text-sm font-bold opacity-60" style={{ color: tokens.colors[mode].text.secondary }}>
                    {t('expiringSoonDesc', 'You have points that will expire in the next 30 days. Use them now!')}
                  </p>
                </div>
              </div>
              <Link 
                to="/products"
                className="px-6 py-3 rounded-2xl font-black text-sm text-white transition-transform hover:scale-105"
                style={{ background: tokens.colors[mode].error.DEFAULT }}
              >
                {t('shopNow', 'Shop Now')}
              </Link>
            </div>
          )}

          {/* Points Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {[
              { label: t('earnedPoints', 'Total Earned'), value: summary?.earned_points || 0, icon: '📈', color: tokens.colors[mode].success.DEFAULT, desc: t('earnedPointsDesc', 'Points from purchases') },
              { label: t('redeemedPoints', 'Redeemed'), value: summary?.redeemed_points || 0, icon: '🛒', color: tokens.colors[mode].warning.DEFAULT, desc: t('redeemedPointsDesc', 'Used for discounts') },
              { label: t('adjustedPoints', 'Adjusted'), value: summary?.adjusted_points || 0, icon: '🛠️', color: tokens.colors[mode].primary.DEFAULT, desc: t('adjustedPointsDesc', 'Manual or bonus changes') },
              { label: t('expiredPoints', 'Expired'), value: summary?.expired_points || 0, icon: '⏰', color: tokens.colors[mode].error.DEFAULT, desc: t('expiredPointsDesc', 'No longer valid') },
            ].map((stat, i) => (
              <div 
                key={i}
                className="p-6 rounded-[35px] flex flex-col gap-4 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300"
                style={{
                  background: tokens.gradients.surface[mode],
                  border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
                  boxShadow: tokens.shadows.sm
                }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-2xl opacity-10 transition-opacity group-hover:opacity-20" style={{ background: stat.color }} />
                
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: `${stat.color}15`, color: stat.color }}>
                    {stat.icon}
                  </div>
                  <span className="text-2xl font-black" style={{ color: tokens.colors[mode].text.primary }}>{stat.value}</span>
                </div>
                
                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">{stat.label}</span>
                  <p className="text-[10px] font-bold opacity-40 italic" style={{ color: tokens.colors[mode].text.secondary }}>{stat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Transactions Section */}
          <div 
            className="p-10 rounded-[40px]"
            style={{
              background: tokens.gradients.surface[mode],
              border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
              boxShadow: tokens.shadows.sm
            }}
          >
            <h2 className="text-3xl font-black mb-8" style={{ color: tokens.colors[mode].text.primary }}>
              {t('pointsTransactions', 'Transaction History')}
            </h2>

            {loading ? (
              <div className="py-20 text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="font-bold text-slate-400">{t('loading', 'Loading...')}</p>
              </div>
            ) : transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-4">
                  <thead>
                    <tr>
                      <th className="px-6 py-2 text-sm font-black text-slate-400 uppercase tracking-widest">{t('transaction', 'Transaction')}</th>
                      <th className="px-6 py-2 text-sm font-black text-slate-400 uppercase tracking-widest">{t('type', 'Type')}</th>
                      <th className="px-6 py-2 text-sm font-black text-slate-400 uppercase tracking-widest text-center">{t('points', 'Points')}</th>
                      <th className="px-6 py-2 text-sm font-black text-slate-400 uppercase tracking-widest text-right">{t('date', 'Date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr 
                        key={transaction.id}
                        className="group hover:scale-[1.01] transition-transform duration-300"
                      >
                        <td className="px-6 py-6 rounded-l-[25px] border-y border-l" style={{ borderColor: tokens.colors[mode].border.DEFAULT, background: tokens.colors[mode].surface.base }}>
                          <p className="font-bold text-lg" style={{ color: tokens.colors[mode].text.primary }}>{transaction.description}</p>
                          <p className="text-sm text-slate-400">{transaction.id}</p>
                        </td>
                        <td className="px-6 py-6 border-y" style={{ borderColor: tokens.colors[mode].border.DEFAULT, background: tokens.colors[mode].surface.base }}>
                          <span 
                            className="px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider"
                            style={{ 
                              background: transaction.type === 'earned' ? `${tokens.colors[mode].success.DEFAULT}15` : `${tokens.colors[mode].error.DEFAULT}15`,
                              color: transaction.type === 'earned' ? tokens.colors[mode].success.DEFAULT : tokens.colors[mode].error.DEFAULT
                            }}
                          >
                            {transaction.type_label}
                          </span>
                        </td>
                        <td className="px-6 py-6 border-y text-center" style={{ borderColor: tokens.colors[mode].border.DEFAULT, background: tokens.colors[mode].surface.base }}>
                          <span className={`text-xl font-black ${transaction.points.startsWith('-') ? 'text-red-500' : 'text-emerald-500'}`}>
                            {transaction.points.startsWith('-') ? transaction.points : `+${transaction.points}`}
                          </span>
                        </td>
                        <td className="px-6 py-6 rounded-r-[25px] border-y border-r text-right" style={{ borderColor: tokens.colors[mode].border.DEFAULT, background: tokens.colors[mode].surface.base }}>
                          <p className="font-bold" style={{ color: tokens.colors[mode].text.primary }}>{transaction.created_at}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-20 text-center">
                <div className="text-6xl mb-6">🏜️</div>
                <h3 className="text-2xl font-black text-slate-400">{t('noTransactions', 'No transactions yet')}</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

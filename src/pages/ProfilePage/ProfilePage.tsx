import { useTheme } from '../../hooks/useTheme';
import { BreadCrumb } from '../../components/molecules/BreadCrumb';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../tokens';
import { useDirection } from '../../hooks/useDirection';
import { useAuth } from '@/hooks/useAuth';
import { useCatalog } from '../../hooks/useCatalog';
import { FormInput } from '../../components/atoms/FormInput';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const { direction } = useDirection();
  const { user, logout, updateProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { countries } = useCatalog();
  const [activeTab] = useState('account');
  const [isEditing, setIsEditing] = useState(false);

  const selectedCountry = countries.find(c => String(c.id) === String(user?.country?.id)) || countries[0];
  
  // Form state for update profile
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Initialize form when entering edit mode
  const startEditing = () => {
    if (user) {
      const names = user.full_name.split(' ');
      setFormData({
        first_name: names[0] || '',
        last_name: names.slice(1).join(' ') || '',
        phone: user.phone || '',
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
      setIsEditing(true);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.current_password) {
      toast.error(t('currentPasswordRequired', 'Current password is required to save changes'));
      return;
    }

    const data = new FormData();
    data.append('current_password', formData.current_password);
    if (formData.first_name) data.append('first_name', formData.first_name);
    if (formData.last_name) data.append('last_name', formData.last_name);
    if (formData.phone) data.append('phone', formData.phone);
    if (formData.new_password) {
      data.append('new_password', formData.new_password);
      data.append('new_password_confirmation', formData.new_password_confirmation);
    }
    if (avatar) {
      data.append('avatar', avatar);
    }

    try {
      const response = await updateProfile(data);
      if (response.status) {
        toast.success(response.message || t('profileUpdated', 'Profile updated successfully'));
        setIsEditing(false);
        setAvatar(null);
        setAvatarPreview(null);
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData?.errors) {
        Object.values(errorData.errors).flat().forEach((msg: any) => toast.error(msg));
      } else {
        toast.error(errorData?.message || t('updateFailed', 'Update failed'));
      }
    }
  };

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // User data from auth
  const userData = {
    name: user.full_name || 'Guest User',
    email: user.email,
    phone: user.phone || t('noPhone'),
    avatar: user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'U')}&size=200&background=667eea&color=fff&bold=true`,
    memberSince: user.created_at
  };

  const orderStats = [
    { key: 'totalOrders', value: 0, icon: '📦', color: tokens.colors[mode].primary.DEFAULT },
    { key: 'pendingOrders', value: 0, icon: '⏳', color: tokens.colors[mode].warning.DEFAULT },
    { key: 'completedOrders', value: 0, icon: '✅', color: tokens.colors[mode].success.DEFAULT },
    { key: 'cancelledOrders', value: 0, icon: '❌', color: tokens.colors[mode].error.DEFAULT },
    { key: 'ordersNotDelivered', value: 0, icon: '🚚', color: tokens.colors[mode].primary[600] },
    { key: 'returnedOrders', value: 0, icon: '↩️', color: tokens.colors[mode].accent.DEFAULT }
  ];

  const menuItems = [
    { id: 'account', label: t('accountInformation'), icon: '👤', path: '/profile' },
    { id: 'orders', label: t('orders'), icon: '📦', path: '/profile/orders' },
    { id: 'points', label: t('myPoints', 'My Points'), icon: '💰', path: '/profile/points' },
    { id: 'reviews', label: t('reviews'), icon: '⭐', path: '/profile/reviews' },
    { id: 'wishlist', label: t('wishlist'), icon: '❤️', path: '/wishlist' },
    { id: 'addresses', label: t('addresses'), icon: '📍', path: '/profile/addresses' },
    { id: 'payment', label: t('paymentMethods'), icon: '💳', path: '/profile/payment' },
    { id: 'notifications', label: t('notifications'), icon: '🔔', path: '/profile/notifications', badge: '0' },
    { id: 'settings', label: t('settings'), icon: '⚙️', path: '/profile/settings' }
  ];

  return (
    <div className="min-h-screen py-8">
      <BreadCrumb 
        items={[
          { label: t('home'), path: '/' },
          { label: t('editProfile'), path: '/profile' }
        ]}
      />

      {/* Welcome Banner */}
      <div 
        className="p-12 rounded-[40px] mb-12 text-center relative overflow-hidden"
        style={{
          background: tokens.gradients.primary,
          boxShadow: `0 20px 50px ${tokens.colors[mode].primary[500]}4D`
        }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full -ml-20 -mb-20 blur-3xl" />
        
        <h1 className="text-5xl font-black text-white mb-4 relative z-10">
          {t('welcome')}, {userData.name}! 👋
        </h1>
        <p className="text-white/90 text-xl max-w-2xl mx-auto relative z-10 leading-relaxed">
          {t('manageAccount')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* User Card */}
          <div 
            className="p-8 rounded-[35px] mb-8 text-center"
            style={{
              background: tokens.gradients.surface[mode],
              border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
              boxShadow: tokens.shadows.md
            }}
          >
            <div className="relative inline-block mb-6">
              <div 
                className="w-36 h-36 rounded-full mx-auto p-1.5"
                style={{
                  background: tokens.gradients.primary
                }}
              >
                <img 
                   src={avatarPreview || userData.avatar}
                   alt={userData.name}
                   className="w-full h-full rounded-full border-4 object-cover"
                   style={{
                     borderColor: tokens.colors[mode].surface.base
                   }}
                />
              </div>
              {isEditing ? (
                <label className="absolute bottom-1 right-1 w-11 h-11 rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-transform shadow-xl cursor-pointer"
                  style={{
                    background: tokens.gradients.secondary,
                    color: tokens.colors[mode].text.inverse
                  }}
                >
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              ) : (
                <button 
                  onClick={startEditing}
                  className="absolute bottom-1 right-1 w-11 h-11 rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-transform shadow-xl"
                  style={{
                    background: tokens.gradients.secondary,
                    color: tokens.colors[mode].text.inverse
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
            </div>
            <h2 
              className="text-2xl font-black mb-1"
              style={{ color: tokens.colors[mode].text.primary }}
            >
              {userData.name}
            </h2>
            <p 
              className="text-sm mb-6 font-bold"
              style={{ color: tokens.colors[mode].text.tertiary }}
            >
              {userData.email}
            </p>
            <div className="flex gap-2 justify-center">
              {!isEditing && (
                <button 
                  onClick={startEditing}
                  className="px-6 py-2.5 rounded-2xl font-black text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                  style={{
                    background: mode === 'light' ? tokens.colors.light.primary[50] : tokens.colors.dark.surface.base,
                    color: tokens.colors[mode].primary.DEFAULT
                  }}
                >
                  {t('editProfile')}
                </button>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <div 
            className="rounded-[35px] overflow-hidden"
            style={{
              background: tokens.gradients.surface[mode],
              border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
              boxShadow: tokens.shadows.md
            }}
          >
            <div 
              className="p-6"
              style={{
                borderBottom: `1px solid ${tokens.colors[mode].border.DEFAULT}`
              }}
            >
              <h3 
                className="text-xl font-black"
                style={{ color: tokens.colors[mode].text.primary }}
              >
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
                    background: activeTab === item.id
                      ? `${tokens.colors[mode].primary.DEFAULT}1A`
                      : 'transparent',
                    color: activeTab === item.id
                      ? tokens.colors[mode].primary.DEFAULT
                      : tokens.colors[mode].text.secondary
                  }}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl transition-transform group-hover:scale-125">{item.icon}</span>
                    <span className="font-black">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.badge && (
                      <span 
                        className="px-2.5 py-1 rounded-full text-[10px] font-black shadow-lg animate-pulse"
                        style={{
                          background: tokens.colors[mode].error.DEFAULT,
                          color: tokens.colors[mode].text.inverse
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                    {activeTab === item.id && (
                      <svg className={`w-5 h-5 transition-transform ${direction === 'rtl' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </Link>
              ))}
            </nav>
            <div className="p-6">
              <button 
                onClick={handleLogout}
                className="w-full px-6 py-4 rounded-2xl font-black transition-all duration-500 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-xl group"
                style={{
                  background: `linear-gradient(135deg, ${tokens.colors[mode].error.DEFAULT} 0%, ${tokens.colors[mode].error[700]} 100%)`,
                  color: tokens.colors[mode].text.inverse
                }}
              >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {t('logout')}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Account Information / Edit Form */}
          <div 
            className="p-10 rounded-[40px] mb-12"
            style={{
              background: tokens.gradients.surface[mode],
              border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
              boxShadow: tokens.shadows.sm
            }}
          >
            <div className="flex items-center justify-between mb-10">
              <h2 
                className="text-4xl font-black"
                style={{ color: tokens.colors[mode].text.primary }}
              >
                {isEditing ? t('editProfile') : t('accountInformation')}
              </h2>
              {!isEditing && (
                <button 
                  onClick={startEditing}
                  className="px-8 py-3.5 rounded-2xl font-black transition-all duration-500 hover:scale-105 active:scale-95 shadow-xl"
                  style={{
                    background: tokens.gradients.primary,
                    color: tokens.colors[mode].text.inverse
                  }}
                >
                  {t('edit')}
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-sm font-black uppercase tracking-widest px-1" style={{ color: tokens.colors[mode].text.tertiary }}>
                      {t('firstName')}
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl font-bold border outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                      style={{
                        background: tokens.colors[mode].surface.base,
                        color: tokens.colors[mode].text.primary,
                        borderColor: tokens.colors[mode].border.DEFAULT
                      }}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-black uppercase tracking-widest px-1" style={{ color: tokens.colors[mode].text.tertiary }}>
                      {t('lastName')}
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl font-bold border outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                      style={{
                        background: tokens.colors[mode].surface.base,
                        color: tokens.colors[mode].text.primary,
                        borderColor: tokens.colors[mode].border.DEFAULT
                      }}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-black uppercase tracking-widest px-1" style={{ color: tokens.colors[mode].text.tertiary }}>
                      {selectedCountry ? `${t('phoneNumber')} (${selectedCountry.phone_length} ${t('digits')})` : t('phoneNumber')}
                    </label>
                    <div className="relative">
                      <FormInput
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder={selectedCountry ? '0'.repeat(selectedCountry.phone_length) : '12345678'}
                        maxLength={selectedCountry?.phone_length || undefined}
                        inputDir="ltr"
                        leftElement={selectedCountry ? (
                          <div
                            className="font-black px-4 h-full flex items-center justify-center text-sm"
                            style={{
                              color: tokens.colors[mode].text.tertiary,
                              borderRight: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
                            }}
                          >
                            {selectedCountry.phone_code}
                          </div>
                        ) : undefined}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-8 border-dashed" style={{ borderColor: tokens.colors[mode].border.DEFAULT }}>
                   <h3 className="text-xl font-black mb-6" style={{ color: tokens.colors[mode].text.primary }}>{t('security')}</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="block text-sm font-black uppercase tracking-widest px-1" style={{ color: tokens.colors[mode].text.tertiary }}>
                          {t('currentPassword')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          required
                          value={formData.current_password}
                          onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                          placeholder="••••••••"
                          className="w-full px-6 py-4 rounded-2xl font-bold border outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                          style={{
                            background: tokens.colors[mode].surface.base,
                            color: tokens.colors[mode].text.primary,
                            borderColor: tokens.colors[mode].border.DEFAULT
                          }}
                        />
                      </div>
                      <div />
                      <div className="space-y-3">
                        <label className="block text-sm font-black uppercase tracking-widest px-1" style={{ color: tokens.colors[mode].text.tertiary }}>
                          {t('newPassword')}
                        </label>
                        <input
                          type="password"
                          value={formData.new_password}
                          onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                          placeholder="••••••••"
                          className="w-full px-6 py-4 rounded-2xl font-bold border outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                          style={{
                            background: tokens.colors[mode].surface.base,
                            color: tokens.colors[mode].text.primary,
                            borderColor: tokens.colors[mode].border.DEFAULT
                          }}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="block text-sm font-black uppercase tracking-widest px-1" style={{ color: tokens.colors[mode].text.tertiary }}>
                          {t('confirmNewPassword')}
                        </label>
                        <input
                          type="password"
                          value={formData.new_password_confirmation}
                          onChange={(e) => setFormData({ ...formData, new_password_confirmation: e.target.value })}
                          placeholder="••••••••"
                          className="w-full px-6 py-4 rounded-2xl font-bold border outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                          style={{
                            background: tokens.colors[mode].surface.base,
                            color: tokens.colors[mode].text.primary,
                            borderColor: tokens.colors[mode].border.DEFAULT
                          }}
                        />
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="px-10 py-4 rounded-2xl font-black transition-all duration-500 hover:scale-105 active:scale-95 shadow-xl disabled:opacity-50"
                    style={{
                      background: tokens.gradients.primary,
                      color: '#ffffff'
                    }}
                  >
                    {authLoading ? t('saving...') : t('saveChanges')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setAvatar(null);
                      setAvatarPreview(null);
                    }}
                    className="px-10 py-4 rounded-2xl font-black transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    style={{
                      color: tokens.colors[mode].text.secondary,
                      border: `1px solid ${tokens.colors[mode].border.DEFAULT}`
                    }}
                  >
                    {t('cancel')}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { label: t('fullName'), value: userData.name },
                  { label: t('emailAddress'), value: userData.email },
                  { label: t('phoneNumber'), value: userData.phone },
                  { label: t('memberSince'), value: userData.memberSince }
                ].map((field, i) => (
                  <div key={i} className="space-y-3">
                    <label className="block text-sm font-black uppercase tracking-widest px-1" style={{ color: tokens.colors[mode].text.tertiary }}>
                      {field.label}
                    </label>
                    <div 
                      className="px-6 py-4 rounded-2xl font-bold border transition-all hover:ring-4 hover:ring-primary/5"
                      style={{
                        background: mode === 'light' ? tokens.colors.light.surface.elevated : tokens.colors.dark.surface.base,
                        color: tokens.colors[mode].text.primary,
                        borderColor: tokens.colors[mode].border.DEFAULT
                      }}
                    >
                      {field.value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!isEditing && (
            <>
              {/* Order Statistics */}
              <div className="mb-12">
                <h2 className="text-4xl font-black mb-8" style={{ color: tokens.colors[mode].text.primary }}>
                  {t('orderStatistics')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {orderStats.map((stat, index) => (
                    <div
                      key={index}
                      className="p-8 rounded-[35px] transition-all duration-500 hover:scale-[1.03] group relative overflow-hidden"
                      style={{
                        background: tokens.gradients.surface[mode],
                        border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
                        boxShadow: tokens.shadows.sm
                      }}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-current opacity-[0.03] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" style={{ color: stat.color }} />
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-20 h-20 rounded-[28px] flex items-center justify-center shadow-inner" style={{ background: `${stat.color}15`, color: stat.color }}>
                          <span className="text-4xl transform group-hover:scale-125 transition-transform duration-500">{stat.icon}</span>
                        </div>
                        <div className="text-5xl font-black tracking-tighter" style={{ color: stat.color }}>
                          {stat.value}
                        </div>
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-tight" style={{ color: tokens.colors[mode].text.secondary }}>
                        {t(stat.key)}
                      </h3>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders */}
              <div 
                className="p-12 rounded-[40px] relative overflow-hidden"
                style={{
                  background: tokens.gradients.surface[mode],
                  border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
                  boxShadow: tokens.shadows.sm
                }}
              >
                <div className="flex items-center justify-between mb-10 relative z-10">
                  <h2 className="text-4xl font-black" style={{ color: tokens.colors[mode].text.primary }}>
                    {t('recentOrders')}
                  </h2>
                  <Link to="/profile/orders" className="text-sm font-black hover:underline underline-offset-8 flex items-center gap-2" style={{ color: tokens.colors[mode].primary.DEFAULT }}>
                    {t('viewAll')} {direction === 'rtl' ? '←' : '→'}
                  </Link>
                </div>

                <div className="text-center py-16 relative z-10">
                  <div className="text-8xl mb-6 inline-block p-10 rounded-[45px] animate-bounce" style={{ background: `${tokens.colors[mode].primary.DEFAULT}10` }}>📦</div>
                  <h3 className="text-3xl font-black mb-3" style={{ color: tokens.colors[mode].text.primary }}>{t('noOrdersYet')}</h3>
                  <p className="text-xl mb-10 font-bold" style={{ color: tokens.colors[mode].text.tertiary }}>{t('startShoppingDesc')}</p>
                  <Link to="/categories" className="inline-block px-12 py-5 rounded-2xl font-black transition-all duration-500 hover:scale-110 active:scale-95 shadow-[0_20px_40px_rgba(99,102,241,0.2)]" style={{ background: tokens.gradients.primary, color: '#ffffff' }}>
                    {t('startShopping')} 🛍️
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

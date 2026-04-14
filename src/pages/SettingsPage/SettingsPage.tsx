import { useTheme } from '../../hooks/useTheme';
import { BreadCrumb } from '../../components/molecules/BreadCrumb';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../tokens';

export function SettingsPage() {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    orderUpdates: true,
    promotions: true,
    newsletter: false,
    twoFactor: false
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const settingsSections = [
    {
      title: t('notifications'),
      icon: '🔔',
      items: [
        { key: 'emailNotifications' as const, label: t('emailNotifications'), description: t('receiveEmailDesc') },
        { key: 'smsNotifications' as const, label: t('smsNotifications'), description: t('receiveSmsDesc') },
        { key: 'pushNotifications' as const, label: t('pushNotifications'), description: t('receivePushDesc') }
      ]
    },
    {
      title: t('marketing'),
      icon: '📢',
      items: [
        { key: 'orderUpdates' as const, label: t('orderUpdates'), description: t('orderUpdatesDesc') },
        { key: 'promotions' as const, label: t('promotions'), description: t('promotionsDesc') },
        { key: 'newsletter' as const, label: t('newsletter'), description: t('newsletterSettingsDesc') }
      ]
    },
    {
      title: t('security'),
      icon: '🔒',
      items: [
        { key: 'twoFactor' as const, label: t('twoFactor'), description: t('twoFactorDesc') }
      ]
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <BreadCrumb 
        items={[
          { label: t('home'), path: '/' },
          { label: t('account'), path: '/profile' },
          { label: t('settings'), path: '/profile/settings' }
        ]}
      />

      <div className="mb-12 px-2">
        <h1 
          className="text-5xl font-black mb-4"
          style={{ color: tokens.colors[mode].text.primary }}
        >
          ⚙️ {t('settings')}
        </h1>
        <p 
          className="text-xl font-bold opacity-70"
          style={{ color: tokens.colors[mode].text.secondary }}
        >
          {t('managePreferences')}
        </p>
      </div>

      <div className="space-y-8 px-2 max-w-5xl">
        {settingsSections.map((section, idx) => (
          <div
            key={idx}
            className="p-10 rounded-[40px] shadow-xl transition-all duration-500 hover:shadow-2xl"
            style={{
              background: tokens.colors[mode].surface.elevated,
              backdropFilter: 'blur(30px)',
              border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
            }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg" style={{ background: `${tokens.colors[mode].primary.DEFAULT}15` }}>
                {section.icon}
              </div>
              <h2 
                className="text-3xl font-black"
                style={{ color: tokens.colors[mode].text.primary }}
              >
                {section.title}
              </h2>
            </div>

            <div className="space-y-4">
              {section.items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-6 rounded-3xl transition-all duration-300"
                  style={{
                    background: mode === 'light' ? tokens.colors.light.surface.base : tokens.colors.dark.surface.base
                  }}
                >
                  <div>
                    <h3 
                      className="text-xl font-black mb-1"
                      style={{ color: tokens.colors[mode].text.primary }}
                    >
                      {item.label}
                    </h3>
                    <p 
                      className="text-sm font-bold opacity-60"
                      style={{ color: tokens.colors[mode].text.secondary }}
                    >
                      {item.description}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSetting(item.key)}
                    className="relative w-20 h-10 rounded-full transition-all duration-500 shadow-inner group"
                    style={{
                      background: settings[item.key]
                        ? tokens.gradients.primary
                        : mode === 'light' ? '#e2e8f0' : '#334155'
                    }}
                  >
                    <div
                      className="absolute top-1.5 w-7 h-7 rounded-full bg-white transition-all duration-500 shadow-xl"
                      style={{
                        left: settings[item.key] ? '45px' : '8px'
                      }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Danger Zone */}
        <div
          className="p-10 rounded-[40px] shadow-xl relative overflow-hidden"
          style={{
            background: mode === 'light'
              ? 'rgba(239, 68, 68, 0.05)'
              : 'rgba(239, 68, 68, 0.1)',
            border: `2px solid ${tokens.colors[mode].error.DEFAULT}`
          }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
          
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg bg-red-500/10">
              ⚠️
            </div>
            <h2 
              className="text-3xl font-black"
              style={{ color: tokens.colors[mode].error.DEFAULT }}
            >
              {t('dangerZone')}
            </h2>
          </div>
          <div className="space-y-4 relative z-10">
            <button 
              className="w-full px-8 py-5 rounded-2xl font-black text-xl transition-all duration-500 hover:scale-[1.02] active:scale-95 shadow-xl hover:shadow-red-500/30"
              style={{
                background: tokens.colors[mode].error.DEFAULT,
                color: '#ffffff'
              }}
            >
              {t('deleteAccount')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

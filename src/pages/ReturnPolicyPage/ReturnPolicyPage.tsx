import { useSettings } from '../../hooks/useSettings';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../tokens';
import { useTheme } from '../../hooks/useTheme';
import { BreadCrumb } from '../../components/molecules/BreadCrumb';

export function ReturnPolicyPage() {
  const { settings, loading } = useSettings();
  const { t } = useTranslation();
  const { mode } = useTheme();

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Breadcrumb */}
        <BreadCrumb 
          items={[
            { label: t('home'), path: '/' },
            { label: t('returnPolicy'), path: '/return-policy' }
          ]}
        />

        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-7xl mb-6 animate-pulse inline-block">↩️</div>
          <h1 
            className="text-6xl font-black mb-6"
            style={{ color: tokens.colors[mode].text.primary }}
          >
            {t('returnPolicy')}
          </h1>
          <p 
            className="text-2xl font-bold leading-relaxed max-w-3xl mx-auto"
            style={{ color: tokens.colors[mode].text.secondary }}
          >
            {t('returnPolicySubtitle')}
          </p>
        </div>

        {/* Content */}
        <div 
          className="rounded-[45px] p-10 md:p-16 transition-all duration-500 shadow-2xl relative overflow-hidden"
          style={{
            background: tokens.colors[mode].surface.elevated,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
          }}
        >
          <div className="absolute top-0 left-0 w-3 h-full" style={{ background: tokens.gradients.secondary }} />
          
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4" style={{ borderColor: tokens.colors[mode].primary.DEFAULT }}></div>
            </div>
          ) : settings?.return_policy ? (
            <div 
              className="prose prose-xl dark:prose-invert max-w-none font-medium leading-loose"
              style={{ color: tokens.colors[mode].text.secondary }}
              dangerouslySetInnerHTML={{ __html: settings.return_policy }}
            />
          ) : (
            <div className="text-center py-24">
              <p className="text-2xl font-black italic opacity-30" style={{ color: tokens.colors[mode].text.tertiary }}>{t('noReturnPolicy')}</p>
            </div>
          )}
        </div>

        {/* Support Section */}
        <div 
          className="mt-20 p-16 rounded-[50px] text-center overflow-hidden relative shadow-[0_30px_70px_rgba(99,102,241,0.25)]"
          style={{
            background: tokens.gradients.primary,
          }}
        >
          <div className="relative z-10">
            <h3 className="text-4xl font-black text-white mb-8 uppercase tracking-tight">
              {t('needHelpWithReturn')}
            </h3>
            <div className="flex flex-wrap gap-6 justify-center">
              <a
                href={`mailto:${settings?.email || 'support@bnaia.com'}`}
                className="px-12 py-5 rounded-2xl font-black text-xl transition-all duration-500 shadow-2xl hover:scale-110"
                style={{ 
                  color: tokens.colors.light.primary[600],
                  background: tokens.colors.light.surface.base
                }}
              >
                📧 {t('emailSupport')}
              </a>
              <a
                href={`tel:${settings?.phone_1 || ''}`}
                className="px-12 py-5 rounded-2xl font-black text-xl transition-all duration-500 bg-white/20 text-white border-2 border-white/40 hover:bg-white/30 hover:scale-110 backdrop-blur-md"
              >
                📞 {t('callUs')}
              </a>
            </div>
          </div>
          
          {/* Decor */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-900/40 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px] pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

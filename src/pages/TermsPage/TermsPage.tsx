import { BreadCrumb } from '../../components/molecules/BreadCrumb';
import { useSettings } from '../../hooks/useSettings';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../tokens';
import { useTheme } from '../../hooks/useTheme';

export function TermsPage() {
  const { settings, loading } = useSettings();
  const { t } = useTranslation();
  const { mode } = useTheme();

  return (
    <div className="min-h-screen py-8">
      <BreadCrumb 
        items={[
          { label: t('home'), path: '/' },
          { label: t('termsSubtitle'), path: '/terms' }
        ]}
      />

      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="text-6xl mb-6 animate-bounce inline-block">📋</div>
        <h1 
          className="text-5xl font-black mb-4"
          style={{ color: tokens.colors[mode].text.primary }}
        >
          {settings?.terms_and_conditions?.title || t('termsSubtitle')}
        </h1>
        <p 
          className="text-xl max-w-3xl mx-auto mb-4 font-bold leading-relaxed"
          style={{ color: tokens.colors[mode].text.secondary }}
        >
          {t('termsSubtitle')}
        </p>
      </div>

      {/* Content Section */}
      <div 
        className="max-w-5xl mx-auto p-10 md:p-16 rounded-[40px] transition-all duration-500 shadow-2xl"
        style={{
          background: tokens.colors[mode].surface.elevated,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
        }}
      >
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4" style={{ borderColor: tokens.colors[mode].primary.DEFAULT }}></div>
          </div>
        ) : settings?.terms_and_conditions?.description ? (
          <div 
            className="prose prose-xl dark:prose-invert max-w-none font-medium leading-loose"
            style={{ color: tokens.colors[mode].text.secondary }}
            dangerouslySetInnerHTML={{ __html: settings.terms_and_conditions.description }}
          />
        ) : (
          <div className="text-center py-24">
            <p className="text-2xl font-black italic opacity-30" style={{ color: tokens.colors[mode].text.tertiary }}>{t('noTermsContent')}</p>
          </div>
        )}
      </div>

      {/* Contact Section */}
      <div 
        className="mt-20 p-16 rounded-[50px] text-center max-w-5xl mx-auto overflow-hidden relative shadow-[0_30px_70px_rgba(99,102,241,0.2)]"
        style={{
          background: tokens.gradients.primary,
        }}
      >
        <div className="relative z-10">
          <h3 className="text-4xl font-black text-white mb-6 uppercase tracking-tight">
            {t('stillHaveQuestions')}
          </h3>
          <p className="text-2xl text-white/90 mb-10 max-w-3xl mx-auto font-bold leading-relaxed">
            {t('supportDescription')}
          </p>
          <div className="flex justify-center">
              <a
                href={`mailto:${settings?.email || 'info@bnaia.com'}`}
                className="px-12 py-5 rounded-2xl font-black text-xl transition-all duration-500 shadow-2xl hover:scale-110"
                style={{ 
                  color: tokens.colors.light.primary[600],
                  background: tokens.colors.light.surface.base
                }}
              >
                ✉️ {t('contactUs')}
              </a>
          </div>
        </div>

        {/* Decor */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-900/40 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px] pointer-events-none" />
      </div>
    </div>
  );
}

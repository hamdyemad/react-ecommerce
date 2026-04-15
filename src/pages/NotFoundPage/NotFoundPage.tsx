import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { tokens } from '../../tokens';
import { Button } from '../../components/atoms/Button';
import { SEO } from '../../components/atoms/SEO';

export function NotFoundPage() {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20 px-6">
      <SEO title={t('pageNotFound', 'Page Not Found')} />
      
      <div className="relative w-full max-w-2xl text-center">
        {/* Background Decorative Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-[120px] animate-pulse delay-700" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <h1 
            className="text-[12rem] sm:text-[18rem] font-black leading-none opacity-10 select-none mb-8"
            style={{ color: tokens.colors[mode].text.primary }}
          >
            404
          </h1>
          
          <div className="mt-[-8rem] sm:mt-[-12rem]">
            <h2 
              className="text-4xl sm:text-6xl font-black mb-6"
              style={{ color: tokens.colors[mode].text.primary }}
            >
              {t('lostInSpace', 'Oops! Lost in Space?')}
            </h2>
            
            <p 
              className="text-lg sm:text-xl opacity-60 mb-12 max-w-md mx-auto font-medium"
              style={{ color: tokens.colors[mode].text.secondary }}
            >
              {t('pageNotFoundDesc', "The page you are looking for doesn't exist or has been moved to another galaxy.")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto px-10 py-5 rounded-2xl font-black shadow-xl hover:shadow-primary/40 transition-all hover:scale-[1.05] active:scale-95 flex items-center gap-3"
                onClick={() => navigate('/')}
              >
                🏠 {t('backToHome', 'Back to Home')}
              </Button>
              
              <button
                className="w-full sm:w-auto px-10 py-5 rounded-2xl font-black transition-all hover:bg-black/5 dark:hover:bg-white/5 opacity-60 hover:opacity-100"
                style={{ color: tokens.colors[mode].text.primary }}
                onClick={() => navigate(-1)}
              >
                🔙 {t('goBack', 'Go Back')}
              </button>
            </div>
          </div>
        </div>

        {/* Grid Pattern Background */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: `radial-gradient(${tokens.colors[mode].text.primary} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      </div>
    </div>
  );
}

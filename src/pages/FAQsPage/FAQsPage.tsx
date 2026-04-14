import { useState, useEffect } from 'react';
import { BreadCrumb } from '../../components/molecules/BreadCrumb';
import { faqService } from '../../services/faqService';
import type { FAQ } from '../../types/api';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../tokens';
import { useTheme } from '../../hooks/useTheme';
import { useDirection } from '../../hooks/useDirection';

export function FAQsPage() {
  const { t } = useTranslation();
  const { mode } = useTheme();
  const { direction } = useDirection();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await faqService.getFAQs();
        if (response.status) {
          setFaqs(response.data);
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const toggleAccordion = (id: number) => {
    setActiveId(activeId === id ? null : id);
  };

  return (
    <div className="min-h-screen py-8">
      <BreadCrumb 
        items={[
          { label: t('home'), path: '/' },
          { label: t('faqs'), path: '/faqs' }
        ]}
      />

      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="text-6xl mb-6 animate-bounce inline-block">❓</div>
        <h1 
          className="text-5xl font-black mb-4"
          style={{ color: tokens.colors[mode].text.primary }}
        >
          {t('faqs')}
        </h1>
        <p 
          className="text-xl max-w-2xl mx-auto font-bold leading-relaxed"
          style={{ color: tokens.colors[mode].text.secondary }}
        >
          {t('faqsSubtitle')}
        </p>
      </div>

      {/* FAQs List */}
      <div className="max-w-4xl mx-auto space-y-4 px-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4" style={{ borderColor: tokens.colors[mode].primary.DEFAULT }}></div>
          </div>
        ) : faqs.length > 0 ? (
          faqs.map((faq) => (
            <div 
              key={faq.id}
              className="rounded-[30px] overflow-hidden transition-all duration-500 hover:shadow-2xl"
              style={{
                background: tokens.colors[mode].surface.elevated,
                border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
                boxShadow: activeId === faq.id ? '0 30px 60px rgba(0,0,0,0.12)' : '0 10px 30px rgba(0,0,0,0.03)',
                transform: activeId === faq.id ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              <button
                onClick={() => toggleAccordion(faq.id)}
                className={`w-full p-8 flex items-center justify-between gap-6 group transition-colors ${direction === 'rtl' ? 'text-right' : 'text-left'}`}
                style={{
                    background: activeId === faq.id 
                        ? `${tokens.colors[mode].primary.DEFAULT}1A`
                        : 'transparent'
                }}
              >
                <span 
                  className="text-2xl font-black transition-colors"
                  style={{ color: activeId === faq.id ? tokens.colors[mode].primary.DEFAULT : tokens.colors[mode].text.primary }}
                >
                  {faq.question}
                </span>
                <div 
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${activeId === faq.id ? 'rotate-180 scale-110' : ''}`}
                  style={{ 
                    background: activeId === faq.id ? tokens.gradients.primary : tokens.colors[mode].surface.base,
                    color: activeId === faq.id ? tokens.colors[mode].text.inverse : tokens.colors[mode].primary.DEFAULT
                  }}
                >
                  {activeId === faq.id ? '−' : '+'}
                </div>
              </button>
              
              <div 
                className={`transition-all duration-700 ease-in-out overflow-hidden ${activeId === faq.id ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div 
                  className="p-10 pt-0 text-xl font-bold leading-relaxed space-y-4"
                  style={{ color: tokens.colors[mode].text.secondary }}
                >
                  <div className="h-px w-full mb-8 shadow-inner" style={{ background: tokens.colors[mode].border.DEFAULT }} />
                  <p>{faq.answer}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-surface-elevated rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="text-8xl mb-6 opacity-20">📭</div>
            <p className="text-2xl font-black" style={{ color: tokens.colors[mode].text.tertiary }}>{t('noFaqs')}</p>
          </div>
        )}
      </div>

      {/* Contact Support Section */}
      <div 
        className="mt-24 p-16 rounded-[50px] text-center max-w-5xl mx-auto overflow-hidden relative shadow-[0_30px_70px_rgba(99,102,241,0.25)]"
        style={{
          background: tokens.gradients.primary,
        }}
      >
        <div className="relative z-10">
          <h2 className="text-5xl font-black text-white mb-6 uppercase tracking-tight">{t('stillHaveQuestions')}</h2>
          <p className="text-2xl text-white/90 mb-12 max-w-3xl mx-auto font-bold leading-relaxed">
            {t('supportDescription')}
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <a
              href="/contact"
              className="px-12 py-5 rounded-2xl font-black text-xl transition-all duration-500 shadow-2xl hover:scale-110"
              style={{ 
                color: tokens.colors.light.primary[600],
                background: tokens.colors.light.surface.base
              }}
            >
              ✉️ {t('contactUs')}
            </a>
            <a
              href="tel:+1234567890"
              className="px-12 py-5 rounded-2xl font-black text-xl transition-all duration-500 bg-white/20 text-white border-2 border-white/40 hover:bg-white/30 hover:scale-110 backdrop-blur-md"
            >
              📞 {t('liveSupport')}
            </a>
          </div>
        </div>

        {/* Decor */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-900/40 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px] pointer-events-none" />
      </div>
    </div>
  );
}

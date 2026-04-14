import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { tokens } from '../../tokens';
import { BreadCrumb } from '../../components/molecules/BreadCrumb';
import { SEO } from '../../components/atoms/SEO';
import { settingsService } from '../../services/settingsService';
import type { AboutUsData } from '../../types/api';

export function AboutUsPage() {
  const { t } = useTranslation();
  const { mode } = useTheme();
  const [data, setData] = useState<AboutUsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await settingsService.getAboutUs();
        if (response.status) {
          setData(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch about us data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-40 flex justify-center bg-slate-50 dark:bg-slate-950 animate-pulse">
        <div className="max-w-4xl w-full h-[600px] bg-slate-100 dark:bg-slate-900 rounded-[50px]" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen pb-40 px-6 overflow-hidden" style={{ background: mode === 'light' ? '#fcfcfd' : '#0a0f1d' }}>
      <SEO title={t('aboutUs')} description={data.meta_description} />
      
      {/* 1. Correct Top Padding to Avoid Sticky Header Overlap */}
      <div className="pt-10 max-w-5xl mx-auto mb-16">
        <BreadCrumb 
          items={[
            { label: t('home'), path: '/' },
            { label: t('aboutUs'), path: '/about-us' }
          ]} 
        />
        <h1 
          className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight prose prose-slate dark:prose-invert max-w-full mb-10"
          style={{ color: tokens.colors[mode].text.primary }}
          dangerouslySetInnerHTML={{ __html: data.section_1.title }}
        />
        <div 
          className="text-xl md:text-2xl leading-relaxed prose prose-slate dark:prose-invert opacity-70 mb-12"
          dangerouslySetInnerHTML={{ __html: data.section_1.text }}
        />
      </div>

      {/* 2. Full Width Image Gallery Style */}
      <div className="max-w-7xl mx-auto mb-24">
         <div className="rounded-[40px] md:rounded-[60px] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
            <img src={data.section_1.image} alt="" className="w-full h-auto object-cover max-h-[700px]" />
         </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-20">
         {/* 3. Sub-sections Flow */}
         <div className="grid md:grid-cols-2 gap-8">
            {[data.section_1.sub_section_1, data.section_1.sub_section_2].map((sub, i) => (
              <div key={i} className="p-10 rounded-[45px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl hover:-translate-y-2 transition-transform">
                 <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center p-3 mb-8">
                    <img src={sub.icon} alt="" className="w-full h-full object-contain" />
                 </div>
                 <h4 className="text-xl font-black mb-4 prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: sub.subtitle }} />
                 <div className="text-base opacity-60 prose-sm dark:prose-invert leading-relaxed" dangerouslySetInnerHTML={{ __html: sub.text }} />
              </div>
            ))}
         </div>

         {/* 4. Commitments */}
         <div className="p-10 md:p-14 rounded-[50px] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-black mb-10 uppercase tracking-[0.4em] opacity-30">Our Key Commitments</h3>
            <div className="grid gap-4">
               {Object.values(data.section_1.bullets).map((bullet, i) => (
                 <div key={i} className="flex gap-4 items-center p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 shadow-sm font-bold opacity-80 prose prose-slate dark:prose-invert" dangerouslySetInnerHTML={{ __html: bullet }} />
               ))}
            </div>
         </div>

         {/* 5. Narrative Section 2 */}
         <div className="grid gap-12">
            <div className="rounded-[50px] overflow-hidden shadow-2xl relative aspect-video">
               <img src={data.section_2.image} alt="" className="w-full h-full object-cover" />
               <a href={data.section_2.video_link} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/30 flex items-center justify-center hover:bg-black/50 transition-all">
                  <div className="w-20 h-20 rounded-full bg-white text-primary flex items-center justify-center shadow-2xl transition-transform hover:scale-110">
                    <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
               </a>
            </div>
            <div>
               <h2 className="text-4xl font-black mb-8 leading-tight prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: data.section_2.title }} />
               <div className="text-xl opacity-60 leading-relaxed prose prose-xl dark:prose-invert" dangerouslySetInnerHTML={{ __html: data.section_2.text }} />
               
               <div className="mt-10 p-10 rounded-[40px] bg-primary text-white shadow-xl">
                  <h4 className="font-black text-xl mb-3 prose prose-invert" dangerouslySetInnerHTML={{ __html: data.section_2.sub_section.subtitle }} />
                  <p className="opacity-80 prose prose-invert" dangerouslySetInnerHTML={{ __html: data.section_2.sub_section.text }} />
               </div>
            </div>
         </div>

         {/* 6. Excellence & Highlights */}
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { t: data.section_3.side_title_1, s: data.section_3.side_text_1, icon: '🛡️' },
              { t: data.section_3.side_title_2, s: data.section_3.side_text_2, icon: '💎' },
              { t: data.section_3.side_title_3, s: data.section_3.side_text_3, icon: '⚡' },
            ].map((item, i) => (
              <div key={i} className="p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 text-center bg-white dark:bg-slate-900 shadow-sm">
                 <div className="text-5xl mb-6">{item.icon}</div>
                 <h3 className="text-xl font-black mb-4 prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: item.t }} />
                 <div className="text-sm opacity-50 prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: item.s }} />
              </div>
            ))}
         </div>

         {/* 7. Finale Block - Mission/Objective - High Width */}
         <div className="pt-20 border-t border-slate-100 dark:border-slate-900 space-y-12">
            <h2 className="text-4xl font-black text-center mb-16 prose prose-xl dark:prose-invert" dangerouslySetInnerHTML={{ __html: data.section_4.title }} />
            <div className="p-12 md:p-16 rounded-[60px] relative overflow-hidden group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] border-4 border-white dark:border-slate-800" style={{ background: tokens.gradients.primary }}>
               <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40" />
               <h3 className="text-sm font-black mb-12 uppercase tracking-[0.5em] text-white/40">Our Mission</h3>
               <div className="grid gap-8">
                  {Object.values(data.about).map((bullet, i) => (
                    <div key={i} className="flex gap-6 items-start group/item">
                       <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-3xl flex items-center justify-center text-2xl shadow-xl border border-white/30 flex-shrink-0 group-hover/item:rotate-12 transition-all duration-500">✨</div>
                       <div className="text-xl md:text-2xl font-black text-white prose prose-invert leading-tight" dangerouslySetInnerHTML={{ __html: bullet }} />
                    </div>
                  ))}
               </div>
            </div>

            <div className="grid gap-8">
               <div className="p-10 md:p-14 rounded-[50px] border border-slate-100 dark:border-slate-800 shadow-sm">
                  <h3 className="text-sm font-black mb-10 uppercase tracking-[0.4em] opacity-10">Strategic Objectives</h3>
                  <div className="grid gap-4">
                     {Object.values(data.objective).map((bullet, i) => (
                       <div key={i} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 prose-sm dark:prose-invert font-bold" dangerouslySetInnerHTML={{ __html: bullet }} />
                     ))}
                  </div>
               </div>
               
               <div className="p-10 md:p-14 rounded-[50px] bg-primary text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-[60px] -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000" />
                  <h3 className="text-sm font-black mb-10 uppercase tracking-[0.4em] opacity-30">Excellence Points</h3>
                  <div className="grid gap-4 relative z-10">
                     {Object.values(data.excellent).map((bullet, i) => (
                       <div key={i} className="p-6 rounded-3xl bg-white/10 border border-white/20 prose prose-invert font-black flex items-center gap-6" dangerouslySetInnerHTML={{ __html: bullet }} />
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>

      <style>{`
        .prose h1, .prose h2, .prose h3, .prose h4 {
           margin: 0 !important;
           font-weight: 900 !important;
           color: inherit !important;
           font-size: inherit !important;
        }
        .prose strong { font-weight: 900 !important; color: inherit !important; }
      `}</style>
    </div>
  );
}

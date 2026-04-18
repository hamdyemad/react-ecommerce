import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { useDirection } from '../../hooks/useDirection';
import { tokens } from '../../tokens';
import { BreadCrumb } from '../../components/molecules/BreadCrumb';
import { SEO } from '../../components/atoms/SEO';
import { settingsService } from '../../services/settingsService';
import type { AboutUsData } from '../../types/api';

export function AboutUsPage() {
  const { t } = useTranslation();
  const { mode } = useTheme();
  const { direction } = useDirection();
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
    <div className="min-h-screen pb-20 md:pb-40 px-4 sm:px-6 md:px-12 overflow-hidden" style={{ background: mode === 'light' ? '#fcfcfd' : '#0a0f1d', direction }}>
      <SEO title={t('aboutUs')} description={data.meta_description} />
      
      {/* 1. Header Section */}
      <div className="pt-10 md:pt-20 max-w-6xl mx-auto mb-12 md:mb-24">
        <div className="mb-8 md:mb-12">
          <BreadCrumb 
            items={[
              { label: t('home'), path: '/' },
              { label: t('aboutUs'), path: '/about-us' }
            ]} 
          />
        </div>
        
        <div className="space-y-6 md:space-y-10">
          <h1 
            className="font-black leading-[1.1] tracking-tight max-w-4xl"
            style={{ 
              color: tokens.colors[mode].text.primary,
              fontSize: 'clamp(1.875rem, 5vw, 4.5rem)', // 30px to 72px
              textAlign: direction === 'rtl' ? 'right' : 'left'
            }}
            dangerouslySetInnerHTML={{ __html: data.section_1.title }}
          />
          <div 
            className="max-w-3xl leading-relaxed"
            style={{ 
              color: tokens.colors[mode].text.secondary,
              fontSize: 'clamp(1rem, 2vw, 1.5rem)', // 16px to 24px
              textAlign: direction === 'rtl' ? 'right' : 'left'
            }}
            dangerouslySetInnerHTML={{ __html: data.section_1.text }}
          />
        </div>
      </div>

      {/* 2. Full Width Image Gallery Style */}
      <div className="max-w-7xl mx-auto mb-16 md:mb-32">
         <div className="rounded-[32px] md:rounded-[60px] overflow-hidden shadow-2xl border border-white/10 dark:border-slate-800/50">
            <img src={data.section_1.image} alt="" className="w-full h-auto object-cover max-h-[350px] md:max-h-[750px]" />
         </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-16 md:space-y-40">
         {/* 3. Sub-sections Flow */}
         <div className="grid md:grid-cols-2 gap-6 md:gap-12">
            {[data.section_1.sub_section_1, data.section_1.sub_section_2].map((sub, i) => (
              <div key={i} className="group p-6 md:p-14 rounded-[32px] md:rounded-[56px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col items-center text-center md:items-start md:text-start">
                 <div className="w-14 h-14 md:w-20 md:h-20 rounded-[20px] md:rounded-[32px] bg-primary/10 flex items-center justify-center p-3 md:p-4 mb-6 md:mb-12 group-hover:rotate-6 transition-transform">
                    <img src={sub.icon} alt="" className="w-full h-full object-contain" />
                 </div>
                 <h4 className="text-xl md:text-3xl font-black mb-3 md:mb-6" style={{ color: tokens.colors[mode].text.primary }} dangerouslySetInnerHTML={{ __html: sub.subtitle }} />
                 <div className="text-base md:text-xl leading-relaxed" style={{ color: tokens.colors[mode].text.secondary }} dangerouslySetInnerHTML={{ __html: sub.text }} />
              </div>
            ))}
         </div>

         {/* 4. Commitments */}
         <div className="p-6 md:p-20 rounded-[32px] md:rounded-[80px] bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50">
            <div className="max-w-3xl">
              <h3 className="text-xs font-black mb-8 md:mb-16 uppercase tracking-[0.4em]">Our Key Commitments</h3>
              <div className="grid gap-4 md:gap-6">
                 {Object.values(data.section_1.bullets).map((bullet, i) => (
                   <div key={i} className="flex gap-4 md:gap-8 items-center p-5 md:p-8 rounded-2xl md:rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                     <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-primary flex-shrink-0 animate-pulse" />
                     <div className="text-base md:text-xl font-bold" style={{ color: tokens.colors[mode].text.primary }} dangerouslySetInnerHTML={{ __html: bullet }} />
                   </div>
                 ))}
              </div>
            </div>
         </div>

         {/* 5. Narrative Section 2 */}
         <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 md:gap-32 items-center">
            {/* Image always on top on mobile, left on desktop */}
            <div className="w-full rounded-[32px] md:rounded-[64px] overflow-hidden shadow-2xl relative aspect-[4/3] lg:aspect-square group">
               <img src={data.section_2.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
               <a href={data.section_2.video_link} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm">
                  <div className="w-16 h-16 md:w-32 md:h-32 rounded-full bg-white text-primary flex items-center justify-center shadow-2xl transition-transform hover:scale-110">
                    <svg className="w-8 h-8 md:w-16 md:h-16 ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
               </a>
            </div>
            <div className="w-full space-y-6 md:space-y-14">
               <h2 className="text-2xl md:text-6xl font-black leading-tight text-center md:text-start" style={{ color: tokens.colors[mode].text.primary }} dangerouslySetInnerHTML={{ __html: data.section_2.title }} />
               <div className="text-base md:text-2xl leading-relaxed text-center md:text-start" style={{ color: tokens.colors[mode].text.secondary }} dangerouslySetInnerHTML={{ __html: data.section_2.text }} />
               
               <div
                  className="p-6 md:p-16 rounded-[32px] md:rounded-[56px] shadow-md relative overflow-hidden group border"
                  style={{
                    background: mode === 'light' ? '#f1f5f9' : '#1e293b',
                    borderColor: mode === 'light' ? '#e2e8f0' : '#334155'
                  }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 rounded-full blur-3xl -mr-16 -mt-16 md:-mr-24 md:-mt-24 group-hover:scale-150 transition-transform duration-700" style={{ background: mode === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)' }} />
                  <h4 className="font-black text-lg md:text-3xl mb-3 md:mb-6 relative z-10" style={{ color: tokens.colors[mode].text.primary }} dangerouslySetInnerHTML={{ __html: data.section_2.sub_section.subtitle }} />
                  <p className="text-sm md:text-xl leading-relaxed relative z-10" style={{ color: tokens.colors[mode].text.secondary }} dangerouslySetInnerHTML={{ __html: data.section_2.sub_section.text }} />
               </div>
            </div>
         </div>

         {/* 6. Excellence & Highlights */}
         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
            {[
              { t: data.section_3.side_title_1, s: data.section_3.side_text_1, icon: '🛡️' },
              { t: data.section_3.side_title_2, s: data.section_3.side_text_2, icon: '💎' },
              { t: data.section_3.side_title_3, s: data.section_3.side_text_3, icon: '⚡' },
            ].map((item, i) => (
              <div key={i} className="p-8 md:p-16 rounded-[32px] md:rounded-[48px] border border-slate-100 dark:border-slate-800 text-center bg-white dark:bg-slate-900 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                 <div className="text-4xl md:text-7xl mb-8 md:mb-10">{item.icon}</div>
                 <h3 className="text-xl md:text-3xl font-black mb-4 md:mb-6" style={{ color: tokens.colors[mode].text.primary }} dangerouslySetInnerHTML={{ __html: item.t }} />
                 <div className="text-sm md:text-lg leading-relaxed" style={{ color: tokens.colors[mode].text.secondary }} dangerouslySetInnerHTML={{ __html: item.s }} />
              </div>
            ))}
         </div>

         {/* 7. Finale Block - Mission/Objective */}
         <div className="pt-20 md:pt-40 border-t border-slate-200 dark:border-slate-800 space-y-16 md:space-y-32">
            <h2 className="text-3xl md:text-7xl font-black text-center max-w-4xl mx-auto leading-tight px-4" style={{ color: tokens.colors[mode].text.primary }} dangerouslySetInnerHTML={{ __html: data.section_4.title }} />
            
            <div
               className="p-6 sm:p-12 md:p-32 rounded-[40px] md:rounded-[100px] relative overflow-hidden group shadow-md border"
               style={{
                 background: mode === 'light' ? '#f8fafc' : '#0f172a',
                 borderColor: mode === 'light' ? '#e2e8f0' : '#1e293b'
               }}
            >
               <div className="absolute top-0 right-0 w-64 md:w-[600px] h-64 md:h-[600px] rounded-full blur-[60px] md:blur-[150px] -mr-32 md:-mr-80 -mt-32 md:-mt-80" style={{ background: mode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)' }} />
               <div className="absolute bottom-0 left-0 w-48 md:w-[400px] h-48 md:h-[400px] rounded-full blur-[50px] md:blur-[120px] -ml-24 md:-ml-60 -mb-24 md:-mb-60" style={{ background: 'rgba(0,0,0,0.1)' }} />
               
               <h3 className="text-[10px] md:text-sm font-black mb-8 md:mb-20 uppercase tracking-[0.4em] relative z-10" style={{ color: tokens.colors[mode].text.primary }}>Our Mission</h3>
               <div className="grid gap-8 md:gap-16 relative z-10">
                  {Object.values(data.about).map((bullet, i) => (
                    <div key={i} className="flex flex-col items-center text-center md:flex-row md:items-start md:text-start gap-4 md:gap-12 group/item">
                       <div
                         className="w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-3xl flex items-center justify-center text-2xl md:text-5xl shadow-md border flex-shrink-0 group-hover/item:scale-110 group-hover/item:rotate-12 transition-all duration-700"
                         style={{
                           background: mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
                           borderColor: mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)'
                         }}
                       >✨</div>
                       <div className="text-base md:text-5xl font-black leading-tight" style={{ color: tokens.colors[mode].text.primary }} dangerouslySetInnerHTML={{ __html: bullet }} />
                    </div>
                  ))}
               </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 md:gap-16">
               <div className="p-6 md:p-20 rounded-[32px] md:rounded-[64px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm">
                  <h3 className="text-[10px] md:text-sm font-black mb-8 md:mb-16 uppercase tracking-[0.4em]">Strategic Objectives</h3>
                  <div className="grid gap-4 md:gap-6">
                     {Object.values(data.objective).map((bullet, i) => (
                       <div key={i} className="p-5 md:p-10 rounded-2xl md:rounded-[40px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 text-base md:text-2xl font-bold" style={{ color: tokens.colors[mode].text.primary }} dangerouslySetInnerHTML={{ __html: bullet }} />
                     ))}
                  </div>
               </div>
               
               <div
                  className="p-6 md:p-20 rounded-[32px] md:rounded-[64px] shadow-md relative overflow-hidden group border"
                  style={{
                    background: mode === 'light' ? '#f1f5f9' : '#0f172a',
                    borderColor: mode === 'light' ? '#e2e8f0' : '#1e293b'
                  }}
               >
                  <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[60px] -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000" style={{ background: mode === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)' }} />
                  <h3 className="text-[10px] md:text-sm font-black mb-8 md:mb-16 uppercase tracking-[0.4em] text-center md:text-start" style={{ color: tokens.colors[mode].text.primary }}>Excellence Points</h3>
                  <div className="grid gap-4 md:gap-6 relative z-10">
                     {Object.values(data.excellent).map((bullet, i) => (
                       <div
                         key={i}
                         className="p-5 md:p-10 rounded-2xl md:rounded-[40px] text-base md:text-lg font-black flex flex-col items-center text-center md:flex-row md:items-center md:text-start gap-3 md:gap-10 border"
                         style={{
                           background: mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)',
                           borderColor: mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
                           color: tokens.colors[mode].text.primary
                         }}
                         dangerouslySetInnerHTML={{ __html: bullet }}
                       />
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
        
        @media (max-width: 768px) {
          .prose { font-size: 16px !important; }
          img { border-radius: 20px !important; }
        }
      `}</style>
    </div>
  );
}

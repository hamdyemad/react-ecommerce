import { useTheme } from '../../hooks/useTheme';
import { BreadCrumb } from '../../components/molecules/BreadCrumb';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../tokens';

export function ReviewsPage() {
  const { mode } = useTheme();
  const { t } = useTranslation();

  const reviews = [
    {
      id: 1,
      product: 'Premium Wireless Headphones',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
      rating: 5,
      date: 'Feb 10, 2024',
      comment: 'Amazing sound quality! Best headphones I\'ve ever owned. Highly recommended!',
      helpful: 12
    },
    {
      id: 2,
      product: 'Smart Watch',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop',
      rating: 4,
      date: 'Feb 5, 2024',
      comment: 'Great watch with lots of features. Battery life could be better.',
      helpful: 8
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className="text-2xl transform transition-transform hover:scale-125">
        {i < rating ? '⭐' : '☆'}
      </span>
    ));
  };

  return (
    <div className="min-h-screen py-8">
      <BreadCrumb 
        items={[
          { label: t('home'), path: '/' },
          { label: t('account'), path: '/profile' },
          { label: t('myReviewsPageTitle'), path: '/profile/reviews' }
        ]}
      />

      {/* Header */}
      <div className="mb-12 px-2">
        <h1 
          className="text-5xl font-black mb-4"
          style={{ color: tokens.colors[mode].text.primary }}
        >
          ⭐ {t('myReviewsPageTitle')}
        </h1>
        <p 
          className="text-xl font-bold opacity-70"
          style={{ color: tokens.colors[mode].text.secondary }}
        >
          {reviews.length} {t('reviewsWritten')}
        </p>
      </div>

      {/* Reviews List */}
      <div className="space-y-8 px-2 max-w-5xl">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="p-8 rounded-[40px] transition-all duration-500 hover:scale-[1.01] shadow-2xl group overflow-hidden"
            style={{
              background: tokens.colors[mode].surface.elevated,
              backdropFilter: 'blur(30px)',
              border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
            
            <div className="flex flex-col md:flex-row gap-10 relative z-10">
              <div className="relative group/img">
                  <img
                    src={review.image}
                    alt={review.product}
                    className="w-32 h-32 rounded-3xl object-cover shadow-xl transition-all duration-500 group-hover/img:scale-110 group-hover/img:rotate-3"
                    style={{
                      border: `4px solid ${tokens.colors[mode].surface.base}`
                    }}
                  />
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg" style={{ background: tokens.gradients.primary, color: '#white' }}>
                    🏷️
                  </div>
              </div>
              
              <div className="flex-1">
                <h3 
                  className="text-2xl font-black mb-3 transition-colors group-hover:text-primary"
                  style={{ color: tokens.colors[mode].text.primary }}
                >
                  {review.product}
                </h3>
                <div className="flex flex-wrap items-center gap-6 mb-6">
                  <div className="flex gap-1 drop-shadow-sm">{renderStars(review.rating)}</div>
                  <span 
                    className="text-sm font-black uppercase tracking-widest opacity-50"
                    style={{ color: tokens.colors[mode].text.tertiary }}
                  >
                    📅 {review.date}
                  </span>
                </div>
                <p 
                  className="text-xl mb-8 leading-relaxed font-bold opacity-80 italic"
                  style={{ color: tokens.colors[mode].text.secondary }}
                >
                  "{review.comment}"
                </p>
                <div className="flex flex-wrap gap-4">
                  <button 
                    className="px-6 py-3 rounded-2xl font-black text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-md flex items-center gap-2"
                    style={{
                      background: mode === 'light' ? tokens.colors.light.surface.base : tokens.colors.dark.surface.base,
                      color: tokens.colors[mode].text.primary
                    }}
                  >
                    👍 {t('helpful')} ({review.helpful})
                  </button>
                  <button 
                    className="px-6 py-3 rounded-2xl font-black text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-md flex items-center gap-2"
                    style={{
                      background: mode === 'light' ? tokens.colors.light.surface.base : tokens.colors.dark.surface.base,
                      color: tokens.colors[mode].text.primary
                    }}
                  >
                    ✏️ {t('edit')}
                  </button>
                  <button 
                    className="px-6 py-3 rounded-2xl font-black text-sm transition-all duration-300 hover:scale-110 active:scale-90 shadow-md flex items-center gap-2"
                    style={{
                      background: `${tokens.colors[mode].error.DEFAULT}15`,
                      color: tokens.colors[mode].error.DEFAULT
                    }}
                  >
                    🗑️ {t('delete')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { BreadCrumb } from '../../components/molecules/BreadCrumb';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../tokens';
import { reviewService } from '../../services/reviewService';
import { Link } from 'react-router-dom';

export function ReviewsPage() {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await reviewService.getMyReviews();
        if (res.status && res.data) {
          setReviews(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className="text-xl sm:text-2xl transform transition-transform hover:scale-125">
        {i < rating ? '⭐' : '☆'}
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-bold text-slate-400">{t('loading', 'Loading...')}</p>
      </div>
    );
  }

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
          className="text-3xl sm:text-5xl font-black mb-4 flex items-center gap-4"
          style={{ color: tokens.colors[mode].text.primary }}
        >
          ⭐ {t('myReviewsPageTitle')}
        </h1>
        <p 
          className="text-lg sm:text-xl font-bold opacity-70"
          style={{ color: tokens.colors[mode].text.secondary }}
        >
          {reviews.length} {t('reviewsWritten', 'Reviews Written')}
        </p>
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 px-2 max-w-5xl">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-6 sm:p-10 rounded-[40px] transition-all duration-500 hover:scale-[1.01] shadow-xl sm:shadow-2xl group overflow-hidden"
              style={{
                background: tokens.colors[mode].surface.elevated,
                border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
              
              <div className="flex flex-col md:flex-row gap-6 sm:gap-10 relative z-10">
                <Link to={`/products/${review.reviewable?.slug}`} className="relative group/img block shrink-0">
                    <img
                      src={review.reviewable?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.reviewable?.name || 'P')}&size=200&background=667eea&color=fff&bold=true`}
                      alt={review.reviewable?.name}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover shadow-xl transition-all duration-500 group-hover/img:scale-110 group-hover/img:rotate-3"
                      style={{
                        border: `4px solid ${tokens.colors[mode].surface.base}`
                      }}
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg shadow-lg" style={{ background: tokens.gradients.primary, color: 'white' }}>
                      🏷️
                    </div>
                </Link>
                
                <div className="flex-1">
                  <Link to={`/products/${review.reviewable?.slug}`}>
                    <h3 
                      className="text-xl sm:text-2xl font-black mb-3 transition-colors hover:text-primary"
                      style={{ color: tokens.colors[mode].text.primary }}
                    >
                      {review.reviewable?.name || t('unknownProduct', 'Product')}
                    </h3>
                  </Link>
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <div className="flex gap-1 drop-shadow-sm">{renderStars(review.star)}</div>
                    <span 
                      className="text-xs sm:text-sm font-black uppercase tracking-widest opacity-50"
                      style={{ color: tokens.colors[mode].text.tertiary }}
                    >
                      📅 {review.created_at}
                    </span>
                  </div>
                  <p 
                    className="text-lg sm:text-xl mb-8 leading-relaxed font-bold opacity-80 italic"
                    style={{ color: tokens.colors[mode].text.secondary }}
                  >
                    "{review.review}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-8xl mb-6">⭐</div>
          <h3 className="text-2xl sm:text-3xl font-black mb-3" style={{ color: tokens.colors[mode].text.primary }}>{t('noReviewsYet', 'No reviews yet')}</h3>
          <p className="text-lg sm:text-xl mb-10 font-bold opacity-60" style={{ color: tokens.colors[mode].text.secondary }}>{t('startReviewingDesc', 'Share your experience with others!')}</p>
          <Link to="/products" className="inline-block px-12 py-4 rounded-2xl font-black transition-all duration-500 hover:scale-110 active:scale-95 shadow-xl" style={{ background: tokens.gradients.primary, color: '#ffffff' }}>
            {t('shopNow')} 🛍️
          </Link>
        </div>
      )}
    </div>
  );
}

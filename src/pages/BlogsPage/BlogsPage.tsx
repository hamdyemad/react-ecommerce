import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../tokens';
import { BreadCrumb } from '../../components/molecules/BreadCrumb';
import { blogService } from '../../services/blogService';
import type { Blog, BlogCategory } from '../../types/api';

export function BlogsPage() {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | string>('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [selectedCategory, searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await blogService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch blog categories:', error);
    }
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = {
        blog_category_id: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchQuery || undefined
      };
      const response = await blogService.getBlogs(params);
      setBlogs(response.data);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBlogs();
  };

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-6">
        <BreadCrumb 
          items={[
            { label: t('home'), path: '/' },
            { label: t('blog'), path: '/blogs' }
          ]}
        />

        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-7xl mb-6 animate-bounce inline-block">📝</div>
          <h1 
            className="text-7xl font-black mb-6"
            style={{ color: tokens.colors[mode].text.primary }}
          >
            {t('blog')}
          </h1>
          
          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto space-y-8">
            <form onSubmit={handleSearch} className="relative group">
              <input
                type="text"
                placeholder={t('common:searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  backgroundColor: tokens.colors[mode].surface.elevated,
                  color: tokens.colors[mode].text.primary,
                  border: `2px solid ${tokens.colors[mode].border.DEFAULT}`
                }}
                className="w-full px-8 py-5 rounded-[25px] focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-lg"
              />
              <button 
                type="submit"
                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 hover:scale-105 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>

            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                  selectedCategory === 'all' 
                    ? 'bg-primary text-white shadow-xl shadow-primary/30' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {t('common:all')}
              </button>
              {categories.map((cat: BlogCategory) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-primary text-white shadow-xl shadow-primary/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i} 
                className="h-[450px] rounded-[35px] animate-pulse"
                style={{ backgroundColor: tokens.colors[mode].surface.elevated }}
              />
            ))}
          </div>
        ) : blogs.length > 0 ? (
          <>
            {/* Featured Post (only if on 'all' or first page) */}
            {selectedCategory === 'all' && searchQuery === '' && blogs[0] && (
              <div 
                className="rounded-[45px] overflow-hidden mb-16 group cursor-pointer shadow-2xl transition-all duration-500 hover:scale-[1.01]"
                onClick={() => navigate(`/blog/${blogs[0].slug}`)}
                style={{
                  background: tokens.colors[mode].surface.elevated,
                  backdropFilter: 'blur(30px)',
                  border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
                }}
              >
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative aspect-video md:aspect-auto overflow-hidden">
                    <img
                      src={blogs[0].image}
                      alt={blogs[0].title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div 
                      className="absolute top-8 left-8 px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl"
                      style={{
                        background: tokens.gradients.primary,
                        color: 'white'
                      }}
                    >
                      {t('featured')}
                    </div>
                  </div>
                  <div className="p-16 flex flex-col justify-center">
                    <div 
                      className="text-sm font-black uppercase tracking-[0.2em] mb-4"
                      style={{ color: tokens.colors[mode].primary.DEFAULT }}
                    >
                      {blogs[0].category.title}
                    </div>
                    <h2 
                      className="text-5xl font-black mb-6 leading-tight transition-colors group-hover:text-primary"
                      style={{ color: tokens.colors[mode].text.primary }}
                    >
                      {blogs[0].title}
                    </h2>
                    <p 
                      className="text-xl mb-8 leading-relaxed font-bold opacity-70"
                      style={{ color: tokens.colors[mode].text.secondary }}
                    >
                      {blogs[0].excerpt}
                    </p>
                    <div 
                      className="flex items-center gap-6 text-sm font-black opacity-60"
                      style={{ color: tokens.colors[mode].text.tertiary }}
                    >
                      <span className="flex items-center gap-2">📅 {new Date(blogs[0].created_at).toLocaleDateString()}</span>
                      {blogs[0].read_time && (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-30" />
                          <span className="flex items-center gap-2">⏱️ {blogs[0].read_time}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Blog Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {(selectedCategory === 'all' && searchQuery === '' ? blogs.slice(1) : blogs).map((blog: Blog) => (
                <div
                  key={blog.id}
                  onClick={() => navigate(`/blog/${blog.slug}`)}
                  className="rounded-[35px] overflow-hidden group cursor-pointer transition-all duration-500 hover:scale-105 shadow-xl hover:shadow-2xl"
                  style={{
                    background: tokens.colors[mode].surface.elevated,
                    backdropFilter: 'blur(30px)',
                    border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
                  }}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-10">
                    <div 
                      className="text-xs font-black uppercase tracking-widest mb-3"
                      style={{ color: tokens.colors[mode].primary.DEFAULT }}
                    >
                      {blog.category.title}
                    </div>
                    <h3 
                      className="text-2xl font-black mb-4 line-clamp-2 leading-tight transition-colors group-hover:text-primary"
                      style={{ color: tokens.colors[mode].text.primary }}
                    >
                      {blog.title}
                    </h3>
                    <p 
                      className="text-base mb-6 line-clamp-2 font-bold opacity-60"
                      style={{ color: tokens.colors[mode].text.secondary }}
                    >
                      {blog.excerpt}
                    </p>
                    <div 
                      className="flex items-center gap-4 text-xs font-black opacity-50"
                      style={{ color: tokens.colors[mode].text.tertiary }}
                    >
                      <span>📅 {new Date(blog.created_at).toLocaleDateString()}</span>
                      {blog.read_time && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-current" />
                          <span>⏱️ {blog.read_time}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🔍</div>
            <h2 className="text-3xl font-black mb-4" style={{ color: tokens.colors[mode].text.primary }}>
              {t('common:noResultsFound')}
            </h2>
            <p className="text-xl font-bold opacity-60" style={{ color: tokens.colors[mode].text.secondary }}>
              Try adjusting your search or filters
            </p>
          </div>
        )}

        {/* Newsletter CTA */}
        <div 
          className="mt-24 rounded-[50px] p-16 text-center relative overflow-hidden shadow-[0_30px_70px_rgba(102,126,234,0.3)]"
          style={{
            background: tokens.gradients.primary,
          }}
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <h2 className="text-5xl font-black text-white mb-6 uppercase tracking-tight">
              {t('newsletterTitle')}
            </h2>
            <p className="text-2xl text-white/90 mb-12 max-w-2xl mx-auto font-bold">
              {t('newsletterSubtitle')}
            </p>
            <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder={t('emailPlaceholder')}
                className="flex-1 px-8 py-5 rounded-2xl font-black placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-white/20 transition-all shadow-xl"
                style={{
                  background: `${tokens.colors[mode].surface.base}F2`,
                  color: tokens.colors[mode].text.primary
                }}
              />
              <button
                className="px-12 py-5 rounded-2xl font-black text-xl transition-all duration-500 hover:scale-105 active:scale-95 bg-white shadow-2xl"
                style={{
                  color: tokens.colors.light.primary[600]
                }}
              >
                {t('subscribe')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

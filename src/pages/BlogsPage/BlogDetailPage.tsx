import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../tokens';
import { BreadCrumb } from '../../components/molecules/BreadCrumb';
import { blogService } from '../../services/blogService';
import type { Blog } from '../../types/api';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { mode } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchBlogDetails(slug);
    }
  }, [slug]);

  const fetchBlogDetails = async (blogSlug: string) => {
    try {
      setLoading(true);
      const response = await blogService.getBlogBySlug(blogSlug);
      setBlog(response.data);
    } catch (error) {
      console.error('Failed to fetch blog details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error(t('common:loginRequired', 'Please login to comment'));
      navigate('/login');
      return;
    }
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await blogService.addComment(blog!.id, newComment);
      if (response.status) {
        toast.success(t('common:commentAdded', 'Comment added successfully'));
        setNewComment('');
        // Optimistically add comment to list
        if (blog) {
          setBlog({
            ...blog,
            comments: [response.data, ...(blog.comments || [])],
            comments_count: (blog.comments_count || 0) + 1
          });
        }
      }
    } catch (error) {
      toast.error(t('common:commentError', 'Failed to add comment'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-32 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen py-32 text-center">
        <h2 className="text-4xl font-black mb-6" style={{ color: tokens.colors[mode].text.primary }}>
          {t('common:noResultsFound')}
        </h2>
        <Link 
          to="/blogs" 
          className="px-8 py-4 bg-primary text-white rounded-2xl font-black transition-all hover:scale-110 inline-block"
        >
          {t('common:backTo', { name: t('blog') })}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-6">
        <BreadCrumb 
          items={[
            { label: t('home'), path: '/' },
            { label: t('blog'), path: '/blogs' },
            { label: blog.title, path: `/blog/${blog.slug}` }
          ]}
        />

        {/* Article Header */}
        <div className="mt-12 mb-16 text-center">
          <div 
            className="text-sm font-black uppercase tracking-[0.3em] mb-6"
            style={{ color: tokens.colors[mode].primary.DEFAULT }}
          >
            {blog.category.title}
          </div>
          <h1 
            className="text-6xl font-black mb-10 leading-tight"
            style={{ color: tokens.colors[mode].text.primary }}
          >
            {blog.title}
          </h1>
          <div 
            className="flex items-center justify-center gap-8 text-sm font-black opacity-60"
            style={{ color: tokens.colors[mode].text.tertiary }}
          >
            <span className="flex items-center gap-2">📅 {new Date(blog.created_at).toLocaleDateString()}</span>
            <span className="w-2 h-2 rounded-full bg-current opacity-20" />
            <span className="flex items-center gap-2">👁️ {blog.views_count} {t('views', 'Views')}</span>
            <span className="w-2 h-2 rounded-full bg-current opacity-20" />
            <span className="flex items-center gap-2">💬 {blog.comments_count} {t('comments', 'Comments')}</span>
          </div>
        </div>

        {/* Hero Image */}
        <div className="rounded-[50px] overflow-hidden shadow-2xl mb-16 aspect-video">
          <img 
            src={blog.image} 
            alt={blog.title} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div 
          className="prose prose-2xl max-w-none font-bold leading-relaxed mb-20"
          style={{ color: tokens.colors[mode].text.secondary }}
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Share & Tags */}
        <div className="pt-12 pb-20 border-t" style={{ borderColor: tokens.colors[mode].border.DEFAULT }}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <span className="text-sm font-black uppercase tracking-widest opacity-40">Share:</span>
              <div className="flex gap-2">
                {['FB', 'TW', 'IN'].map(social => (
                  <button 
                    key={social}
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-black transition-all hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: tokens.colors[mode].surface.elevated, color: tokens.colors[mode].text.primary }}
                  >
                    {social}
                  </button>
                ))}
              </div>
            </div>
            
            <Link 
              to="/blogs" 
              className="flex items-center gap-3 font-black text-primary group"
            >
              <span className="group-hover:-translate-x-2 transition-transform">←</span>
              {t('common:backTo', 'Back to')} {t('blog')}
            </Link>
          </div>
        </div>

        {/* Comments Section */}
        <div className="pt-12 border-t" style={{ borderColor: tokens.colors[mode].border.DEFAULT }}>
          <h3 className="text-4xl font-black mb-12" style={{ color: tokens.colors[mode].text.primary }}>
            {t('comments', 'Comments')} ({blog.comments_count})
          </h3>

          {/* Comment Form */}
          <div className="mb-16 p-10 rounded-[40px]" style={{ backgroundColor: tokens.colors[mode].surface.elevated }}>
            <h4 className="text-xl font-black mb-6" style={{ color: tokens.colors[mode].text.primary }}>
              {t('leaveComment', 'Leave a comment')}
            </h4>
            <form onSubmit={handleCommentSubmit} className="space-y-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t('writeComment', 'Write your message here...')}
                className="w-full px-8 py-6 rounded-3xl font-bold transition-all focus:outline-none focus:ring-4 focus:ring-primary/10 min-h-[150px]"
                style={{ 
                  backgroundColor: tokens.colors[mode].surface.base,
                  color: tokens.colors[mode].text.primary,
                  border: `2px solid ${tokens.colors[mode].border.DEFAULT}`
                }}
              />
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="px-12 py-5 bg-primary text-white rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 cursor-pointer shadow-xl shadow-primary/30"
              >
                {isSubmitting ? t('submitting', 'Submitting...') : t('postComment', 'Post Comment')}
              </button>
            </form>
          </div>

          {/* Comments List */}
          <div className="space-y-8">
            {blog.comments && blog.comments.length > 0 ? (
              blog.comments.map((comment: any) => (
                <div 
                  key={comment.id}
                  className="p-8 rounded-[35px] transition-all hover:translate-x-2"
                  style={{ backgroundColor: tokens.colors[mode].surface.elevated }}
                >
                  <div className="flex items-start gap-5 mb-6">
                    <img 
                      src={comment.customer.image || 'https://via.placeholder.com/60'} 
                      alt={comment.customer.full_name}
                      className="w-14 h-14 rounded-2xl object-cover shadow-lg"
                    />
                    <div>
                      <h5 className="font-black text-lg" style={{ color: tokens.colors[mode].text.primary }}>
                        {comment.customer.full_name}
                      </h5>
                      <span className="text-xs font-bold opacity-40 uppercase tracking-widest">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p 
                    className="text-lg leading-relaxed font-bold"
                    style={{ color: tokens.colors[mode].text.secondary }}
                  >
                    {comment.comment}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 opacity-40 italic font-bold">
                {t('noComments', 'No comments yet. Be the first to share your thoughts!')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

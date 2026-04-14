import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../tokens';
import { Button } from '../../components/atoms/Button';
import { useTheme } from '../../hooks/useTheme';
import { SEO } from '../../components/atoms/SEO';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { FormInput } from '../../components/atoms/FormInput';

export function LoginPage() {
  const { t } = useTranslation();
  const { mode } = useTheme();
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login({ email, password });
      if (response.status) {
        toast.success(response.message || t('loginSuccess', 'Login Successful'));
        navigate('/');
      } else {
        toast.error(response.message || t('loginFailed', 'Login Failed'));
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      const errorErrors = errorData?.errors;
      
      if (errorErrors && Object.keys(errorErrors).length > 0) {
        Object.values(errorErrors).flat().forEach((msg: any) => toast.error(msg));
      } else if (errorData?.message) {
        toast.error(errorData.message);
      } else {
        toast.error(t('loginFailed', 'Login Failed'));
      }
    }
  };

  return (
    <div className="min-h-screen py-16 flex items-center justify-center relative overflow-hidden">
      <SEO title={t('signIn', 'Sign In')} />
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="max-w-md w-full mx-auto px-6 relative z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-4xl mb-6 mx-auto shadow-xl transform rotate-3 hover:rotate-6 transition-transform">
             🛍️
          </div>
          <h1 
            className="text-5xl font-black mb-4 pb-2"
            style={{ 
              background: tokens.gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('welcomeBack')}
          </h1>
          <p className="text-xl font-bold opacity-70" style={{ color: tokens.colors[mode].text.secondary }}>
            {t('signInSubtitle')}
          </p>
        </div>

        {/* Login Form */}
        <div 
          className="rounded-[45px] p-10 md:p-12 transition-all duration-500 shadow-2xl hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] group"
          style={{
            background: tokens.colors[mode].surface.elevated,
            backdropFilter: 'blur(30px)',
            border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <FormInput
              label={t('emailAddress')}
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
              required
            />

            <FormInput
              label={t('password')}
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder={t('passwordPlaceholder')}
              required
            />

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-3 cursor-pointer group/check">
                <input 
                  type="checkbox" 
                  className="w-6 h-6 rounded-lg border-2 transition-all cursor-pointer accent-primary" 
                />
                <span 
                  className="text-sm font-bold opacity-70 group-hover/check:opacity-100 transition-opacity"
                  style={{ color: tokens.colors[mode].text.secondary }}
                >
                  {t('rememberMe')}
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-black hover:text-primary transition-all hover:underline underline-offset-4"
                style={{ color: tokens.colors[mode].primary.DEFAULT }}
              >
                {t('forgotPassword')}
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full py-5 rounded-2xl font-black text-xl transition-all duration-500 hover:scale-[1.03] active:scale-95 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: tokens.gradients.primary,
                boxShadow: '0 20px 50px rgba(102, 126, 234, 0.4)',
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('signingIn', 'Signing In...')}
                </div>
              ) : t('signIn')}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dashed" style={{ borderColor: tokens.colors[mode].border.DEFAULT }} />
            </div>
            <div className="relative flex justify-center text-xs">
              <span 
                className="px-6 font-black uppercase tracking-[0.3em] opacity-40"
                style={{ 
                  background: tokens.colors[mode].surface.elevated,
                  color: tokens.colors[mode].text.primary
                }}
              >
                {t('orContinueWith')}
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="flex flex-col gap-6">
            <button
              onClick={() => {
                window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/redirect`;
              }}
              className="py-5 px-4 rounded-2xl font-black transition-all duration-500 hover:scale-[1.05] active:scale-95 flex items-center justify-center gap-3 shadow-lg"
              style={{
                background: tokens.colors[mode].surface.base,
                color: tokens.colors[mode].text.primary,
                border: `1px solid ${tokens.colors[mode].border.DEFAULT}`
              }}
            >
              <svg className="w-7 h-7" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#4285F4" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
          </div>

          {/* Sign Up Link */}
          <p 
            className="text-center mt-10 text-lg font-bold"
            style={{ color: tokens.colors[mode].text.secondary }}
          >
            {t('dontHaveAccount')}{' '}
            <Link
              to="/register"
              className="font-black hover:underline ml-1 underline-offset-4"
              style={{ color: tokens.colors[mode].primary.DEFAULT }}
            >
              {t('signUp')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

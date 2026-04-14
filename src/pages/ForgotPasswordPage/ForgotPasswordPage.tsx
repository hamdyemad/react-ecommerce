import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../tokens';
import { FormInput } from '../../components/atoms/FormInput';
import { Button } from '../../components/atoms/Button';
import { useTheme } from '../../hooks/useTheme';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mode } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.requestPasswordReset(email);
      if (response.status) {
        toast.success(response.message || t('otpSent'));
        navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        toast.error(response.message || t('requestFailed'));
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      const errorErrors = errorData?.errors;

      if (errorErrors && Object.keys(errorErrors).length > 0) {
        Object.values(errorErrors).flat().forEach((msg: any) => toast.error(msg));
      } else if (errorData?.message) {
        toast.error(errorData.message);
      } else {
        toast.error(t('somethingWentWrong'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 flex items-center justify-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="max-w-md w-full mx-auto px-6 relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-4xl mb-6 mx-auto shadow-xl animate-bounce">
            🔐
          </div>
          <h1 
            className="text-5xl font-black mb-4 pb-2"
            style={{ 
              background: tokens.gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('forgotPasswordTitle')}
          </h1>
          <p className="text-xl font-bold opacity-70" style={{ color: tokens.colors[mode].text.secondary }}>
            {t('forgotPasswordSubtitle')}
          </p>
        </div>

        <div 
          className="rounded-[45px] p-10 md:p-12 transition-all duration-500 shadow-2xl hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)]"
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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full py-5 rounded-2xl font-black text-xl transition-all duration-500 hover:scale-[1.03] active:scale-95 shadow-2xl disabled:opacity-50"
              style={{
                background: tokens.gradients.primary,
                boxShadow: '0 20px 50px rgba(102, 126, 234, 0.4)',
              }}
            >
              {loading ? t('loading...') : t('sendResetLink')}
            </Button>
          </form>

          <div className="text-center mt-12">
            <Link
              to="/login"
              className="text-sm font-black transition-all hover:scale-110 flex items-center justify-center gap-3 group opacity-60 hover:opacity-100"
              style={{ color: tokens.colors[mode].text.secondary }}
            >
              <span className="transition-transform group-hover:-translate-x-2 text-xl">←</span>
              {t('backToSignIn')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

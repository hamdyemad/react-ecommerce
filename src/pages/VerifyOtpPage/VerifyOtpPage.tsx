import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../tokens';
import { FormInput } from '../../components/atoms/FormInput';
import { Button } from '../../components/atoms/Button';
import { useTheme } from '../../hooks/useTheme';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

export function VerifyOtpPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { mode } = useTheme();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error(t('emailRequired'));
      return;
    }
    
    setLoading(true);
    try {
      const otpValue = otp.join('');
      const response = await authService.verifyResetOtp(email, otpValue);
      if (response.status) {
        toast.success(response.message || t('otpVerified'));
        const resetToken = response.data?.reset_token;
        // Redirect to reset password with email and reset_token as params
        navigate(`/reset-password?email=${encodeURIComponent(email)}&reset_token=${encodeURIComponent(resetToken)}`);
      } else {
        toast.error(response.message || t('invalidOtp'));
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

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle potential double input (Android/OS specific)
      value = value[value.length - 1];
    }
    
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d*$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);

    // Focus last filled or next empty
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
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
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-4xl mb-6 mx-auto shadow-xl">
            🔢
          </div>
          <h1 
            className="text-5xl font-black mb-4 pb-2"
            style={{ 
              background: tokens.gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('verifyOtpTitle', 'Verify OTP')}
          </h1>
          <p className="text-xl font-bold opacity-70" style={{ color: tokens.colors[mode].text.secondary }}>
            {t('verifyOtpSubtitle', 'Enter the code sent to your email')}
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
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
              required
              disabled={!!email}
            />

            <div className="space-y-4">
              <label className="block text-sm font-black uppercase tracking-widest px-1" style={{ color: tokens.colors[mode].text.tertiary }}>
                {t('otpCode', 'Enter Verification Code')}
              </label>
              <div className="flex justify-between gap-2" dir="ltr">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-full h-16 text-center text-2xl font-black rounded-2xl border-2 transition-all outline-none focus:ring-4 focus:ring-primary/10"
                    style={{
                      background: mode === 'light' ? '#eef4ff' : '#1e293b',
                      color: tokens.colors[mode].primary.DEFAULT,
                      borderColor: digit ? tokens.colors[mode].primary.DEFAULT : tokens.colors[mode].border.DEFAULT
                    }}
                  />
                ))}
              </div>
            </div>

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
              {loading ? t('loading...') : t('verifyCode', 'Verify Code')}
            </Button>
          </form>

          <div className="text-center mt-12">
            <Link
              to="/forgot-password"
              className="text-sm font-black transition-all hover:scale-110 flex items-center justify-center gap-3 group opacity-60 hover:opacity-100"
              style={{ color: tokens.colors[mode].text.secondary }}
            >
              <span className="transition-transform group-hover:-translate-x-2 text-xl">←</span>
              {t('resendCode', 'Resend Code')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

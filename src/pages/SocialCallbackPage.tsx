import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { tokens } from '../tokens';
import { useTheme } from '../hooks/useTheme';

export function SocialCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { mode } = useTheme();

  useEffect(() => {
    // Decode the token from the URL
    // Some tokens might be encoded, so we use searchParams to get the raw value
    const token = searchParams.get('token');
    const userData = searchParams.get('user');
    
    if (token) {
      console.log('Google Login Success, saving token...');
      // 1. Save the token exactly as it comes from the backend
      localStorage.setItem('auth_token', token);
      
      // 2. Clear any old errors
      localStorage.removeItem('auth_error');
      
      if (userData) {
        try {
          // You can also save user data to cache if needed, 
          // but AuthProvider.checkAuth will usually fetch fresh data from /profile
          localStorage.setItem('auth_user_cache', userData);
        } catch (e) {
          console.error('Failed to cache user data', e);
        }
      }

      toast.success(t('loginSuccess', 'Google Login Successful! Welcome.'));
      
      // 3. Hard redirect to home to re-initialize the entire app with the new token
      window.location.href = '/';
    } else {
      console.error('Social login failed: No token found in URL');
      toast.error(t('loginFailed', 'Social login failed. No token received.'));
      navigate('/login');
    }
  }, [searchParams, navigate, t]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
      <div 
        className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-6"
      />
      <h2 
        className="text-2xl font-black mb-2"
        style={{ color: tokens.colors[mode].text.primary }}
      >
        {t('authenticating', 'Authenticating...')}
      </h2>
      <p className="opacity-60 font-bold">
        {t('completingGoogleLogin', 'Completing your Google login, please wait.')}
      </p>
    </div>
  );
}

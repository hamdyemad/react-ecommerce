import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { areaService, authService } from '../../services';
import type { City, Region } from '../../types/api';
import { Select } from '../../components/atoms/Select';
import { FormInput } from '../../components/atoms/FormInput';
import { FormButton } from '../../components/atoms/FormButton';
import { useDirection } from '../../hooks/useDirection';
import { useTranslation } from 'react-i18next';
import { useCatalog } from '../../hooks/useCatalog';
import { tokens } from '../../tokens';
import { useTheme } from '../../hooks/useTheme';
import toast from 'react-hot-toast';
import { SEO } from '../../components/atoms/SEO';

export function RegisterPage() {
  const { language, direction } = useDirection();
  const isRtl = direction === 'rtl';
  const { mode } = useTheme();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country_id: '',
    city_id: '',
    region_id: '',
    gender: 'male',
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [cities, setCities] = useState<City[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const { countries } = useCatalog();

  useEffect(() => {
    if (countries.length > 0 && !formData.country_id) {
       setFormData(prev => ({ ...prev, country_id: String(countries[0].id) }));
    }
  }, [countries]);

  useEffect(() => {
    if (!formData.country_id) return;
    const fetchCities = async () => {
      try {
        setLoadingCities(true);
        const response = await areaService.getCities(formData.country_id);
        setCities(response.data);
        setFormData(prev => ({ ...prev, city_id: '', region_id: '' }));
      } catch (err) {
        console.error('Failed to fetch cities:', err);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, [formData.country_id, language]); // Re-fetch when language changes

  useEffect(() => {
    if (!formData.city_id) return;
    const fetchRegions = async () => {
      try {
        setLoadingRegions(true);
        const response = await areaService.getRegions(formData.city_id);
        setRegions(response.data);
        setFormData(prev => ({ ...prev, region_id: '' }));
      } catch (err) {
        console.error('Failed to fetch regions:', err);
      } finally {
        setLoadingRegions(false);
      }
    };
    fetchRegions();
  }, [formData.city_id, language]); // Re-fetch when language changes

  const [agreeTerms, setAgreeTerms] = useState(false);

  const selectedCountry = countries.find(c => String(c.id) === String(formData.country_id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formErrors: Record<string, string[]> = {};
    if (!formData.firstName) formErrors.first_name = [t('requiredField')];
    if (!formData.lastName) formErrors.last_name = [t('requiredField')];
    if (!formData.email) formErrors.email = [t('requiredField')];
    if (!formData.phone) {
      formErrors.phone = [t('requiredField')];
    } else if (selectedCountry && formData.phone.length !== selectedCountry.phone_length) {
      formErrors.phone = [t('invalidPhoneLength', { length: selectedCountry.phone_length })];
    }
    if (!formData.country_id) formErrors.country_id = [t('requiredField')];
    if (!formData.city_id) formErrors.city_id = [t('requiredField')];
    if (!formData.region_id) formErrors.region_id = [t('requiredField')];
    if (!formData.gender) formErrors.gender = [t('requiredField')];
    if (!formData.password) formErrors.password = [t('requiredField')];
    
    if (formData.password && !formData.confirmPassword) {
      formErrors.password_confirmation = [t('requiredField')];
    } else if (formData.password !== formData.confirmPassword) {
      formErrors.password_confirmation = [t('passwordsMismatch')];
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        phone: formData.phone,
        lang: language,
        country_id: formData.country_id,
        city_id: formData.city_id,
        region_id: formData.region_id,
        gender: formData.gender,
      };

      const res = await authService.register(payload);
      if (res && res.status === false && (res as any).errors) {
        setErrors((res as any).errors);
      } else {
        toast.success((res as any).message || 'Registration successful. OTP sent to your email');
        navigate('/login');
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Failed to register');
        console.error('Failed to register:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    const fieldMapping: Record<string, string> = {
      firstName: 'first_name',
      lastName: 'last_name',
      confirmPassword: 'password_confirmation',
    };
    const apiField = fieldMapping[e.target.name] || e.target.name;
    setErrors(prev => ({ ...prev, [apiField]: [] }));
  };


  // Phone code prefix — always shown on physical LEFT because the phone FormInput
  // uses inputDir="ltr". The border is always on the right side (between code and field).
  const phoneCodeElement = selectedCountry ? (
    <div
      className="font-black px-4 h-full flex items-center justify-center text-sm"
      style={{
        color: tokens.colors[mode].text.tertiary,
        borderRight: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
      }}
    >
      {selectedCountry.phone_code}
    </div>
  ) : undefined;

  return (
    <div className="min-h-screen py-8 sm:py-16 flex items-center justify-center relative overflow-hidden">
      <SEO title={t('register', 'Register')} />
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="max-w-3xl w-full mx-auto px-6 relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-4xl mb-6 mx-auto shadow-xl transform -rotate-3 hover:rotate-0 transition-transform">
            ✨
          </div>
          <h1
            className="text-3xl sm:text-6xl font-black mb-3 pb-1 sm:mb-4 sm:pb-2"
            style={{
              background: tokens.gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('register:title')}
          </h1>
          <p className="text-lg sm:text-xl font-bold opacity-70" style={{ color: tokens.colors[mode].text.secondary }}>
            {t('register:subtitle')}
          </p>
        </div>

        <div
          className="rounded-[35px] sm:rounded-[45px] p-6 sm:p-10 md:p-14 transition-all duration-500 shadow-2xl hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)]"
          style={{
            background: tokens.colors[mode].surface.elevated,
            backdropFilter: 'blur(30px)',
            border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-8" noValidate>
            {/* First & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              <FormInput
                label={t('firstName')}
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder={isRtl ? 'محمد' : 'John'}
                required
                error={errors.first_name?.[0]}
              />
              <FormInput
                label={t('lastName')}
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder={isRtl ? 'أحمد' : 'Doe'}
                required
                error={errors.last_name?.[0]}
              />
            </div>

            {/* Email */}
            <FormInput
              label={t('emailAddress')}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('emailPlaceholder')}
              required
              error={errors.email?.[0]}
              dir="ltr"
              style={{ textAlign: isRtl ? 'right' : 'left' }}
            />

            {/* Phone with country code prefix — always LTR input */}
            <FormInput
              label={
                selectedCountry
                  ? `${t('phoneNumber')} (${selectedCountry.phone_length} ${t('digits')})`
                  : t('phoneNumber')
              }
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={selectedCountry ? '0'.repeat(selectedCountry.phone_length) : '12345678'}
              required
              maxLength={selectedCountry?.phone_length || undefined}
              error={errors.phone?.[0]}
              inputDir="ltr"
              leftElement={phoneCodeElement}
            />

            {/* Country & Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Select
                label={t('country')}
                name="country_id"
                value={formData.country_id}
                onChange={handleChange as any}
                required
                error={errors.country_id?.[0]}
                placeholder={t('selectCountry')}
                options={countries.map(c => ({
                  value: c.id,
                  label: language === 'ar' ? (c as any).name_ar || c.name : c.name,
                }))}
              />

              <Select
                label={t('gender')}
                name="gender"
                value={formData.gender}
                onChange={handleChange as any}
                required
                error={errors.gender?.[0]}
                options={[
                  { value: 'male', label: t('male') },
                  { value: 'female', label: t('female') },
                ]}
              />
            </div>

            {/* City & Region */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              <Select
                label={t('city')}
                name="city_id"
                value={formData.city_id}
                onChange={handleChange as any}
                required
                disabled={!formData.country_id || loadingCities}
                error={errors.city_id?.[0]}
                placeholder={loadingCities ? t('loadingCities') : t('selectCity')}
                options={cities.map(city => ({ value: city.id, label: city.name }))}
              />

              <Select
                label={t('region')}
                name="region_id"
                value={formData.region_id}
                onChange={handleChange as any}
                required
                disabled={!formData.city_id || loadingRegions}
                error={errors.region_id?.[0]}
                placeholder={loadingRegions ? t('loadingRegions') : t('selectRegion')}
                options={regions.map(region => ({ value: region.id, label: region.name }))}
              />
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              {/* FormInput auto-adds eye icon for type=password */}
              <FormInput
                label={t('password')}
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('passwordPlaceholder')}
                required
                error={errors.password?.[0]}
              />

              <FormInput
                label={t('confirmPassword')}
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t('passwordPlaceholder')}
                required
                error={errors.password_confirmation?.[0]}
              />
            </div>

            {/* Terms & Privacy */}
            <label className="flex items-start gap-4 cursor-pointer group/check">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-6 h-6 rounded-lg mt-1 accent-primary cursor-pointer shadow-sm flex-shrink-0"
                required
              />
              <span
                className="text-sm font-bold leading-relaxed opacity-70 group-hover/check:opacity-100 transition-opacity"
                style={{ color: tokens.colors[mode].text.secondary }}
              >
                {t('iAgree')}{' '}
                <Link
                  to="/terms"
                  className="font-black hover:underline underline-offset-4 transition-all"
                  style={{ color: tokens.colors[mode].primary.DEFAULT }}
                >
                  {t('terms')}
                </Link>
                {' '}{t('and')}{' '}
                <Link
                  to="/privacy-policy"
                  className="font-black hover:underline underline-offset-4 transition-all"
                  style={{ color: tokens.colors[mode].primary.DEFAULT }}
                >
                  {t('privacy')}
                </Link>
              </span>
            </label>

            {/* Submit */}
            <FormButton
              type="submit"
              disabled={!agreeTerms || loading}
              className="w-full py-4 sm:py-5 rounded-2xl font-black text-lg sm:text-xl shadow-2xl transition-all duration-500 hover:scale-[1.02] active:scale-95"
              style={{
                background: (!agreeTerms || loading)
                  ? tokens.colors[mode].surface.base
                  : tokens.gradients.primary,
                color: (!agreeTerms || loading)
                  ? tokens.colors[mode].text.tertiary
                  : '#ffffff',
                boxShadow: (!agreeTerms || loading) ? 'none' : '0 20px 50px rgba(102, 126, 234, 0.4)',
                cursor: (!agreeTerms || loading) ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? t('register:creating') : t('register:createBtn')}
            </FormButton>
          </form>

          <p className="text-center mt-10 text-lg font-bold" style={{ color: tokens.colors[mode].text.secondary }}>
            {t('alreadyHaveAccount')}{' '}
            <Link
              to="/login"
              className="font-black hover:underline underline-offset-4 ms-1"
              style={{ color: tokens.colors[mode].primary.DEFAULT }}
            >
              {t('signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useDirection } from '../../hooks/useDirection';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../tokens';
import { BreadCrumb } from '../../components/molecules/BreadCrumb';
import { SEO } from '../../components/atoms/SEO';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { areaService } from '../../services';
import type { City } from '../../types/api';
import { Select } from '../../components/atoms/Select';
import { FormInput } from '../../components/atoms/FormInput';
import { orderService, addressService } from '../../services';
import type { Address } from '../../types/address';
import { useAuth } from '../../hooks/useAuth';
import { SuccessModal } from '../../components/molecules/SuccessModal/SuccessModal';
import { OrderSummary } from '../../components/organisms';

interface CheckoutPageProps {
  items: any[];
  subtotal: number;
  total: number;
  appliedPromo?: any;
  setAppliedPromo: (promo: any) => void;
  onOrderSuccess: () => void;
}

export function CheckoutPage({ items, subtotal, total, appliedPromo, setAppliedPromo, onOrderSuccess }: CheckoutPageProps) {
  const { mode } = useTheme();
  const { t, i18n } = useTranslation();
  const { selectedCountry } = useDirection();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';

  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    cityId: '',
    address: '',
    paymentMethod: 'cod',
    customerAddressId: '',
    usePoint: 0 as number | string
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill form if user is authenticated and fetch addresses
  useEffect(() => {
    if (isAuthenticated && user) {
      // Logic fix for 'full_name' vs 'first_name/last_name'
      const displayName = (user as any).full_name || 
                         ((user as any).first_name ? `${(user as any).first_name} ${(user as any).last_name || ''}` : '');
      
      setFormData(prev => ({
        ...prev,
        fullName: displayName,
        email: user.email || '',
        phone: user.phone || '',
      }));

      const fetchAddresses = async () => {
        try {
          const res = await addressService.getAddresses();
          if (res.status && res.data) {
            setUserAddresses(res.data);
            const primary = res.data.find(a => a.is_primary) || res.data[0];
            if (primary) {
              setFormData(prev => ({
                ...prev,
                customerAddressId: String(primary.id),
                cityId: String(primary.city?.id || ''),
                address: primary.address
              }));
              
              if (primary.city?.shipping) {
                setShippingCost(primary.city.shipping.min_cost);
              }
            }
          }
        } catch (err) {
          console.error('Failed to fetch addresses:', err);
        }
      };
      fetchAddresses();
    }
  }, [isAuthenticated, user]);

  const handleAddressSelect = (addr: Address) => {
    setFormData(prev => ({
      ...prev,
      customerAddressId: String(addr.id),
      cityId: String(addr.city?.id || ''),
      address: addr.address
    }));
    
    if (addr.city?.shipping) {
      setShippingCost(addr.city.shipping.min_cost);
    } else {
      setShippingCost(0);
    }
  };

  useEffect(() => {
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const res = await areaService.getAllCities();
        setCities(res.data || []);
      } catch (err) {
        console.error('Failed to fetch cities:', err);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, []);

  const handleCityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = e.target.value;
    setFormData(prev => ({ ...prev, cityId }));
    
    // Clear error
    if (errors.cityId) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.cityId;
        return newErrors;
      });
    }

    const selectedCity = cities.find(c => String(c.id) === String(cityId));
    if (selectedCity && selectedCity.shipping) {
      setShippingCost(selectedCity.shipping.min_cost);
    } else {
      setShippingCost(0);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = t('requiredField', 'This field is required');
    if (!formData.email) newErrors.email = t('requiredField', 'This field is required');
    if (!formData.phone) newErrors.phone = t('requiredField', 'This field is required');
    if (!formData.cityId) newErrors.cityId = t('requiredField', 'This field is required');
    if (!formData.address) newErrors.address = t('requiredField', 'This field is required');

    if (selectedCountry && formData.phone && formData.phone.length !== selectedCountry.phone_length) {
      newErrors.phone = t('common:phoneLengthError', { length: selectedCountry.phone_length, defaultValue: `Phone number must be ${selectedCountry.phone_length} digits` });
    }

    if (isAuthenticated && userAddresses.length > 0 && !formData.customerAddressId && !formData.address) {
      toast.error(t('common:selectSavedAddressError', 'Please select a shipping address from your account'));
      newErrors.addressList = 'required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) {
      toast.error(t('common:fillRequiredFields', 'Please fill all required fields'));
      return;
    }

    setLoading(true);
    try {
      let finalAddressId = formData.customerAddressId;

      // Handle manual address for authenticated users
      if (isAuthenticated && !finalAddressId) {
        try {
          // Fetch regions for the selected city to get a region_id
          const regRes = await areaService.getRegions(formData.cityId);
          const regionId = regRes.data?.[0]?.id || 1; // Fallback to 1 if no regions found

          const addrRes = await addressService.createAddress({
            title: t('common:home', 'Home'),
            address: formData.address,
            is_primary: '1',
            country_id: String(selectedCountry?.id || '1'),
            city_id: formData.cityId,
            region_id: String(regionId),
          });

          if (addrRes.status && addrRes.data) {
            finalAddressId = String(addrRes.data.id);
          }
        } catch (addrErr) {
          console.error('Failed to auto-create address:', addrErr);
          // If auto-create fails, we still try to proceed, maybe the API accepts empty ID
        }
      }

      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ' ';

      const payload: any = {
        is_guest: !isAuthenticated,
        payment_method: formData.paymentMethod,
        promo_code: appliedPromo?.code || null,
        promo_code_id: appliedPromo?.id || null,
        use_point: formData.usePoint,
        products: items.map(item => ({
          vendor_product_id: item.vendor_product_id || item.id,
          vendor_product_variant_id: item.vendor_product_variant_id || null,
          quantity: item.quantity,
          type: 'product' as const
        }))
      };

      if (!isAuthenticated) {
        payload.guest_first_name = firstName;
        payload.guest_last_name = lastName;
        payload.guest_email = formData.email;
        payload.guest_phone = formData.phone;
        payload.guest_country_id = String(selectedCountry?.id || '1');
        payload.guest_city_id = formData.cityId;
      } else {
        payload.customer_address_id = finalAddressId;
        payload.city_id = formData.cityId;
        payload.address = formData.address;
        payload.first_name = firstName;
        payload.last_name = lastName;
        payload.email = formData.email;
        payload.phone = formData.phone;
        payload.country_id = String(selectedCountry?.id || '1');
      }

      const res = await orderService.checkout(payload);
      
      if (res.status) {
        setOrderDetails(res.data);
        setShowSuccess(true);
        onOrderSuccess();
      } else {
        toast.error(res.message || t('common:somethingWentWrong', 'Something went wrong'));
      }
    } catch (err: any) {
      console.error('Order Error:', err);
      toast.error(err.response?.data?.message || t('common:orderFailed', 'Failed to place order'));
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !showSuccess) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen py-8">
      <SEO title={t('common:checkout', 'Checkout')} />
      <BreadCrumb 
        items={[
          { label: t('common:home', 'Home'), path: '/' },
          { label: t('common:shoppingCart', 'Shopping Cart'), path: '/cart' },
          { label: t('common:checkout', 'Checkout'), path: '/checkout' }
        ]}
      />

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <h1 
          className="text-6xl font-black mb-12"
          style={{ color: tokens.colors[mode].text.primary }}
        >
          {t('common:checkout', 'Checkout')}
        </h1>

        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            <div 
              className="p-10 rounded-[45px] shadow-2xl relative group z-20"
              style={{
                background: tokens.colors[mode].surface.elevated,
                border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
              }}
            >
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">
                  📍
                </div>
                <h2 className="text-3xl font-black" style={{ color: tokens.colors[mode].text.primary }}>
                  {t('common:shippingInformation', 'Shipping Information')}
                </h2>
              </div>

              {/* Saved Addresses Section for Auth Users */}
              {isAuthenticated && userAddresses.length > 0 && (
                <div className="mb-12">
                  <h3 
                    className="text-sm font-black uppercase tracking-widest mb-6 opacity-60 flex items-center gap-2"
                    style={{ color: tokens.colors[mode].text.primary }}
                  >
                    🏠 {t('common:chooseSavedAddress', 'Choose from Saved Addresses')}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {userAddresses.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => handleAddressSelect(addr)}
                        className={`p-6 rounded-[32px] border-2 text-start transition-all duration-300 relative group overflow-hidden ${
                          formData.customerAddressId === String(addr.id)
                            ? 'border-primary bg-primary/5 shadow-[0_0_30px_rgba(99,102,241,0.2)]'
                            : 'border-slate-100 dark:border-slate-800 hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-black text-lg" style={{ color: tokens.colors[mode].text.primary }}>
                            {addr.title}
                          </span>
                          {addr.is_primary && (
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase border border-emerald-500/20">
                              {t('common:primary', 'Primary')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold opacity-60 flex items-start gap-2" style={{ color: tokens.colors[mode].text.secondary }}>
                          <span className="flex-shrink-0">🏢</span>
                          {addr.city.name}, {addr.address}
                        </p>
                        
                        {formData.customerAddressId === String(addr.id) && (
                          <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-bounceIn">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="mt-8 pt-8 border-t border-dashed" style={{ borderColor: tokens.colors[mode].border.DEFAULT }} />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-8">
                <FormInput
                  label={t('common:fullName', 'Full Name')}
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder={t('common:fullName', 'Full Name')}
                  error={errors.fullName}
                  required
                />
                <FormInput
                  label={t('common:emailAddress', 'Email Address')}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  error={errors.email}
                  required
                />
                <FormInput
                  label={
                    selectedCountry
                      ? `${t('common:phoneNumber', 'Phone Number')} (${selectedCountry.phone_length} ${t('common:digits', 'digits')})`
                      : t('common:phoneNumber', 'Phone Number')
                  }
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder={selectedCountry ? '0'.repeat(selectedCountry.phone_length) : '0123456789'}
                  error={errors.phone}
                  required
                  maxLength={selectedCountry?.phone_length}
                  inputDir="ltr"
                  leftElement={
                    selectedCountry && (
                      <div
                        className="font-black px-4 h-full flex items-center justify-center text-sm"
                        style={{
                          color: tokens.colors[mode].text.tertiary,
                          borderRight: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
                        }}
                      >
                        {selectedCountry.phone_code}
                      </div>
                    )
                  }
                />
                <Select
                  label={t('common:cityGovernorate', 'City / Governorate')}
                  name="cityId"
                  value={formData.cityId}
                  onChange={handleCityChange as any}
                  disabled={loadingCities}
                  placeholder={loadingCities ? t('common:loading...', 'Loading...') : t('common:selectCity', 'Select City')}
                  options={cities.map(city => ({ value: city.id, label: city.name }))}
                  error={errors.cityId}
                  required
                />
                <div className="md:col-span-2">
                  <FormInput
                    label={t('common:detailedAddress', 'Detailed Address')}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder={isRTL ? 'الشارع، رقم المبنى، الحي...' : 'Street, Building, District...'}
                    error={errors.address}
                    required
                  />
                </div>
              </div>
            </div>

            <div 
              className="p-10 rounded-[45px] shadow-2xl relative group z-10"
              style={{
                background: tokens.colors[mode].surface.elevated,
                border: `1px solid ${tokens.colors[mode].border.DEFAULT}`,
              }}
            >
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-2xl">
                  💳
                </div>
                <h2 className="text-3xl font-black" style={{ color: tokens.colors[mode].text.primary }}>
                  {t('common:paymentMethod', 'Payment Method')}
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {['cod', 'card'].map(method => (
                  <button
                    key={method}
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method }))}
                    className={`p-6 rounded-[32px] border-2 text-start transition-all relative overflow-hidden ${
                      formData.paymentMethod === method 
                        ? 'border-primary bg-primary/5' 
                        : 'border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl">{method === 'card' ? '💳' : '💵'}</span>
                      {formData.paymentMethod === method && (
                        <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <span className="font-black text-lg block" style={{ color: tokens.colors[mode].text.primary }}>
                      {method === 'card' 
                        ? t('common:creditCard', 'Credit Card') 
                        : t('common:cashOnDelivery', 'Cash on Delivery')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 transition-all duration-300">
            <OrderSummary
              items={items}
              subtotal={subtotal}
              total={total}
              appliedPromo={appliedPromo}
              setAppliedPromo={setAppliedPromo}
              onAction={handlePlaceOrder}
              actionLabel={"🚀 " + t('common:confirmOrder', 'Confirm Order')}
              actionLoading={loading}
              shippingCost={shippingCost}
              isCalculatingShipping={calculatingShipping}
              showItems={true}
              isCheckout={true}
            />
          </div>
        </div>
      </div>

      {showSuccess && orderDetails && (
        <SuccessModal 
          orderData={orderDetails}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
}

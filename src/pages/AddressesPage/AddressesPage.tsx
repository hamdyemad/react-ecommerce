import { useTheme } from '../../hooks/useTheme';
import { useDirection } from '../../hooks/useDirection';
import { BreadCrumb } from '../../components/molecules/BreadCrumb';
import { Button } from '../../components/atoms/Button';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../tokens';
import { addressService, areaService } from '../../services';
import { useCatalog } from '../../hooks/useCatalog';
import type { Address, AddressCreateData } from '../../types/address';
import type { City, Region } from '../../types/area';
import toast from 'react-hot-toast';
import { FormInput } from '../../components/atoms/FormInput';
import { Select } from '../../components/atoms/Select';
import { ConfirmModal } from '../../components/molecules/ConfirmModal/ConfirmModal';

export function AddressesPage() {
  const { mode } = useTheme();
  const { t } = useTranslation();
  const { countries } = useCatalog();
  const { language } = useDirection();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isInitializingEdit, setIsInitializingEdit] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Area data
  const [cities, setCities] = useState<City[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingRegions, setLoadingRegions] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    keyword: '',
    is_primary: '' // '' | '0' | '1'
  });

  const [formData, setFormData] = useState<AddressCreateData>({
    title: '',
    address: '',
    postal_code: '',
    is_primary: '0',
    country_id: '',
    city_id: '',
    region_id: '',
    subregion_id: ''
  });

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.is_primary) params.is_primary = filters.is_primary;
      
      const response = await addressService.getAddresses(params);
      if (response.status) {
        setAddresses(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch addresses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAddresses();
    }, 400); // Debounce search
    return () => clearTimeout(timer);
  }, [filters.keyword, filters.is_primary]);

  // Pre-select first country if available
  useEffect(() => {
    if (countries.length > 0 && !formData.country_id && showModal) {
      setFormData(prev => ({ ...prev, country_id: String(countries[0].id) }));
    }
  }, [countries, showModal]);

  // Fetch cities when country changes
  useEffect(() => {
    if (!formData.country_id) {
       setCities([]);
       return;
    }
    const fetchCities = async () => {
      try {
        setLoadingCities(true);
        const response = await areaService.getCities(formData.country_id);
        if (response.status) {
          setCities(response.data);
          // Only clear child fields if we are NOT in the middle of initializing an edit
          if (!isInitializingEdit) {
            setFormData(prev => ({ ...prev, city_id: '', region_id: '' }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch cities', err);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, [formData.country_id, language]);

  // Fetch regions when city changes
  useEffect(() => {
    if (!formData.city_id) {
        setRegions([]);
        return;
    }
    const fetchRegions = async () => {
      try {
        setLoadingRegions(true);
        const response = await areaService.getRegions(formData.city_id);
        if (response.status) {
          setRegions(response.data);
          // Only clear child fields if we are NOT in the middle of initializing an edit
          if (!isInitializingEdit) {
            setFormData(prev => ({ ...prev, region_id: '' }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch regions', err);
      } finally {
        setLoadingRegions(false);
        // After final fetch, we can say initialization is done
        setIsInitializingEdit(false);
      }
    };
    fetchRegions();
  }, [formData.city_id, language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = editingId 
        ? await addressService.updateAddress(editingId, formData)
        : await addressService.createAddress(formData);

      if (response.status) {
        toast.success(response.message || (editingId ? t('addressUpdated') : t('addressAdded')));
        closeModal();
        fetchAddresses();
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData?.errors) {
        Object.values(errorData.errors).flat().forEach((msg: any) => toast.error(msg));
      } else {
        toast.error(errorData?.message || t('failedToSaveAddress'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (address: Address) => {
    setEditingId(address.id);
    setIsInitializingEdit(true);
    
    // Temporarily set form data. The useEffects will trigger.
    // Because isInitializingEdit is true, they won't clear the IDs.
    setFormData({
      title: address.title,
      address: address.address,
      postal_code: address.postal_code || '',
      is_primary: address.is_primary ? '1' : '0',
      country_id: String(address.country.id),
      city_id: String(address.city.id),
      region_id: String(address.region.id),
      subregion_id: address.subregion ? String(address.subregion.id) : ''
    });
    
    setShowModal(true);
    
    // Optionally fetch fresh data for this specific address
    try {
        const res = await addressService.getAddress(address.id);
        if (res.status) {
            // refresh data if needed
        }
    } catch (err) {
        console.error('Failed to fetch single address', err);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setIsInitializingEdit(false);
    setFormData({
      title: '',
      address: '',
      postal_code: '',
      is_primary: '0',
      country_id: '',
      city_id: '',
      region_id: '',
      subregion_id: ''
    });
  };

  const handleDelete = (id: number) => {
    setAddressToDelete(id);
  };

  const confirmDelete = async () => {
    if (!addressToDelete) return;
    try {
      setIsDeleting(true);
      const response = await addressService.deleteAddress(addressToDelete);
      if (response.status) {
        toast.success(response.message || t('addressDeleted', 'Address deleted successfully'));
        fetchAddresses();
        setAddressToDelete(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('failedToDelete', 'Failed to delete address'));
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <div className="min-h-screen py-8">
      <BreadCrumb 
        items={[
          { label: t('home'), path: '/' },
          { label: t('account'), path: '/profile' },
          { label: t('addresses'), path: '/profile/addresses' }
        ]}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 px-2">
        <div>
          <h1 
            className="text-5xl font-black mb-4 flex items-center gap-4"
            style={{ color: tokens.colors[mode].text.primary }}
          >
            📍 {t('myAddresses')}
          </h1>
          <p 
            className="text-xl font-bold opacity-70"
            style={{ color: tokens.colors[mode].text.secondary }}
          >
            {t('manageShippingAddresses')}
          </p>
        </div>
        <Button 
          variant="primary" 
          size="lg" 
          className="rounded-2xl font-black px-8 shadow-xl hover:scale-105 active:scale-95 transition-all"
          onClick={() => setShowModal(true)}
        >
          + {t('addNewAddress')}
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 px-2 max-w-6xl">
        <div className="md:col-span-2 relative group">
           <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl group-focus-within:scale-110 transition-transform">🔍</span>
           <input 
             type="text"
             placeholder={t('searchAddresses', 'Search by title or address...')}
             value={filters.keyword}
             onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
             className="w-full pl-16 pr-6 py-5 rounded-3xl font-bold border outline-none transition-all focus:ring-4 focus:ring-primary/10 shadow-sm"
             style={{ 
               background: tokens.colors[mode].surface.elevated,
               borderColor: tokens.colors[mode].border.DEFAULT,
               color: tokens.colors[mode].text.primary
             }}
           />
        </div>
        <div className="flex gap-4">
           {[
             { label: t('all', 'All'), value: '' },
             { label: t('primary', 'Primary'), value: '1' },
             { label: t('other', 'Other'), value: '0' }
           ].map((opt) => (
             <button
               key={opt.value}
               onClick={() => setFilters({ ...filters, is_primary: opt.value })}
               className="flex-1 py-5 rounded-3xl font-black text-sm transition-all duration-300 shadow-sm whitespace-nowrap"
               style={{
                 background: filters.is_primary === opt.value 
                   ? tokens.gradients.primary 
                   : tokens.colors[mode].surface.elevated,
                 color: filters.is_primary === opt.value 
                   ? '#ffffff' 
                   : tokens.colors[mode].text.secondary,
                 border: filters.is_primary === opt.value 
                   ? 'none' 
                   : `1px solid ${tokens.colors[mode].border.DEFAULT}`
               }}
             >
               {opt.label}
             </button>
           ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-bold text-slate-400">{t('loading', 'Loading...')}</p>
        </div>
      ) : addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2 max-w-6xl">
            {addresses.map((address) => (
            <div
                key={address.id}
                className="p-8 rounded-[40px] transition-all duration-500 hover:scale-[1.02] relative group overflow-hidden"
                style={{
                background: address.is_primary 
                    ? (mode === 'light' ? '#f5f3ff' : '#1e1b4b') // Custom subtle background for primary
                    : tokens.colors[mode].surface.elevated,
                backdropFilter: 'blur(30px)',
                border: address.is_primary
                    ? `2.5px solid ${tokens.colors[mode].primary.DEFAULT}`
                    : `1px solid ${tokens.colors[mode].border.DEFAULT}`,
                boxShadow: address.is_primary 
                    ? `0 20px 40px ${tokens.colors[mode].primary.DEFAULT}26` 
                    : tokens.shadows.sm
                }}
            >
                {address.is_primary && (
                    <div className="absolute -right-12 -top-12 w-24 h-24 rotate-45 flex items-end justify-center pb-1 shadow-xl"
                        style={{ background: tokens.gradients.primary }}
                    >
                        <span className="text-white text-[10px] font-black uppercase tracking-widest mb-1">PRO</span>
                    </div>
                )}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

                <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div 
                    className="w-16 h-16 rounded-[22px] flex items-center justify-center transform group-hover:rotate-12 transition-all shadow-xl"
                    style={{
                        background: address.is_primary ? tokens.gradients.primary : `${tokens.colors[mode].primary.DEFAULT}1A`,
                        color: address.is_primary ? '#ffffff' : tokens.colors[mode].primary.DEFAULT
                    }}
                    >
                    <span className="text-3xl">🏠</span>
                    </div>
                    <div>
                    <h3 
                        className="text-2xl font-black mb-1"
                        style={{ color: tokens.colors[mode].text.primary }}
                    >
                        {address.title}
                    </h3>
                    {address.is_primary && (
                        <span 
                        className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-inner"
                        style={{
                            background: `${tokens.colors[mode].success.DEFAULT}20`,
                            color: tokens.colors[mode].success.DEFAULT
                        }}
                        >
                        {t('default', 'Default')}
                        </span>
                    )}
                    </div>
                </div>
                </div>
                <div 
                className="space-y-3 mb-8 relative z-10 text-lg leading-relaxed font-bold"
                style={{ color: tokens.colors[mode].text.secondary }}
                >
                <p className="text-[var(--color-text-primary)]">{address.address}</p>
                <div className="flex flex-wrap gap-2 text-sm opacity-80">
                    <span>{address.region?.name}</span>
                    <span>•</span>
                    <span>{address.city?.name}</span>
                    <span>•</span>
                    <span>{address.country?.name}</span>
                </div>
                {address.postal_code && (
                    <p className="text-xs">{t('postalCode', 'Postal Code')}: {address.postal_code}</p>
                )}
                           <div className="flex gap-4 relative z-10 w-full">
                <button 
                    onClick={() => handleEdit(address)}
                    className="flex-1 px-6 py-4 rounded-2xl font-black text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg group-hover:bg-primary group-hover:text-white"
                    style={{
                    background: mode === 'light' ? tokens.colors.light.surface.base : tokens.colors.dark.surface.base,
                    color: tokens.colors[mode].text.primary
                    }}
                >
                    {t('edit')}
                </button>
                <button 
                    onClick={() => handleDelete(address.id)}
                    className="px-6 py-4 rounded-2xl font-black text-sm transition-all duration-300 hover:scale-110 active:scale-90 shadow-lg hover:bg-error hover:text-white group/del"
                    style={{
                    background: `${tokens.colors[mode].error.DEFAULT}10`,
                    color: tokens.colors[mode].error.DEFAULT
                    }}
                >
                    <span className="group-hover/del:scale-125 transition-transform inline-block">🗑️</span>
                </button>
                </div>
           </div>
            </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-20">
            <div className="text-8xl mb-6">📍</div>
            <h3 className="text-3xl font-black mb-3" style={{ color: tokens.colors[mode].text.primary }}>{t('noAddressesYet', 'No addresses yet')}</h3>
            <p className="text-xl mb-10 font-bold" style={{ color: tokens.colors[mode].text.tertiary }}>{t('addAddressToStart', 'Add an address to start shopping')}</p>
        </div>
      )}

      {/* Modal for adding address */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div 
             className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
             onClick={closeModal}
           />
           <div 
             className="w-full max-w-xl rounded-[40px] p-10 relative shadow-2xl animate-in zoom-in-95 duration-300"
             style={{ background: tokens.colors[mode].surface.elevated }}
           >
              <button 
                onClick={closeModal}
                className="absolute top-8 right-8 w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
                style={{ color: tokens.colors[mode].text.primary }}
              >
                ✕
              </button>

              <h2 className="text-3xl font-black mb-10" style={{ color: tokens.colors[mode].text.primary }}>
                {editingId ? t('editAddress', 'Edit Address') : t('addNewAddress', 'Add New Address')}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                 <FormInput
                   label={t('addressTitle', 'ADDRESS TITLE (E.G. HOME, WORK)')}
                   value={formData.title}
                   onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                   placeholder="Home"
                   required
                   className="uppercase"
                 />

                 <FormInput
                   label={t('fullAddress', 'FULL ADDRESS')}
                   value={formData.address}
                   onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                   placeholder="123 Main St..."
                   required
                   className="uppercase"
                 />

                 <div className="grid grid-cols-2 gap-6">
                    <FormInput
                      label={t('postalCodeLabel', 'POSTAL CODE')}
                      value={formData.postal_code || ''}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      placeholder="12345"
                      className="uppercase"
                    />

                    <Select
                      name="country_id"
                      label={t('countryLabel', 'COUNTRY')}
                      value={formData.country_id}
                      onChange={(e) => setFormData({ ...formData, country_id: e.target.value })}
                      options={countries.map(c => ({ value: c.id, label: c.name }))}
                      placeholder={t('selectCountry')}
                      required
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <Select
                      name="city_id"
                      label={t('cityLabel', 'CITY')}
                      value={formData.city_id}
                      onChange={(e) => setFormData({ ...formData, city_id: e.target.value })}
                      options={cities.map(c => ({ value: c.id, label: c.name }))}
                      placeholder={loadingCities ? t('loadingCities') : t('selectCity')}
                      disabled={!formData.country_id || loadingCities}
                      required
                    />

                    <Select
                      name="region_id"
                      label={t('regionLabel', 'REGION')}
                      value={formData.region_id}
                      onChange={(e) => setFormData({ ...formData, region_id: e.target.value })}
                      options={regions.map(r => ({ value: r.id, label: r.name }))}
                      placeholder={loadingRegions ? t('loadingRegions') : t('selectRegion')}
                      disabled={!formData.city_id || loadingRegions}
                      required
                    />
                 </div>

                  <div className="flex items-center gap-4 py-6">
                    <label className="relative flex items-center cursor-pointer group/check">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={formData.is_primary === '1'}
                        onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked ? '1' : '0' })}
                      />
                      <div 
                        className="w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all peer-checked:border-primary peer-checked:bg-primary shadow-sm group-hover/check:shadow-md"
                        style={{ 
                          borderColor: formData.is_primary === '1' ? tokens.colors[mode].primary.DEFAULT : tokens.colors[mode].border.DEFAULT,
                          background: formData.is_primary === '1' ? tokens.colors[mode].primary.DEFAULT : tokens.colors[mode].surface.base
                        }}
                      >
                        <svg className={`w-4 h-4 text-white transition-opacity ${formData.is_primary === '1' ? 'opacity-100' : 'opacity-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="ml-4 font-black text-[11px] uppercase tracking-widest select-none" style={{ color: tokens.colors[mode].text.secondary }}>
                        {t('setAsDefaultAddress', 'Set as default address')}
                      </span>
                    </label>
                  </div>

                  <div className="pt-8 flex gap-4 items-center">
                    <button 
                      type="submit" 
                      className="flex-1 py-[18px] rounded-[22px] font-black text-sm uppercase tracking-widest text-white shadow-xl shadow-primary/20 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50"
                      style={{ 
                        background: tokens.gradients.primary,
                      }}
                      disabled={submitting}
                    >
                      {submitting ? t('saving...') : t('saveAddress', 'Save Address')}
                    </button>
                    <button 
                      type="button" 
                      className="flex-1 py-[18px] rounded-[22px] font-black text-sm uppercase tracking-widest transition-all border active:scale-95 hover:bg-slate-50 dark:hover:bg-slate-800"
                      style={{ 
                        color: tokens.colors[mode].text.secondary,
                        borderColor: tokens.colors[mode].border.DEFAULT,
                        backgroundColor: tokens.colors[mode].surface.base
                      }}
                      onClick={closeModal}
                    >
                      {t('cancel', 'Cancel')}
                    </button>
                  </div>
              </form>
           </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!addressToDelete}
        onClose={() => setAddressToDelete(null)}
        onConfirm={confirmDelete}
        title={t('deleteAddress', 'Delete Address')}
        message={t('confirmDeleteAddressMessage', 'Are you sure you want to delete this address? This action cannot be undone.')}
        confirmLabel={t('delete', 'Delete')}
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
}

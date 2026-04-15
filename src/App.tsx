import { ThemeProvider, useTheme } from './hooks/useTheme';
import { DirectionProvider, useDirection } from './hooks/useDirection';
import { SettingsProvider } from './hooks/useSettings';
import { CatalogProvider } from './hooks/useCatalog';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { WishlistProvider, useWishlist } from './hooks/useWishlist';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Header } from './components/organisms/Header';
import { Footer } from './components/organisms/Footer';
import { CartDrawer } from './components/organisms/CartDrawer';
import { Sidebar } from './components/organisms/Sidebar';
import { ScrollToTopButton } from './components/atoms/ScrollToTopButton';
import { HomePage } from './pages/HomePage';
import { CategoriesPage } from './pages/CategoriesPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { DepartmentPage } from './pages/DepartmentPage';
import { CategoryPage } from './pages/CategoryPage/CategoryPage';
import { SubcategoryPage } from './pages/SubcategoryPage';
import { SubcategoriesPage } from './pages/SubcategoriesPage';
import { BrandsPage } from './pages/BrandsPage';
import { DealsPage } from './pages/DealsPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage/CheckoutPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { VerifyOtpPage } from './pages/VerifyOtpPage';
import { ReturnPolicyPage } from './pages/ReturnPolicyPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { AboutUsPage } from './pages/AboutUsPage';
import { BlogsPage } from './pages/BlogsPage';
import { BlogDetailPage } from './pages/BlogsPage/BlogDetailPage';
import { ContactPage } from './pages/ContactPage';
import { TermsPage } from './pages/TermsPage';
import { FAQsPage } from './pages/FAQsPage';
import { WishlistPage } from './pages/WishlistPage';
import { ProfilePage } from './pages/ProfilePage';
import { BrandPage } from './pages/BrandPage';
import { VendorPage } from './pages/VendorPage';
import { OrdersPage } from './pages/OrdersPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { AddressesPage } from './pages/AddressesPage';
import { PaymentPage } from './pages/PaymentPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PointsPage } from './pages/PointsPage';
import { AllProductsPage } from './pages/AllProductsPage';
import { NewArrivalsPage } from './pages/NewArrivalsPage';
import { StoreLocatorPage } from './pages/StoreLocatorPage';
import { TrackOrderPage } from './pages/TrackOrderPage/TrackOrderPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SocialCallbackPage } from './pages/SocialCallbackPage';
import { Toaster } from 'react-hot-toast';
import { GuestRoute } from './components/atoms/GuestRoute';
import { ProtectedRoute } from './components/atoms/ProtectedRoute';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { cartService } from './services/cartService';

// Scroll to top component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

interface CartItemType {
  id: string;
  image: string;
  title: string;
  variant?: string;
  price: number;
  quantity: number;
  vendor_product_id?: number | string;
  vendor_product_variant_id?: number | string | null;
  server_id?: number; // Unique ID from server/cart table
}

function DemoContent() {
  const { mode, toggleMode } = useTheme();
  const { language, setLanguage, country, setSelectedCountry } = useDirection();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showCart, setShowCart] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [serverTotals, setServerTotals] = useState({ subtotal: 0, total: 0 });
  const [isCartActionLoading, setIsCartActionLoading] = useState(false);
  
  const [appliedPromo, setAppliedPromo] = useState<any>(() => {
    const saved = localStorage.getItem('anibal_applied_promo');
    return saved ? JSON.parse(saved) : null;
  });
  
  const { wishlist, toggleWishlist } = useWishlist();

  // 1. Fetch Cart Data
  useEffect(() => {
    const fetchCart = async () => {
      if (isAuthenticated) {
        try {
          const res = await cartService.getCart();
          if (res.status && res.data) {
            const mappedItems = res.data.items.map((item: any) => ({
              id: String(item.product.id),
              server_id: item.id,
              image: item.product.image || '',
              title: item.product.name, // Fixed: use item.product.name
              price: item.product.real_price,
              quantity: item.quantity,
              vendor_product_id: item.product.vendor_product_id,
              vendor_product_variant_id: item.product.variant_id
            }));
            setCartItems(mappedItems);
            setServerTotals({
              subtotal: res.data.totalProductPrice || res.data.totalPrice,
              total: res.data.totalPrice
            });
            
            // If local guest cart exists, sync it to server then clear local
            const guestCart = localStorage.getItem('anibal_guest_cart');
            if (guestCart) {
              const localItems = JSON.parse(guestCart);
              if (localItems.length > 0) {
                await cartService.addBulk({
                  items: localItems.map((li: any) => ({
                    vendor_product_id: Number(li.vendor_product_id),
                    vendor_product_variant_id: li.vendor_product_variant_id ? Number(li.vendor_product_variant_id) : null,
                    quantity: li.quantity,
                    type: 'product'
                  }))
                });
                localStorage.removeItem('anibal_guest_cart');
                // Re-fetch server cart after sync
                const reRes = await cartService.getCart();
                const reMapped = reRes.data.items.map((item: any) => ({
                  id: String(item.product.id),
                  server_id: item.id,
                  image: item.product.image || '',
                  title: item.product.name,
                  price: item.product.real_price,
                  quantity: item.quantity,
                  vendor_product_id: item.product.vendor_product_id,
                  vendor_product_variant_id: item.product.variant_id
                }));
                setCartItems(reMapped);
                setServerTotals({
                  subtotal: reRes.data.totalProductPrice || reRes.data.totalPrice,
                  total: reRes.data.totalPrice
                });
              } else {
                localStorage.removeItem('anibal_guest_cart');
              }
            }
          }
        } catch (err) {
          console.error('Failed to fetch server cart:', err);
        }
      } else {
        // Guest Mode
        const saved = localStorage.getItem('anibal_guest_cart');
        setCartItems(saved ? JSON.parse(saved) : []);
      }
    };
    fetchCart();
  }, [isAuthenticated]);

  // 2. Persist Guest Cart
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('anibal_guest_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  useEffect(() => {
    if (appliedPromo) {
      localStorage.setItem('anibal_applied_promo', JSON.stringify(appliedPromo));
    } else {
      localStorage.removeItem('anibal_applied_promo');
    }
  }, [appliedPromo]);

  const handleAddToCart = async (data: string | number | { 
    vendor_product_id: number; 
    variant_id: number | null; 
    quantity: number;
    product_data?: any;
  }) => {
    setIsCartActionLoading(true);
    // 1. Authenticated Mode
    if (isAuthenticated) {
      try {
        const item = typeof data === 'object' ? data : { vendor_product_id: Number(data), variant_id: null, quantity: 1 };
        await cartService.addBulk({
          items: [{
            vendor_product_id: item.vendor_product_id,
            vendor_product_variant_id: item.variant_id,
            quantity: item.quantity,
            type: 'product'
          }]
        });
        // Re-fetch cart to get correct IDs and totals
        const res = await cartService.getCart();
        const mappedItems = res.data.items.map((item: any) => ({
          id: String(item.product.id),
          server_id: item.id,
          image: item.product.image || '',
          title: item.product.name,
          price: item.product.real_price,
          quantity: item.quantity,
          vendor_product_id: item.product.vendor_product_id,
          vendor_product_variant_id: item.product.variant_id
        }));
        setCartItems(mappedItems);
        setServerTotals({
          subtotal: res.data.totalProductPrice || res.data.totalPrice,
          total: res.data.totalPrice
        });
        toast.success(language === 'ar' ? 'تمت إضافة العنصر' : 'Item added to cart!');
        setShowCart(true);
      } catch (err) {
        toast.error('Failed to add item to cart');
      } finally {
        setIsCartActionLoading(false);
      }
      return;
    }

    // 2. Local State Update (Guest Only)
    if (typeof data === 'object' && data.product_data) {
      const pData = data.product_data;
      setCartItems((prev) => {
        const idStr = String(pData.id);
        const existing = prev.find((item) => item.id === idStr);
        if (existing) {
          return prev.map((item) =>
            item.id === idStr ? { ...item, quantity: item.quantity + data.quantity } : item
          );
        }
        return [
          ...prev,
          {
            id: idStr,
            image: pData.image,
            title: pData.title,
            price: pData.price,
            quantity: data.quantity,
            variant: pData.variant_name || undefined,
            vendor_product_id: data.vendor_product_id,
            vendor_product_variant_id: data.variant_id
          },
        ];
      });
      toast.success(language === 'ar' ? 'تمت إضافة العنصر' : 'Item added to cart!');
      setShowCart(true);
      setIsCartActionLoading(false);
      return;
    }

    // 3. Legacy fallback for internal testing
    const fallbackId = typeof data === 'object' ? data.vendor_product_id : data;
    const allProducts = [
      { id: '1', image: '', title: 'Test', price: 100 }
    ];
    const product = allProducts.find((p) => p.id === String(fallbackId));
    if (product) {
      setCartItems((prev) => {
        const existing = prev.find((item) => item.id === String(fallbackId));
        if (existing) {
          return prev.map((item) =>
            item.id === String(fallbackId) ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [
          ...prev,
          { id: product.id, image: product.image, title: product.title, price: product.price, quantity: 1 },
        ];
      });
      setShowCart(true);
    }
    setIsCartActionLoading(false);
  };

  const handleQuantityChange = async (id: string | number, newQuantity: number) => {
    if (isAuthenticated) {
      const item = cartItems.find(i => i.id === String(id));
      if (item?.server_id) {
        setIsCartActionLoading(true);
        try {
          await cartService.updateQuantity(item.server_id, newQuantity);
          const res = await cartService.getCart();
          const mappedItems = res.data.items.map((item: any) => ({
            id: String(item.product.id),
            server_id: item.id,
            image: item.product.image || '',
            title: item.product.name,
            price: item.product.real_price,
            quantity: item.quantity,
            vendor_product_id: item.product.vendor_product_id,
            vendor_product_variant_id: item.product.variant_id
          }));
          setCartItems(mappedItems);
          setServerTotals({
            subtotal: res.data.totalProductPrice || res.data.totalPrice,
            total: res.data.totalPrice
          });
          toast.success(language === 'ar' ? 'تم تحديث الكمية' : 'Quantity updated!');
        } catch (err) {
          toast.error('Failed to update quantity');
        } finally {
          setIsCartActionLoading(false);
        }
      }
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === String(id) ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = async (id: string | number) => {
    if (isAuthenticated) {
      const item = cartItems.find(i => i.id === String(id));
      if (item?.server_id) {
        setIsCartActionLoading(true);
        try {
          await cartService.removeItem(item.server_id);
          const res = await cartService.getCart();
          const mappedItems = res.data.items.map((item: any) => ({
            id: String(item.product.id),
            server_id: item.id,
            image: item.product.image || '',
            title: item.product.name,
            price: item.product.real_price,
            quantity: item.quantity,
            vendor_product_id: item.product.vendor_product_id,
            vendor_product_variant_id: item.product.variant_id
          }));
          setCartItems(mappedItems);
          setServerTotals({
            subtotal: res.data.totalProductPrice || res.data.totalPrice,
            total: res.data.totalPrice
          });
          toast.success(language === 'ar' ? 'تم حذف العنصر' : 'Item removed from cart');
        } catch (err) {
          toast.error('Failed to remove item');
        } finally {
          setIsCartActionLoading(false);
        }
      }
      return;
    }

    setCartItems((prev) => prev.filter((item) => item.id !== String(id)));
  };

  const handleOrderSuccess = async () => {
    if (isAuthenticated) {
      try {
        await cartService.clear();
      } catch (err) {
        console.error('Failed to clear server cart:', err);
      }
    }
    setCartItems([]);
    setAppliedPromo(null);
    localStorage.removeItem('anibal_guest_cart');
    localStorage.removeItem('anibal_applied_promo');
    setShowCart(false);
  };

  const handleToggleWishlist = async (data: any) => {
    await toggleWishlist(data);
  };

  // Financial Calculation
  useEffect(() => {
    const updateHeaderHeight = () => {
      const header = document.querySelector('header');
      if (header) {
        document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
      }
    };
    
    // Initial measure
    updateHeaderHeight();
    
    // Remeasure on resize or scroll (since header changes size on scroll)
    window.addEventListener('resize', updateHeaderHeight);
    window.addEventListener('scroll', updateHeaderHeight);
    
    return () => {
      window.removeEventListener('resize', updateHeaderHeight);
      window.removeEventListener('scroll', updateHeaderHeight);
    };
  }, []);

  const subtotal = isAuthenticated 
    ? serverTotals.subtotal 
    : cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const discount = appliedPromo 
    ? (appliedPromo.discount_type === 'percent' 
        ? (subtotal * appliedPromo.discount_value) / 100 
        : appliedPromo.discount_value)
    : 0;

  const total = isAuthenticated 
    ? serverTotals.total 
    : subtotal - discount;

  return (
    <div className="min-h-screen transition-colors duration-200">
      <ScrollToTop />
      
      <Header
        mode={mode}
        language={language}
        country={country}
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        onToggleMode={toggleMode}
        onToggleLanguage={() => setLanguage(language === 'en' ? 'ar' : 'en')}
        onCountryChange={(countryObj) => {
          setSelectedCountry(countryObj);
          window.location.reload();
        }}
        onCartClick={() => setShowCart(!showCart)}
        onMenuClick={() => setShowSidebar(!showSidebar)}
      />

      <Sidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
      />

      <main className="max-w-7xl mx-auto px-6 transition-colors duration-200">
        {showCart && (
          <CartDrawer
            items={cartItems}
            subtotal={subtotal}
            total={total}
            isLoading={isCartActionLoading}
            onClose={() => setShowCart(false)}
            onQuantityChange={handleQuantityChange}
            onRemoveItem={handleRemoveItem}
            onCheckout={() => {
              setShowCart(false);
              navigate('/checkout');
            }}
          />
        )}

        <Routes>
          <Route path="/" element={<HomePage onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} wishlistItems={wishlist.map((i: any) => i.id)} />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/sub-categories" element={<SubcategoriesPage />} />
          <Route path="/department/:departmentId" element={<DepartmentPage onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} wishlistItems={wishlist.map((i: any) => i.id)} />} />
          <Route path="/category/:categoryId" element={<CategoryPage onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} wishlistItems={wishlist.map((i: any) => i.id)} />} />
          <Route path="/categories/:categoryId" element={<CategoryPage onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} wishlistItems={wishlist.map((i: any) => i.id)} />} />
          <Route path="/sub-category/:subcategorySlug" element={<SubcategoryPage onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} wishlistItems={wishlist.map((i: any) => i.id)} />} />
          <Route path="/brands" element={<BrandsPage />} />
          <Route path="/store-locator" element={<StoreLocatorPage />} />
          <Route path="/brand/:brandId" element={<BrandPage onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} wishlistItems={wishlist.map((i: any) => i.id)} />} />
          <Route path="/vendors/:slug" element={<VendorPage onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} wishlistItems={wishlist.map((i: any) => i.id)} />} />
          <Route path="/product/:slug" element={<ProductDetailsPage onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} wishlistItems={wishlist.map((i: any) => i.id)} isLoading={isCartActionLoading} />} />
          <Route path="/cart" element={
            <CartPage 
              items={cartItems} 
              subtotal={subtotal} 
              total={total} 
              appliedPromo={appliedPromo}
              setAppliedPromo={setAppliedPromo}
              onQuantityChange={handleQuantityChange} 
              onRemoveItem={handleRemoveItem} 
              onCheckout={() => navigate('/checkout')} 
            />
          } />
          <Route path="/checkout" element={<CheckoutPage items={cartItems} subtotal={subtotal} total={total} appliedPromo={appliedPromo} setAppliedPromo={setAppliedPromo} onOrderSuccess={handleOrderSuccess} />} />
          <Route path="/track-order" element={<TrackOrderPage />} />
          <Route path="/track-order/:reference" element={<TrackOrderPage />} />

          <Route path="/deals" element={<DealsPage onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} wishlistItems={wishlist.map((i: any) => i.id)} />} />
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
          <Route path="/verify-otp" element={<GuestRoute><VerifyOtpPage /></GuestRoute>} />
          <Route path="/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
          <Route path="/return-policy" element={<ReturnPolicyPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/faqs" element={<FAQsPage />} />
          <Route path="/wishlist" element={<WishlistPage onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} wishlistItems={wishlist.map((i: any) => i.id)} />} />
          <Route path="/products" element={<AllProductsPage onToggleWishlist={handleToggleWishlist} wishlistItems={wishlist.map((i: any) => i.id)} />} />
          <Route path="/new-arrivals" element={<NewArrivalsPage onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} wishlistItems={wishlist.map((i: any) => i.id)} />} />
          <Route path="/auth/google/callback" element={<SocialCallbackPage />} />


          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/profile/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/profile/points" element={<ProtectedRoute><PointsPage /></ProtectedRoute>} />
          <Route path="/profile/reviews" element={<ProtectedRoute><ReviewsPage /></ProtectedRoute>} />
          <Route path="/profile/addresses" element={<ProtectedRoute><AddressesPage /></ProtectedRoute>} />
          <Route path="/profile/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
          <Route path="/profile/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/profile/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          
          {/* 404 Case */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
      <ScrollToTopButton />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <WishlistProvider>
            <DirectionProvider>
              <SettingsProvider>
                <CatalogProvider>
                  <DemoContent />
                </CatalogProvider>
              </SettingsProvider>
            </DirectionProvider>
          </WishlistProvider>
        </AuthProvider>
      </ThemeProvider>
      <Toaster position="top-center" />
    </BrowserRouter>
  );
}

export default App;

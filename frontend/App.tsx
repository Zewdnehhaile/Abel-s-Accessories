import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ChatWidget from './components/ChatWidget';
import Home from './pages/Home';
import About from './pages/About';
import Shop from './pages/Shop';
import Repair from './pages/Repair';
import Login from './pages/Login';
import AbelDashboard from './pages/admin/AbelDashboard';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import { User, UserRole, CartItem, Product } from './types';
import { getCurrentUser, logout } from './services/authService';
import { getDiscountedPrice } from './services/productService';
import { X, Trash2, Plus, Minus, Loader, Globe, Check } from 'lucide-react';
import { I18N } from './constants';

export type ViewState = 'home' | 'about' | 'shop' | 'repair' | 'login' | 'admin' | 'super-admin';
export type ShopCategory = 'all' | 'phones' | 'accessories';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [shopCategory, setShopCategory] = useState<ShopCategory>('all');
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  
  const [lang, setLang] = useState<'en' | 'am'>('en');
  const t = I18N[lang];

  useEffect(() => {
    const loggedUser = getCurrentUser();
    if (loggedUser) setUser(loggedUser);
  }, []);

  const handleNavigate = (view: ViewState, category: ShopCategory = 'all') => {
    setCurrentView(view);
    if (view === 'shop') {
      setShopCategory(category);
    }
    window.scrollTo(0, 0);
  };

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('abel_user', JSON.stringify(u));
    if (u.role === UserRole.SUPER_ADMIN) setCurrentView('super-admin');
    else if (u.role === UserRole.SHOP_ADMIN) setCurrentView('admin');
    else setCurrentView('home');
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setCurrentView('login');
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
        setIsCheckingOut(false);
        setCheckoutSuccess(true);
        setCart([]);
        setTimeout(() => setCheckoutSuccess(false), 3000);
    }, 2000);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (getDiscountedPrice(item) * item.quantity), 0);

  const renderContent = () => {
    switch (currentView) {
      case 'login':
        return <Login onLogin={handleLogin} onBack={() => setCurrentView('home')} />;
      case 'admin':
        if (user?.role === UserRole.SHOP_ADMIN || user?.role === UserRole.SUPER_ADMIN) {
          return <AbelDashboard />;
        }
        return <div className="p-10 text-center text-red-500">Access Denied. Please login.</div>;
      case 'super-admin':
        if (user?.role === UserRole.SUPER_ADMIN) {
          return <SuperAdminDashboard />;
        }
        return <div className="p-10 text-center text-red-500">Access Denied. Super Admin only.</div>;
      case 'about':
        return <About lang={lang} onNavigate={handleNavigate} />;
      case 'shop':
        return <Shop addToCart={addToCart} lang={lang} categoryFilter={shopCategory} />;
      case 'repair':
        return <Repair />;
      case 'home':
      default:
        return <Home onNavigate={handleNavigate} lang={lang} />;
    }
  };

  const isAuthPage = currentView === 'login';

  return (
    <div className="min-h-screen text-[var(--text-main)] font-sans selection:bg-[var(--primary)] selection:text-white">
      {!isAuthPage && (
        <div className="relative">
          <Navbar 
            user={user} 
            onLogout={handleLogout} 
            cartCount={cart.reduce((acc, i) => acc + i.quantity, 0)} 
            toggleCart={() => setIsCartOpen(true)}
            onNavigate={handleNavigate}
          />
          <div className="fixed top-24 right-4 z-30 md:top-[88px] md:right-5">
              <button 
                onClick={() => setLang(l => l === 'en' ? 'am' : 'en')}
                className="bg-[var(--bg-card)] shadow-lg border border-[var(--border)] text-[var(--text-main)] px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold hover:bg-[var(--bg-body)] transition-colors"
              >
                  <Globe size={12} />
                  {lang === 'en' ? 'Amharic' : 'English'}
              </button>
          </div>
        </div>
      )}
      
      <main className={!isAuthPage ? "pt-0" : "h-screen"}>
        {renderContent()}
      </main>

      {!isAuthPage && (
        <footer className="bg-[var(--bg-card)] text-[var(--text-muted)] py-10 px-6 border-t border-[var(--border)] mt-12">
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              <div>© 2023 Abel Accessories Sales. All rights reserved.</div>
              <div className="flex gap-4 text-sm">
                 <button className="hover:text-[var(--primary)] transition-colors">Privacy Policy</button>
                 <button className="hover:text-[var(--primary)] transition-colors">Terms of Service</button>
              </div>
           </div>
        </footer>
      )}

      {!isAuthPage && <ChatWidget isOnline={true} />}

      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-[var(--bg-card)] h-full shadow-2xl p-6 flex flex-col border-l border-[var(--border)] animate-in slide-in-from-right">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[var(--text-main)]">{t.cartTitle}</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]"><X /></button>
             </div>
             
             {checkoutSuccess ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in">
                    <div className="w-20 h-20 bg-[var(--accent-green)] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                        <Check className="text-white w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--text-main)]">Payment Successful!</h3>
                    <p className="text-[var(--text-muted)]">Thank you for your purchase via Chapa.</p>
                </div>
             ) : (
             <>
                 <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {cart.length === 0 ? (
                      <div className="text-center text-[var(--text-muted)] mt-10">{t.cartEmpty}</div>
                    ) : (
                      cart.map(item => (
                        <div key={item.id} className="flex gap-4 bg-[var(--bg-body)] p-3 rounded-xl border border-[var(--border)] items-center">
                           <img src={item.image} alt="" className="w-16 h-16 rounded-lg object-cover bg-gray-800" />
                           <div className="flex-1">
                              <h4 className="font-medium text-[var(--text-main)] line-clamp-1">{item.name}</h4>
                              <p className="text-[var(--primary)] text-sm font-bold">{getDiscountedPrice(item).toLocaleString()} ETB</p>
                              {(item.discountPercent ?? 0) > 0 && (
                                <p className="text-xs text-[var(--text-muted)] line-through">{item.price.toLocaleString()} ETB</p>
                              )}
                              <div className="flex items-center gap-3 mt-2">
                                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 bg-[var(--bg-card)] border border-[var(--border)] rounded hover:border-[var(--primary)] text-[var(--text-main)] transition-colors"><Minus size={12} /></button>
                                  <span className="text-sm font-medium w-4 text-center text-[var(--text-main)]">{item.quantity}</span>
                                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 bg-[var(--bg-card)] border border-[var(--border)] rounded hover:border-[var(--primary)] text-[var(--text-main)] transition-colors"><Plus size={12} /></button>
                              </div>
                           </div>
                           <button onClick={() => removeFromCart(item.id)} className="text-[var(--text-muted)] hover:text-red-500 transition-colors self-start p-2"><Trash2 size={18} /></button>
                        </div>
                      ))
                    )}
                 </div>

                 <div className="border-t border-[var(--border)] pt-6 mt-4">
                    <div className="flex justify-between text-xl font-bold text-[var(--text-main)] mb-6">
                       <span>{t.total}</span>
                       <span>{cartTotal.toLocaleString()} ETB</span>
                    </div>
                    <button 
                      onClick={handleCheckout}
                      disabled={cart.length === 0 || isCheckingOut}
                      className="btn btn-primary w-full py-4 text-lg shadow-lg flex justify-center items-center gap-2"
                    >
                      {isCheckingOut ? (
                          <>
                            <Loader className="animate-spin" size={20} /> Processing...
                          </>
                      ) : (
                          t.checkout
                      )}
                    </button>
                 </div>
             </>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

import React from 'react';
import { ShoppingCart, Menu, X, User as UserIcon, LogOut, LayoutDashboard, Info } from 'lucide-react';
import { User, UserRole } from '../types';
import { ViewState, ShopCategory } from '../App';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  cartCount: number;
  toggleCart: () => void;
  onNavigate: (view: ViewState, category?: ShopCategory) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, cartCount, toggleCart, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-[var(--nav-bg)] backdrop-blur-xl border-b border-[var(--border)] transition-colors duration-300">
      <div className="max-w-[1300px] mx-auto px-[5%]">
        <div className="flex items-center justify-between h-[80px]">
          {/* Logo */}
          <button onClick={() => onNavigate('home')} className="group flex items-center gap-3 focus:outline-none">
            <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
               <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-70 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-slow"></div>
               <div className="relative w-full h-full bg-[var(--bg-body)] rounded-xl border border-white/10 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
                  <svg viewBox="0 0 100 100" className="w-full h-full p-1.5" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <defs>
                        <linearGradient id="logoGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                           <stop offset="0%" stopColor="#6366f1" />
                           <stop offset="50%" stopColor="#a855f7" />
                           <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                     </defs>
                     <path d="M15 85 L40 15 L65 85" stroke="url(#logoGradient)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                     <path d="M28 60 H52" stroke="url(#logoGradient)" strokeWidth="8" strokeLinecap="round" />
                     
                     {/* B part sharing the same gradient style */}
                     <path d="M65 15 V85" stroke="url(#logoGradient)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                     <path d="M65 15 H80 C95 15 95 45 80 45 H65" stroke="url(#logoGradient)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                     <path d="M65 45 H80 C95 45 95 85 80 85 H65" stroke="url(#logoGradient)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
               </div>
            </div>
            <div className="flex flex-col items-start -space-y-1">
              <span className="text-xl md:text-2xl font-black tracking-tighter text-[var(--text-main)]">
                Abel<span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-purple-500">Accessories</span>
              </span>
            </div>
          </button>

          {/* Desktop Links */}
          <ul className="hidden md:flex items-center gap-8">
            <li><button onClick={() => onNavigate('home')} className="text-[0.95rem] font-medium opacity-70 hover:opacity-100 hover:text-[var(--primary)] text-[var(--text-main)] transition-all">Home</button></li>
            <li><button onClick={() => onNavigate('about')} className="text-[0.95rem] font-medium opacity-70 hover:opacity-100 hover:text-[var(--primary)] text-[var(--text-main)] transition-all">About</button></li>
            <li><button onClick={() => onNavigate('shop', 'phones')} className="text-[0.95rem] font-medium opacity-70 hover:opacity-100 hover:text-[var(--primary)] text-[var(--text-main)] transition-all">Phones</button></li>
            <li><button onClick={() => onNavigate('shop', 'accessories')} className="text-[0.95rem] font-medium opacity-70 hover:opacity-100 hover:text-[var(--primary)] text-[var(--text-main)] transition-all">Accessories</button></li>
            <li><button onClick={() => onNavigate('repair')} className="text-[0.95rem] font-medium opacity-70 hover:opacity-100 hover:text-[var(--primary)] text-[var(--text-main)] transition-all">Repairs</button></li>
          </ul>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-6">
             {/* Cart Icon Button */}
             <button 
                onClick={toggleCart}
                className="relative text-[var(--text-main)] hover:text-[var(--primary)] transition-colors p-1"
                title="Cart"
             >
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[var(--primary)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg border border-[var(--bg-body)]">
                    {cartCount}
                  </span>
                )}
             </button>

             {user ? (
               <div className="flex items-center gap-3 border-l border-[var(--border)] pl-6">
                 <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-[var(--text-main)]">{user.name}</span>
                 </div>
                 {user.role !== UserRole.CUSTOMER && (
                   <button 
                    onClick={() => onNavigate(user.role === UserRole.SUPER_ADMIN ? 'super-admin' : 'admin')} 
                    className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors" 
                    title="Dashboard"
                   >
                      <LayoutDashboard size={22} />
                   </button>
                 )}
                 <button onClick={onLogout} className="text-[var(--text-muted)] hover:text-red-500 transition-colors" title="Logout">
                   <LogOut size={22} />
                 </button>
               </div>
             ) : (
               <button 
                onClick={() => onNavigate('login')} 
                className="btn btn-primary btn-sm px-6 py-2.5 shadow-lg shadow-indigo-500/20"
               >
                 Sign In
               </button>
             )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
             <button 
                onClick={toggleCart}
                className="relative text-[var(--text-main)]"
             >
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[var(--primary)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
             </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-[var(--text-main)] p-2">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[var(--bg-card)] border-b border-[var(--border)] animate-in slide-in-from-top-5">
          <div className="px-4 py-4 space-y-2">
            <button onClick={() => { onNavigate('home'); setIsMenuOpen(false); }} className="block w-full text-left py-3 text-[var(--text-main)] font-medium border-b border-[var(--border)]">Home</button>
            <button onClick={() => { onNavigate('about'); setIsMenuOpen(false); }} className="block w-full text-left py-3 text-[var(--text-main)] font-medium border-b border-[var(--border)]">About</button>
            <button onClick={() => { onNavigate('shop', 'phones'); setIsMenuOpen(false); }} className="block w-full text-left py-3 text-[var(--text-main)] font-medium border-b border-[var(--border)]">Phones</button>
            <button onClick={() => { onNavigate('shop', 'accessories'); setIsMenuOpen(false); }} className="block w-full text-left py-3 text-[var(--text-main)] font-medium border-b border-[var(--border)]">Accessories</button>
            <button onClick={() => { onNavigate('repair'); setIsMenuOpen(false); }} className="block w-full text-left py-3 text-[var(--text-main)] font-medium border-b border-[var(--border)]">Repairs</button>
            
            <div className="pt-6 flex flex-col gap-4">
                {user ? (
                   <>
                    {(user.role === UserRole.SHOP_ADMIN || user.role === UserRole.SUPER_ADMIN) && (
                        <button 
                            onClick={() => { onNavigate(user.role === UserRole.SUPER_ADMIN ? 'super-admin' : 'admin'); setIsMenuOpen(false); }} 
                            className="btn btn-outline w-full"
                        >
                            Dashboard
                        </button>
                    )}
                    <button onClick={onLogout} className="text-red-500 font-medium py-2 text-center border-t border-[var(--border)] mt-2">Logout</button>
                   </>
                ) : (
                    <button onClick={() => { onNavigate('login'); setIsMenuOpen(false); }} className="btn btn-primary w-full">Sign In</button>
                )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
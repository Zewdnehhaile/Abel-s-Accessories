
import React, { useState } from 'react';
import { login } from '../services/authService';
import { User } from '../types';
import { Lock, Mail, Loader, ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Fix: Pass both email and password to the login service to correctly authenticate the user.
      const user = await login(email, password);
      onLogin(user);
    } catch (err) {
      setError('Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-body)] px-4 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
      </div>

      <button onClick={onBack} className="absolute top-6 left-6 text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-2 transition-colors z-20 focus:outline-none">
        <ArrowLeft size={20} /> Back to Home
      </button>

      <div className="max-w-md w-full bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border)] p-8 md:p-10 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-body)] border border-[var(--border)] text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-6">
            Secure Sign In
          </div>
          <div className="w-20 h-20 bg-[var(--bg-body)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl ring-1 ring-[var(--border)] overflow-hidden">
             {/* Custom Logo Graphic */}
             <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                   <linearGradient id="logoGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                   </linearGradient>
                </defs>
                 <path d="M50 15L15 85H30L50 45L70 85H85L50 15Z" fill="url(#logoGradient)" />
                 <path d="M25 65H75" stroke="url(#logoGradient)" strokeWidth="6" strokeLinecap="round" />
                 
                 {/* B part sharing the same gradient style */}
                 <path d="M70 15 V85" stroke="url(#logoGradient)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                 <path d="M70 15 H85 C95 15 95 45 85 45 H70" stroke="url(#logoGradient)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                 <path d="M70 45 H85 C95 45 95 85 85 85 H70" stroke="url(#logoGradient)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
          </div>
          <h2 className="text-3xl font-bold text-[var(--text-main)] mb-2">Welcome Back</h2>
          <p className="text-[var(--text-muted)]">Sign in to manage Abel Accessories Sales</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--bg-body)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-3.5 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all placeholder:text-[var(--text-muted)]"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Password</label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors z-10 pointer-events-none">
                 <Lock size={18} />
              </div>
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--bg-body)] border border-[var(--border)] rounded-xl pl-10 pr-12 py-3.5 text-black focus:outline-none focus:border-[var(--primary)] transition-all placeholder:text-[var(--text-muted)]"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--primary)] focus:outline-none p-1 transition-colors z-20"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[var(--primary)] hover:brightness-110 text-white font-bold py-4 rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg mt-4"
          >
            {loading ? <Loader className="animate-spin" size={20} /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;


import React, { useEffect, useState } from 'react';
import { login, requestPasswordReset, resetPassword } from '../services/authService';
import { User } from '../types';
import { Lock, Mail, Loader, ArrowLeft, Eye, EyeOff, X } from 'lucide-react';

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
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetStep, setResetStep] = useState<'request' | 'reset'>('request');
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetTokenLocked, setResetTokenLocked] = useState(false);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetStatus, setResetStatus] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('resetToken');
    if (token) {
      setIsResetOpen(true);
      setResetStep('reset');
      setResetToken(token);
      setResetTokenLocked(true);
      setResetStatus('Enter a new password to complete the reset.');
      params.delete('resetToken');
      const newUrl = `${window.location.pathname}`;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  const openResetModal = () => {
    setIsResetOpen(true);
    setResetStep('request');
    setResetEmail(email);
    setResetToken('');
    setResetTokenLocked(false);
    setResetNewPassword('');
    setResetConfirmPassword('');
    setResetStatus('');
    setResetError('');
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetStatus('');
    try {
      const data = await requestPasswordReset(resetEmail);
      setResetStatus(data.message || 'Password reset email sent. Check your inbox.');
    } catch (err: any) {
      setResetError(err?.message || 'Failed to request password reset.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetStatus('');
    if (!resetToken.trim()) {
      setResetError('Reset token is required.');
      setResetLoading(false);
      return;
    }
    if (!resetNewPassword.trim()) {
      setResetError('New password is required.');
      setResetLoading(false);
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('Passwords do not match.');
      setResetLoading(false);
      return;
    }
    try {
      const data = await resetPassword(resetToken.trim(), resetNewPassword);
      setResetStatus(data.message || 'Password reset successful. You can sign in now.');
      setResetStep('request');
    } catch (err: any) {
      setResetError(err?.message || 'Failed to reset password.');
    } finally {
      setResetLoading(false);
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
                className="w-full bg-[var(--bg-body)] border border-[var(--border)] rounded-xl pl-10 pr-12 py-3.5 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all placeholder:text-[var(--text-muted)]"
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

          <div className="flex justify-end">
            <button
              type="button"
              onClick={openResetModal}
              className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
            >
              Forgot password?
            </button>
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

      {isResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[var(--text-main)]">Reset Password</h3>
              <button onClick={() => setIsResetOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                <X size={18} />
              </button>
            </div>

            {resetStatus && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-lg p-3 mb-4">
                {resetStatus}
              </div>
            )}
            {resetError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg p-3 mb-4">
                {resetError}
              </div>
            )}

            {resetStep === 'request' ? (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full bg-[var(--bg-body)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="you@example.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full btn btn-primary py-3"
                >
                  {resetLoading ? 'Sending...' : 'Send Reset Email'}
                </button>
                <button
                  type="button"
                  onClick={() => setResetStep('reset')}
                  className="w-full btn btn-outline py-3"
                >
                  I already have a reset token
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {!resetTokenLocked && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Reset Token</label>
                    <input
                      type="text"
                      required
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      className="w-full bg-[var(--bg-body)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                      placeholder="Paste token here"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">New Password</label>
                  <input
                    type="password"
                    required
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    className="w-full bg-[var(--bg-body)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="New password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    className="w-full bg-[var(--bg-body)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="Confirm password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full btn btn-primary py-3"
                >
                  {resetLoading ? 'Resetting...' : 'Reset Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setResetStep('request')}
                  className="w-full btn btn-outline py-3"
                >
                  Back
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

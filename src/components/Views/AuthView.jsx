import React, { useState, useEffect } from 'react';
import { IndianRupee, User, UserCheck, KeyRound, ShieldAlert, ArrowRight, Mail, Calendar, CheckCircle2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthView = () => {
  const [viewMode, setViewMode] = useState('login'); // 'login', 'register', 'forgot', 'reset'
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmRegisterPassword, setConfirmRegisterPassword] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmRegisterPassword, setShowConfirmRegisterPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [successMessage, setSuccessMessage] = useState(null);

  const { login, register, forgotPassword, resetPassword, loading, authError, setAuthError } = useAuth();

  // Check URL params for reset token on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('resetToken');
    if (tokenParam) {
      setResetToken(tokenParam);
      setViewMode('reset');
    }
  }, []);

  const clearState = () => {
    setAuthError(null);
    setSuccessMessage(null);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    clearState();
    if (!username || !password) {
      setAuthError('Please enter your Gmail / Username and Password.');
      return;
    }
    await login(username, password);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    clearState();
    if (!email || !name || !username || !password || !confirmRegisterPassword) {
      setAuthError('Please fill in Gmail/Email, Full Name, Username, Password, and Confirm Password.');
      return;
    }
    if (password !== confirmRegisterPassword) {
      setAuthError('Passwords do not match. Please re-enter your confirm password.');
      return;
    }
    const res = await register({ email, username, password, name, dob });
    if (res.success && res.message) {
      setSuccessMessage(res.message);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    clearState();
    if (!email) {
      setAuthError('Please enter your registered Gmail/Email.');
      return;
    }
    const res = await forgotPassword(email);
    if (res.success) {
      setSuccessMessage(res.message);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    clearState();
    if (!newPassword) {
      setAuthError('Please enter your new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setAuthError('Passwords do not match. Please re-enter.');
      return;
    }
    const res = await resetPassword(resetToken, newPassword);
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        setViewMode('login');
        clearState();
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-900 text-slate-100 select-none">
      <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative background blur elements */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/25 mb-4 font-extrabold">
            <IndianRupee className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Rupee<span className="text-emerald-400">Track</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
            {viewMode === 'login' && 'Log in to access your personal financial data'}
            {viewMode === 'register' && 'Sign up with Gmail to track your finance'}
            {viewMode === 'forgot' && 'Reset your account password via Gmail'}
            {viewMode === 'reset' && 'Enter your new password below'}
          </p>
        </div>

        {/* Error Alert */}
        {authError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {viewMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Gmail / Username or User ID
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. rahul@gmail.com or rahul99"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('forgot');
                    clearState();
                  }}
                  className="text-xs font-medium text-emerald-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Log In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setViewMode('register');
                  clearState();
                }}
                className="text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
              >
                Don't have an account? Sign Up
              </button>
            </div>
          </form>
        )}

        {/* 2. REGISTER / SIGN UP FORM */}
        {viewMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Gmail / Email Address *
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="e.g. rahul@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Full Name *
              </label>
              <div className="relative">
                <UserCheck className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Username *
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. rahul99"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Date of Birth (DOB)
              </label>
              <div className="relative">
                <Calendar className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password *
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirmRegisterPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmRegisterPassword}
                  onChange={(e) => setConfirmRegisterPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmRegisterPassword(!showConfirmRegisterPassword)}
                  aria-label={showConfirmRegisterPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showConfirmRegisterPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account & Send Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setViewMode('login');
                  clearState();
                }}
                className="text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
              >
                Already have an account? Log In
              </button>
            </div>
          </form>
        )}

        {/* 3. FORGOT PASSWORD FORM */}
        {viewMode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Registered Gmail / Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="e.g. rahul@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send Reset Link to Gmail</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setViewMode('login');
                  clearState();
                }}
                className="text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
              >
                Back to Log In
              </button>
            </div>
          </form>
        )}

        {/* 4. RESET PASSWORD FORM */}
        {viewMode === 'reset' && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Reset Token
              </label>
              <div className="relative">
                <RefreshCw className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter or paste reset token"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Update Password & Log In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setViewMode('login');
                  clearState();
                }}
                className="text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
              >
                Back to Log In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

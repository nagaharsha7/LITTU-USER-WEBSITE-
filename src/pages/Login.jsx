import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect target after login
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      await login(email, password, rememberMe);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!resetEmail) {
      alert("Please enter your email address first.");
      return;
    }

    try {
      await resetPassword(resetEmail);
      setResetSent(true);
      setTimeout(() => {
        setShowResetModal(false);
        setResetSent(false);
        setResetEmail('');
      }, 3000);
    } catch (err) {
      alert(err.message || "Failed to send reset link.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden animate-fade-in">
      
      {/* Background design elements */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-md w-full space-y-8 bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-lg relative z-10">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white shadow-md shadow-emerald-500/10 flex items-center justify-center">
            <Stethoscope size={24} />
          </div>
          <h2 className="mt-6 text-2xl font-extrabold text-slate-800">
            Welcome Back
          </h2>
          <p className="mt-1.5 text-xs font-semibold text-slate-400">
            Access your orders, prescriptions, and health hub
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-start gap-2.5 text-left text-xs font-semibold animate-fade-in">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Email Field */}
            <div className="text-left">
              <label htmlFor="login-email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-700 bg-white placeholder-slate-300 transition-all text-sm font-medium"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                  <Mail size={16} />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="text-left">
              <label htmlFor="login-password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-700 bg-white placeholder-slate-300 transition-all text-sm font-medium"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                  <Lock size={16} />
                </div>
              </div>
            </div>

          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between text-xs font-bold select-none">
            <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
              <input
                id="login-remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4.5 w-4.5 text-primary focus:ring-primary border-slate-200 rounded-md cursor-pointer accent-primary"
              />
              <span>Remember Me</span>
            </label>

            <button
              id="login-forgot-password"
              type="button"
              onClick={() => setShowResetModal(true)}
              className="text-primary hover:text-primary/95 transition-colors cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Trigger */}
          <button
            id="login-submit-button"
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-primary/95 text-white py-3 px-4 rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:shadow-emerald-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <p className="mt-8 text-center text-xs font-bold text-slate-400">
          New to Littu Medicals?{' '}
          <Link to="/register" className="text-primary hover:text-primary/90 transition-colors">
            Create an account
          </Link>
        </p>

      </div>

      {/* Forgot Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 max-w-sm w-full shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-800 text-left">Reset Password</h3>
            <p className="text-xs text-slate-400 font-medium text-left mt-1">
              Enter your registered email address and we'll send a password recovery link.
            </p>
            
            {resetSent ? (
              <div className="my-6 bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-2xl flex items-start gap-2.5 text-left text-xs font-semibold">
                <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>Verification link sent! Check your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="mt-5 space-y-4">
                <div className="text-left">
                  <input
                    id="reset-password-email"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-700 text-sm font-medium"
                  />
                </div>
                <div className="flex gap-2.5 pt-2 font-bold text-xs">
                  <button
                    id="cancel-reset-button"
                    type="button"
                    onClick={() => { setShowResetModal(false); setResetEmail(''); }}
                    className="flex-1 py-2.5 text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    id="send-reset-button"
                    type="submit"
                    className="flex-1 py-2.5 text-white bg-primary hover:bg-primary/95 rounded-xl"
                  >
                    Send Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;

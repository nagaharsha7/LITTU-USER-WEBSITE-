import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, User, Phone, Mail, Lock, AlertCircle, ShieldCheck } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [verificationPending, setVerificationPending] = useState(false);

  const { register, verifyEmailMock, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Client-side validations
    if (!name.trim()) return setErrorMsg("Full Name is required");
    if (!/^[6-9]\d{9}$/.test(phone)) return setErrorMsg("Enter a valid 10-digit mobile number starting with 6-9");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErrorMsg("Enter a valid email address");
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/.test(password)) {
      return setErrorMsg("Password must be at least 6 characters long and contain both letters and numbers");
    }
    if (password !== confirmPassword) return setErrorMsg("Passwords do not match");
    if (!termsAccepted) return setErrorMsg("You must accept the Terms and Conditions to proceed");

    setSubmitting(true);
    try {
      await register(name, phone, email, password);
      setVerificationPending(true);
    } catch (err) {
      setErrorMsg(err.message || "Registration failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyEmail = async () => {
    setSubmitting(true);
    try {
      await verifyEmailMock();
      navigate('/', { replace: true });
    } catch (err) {
      setErrorMsg("Failed to verify. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (verificationPending || (currentUser && !currentUser.emailVerified)) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative animate-fade-in">
        <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-lg text-center space-y-6">
          <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 text-primary flex items-center justify-center border border-emerald-100 animate-bounce">
            <Mail size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800">Verify Your Email</h2>
          <p className="text-xs font-semibold text-slate-400 max-w-sm mx-auto leading-relaxed">
            We have sent a verification code to <span className="text-slate-700 font-bold">{email || currentUser?.email}</span>. Click below to verify your email and activate your account.
          </p>

          <button
            id="mock-verify-email-button"
            onClick={handleVerifyEmail}
            disabled={submitting}
            className="w-full bg-primary hover:bg-primary/95 text-white py-3 px-4 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>Verify Email Address</span>
              </>
            )}
          </button>

          <p className="text-xs font-semibold text-slate-400">
            Didn't receive email?{' '}
            <button 
              id="resend-verification-button"
              type="button" 
              onClick={() => alert("Verification link resent!")} 
              className="text-primary hover:underline font-bold"
            >
              Resend Link
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden animate-fade-in">
      
      {/* Background circles */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-md w-full space-y-6 bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-lg relative z-10">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white shadow-md shadow-emerald-500/10 flex items-center justify-center">
            <Stethoscope size={24} />
          </div>
          <h2 className="mt-5 text-2xl font-extrabold text-slate-800">
            Create Account
          </h2>
          <p className="mt-1.5 text-xs font-semibold text-slate-400">
            Join Littu Medicals for fast ordering and tracking
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-start gap-2.5 text-left text-xs font-semibold animate-fade-in">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form className="space-y-4 text-left" onSubmit={handleSubmit}>
          
          {/* Full Name */}
          <div>
            <label htmlFor="reg-name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">
              Full Name
            </label>
            <div className="relative">
              <input
                id="reg-name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-700 bg-white placeholder-slate-300 transition-all text-sm font-medium"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                <User size={16} />
              </div>
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label htmlFor="reg-phone" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">
              Mobile Number
            </label>
            <div className="relative">
              <input
                id="reg-phone"
                name="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-700 bg-white placeholder-slate-300 transition-all text-sm font-medium"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                <Phone size={16} />
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="reg-email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">
              Email Address
            </label>
            <div className="relative">
              <input
                id="reg-email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-700 bg-white placeholder-slate-300 transition-all text-sm font-medium"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                <Mail size={16} />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="reg-password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">
              Password
            </label>
            <div className="relative">
              <input
                id="reg-password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 chars, alphanumeric"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-700 bg-white placeholder-slate-300 transition-all text-sm font-medium"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                <Lock size={16} />
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="reg-confirm-password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="reg-confirm-password"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type password"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-700 bg-white placeholder-slate-300 transition-all text-sm font-medium"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                <Lock size={16} />
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-center gap-2 text-xs font-bold select-none pt-1">
            <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
              <input
                id="reg-terms-accepted"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="h-4.5 w-4.5 text-primary focus:ring-primary border-slate-200 rounded-md cursor-pointer accent-primary"
              />
              <span>I accept the <a href="#" onClick={(e) => {e.preventDefault(); alert("Mock terms: Order safely and responsibly.");}} className="text-primary hover:underline">Terms & Conditions</a></span>
            </label>
          </div>

          {/* Register Button */}
          <button
            id="register-submit-button"
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-primary/95 text-white py-3 px-4 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Create Account</span>
            )}
          </button>

        </form>

        {/* Footer Navigation */}
        <p className="text-center text-xs font-bold text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary/90 transition-colors font-bold">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;

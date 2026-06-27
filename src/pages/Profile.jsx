import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { 
  User, Mail, Phone, Lock, CheckCircle2, AlertCircle, 
  TrendingUp, BarChart3, ShoppingBag, Receipt 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend 
} from 'recharts';

// Mock charts data for analytics
const SPEND_TREND_DATA = [
  { month: 'Jan', spend: 850, orders: 2 },
  { month: 'Feb', spend: 1200, orders: 3 },
  { month: 'Mar', spend: 450, orders: 1 },
  { month: 'Apr', spend: 2100, orders: 4 },
  { month: 'May', spend: 980, orders: 2 },
  { month: 'Jun', spend: 1450, orders: 3 }
];

const Profile = () => {
  const { currentUser, updateProfile, updatePasswordSecure } = useAuth();
  
  // Profile Form states
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Password Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passSubmitting, setPassSubmitting] = useState(false);

  // Status banners
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [ordersCount, setOrdersCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  // Load orders metrics
  useEffect(() => {
    const fetchOrdersMetrics = async () => {
      if (!currentUser) return;
      try {
        const list = await orderService.getOrders(currentUser.uid);
        setOrdersCount(list.length);
        const spent = list.reduce((acc, order) => acc + order.finalAmount, 0);
        setTotalSpent(spent);
      } catch (e) {
        console.error(e);
      }
    };
    fetchOrdersMetrics();
  }, [currentUser]);

  // Update Profile Form
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) return setErrorMsg("Full Name is required");
    if (!/^[6-9]\d{9}$/.test(phone)) return setErrorMsg("Enter a valid 10-digit mobile number");

    setProfileSubmitting(true);
    try {
      await updateProfile(name, phone);
      setSuccessMsg("Profile details updated successfully.");
      setProfileEditing(false);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update profile.");
    } finally {
      setProfileSubmitting(false);
    }
  };

  // Change Password Form
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPassword) return setErrorMsg("Current password is required");
    if (!newPassword) return setErrorMsg("New password is required");
    if (newPassword !== confirmNewPassword) return setErrorMsg("Confirm password does not match");
    if (newPassword.length < 6) return setErrorMsg("New password must be at least 6 characters");

    setPassSubmitting(true);
    try {
      await updatePasswordSecure(currentPassword, newPassword);
      setSuccessMsg("Password changed successfully.");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setErrorMsg(err.message || "Failed to change password. Confirm your current password.");
    } finally {
      setPassSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-left">
      <h1 className="text-2xl font-extrabold text-slate-800 mb-8 border-l-4 border-primary pl-3">My Profile</h1>

      {/* Notifications banner */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-start gap-2.5 text-xs font-semibold mb-6 animate-fade-in">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-2xl flex items-start gap-2.5 text-xs font-semibold mb-6 animate-fade-in">
          <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Profile Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        
        {/* User Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-500/10">
            {currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 truncate max-w-[160px]">{currentUser?.name}</h3>
            <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{currentUser?.email}</p>
          </div>
        </div>

        {/* Orders Placed Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-500 border border-indigo-100/50 flex items-center justify-center">
            <ShoppingBag size={20} />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Orders Placed</span>
            <span className="text-lg font-black text-slate-800 mt-0.5 inline-block">{ordersCount} orders</span>
          </div>
        </div>

        {/* Wellness Spend Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-primary border border-emerald-100/50 flex items-center justify-center">
            <Receipt size={20} />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Wellness Spend</span>
            <span className="text-lg font-black text-slate-800 mt-0.5 inline-block">₹{totalSpent.toFixed(2)}</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Profile and Password Form Panels */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Edit Profile Form */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-3 mb-5">
              Account Details
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="text-left">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">Full Name</label>
                <div className="relative">
                  <input
                    id="profile-name-input"
                    type="text"
                    required
                    disabled={!profileEditing}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs font-bold text-slate-700 bg-white disabled:bg-slate-50 disabled:text-slate-500"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                    <User size={15} />
                  </div>
                </div>
              </div>

              <div className="text-left">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">Mobile Number</label>
                <div className="relative">
                  <input
                    id="profile-phone-input"
                    type="tel"
                    required
                    disabled={!profileEditing}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs font-bold text-slate-700 bg-white disabled:bg-slate-50 disabled:text-slate-500"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                    <Phone size={15} />
                  </div>
                </div>
              </div>

              <div className="text-left">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">Registered Email</label>
                <div className="relative">
                  <input
                    id="profile-email-input"
                    type="email"
                    disabled
                    value={currentUser?.email || ''}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-400 bg-slate-50"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                    <Mail size={15} />
                  </div>
                </div>
              </div>

              <div className="pt-2 font-bold text-xs">
                {profileEditing ? (
                  <div className="flex gap-2">
                    <button
                      id="cancel-profile-edit-button"
                      type="button"
                      onClick={() => { setProfileEditing(false); setName(currentUser.name); setPhone(currentUser.phone); }}
                      className="flex-1 py-2.5 text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      id="save-profile-edit-button"
                      type="submit"
                      disabled={profileSubmitting}
                      className="flex-1 py-2.5 text-white bg-primary hover:bg-primary/95 rounded-xl shadow-xs"
                    >
                      {profileSubmitting ? 'Saving...' : 'Save Info'}
                    </button>
                  </div>
                ) : (
                  <button
                    id="edit-profile-info-button"
                    type="button"
                    onClick={() => setProfileEditing(true)}
                    className="w-full py-2.5 text-center text-primary bg-emerald-50 hover:bg-emerald-100/50 border border-emerald-100 rounded-xl cursor-pointer"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-3 mb-5">
              Security Update
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="text-left">
                <input
                  id="profile-current-pass"
                  type="password"
                  required
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs font-bold text-slate-700 bg-white"
                />
              </div>

              <div className="text-left">
                <input
                  id="profile-new-pass"
                  type="password"
                  required
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs font-bold text-slate-700 bg-white"
                />
              </div>

              <div className="text-left">
                <input
                  id="profile-confirm-new-pass"
                  type="password"
                  required
                  placeholder="Confirm New Password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs font-bold text-slate-700 bg-white"
                />
              </div>

              <button
                id="update-password-submit-button"
                type="submit"
                disabled={passSubmitting}
                className="w-full py-2.5 text-center text-white bg-primary hover:bg-primary/95 rounded-xl font-bold text-xs shadow-xs cursor-pointer"
              >
                {passSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

        </div>

        {/* Analytics Charts Panel (Recharts Integration) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-6">
            
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 size={18} className="text-primary" />
                Healthcare Spend Analytics
              </h3>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                Simulated 6 Month View
              </span>
            </div>

            {/* Area Chart: Spending over months */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-1.5">
                <TrendingUp size={14} className="text-emerald-500" />
                Monthly Spending Trend (in INR)
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={SPEND_TREND_DATA}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                      formatter={(value) => [`₹${value}`, 'Amount Spent']}
                    />
                    <Area type="monotone" dataKey="spend" stroke="#16a34a" strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart: Orders count over months */}
            <div className="border-t border-slate-50 pt-6">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-1.5">
                <BarChart3 size={14} className="text-indigo-500" />
                Order Placements Volume
              </h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={SPEND_TREND_DATA}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                      formatter={(value) => [value, 'Orders placed']}
                    />
                    <Bar dataKey="orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default Profile;

import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import SearchBar from './SearchBar';
import { 
  Heart, 
  ShoppingBag, 
  User, 
  Menu, 
  X, 
  LogOut, 
  MapPin, 
  History, 
  Plus, 
  ChevronDown,
  Stethoscope
} from 'lucide-react';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { cartTotals, wishlistItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      setProfileDropdownOpen(false);
      setMobileMenuOpen(false);
      navigate('/');
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const toggleProfileDropdown = () => setProfileDropdownOpen(!profileDropdownOpen);
  const closeProfileDropdown = () => setProfileDropdownOpen(false);

  return (
    <header className="sticky top-0 bg-white border-b border-slate-100 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white shadow-md shadow-emerald-500/10 group-hover:scale-105 transition-transform duration-300">
              <Stethoscope size={24} />
            </div>
            <div className="text-left hidden xs:block">
              <span className="block text-base font-extrabold text-slate-800 tracking-tight leading-none">Littu</span>
              <span className="text-[10px] font-bold text-primary tracking-wider uppercase">Medical Store</span>
            </div>
          </Link>

          {/* Search bar inside header (hidden on small mobile) */}
          <div className="hidden md:block flex-1 max-w-lg mx-4">
            <SearchBar />
          </div>

          {/* Navigation Items */}
          <nav className="hidden lg:flex items-center gap-6">
            <NavLink to="/" className={({ isActive }) => `text-sm font-bold transition-colors ${isActive ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}>
              Home
            </NavLink>
            <NavLink to="/products" className={({ isActive }) => `text-sm font-bold transition-colors ${isActive ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}>
              Medicines
            </NavLink>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="relative p-2.5 text-slate-500 hover:text-rose-500 hover:bg-slate-50 rounded-xl transition-all"
            >
              <Heart size={20} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white animate-fade-in shadow-sm">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Shopping Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2.5 text-slate-500 hover:text-primary hover:bg-slate-50 rounded-xl transition-all"
            >
              <ShoppingBag size={20} />
              {cartTotals.totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white animate-fade-in shadow-sm">
                  {cartTotals.totalItems}
                </span>
              )}
            </Link>

            {/* Authentication Portal */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center gap-2 py-1.5 pl-2.5 pr-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl transition-colors cursor-pointer"
                >
                  <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-primary/20 to-secondary/20 text-primary flex items-center justify-center font-bold text-xs border border-primary/10">
                    {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:block text-xs font-bold text-slate-700 truncate max-w-[80px]">
                    {currentUser.name?.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={closeProfileDropdown}></div>
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 py-2 divide-y divide-slate-50 overflow-hidden animate-fade-in">
                      <div className="px-4 py-2.5 text-left">
                        <p className="text-xs font-semibold text-slate-400">Signed in as</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{currentUser.name}</p>
                      </div>
                      
                      <div className="py-1">
                        <Link to="/profile" onClick={closeProfileDropdown} className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                          <User size={14} />
                          My Profile
                        </Link>
                        <Link to="/orders" onClick={closeProfileDropdown} className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                          <History size={14} />
                          My Orders
                        </Link>
                        <Link to="/addresses" onClick={closeProfileDropdown} className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                          <MapPin size={14} />
                          Addresses
                        </Link>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary/95 rounded-xl transition-all hover:shadow-md shadow-emerald-500/5"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 text-slate-500 hover:text-primary hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-4 animate-fade-in">
          {/* Mobile search bar */}
          <div className="md:hidden">
            <SearchBar />
          </div>

          <div className="flex flex-col gap-2">
            <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `px-4 py-2.5 rounded-xl text-sm font-bold ${isActive ? 'bg-emerald-50 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}>
              Home
            </NavLink>
            <NavLink to="/products" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `px-4 py-2.5 rounded-xl text-sm font-bold ${isActive ? 'bg-emerald-50 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}>
              Browse Medicines
            </NavLink>
            
            {currentUser && (
              <>
                <NavLink to="/profile" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `px-4 py-2.5 rounded-xl text-sm font-bold ${isActive ? 'bg-emerald-50 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}>
                  My Profile
                </NavLink>
                <NavLink to="/orders" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `px-4 py-2.5 rounded-xl text-sm font-bold ${isActive ? 'bg-emerald-50 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}>
                  My Orders
                </NavLink>
                <NavLink to="/addresses" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `px-4 py-2.5 rounded-xl text-sm font-bold ${isActive ? 'bg-emerald-50 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}>
                  Manage Addresses
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all w-full text-left cursor-pointer"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </>
            )}

            {!currentUser && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-xs font-bold text-white bg-primary hover:bg-primary/95 rounded-xl shadow-xs"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

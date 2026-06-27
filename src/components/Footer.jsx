import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      
      {/* Primary Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="flex flex-col gap-4 text-left">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white shadow-md">
                <Stethoscope size={22} />
              </div>
              <div>
                <span className="block text-base font-extrabold text-white tracking-tight">Littu</span>
                <span className="block text-[10px] font-bold text-primary tracking-wider uppercase leading-none">Medical Store</span>
              </div>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400 mt-2">
              Littu Medical Store is your trusted health partner. Order prescription medicines, OTC drugs, health products, baby essentials, and diagnostics accessories online from the comfort of your home.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-3 py-1.5 rounded-xl w-fit">
              <ShieldCheck size={16} />
              100% Genuine Medicines Guaranteed
            </div>
          </div>

          {/* Quick Shop Links */}
          <div className="text-left">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-primary pl-2">
              Shop Categories
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link to="/products?category=Tablets" className="hover:text-primary transition-colors">Tablets & Capsules</Link>
              </li>
              <li>
                <Link to="/products?category=Syrups" className="hover:text-primary transition-colors">Cough & Cold Syrups</Link>
              </li>
              <li>
                <Link to="/products?category=Diabetes%20Care" className="hover:text-primary transition-colors">Diabetes Care Essentials</Link>
              </li>
              <li>
                <Link to="/products?category=Baby%20Care" className="hover:text-primary transition-colors">Baby Care Range</Link>
              </li>
              <li>
                <Link to="/products?category=Healthcare%20Devices" className="hover:text-primary transition-colors">Medical Devices</Link>
              </li>
            </ul>
          </div>

          {/* User Links */}
          <div className="text-left">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-primary pl-2">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link to="/profile" className="hover:text-primary transition-colors">My Profile</Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-primary transition-colors">Track Orders</Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-primary transition-colors">My Wishlist</Link>
              </li>
              <li>
                <Link to="/addresses" className="hover:text-primary transition-colors">Manage Addresses</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-primary transition-colors">Shopping Cart</Link>
              </li>
            </ul>
          </div>

          {/* Support / Contact details */}
          <div className="text-left space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-primary pl-2">
              Customer Support
            </h4>
            <ul className="space-y-3.5 text-xs">
              <li className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-800 text-primary">
                  <Phone size={14} />
                </div>
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-800 text-primary">
                  <Mail size={14} />
                </div>
                <span className="truncate">support@littumedicals.com</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-800 text-primary mt-0.5">
                  <MapPin size={14} />
                </div>
                <span className="leading-normal">
                  Littu Plaza, Main Road, Sector 4, Hyderabad, Telangana - 500001
                </span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Legal & Copyright Section */}
      <div className="bg-slate-950 text-slate-500 py-6 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-center sm:text-left">
          <p>© 2026 Littu Medicals. All rights reserved.</p>
          <p className="flex items-center gap-1.5 justify-center">
            Designed with <Heart size={12} className="text-rose-500 fill-rose-500" /> for your wellness and safety.
          </p>
        </div>
      </div>

    </footer>
  );
};

export default Footer;

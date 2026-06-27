import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Tablet, 
  Layers, 
  FlaskConical, 
  Syringe, 
  Activity, 
  Baby, 
  Sparkles, 
  Smile, 
  ShieldAlert, 
  HeartPulse 
} from 'lucide-react';

// Color themes and icons for each category
const categoryMetadata = {
  'Tablets': { icon: Tablet, bg: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100/50' },
  'Capsules': { icon: Layers, bg: 'bg-sky-50 text-sky-600 border-sky-100 hover:bg-sky-100/50' },
  'Syrups': { icon: FlaskConical, bg: 'bg-violet-50 text-violet-600 border-violet-100 hover:bg-violet-100/50' },
  'Injection': { icon: Syringe, bg: 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100/50' },
  'Diabetes Care': { icon: Activity, bg: 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100/50' },
  'Baby Care': { icon: Baby, bg: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100/50' },
  'Skin Care': { icon: Sparkles, bg: 'bg-pink-50 text-pink-600 border-pink-100 hover:bg-pink-100/50' },
  'Personal Care': { icon: Smile, bg: 'bg-teal-50 text-teal-600 border-teal-100 hover:bg-teal-100/50' },
  'Vitamins': { icon: ShieldAlert, bg: 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100/50' },
  'Healthcare Devices': { icon: HeartPulse, bg: 'bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100/50' }
};

const CategoryCard = ({ category }) => {
  const navigate = useNavigate();
  const meta = categoryMetadata[category] || { icon: Tablet, bg: 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100/50' };
  const IconComponent = meta.icon;

  const handleClick = () => {
    navigate(`/products?category=${encodeURIComponent(category)}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`flex flex-col items-center justify-center p-5 rounded-2xl border cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${meta.bg}`}
    >
      <div className="p-3.5 rounded-full bg-white shadow-sm border border-slate-50/50 mb-3 group-hover:scale-110 transition-transform">
        <IconComponent size={24} className="stroke-[2px]" />
      </div>
      <h3 className="text-xs sm:text-sm font-bold text-slate-800 text-center select-none truncate w-full">
        {category}
      </h3>
    </div>
  );
};

export default CategoryCard;

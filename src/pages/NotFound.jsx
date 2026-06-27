import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, ArrowRight } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
      <div className="mx-auto h-16 w-16 rounded-3xl bg-gradient-to-tr from-primary to-secondary text-white shadow-lg flex items-center justify-center mb-6">
        <Stethoscope size={32} />
      </div>
      
      <h1 className="text-4xl sm:text-6xl font-black text-slate-800 tracking-tight mb-2">404</h1>
      <h2 className="text-lg font-bold text-slate-700 mb-3">Page Not Found</h2>
      <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto leading-relaxed mb-8">
        The healthcare details page or medicine link you are looking for has been moved, renamed, or is temporarily offline.
      </p>

      <Link
        to="/"
        className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
      >
        <span>Go back to Home</span>
        <ArrowRight size={14} />
      </Link>
    </div>
  );
};

export default NotFound;

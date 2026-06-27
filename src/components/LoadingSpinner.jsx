import React from 'react';

export const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const skeletons = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
        {skeletons.map((_, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse flex flex-col justify-between h-96 shadow-sm">
            <div>
              <div className="bg-slate-200 h-40 rounded-xl w-full mb-4"></div>
              <div className="bg-slate-200 h-4 rounded w-3/4 mb-2"></div>
              <div className="bg-slate-200 h-3 rounded w-1/2 mb-4"></div>
              <div className="flex gap-2 mb-4">
                <div className="bg-slate-200 h-5 rounded w-16"></div>
                <div className="bg-slate-200 h-5 rounded w-16"></div>
              </div>
            </div>
            <div className="flex justify-between items-center gap-2">
              <div className="bg-slate-200 h-8 rounded w-20"></div>
              <div className="bg-slate-200 h-8 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'product-details') {
    return (
      <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto py-8">
        <div className="bg-slate-200 rounded-2xl aspect-square w-full h-[400px]"></div>
        <div className="flex flex-col gap-4">
          <div className="bg-slate-200 h-8 rounded w-3/4"></div>
          <div className="bg-slate-200 h-4 rounded w-1/4"></div>
          <div className="bg-slate-200 h-6 rounded w-1/3 mt-2"></div>
          <div className="bg-slate-200 h-20 rounded w-full mt-4"></div>
          <div className="flex gap-4 mt-6">
            <div className="bg-slate-200 h-12 rounded-xl w-32"></div>
            <div className="bg-slate-200 h-12 rounded-xl w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="w-full flex flex-col gap-4">
        {skeletons.map((_, idx) => (
          <div key={idx} className="bg-white rounded-xl p-4 border border-slate-100 animate-pulse flex items-center gap-4 shadow-sm">
            <div className="bg-slate-200 h-16 w-16 rounded-lg flex-shrink-0"></div>
            <div className="flex-1">
              <div className="bg-slate-200 h-4 rounded w-1/3 mb-2"></div>
              <div className="bg-slate-200 h-3 rounded w-1/4"></div>
            </div>
            <div className="bg-slate-200 h-8 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  const colorClasses = {
    primary: 'border-primary border-t-transparent',
    secondary: 'border-secondary border-t-transparent',
    accent: 'border-accent border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  return (
    <div className="flex items-center justify-center p-2">
      <div
        className={`animate-spin rounded-full ${sizeClasses[size] || sizeClasses.md} ${colorClasses[color] || colorClasses.primary}`}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;

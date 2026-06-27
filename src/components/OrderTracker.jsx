import React from 'react';
import { Check, ClipboardList, Package, Truck, Compass, CheckCircle2 } from 'lucide-react';

const STATUS_STEPS = [
  { status: 'Order Placed', label: 'Order Placed', desc: 'We have received your order request.', icon: ClipboardList },
  { status: 'Processing', label: 'Processing', desc: 'Your prescription/order is being verified.', icon: CheckCircle2 },
  { status: 'Packed', label: 'Packed', desc: 'Your package has been prepared and sealed.', icon: Package },
  { status: 'Shipped', label: 'Shipped', desc: 'Package is in transit to the distribution facility.', icon: Truck },
  { status: 'Out For Delivery', label: 'Out For Delivery', desc: 'Our delivery partner is on the way.', icon: Compass },
  { status: 'Delivered', label: 'Delivered', desc: 'Delivered to your address.', icon: Check }
];

const OrderTracker = ({ currentStatus }) => {
  // Find current step index
  const currentIdx = STATUS_STEPS.findIndex(step => step.status.toLowerCase() === currentStatus.toLowerCase());

  return (
    <div className="w-full py-6">
      {/* Desktop Horizontal Tracker */}
      <div className="hidden md:flex items-center justify-between w-full relative">
        {STATUS_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx <= currentIdx;
          const isActive = idx === currentIdx;

          return (
            <React.Fragment key={step.status}>
              {/* Step bubble */}
              <div className="flex flex-col items-center flex-1 relative z-10">
                <div
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                    isCompleted
                      ? 'bg-primary border-primary text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-400'
                  } ${isActive ? 'ring-4 ring-emerald-500/20 scale-110' : ''}`}
                >
                  <Icon size={20} className={isActive ? "animate-pulse" : ""} />
                </div>
                
                <h5 className={`text-xs font-bold mt-3 ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                  {step.label}
                </h5>
                <p className="text-[10px] text-slate-400 text-center px-2 mt-1 leading-tight line-clamp-2 max-w-[120px]">
                  {step.desc}
                </p>
              </div>

              {/* Connecting Line */}
              {idx < STATUS_STEPS.length - 1 && (
                <div className="absolute h-0.5 bg-slate-100 left-0 right-0 top-6 -z-0">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{
                      width: `${(Math.min(currentIdx, idx + 1) / (STATUS_STEPS.length - 1)) * 100}%`
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile Vertical Tracker */}
      <div className="flex flex-col md:hidden gap-6 w-full pl-4 relative">
        {/* Continuous background connector line */}
        <div className="absolute left-[34px] top-6 bottom-6 w-0.5 bg-slate-100 -z-10">
          <div
            className="w-full bg-primary transition-all duration-500"
            style={{
              height: `${(Math.max(0, currentIdx) / (STATUS_STEPS.length - 1)) * 100}%`
            }}
          />
        </div>

        {STATUS_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx <= currentIdx;
          const isActive = idx === currentIdx;

          return (
            <div key={step.status} className="flex gap-4 items-start relative z-10">
              <div
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isCompleted
                    ? 'bg-primary border-primary text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-400'
                } ${isActive ? 'ring-4 ring-emerald-500/20 scale-105' : ''}`}
              >
                <Icon size={18} className={isActive ? "animate-pulse" : ""} />
              </div>
              <div className="text-left pt-1">
                <h5 className={`text-sm font-bold ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                  {step.label}
                </h5>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTracker;

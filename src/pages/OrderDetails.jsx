import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import OrderTracker from '../components/OrderTracker';
import { LoadingSkeleton } from '../components/LoadingSpinner';
import { ChevronLeft, Calendar, CreditCard, MapPin, Receipt, RefreshCw, Box } from 'lucide-react';

const OrderDetails = () => {
  const { orderId } = useParams();
  const { currentUser } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Custom manual simulation overrides for local mockup testing
  const [statusOverride, setStatusOverride] = useState('');

  const fetchOrderDetails = async () => {
    if (!currentUser) return;
    try {
      const details = await orderService.getOrderById(currentUser.uid, orderId);
      setOrder(details);
    } catch (e) {
      setErrorMsg("Failed to retrieve order details. Confirm the Order ID.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId, currentUser]);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status simulation advances
  const handleSimulateStatus = () => {
    const sequence = ['Order Placed', 'Processing', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered'];
    const current = statusOverride || (order ? orderService.getSimulatedOrderStatus(order) : 'Order Placed');
    const nextIdx = (sequence.indexOf(current) + 1) % sequence.length;
    setStatusOverride(sequence[nextIdx]);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <LoadingSkeleton type="product-details" />
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <h3 className="text-lg font-bold text-slate-800">Order Not Found</h3>
        <p className="text-xs text-slate-400 mt-2 font-medium">{errorMsg}</p>
        <Link to="/orders" className="mt-6 inline-block bg-primary text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs">
          Return to Orders List
        </Link>
      </div>
    );
  }

  // Active status calculation
  const activeStatus = statusOverride || orderService.getSimulatedOrderStatus(order);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-left">
      
      {/* Back button */}
      <Link to="/orders" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary mb-6 transition-colors">
        <ChevronLeft size={16} />
        Back to Order History
      </Link>

      {/* Header and status override simulator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-8">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase">Order Details</span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 mt-1">Order #{order.orderId}</h1>
        </div>

        {/* Simulator block for testing */}
        <div className="flex flex-col items-end gap-1">
          <button
            id="simulate-status-button"
            onClick={handleSimulateStatus}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/50 border border-emerald-100 text-[10px] font-black text-primary rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
          >
            <RefreshCw size={11} />
            <span>Simulate Progress</span>
          </button>
          <span className="text-[9px] text-slate-400 font-semibold italic">Cycles status to test stepper timeline</span>
        </div>
      </div>

      {/* 1. Stepper Timeline Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs mb-8">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-3 mb-6">Delivery Progress</h3>
        <OrderTracker currentStatus={activeStatus} />
      </div>

      {/* 2. Addresses & Payments Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Shipping Destination */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-3 mb-4 flex items-center gap-1.5">
              <MapPin size={14} className="text-primary" />
              Delivery Address
            </h3>
            <h4 className="text-sm font-bold text-slate-800 mb-1">{order.address.name}</h4>
            <p className="text-xs text-slate-500 leading-normal">{order.address.address}</p>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              {order.address.city}, {order.address.state} - {order.address.pincode}
            </p>
          </div>
          <div className="border-t border-slate-50 pt-3 mt-4 text-[10px] text-slate-400 font-semibold">
            Contact Number: +91 {order.address.phone}
          </div>
        </div>

        {/* Date and Payment Details */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-3 mb-4 flex items-center gap-1.5">
              <CreditCard size={14} className="text-primary" />
              Payment & Date
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-slate-300" />
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Placed On</span>
                  <span className="font-bold text-slate-700 mt-0.5 inline-block">{formatDate(order.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CreditCard size={16} className="text-slate-300" />
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Payment Mode</span>
                  <span className="font-bold text-slate-700 mt-0.5 inline-block">{order.paymentMethod}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-50 pt-3 mt-4 flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Transaction completed securely</span>
          </div>
        </div>

      </div>

      {/* 3. Items Summary list */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs mb-8">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-3 mb-4 flex items-center gap-1.5">
          <Box size={14} className="text-primary" />
          Items Summary
        </h3>

        <div className="divide-y divide-slate-50 space-y-4">
          {order.items.map((item) => (
            <div key={item.productId} className="flex justify-between items-center gap-4 py-3 first:pt-0">
              <div className="flex items-center gap-4 min-w-0">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-50 flex-shrink-0"
                  />
                )}
                <div className="min-w-0 text-left">
                  <p className="text-sm font-bold text-slate-800 truncate">{item.name}</p>
                  <p className="text-xs text-slate-400 font-medium">Qty: {item.quantity} x ₹{item.price}</p>
                </div>
              </div>
              <span className="text-sm font-extrabold text-slate-800">₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Billing summary breakdown */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs max-w-sm ml-auto">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-3 mb-4 flex items-center gap-1.5">
          <Receipt size={14} className="text-primary" />
          Receipt Bill Details
        </h3>

        <div className="space-y-3 font-semibold text-xs text-slate-500">
          <div className="flex justify-between">
            <span>Items Subtotal</span>
            <span>₹{order.amount.toFixed(2)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Promo Coupon Discount</span>
              <span>- ₹{order.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Delivery Charges</span>
            {order.deliveryCharges === 0 ? (
              <span className="text-emerald-600 font-bold">FREE</span>
            ) : (
              <span>₹{order.deliveryCharges.toFixed(2)}</span>
            )}
          </div>
          
          <div className="flex justify-between items-center text-sm font-black text-slate-800 border-t border-slate-50 pt-4 mt-2">
            <span>Total Paid Amount</span>
            <span className="text-base text-primary">₹{order.finalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default OrderDetails;

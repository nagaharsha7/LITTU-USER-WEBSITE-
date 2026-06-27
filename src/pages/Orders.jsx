import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { ClipboardList, ChevronRight, Clock, Box, ShieldAlert } from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSpinner';

const statusColors = {
  'Order Placed': 'bg-blue-50 text-blue-600 border-blue-100',
  'Processing': 'bg-amber-50 text-amber-600 border-amber-100',
  'Packed': 'bg-purple-50 text-purple-600 border-purple-100',
  'Shipped': 'bg-indigo-50 text-indigo-600 border-indigo-100',
  'Out For Delivery': 'bg-sky-50 text-sky-600 border-sky-100',
  'Delivered': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  'Cancelled': 'bg-rose-50 text-rose-600 border-rose-100'
};

const Orders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      if (!currentUser) return;
      try {
        const list = await orderService.getOrders(currentUser.uid);
        setOrders(list);
      } catch (e) {
        console.error("Order history fetch error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, [currentUser]);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-left">
      <h1 className="text-2xl font-extrabold text-slate-800 mb-8 border-l-4 border-primary pl-3">Order History</h1>

      {loading ? (
        <LoadingSkeleton type="list" count={3} />
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl p-8 shadow-xs max-w-md mx-auto">
          <ClipboardList size={48} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No Orders Found</h3>
          <p className="text-xs text-slate-400 mt-2 font-medium">You haven't placed any orders with us yet.</p>
          <Link to="/products" className="mt-6 inline-block bg-primary text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            // Apply simulated status time updating for local mockup test orders
            const displayStatus = order.orderId.startsWith('ORD-') && !order.createdAt.includes('firebase')
              ? orderService.getSimulatedOrderStatus(order)
              : order.status;

            const badgeStyle = statusColors[displayStatus] || 'bg-slate-50 text-slate-500 border-slate-100';

            return (
              <div 
                key={order.orderId}
                className="bg-white border border-slate-100 hover:border-slate-200 transition-all rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Details info */}
                <div className="text-left space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black text-slate-800">Order #{order.orderId}</span>
                    <span className={`text-[10px] font-bold border px-2.5 py-0.5 rounded-full ${badgeStyle}`}>
                      {displayStatus}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} />
                      {formatDate(order.createdAt)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Box size={13} />
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {/* Items preview text */}
                  <p className="text-xs text-slate-500 font-medium truncate max-w-sm sm:max-w-md mt-1">
                    {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                  </p>
                </div>

                {/* Amount and Link */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-slate-50 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-bold text-slate-400 block">Total Amount</span>
                    <span className="text-sm font-black text-slate-800">₹{order.finalAmount.toFixed(2)}</span>
                  </div>

                  <Link
                    to={`/order/${order.orderId}`}
                    className="flex items-center gap-1 py-2 pl-3 pr-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 hover:border-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all"
                  >
                    <span>Track Order</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Orders;

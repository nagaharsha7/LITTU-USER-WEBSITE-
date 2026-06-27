import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import { ArrowRight, Tag, X, ShoppingBag, Percent, ShieldCheck } from 'lucide-react';

const Cart = () => {
  const { cartItems, cartTotals, couponCode, applyCoupon, removeCoupon } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(false);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess(false);
    if (!couponInput.trim()) return;

    try {
      applyCoupon(couponInput);
      setCouponSuccess(true);
      setCouponInput('');
    } catch (err) {
      setCouponError(err.message || "Invalid coupon code.");
    }
  };

  const handleQuickApply = (code) => {
    setCouponError('');
    setCouponSuccess(false);
    try {
      applyCoupon(code);
      setCouponSuccess(true);
    } catch (err) {
      setCouponError(err.message);
    }
  };

  const isCartEmpty = cartItems.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-left">
      <h1 className="text-2xl font-extrabold text-slate-800 mb-8 border-l-4 border-primary pl-3">Shopping Cart</h1>

      {isCartEmpty ? (
        <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl p-8 max-w-lg mx-auto shadow-xs">
          <div className="text-slate-300 mb-4 flex justify-center">
            <ShoppingBag size={64} className="stroke-[1.5px]" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Your Cart is Empty</h3>
          <p className="text-xs text-slate-400 mt-2 font-medium">Add prescription medicines, wellness essentials, or baby care items to get started.</p>
          <Link to="/products" className="mt-6 inline-flex items-center gap-1.5 bg-primary text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all">
            Browse Medicines <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-100 rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3 mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Items in Cart ({cartTotals.totalItems})</span>
                <span className="text-xs font-bold text-slate-500">Prices are inclusive of all taxes</span>
              </div>
              <div className="divide-y divide-slate-50 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.productId} className="pt-4 first:pt-0">
                    <CartItem item={item} />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Coupons List */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Percent size={14} className="text-primary" />
                Available Coupons
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { code: 'LITTU10', desc: '10% OFF on orders > ₹200' },
                  { code: 'MED20', desc: '20% OFF on orders > ₹500' },
                  { code: 'FREESHIP', desc: 'Free Shipping on orders > ₹300' }
                ].map(cp => (
                  <button
                    key={cp.code}
                    onClick={() => handleQuickApply(cp.code)}
                    disabled={couponCode === cp.code}
                    className={`flex flex-col items-start p-3 border rounded-2xl text-left transition-all cursor-pointer ${
                      couponCode === cp.code
                        ? 'border-primary bg-emerald-50/20 opacity-60 cursor-default'
                        : 'border-slate-200 hover:border-primary hover:bg-slate-50/50'
                    }`}
                  >
                    <span className="text-xs font-bold text-primary">{cp.code}</span>
                    <span className="text-[10px] text-slate-400 font-semibold mt-1">{cp.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Summary Sidepanel */}
          <div className="space-y-6">
            
            {/* Promo Code Input Card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3">Apply Coupon</h4>
              {couponCode ? (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-3.5 rounded-2xl flex items-center justify-between font-bold text-xs">
                  <div className="flex items-center gap-2">
                    <Percent size={18} />
                    <span>Coupon "{couponCode}" Applied!</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="p-1 text-emerald-700 hover:bg-emerald-100/50 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    id="coupon-code-input"
                    type="text"
                    placeholder="ENTER COUPON"
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value); setCouponError(''); }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs font-bold uppercase tracking-wider text-slate-700 bg-white"
                  />
                  <button
                    id="apply-coupon-button"
                    type="submit"
                    className="px-4 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-[10px] text-rose-500 font-bold mt-2 pl-1">{couponError}</p>}
              {couponSuccess && !couponCode && <p className="text-[10px] text-emerald-500 font-bold mt-2 pl-1">Coupon applied successfully!</p>}
            </div>

            {/* Total Pricing Calculations Summary */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider border-b border-slate-50 pb-3 mb-1">Bill Details</h4>
              
              <div className="space-y-3 font-semibold text-xs text-slate-500">
                
                {/* Total MRP */}
                <div className="flex justify-between">
                  <span>Total MRP (Items Price)</span>
                  <span>₹{cartTotals.mrpTotal.toFixed(2)}</span>
                </div>

                {/* Pharmacy Discounts */}
                <div className="flex justify-between text-emerald-600">
                  <span>Product Savings / Discount</span>
                  <span>- ₹{cartTotals.savings.toFixed(2)}</span>
                </div>

                {/* Delivery fee */}
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  {cartTotals.deliveryCharges === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    <span>₹{cartTotals.deliveryCharges.toFixed(2)}</span>
                  )}
                </div>

                {/* Promo Code Discounts */}
                {cartTotals.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Promo Coupon Discount</span>
                    <span>- ₹{cartTotals.discount.toFixed(2)}</span>
                  </div>
                )}

                {/* Net Savings Callout */}
                <div className="bg-emerald-50 text-emerald-700 p-3 rounded-2xl border border-emerald-100/50 flex justify-between font-bold mt-2">
                  <span>Total Savings on Order</span>
                  <span>₹{(cartTotals.savings + cartTotals.discount).toFixed(2)}</span>
                </div>

                {/* Final amount */}
                <div className="flex justify-between items-center text-sm font-black text-slate-800 border-t border-slate-50 pt-4 mt-2">
                  <span>Amount to Pay</span>
                  <span className="text-base">₹{cartTotals.finalAmount.toFixed(2)}</span>
                </div>

              </div>

              {/* Secure Checkout Warning */}
              <div className="flex items-start gap-2 bg-slate-50 text-[10px] text-slate-400 font-semibold p-3 rounded-2xl mt-2 border border-slate-100">
                <ShieldCheck size={16} className="text-emerald-500 flex-shrink-0" />
                <span className="leading-tight text-left">Items in your cart are secure. Complete checkouts by verifying delivery shipping details.</span>
              </div>

              {/* Checkout Trigger */}
              <Link
                to="/checkout"
                className="w-full text-center bg-primary hover:bg-primary/95 text-white py-3.5 px-4 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={14} />
              </Link>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Cart;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { MapPin, Plus, ShieldCheck, CheckCircle2, AlertCircle, CreditCard, ChevronLeft } from 'lucide-react';

const Checkout = () => {
  const { cartItems, cartTotals, clearCart, productsCache } = useCart();
  const { currentUser } = useAuth();
  
  const navigate = useNavigate();

  // Address and payment states
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Inline address form states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrText, setAddrText] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrDefault, setAddrDefault] = useState(false);

  // Fetch user addresses on load
  useEffect(() => {
    const fetchAddressList = async () => {
      if (!currentUser) return;
      try {
        const list = await orderService.getAddresses(currentUser.uid);
        setAddresses(list);
        
        // Auto-select default address
        const defaultAddr = list.find(a => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.addressId);
        } else if (list.length > 0) {
          setSelectedAddressId(list[0].addressId);
        } else {
          setShowAddressForm(true); // open form if list is empty
        }
      } catch (e) {
        console.error("Addresses loading error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchAddressList();
  }, [currentUser]);

  // Handle saving new shipping address
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!addrName.trim()) return setErrorMsg("Full Name is required");
    if (!/^[6-9]\d{9}$/.test(addrPhone)) return setErrorMsg("Enter a valid 10-digit mobile number");
    if (!addrText.trim()) return setErrorMsg("Detailed Address is required");
    if (!addrCity.trim()) return setErrorMsg("City is required");
    if (!addrState.trim()) return setErrorMsg("State is required");
    if (!/^\d{6}$/.test(addrPincode)) return setErrorMsg("Enter a valid 6-digit pin code");

    setSubmitting(true);
    try {
      const added = await orderService.addAddress(currentUser.uid, {
        name: addrName,
        phone: addrPhone,
        address: addrText,
        city: addrCity,
        state: addrState,
        pincode: addrPincode,
        isDefault: addrDefault || addresses.length === 0
      });

      // Update local address list state
      const updatedList = await orderService.getAddresses(currentUser.uid);
      setAddresses(updatedList);
      setSelectedAddressId(added.addressId);
      setShowAddressForm(false);
      
      // Reset form
      setAddrName('');
      setAddrPhone('');
      setAddrText('');
      setAddrCity('');
      setAddrState('');
      setAddrPincode('');
      setAddrDefault(false);
    } catch (err) {
      setErrorMsg(err.message || "Failed to save address.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle placing order
  const handlePlaceOrder = async () => {
    setErrorMsg('');
    if (!selectedAddressId) {
      setErrorMsg("Please select or add a delivery address.");
      return;
    }

    const selectedAddr = addresses.find(a => a.addressId === selectedAddressId);
    if (!selectedAddr) {
      setErrorMsg("Selected address is invalid.");
      return;
    }

    setSubmitting(true);
    try {
      // Map items with names and current prices for order history
      const itemsList = cartItems.map(item => {
        const prod = productsCache[item.productId];
        return {
          productId: item.productId,
          name: prod?.name || 'Medicine',
          price: prod?.price || 0,
          quantity: item.quantity,
          image: prod?.image || ''
        };
      });

      const order = await orderService.placeOrder(currentUser.uid, {
        items: itemsList,
        amount: cartTotals.subtotal,
        deliveryCharges: cartTotals.deliveryCharges,
        discount: cartTotals.discount,
        finalAmount: cartTotals.finalAmount,
        paymentMethod,
        address: selectedAddr
      });

      // Clear the local state cart
      await clearCart();
      
      // Redirect to Order Detail tracking page
      navigate(`/order/${order.orderId}`);
    } catch (err) {
      setErrorMsg(err.message || "Failed to place order.");
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0 && !submitting) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <AlertCircle size={48} className="text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800">No Items to Checkout</h3>
        <p className="text-xs text-slate-400 mt-2 font-medium">Your shopping cart is currently empty.</p>
        <Link to="/products" className="mt-6 inline-block bg-primary text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-left">
      
      {/* Back to Cart link */}
      <Link to="/cart" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary mb-6 transition-colors">
        <ChevronLeft size={16} />
        Back to Shopping Cart
      </Link>

      <h1 className="text-2xl font-extrabold text-slate-800 mb-8 border-l-4 border-primary pl-3">Order Checkout</h1>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-start gap-2.5 text-xs font-semibold mb-6">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Delivery Details Block */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Shipping Address Selection */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                1. Delivery Address
              </h3>
              {!showAddressForm && (
                <button
                  id="toggle-address-form"
                  onClick={() => setShowAddressForm(true)}
                  className="flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  <Plus size={14} />
                  Add Address
                </button>
              )}
            </div>

            {loading ? (
              <div className="py-4 space-y-3">
                <div className="h-20 bg-slate-50 border border-slate-100 animate-pulse rounded-2xl"></div>
              </div>
            ) : showAddressForm ? (
              /* Inline Address Form */
              <form onSubmit={handleSaveAddress} className="space-y-4 border border-slate-100 bg-slate-50/50 rounded-2xl p-4 sm:p-5">
                <h4 className="text-xs font-bold text-slate-700 uppercase">New Shipping Address</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="text-left col-span-1">
                    <input
                      id="addr-name-input"
                      type="text"
                      placeholder="Receiver's Name"
                      value={addrName}
                      onChange={(e) => setAddrName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs font-bold text-slate-700 bg-white"
                    />
                  </div>
                  <div className="text-left col-span-1">
                    <input
                      id="addr-phone-input"
                      type="tel"
                      placeholder="Mobile Number"
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs font-bold text-slate-700 bg-white"
                    />
                  </div>
                  <div className="text-left col-span-2">
                    <input
                      id="addr-text-input"
                      type="text"
                      placeholder="Street address, Flat No., Apartment, Area"
                      value={addrText}
                      onChange={(e) => setAddrText(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs font-bold text-slate-700 bg-white"
                    />
                  </div>
                  <div className="text-left col-span-1">
                    <input
                      id="addr-city-input"
                      type="text"
                      placeholder="City"
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs font-bold text-slate-700 bg-white"
                    />
                  </div>
                  <div className="text-left col-span-1">
                    <input
                      id="addr-state-input"
                      type="text"
                      placeholder="State"
                      value={addrState}
                      onChange={(e) => setAddrState(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs font-bold text-slate-700 bg-white"
                    />
                  </div>
                  <div className="text-left col-span-1">
                    <input
                      id="addr-pincode-input"
                      type="text"
                      placeholder="Pincode (6 digits)"
                      value={addrPincode}
                      onChange={(e) => setAddrPincode(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs font-bold text-slate-700 bg-white"
                    />
                  </div>
                  <div className="col-span-1 flex items-center justify-end font-bold text-xs select-none">
                    <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                      <input
                        id="addr-default-checkbox"
                        type="checkbox"
                        checked={addrDefault}
                        onChange={(e) => setAddrDefault(e.target.checked)}
                        className="h-4.5 w-4.5 text-primary border-slate-200 rounded-md cursor-pointer accent-primary"
                      />
                      <span>Set as Default Address</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 font-bold text-xs pt-2">
                  {addresses.length > 0 && (
                    <button
                      id="cancel-address-button"
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-4 py-2 text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    id="save-address-button"
                    type="submit"
                    className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl shadow-xs"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            ) : (
              /* Address Cards list */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.addressId}
                    onClick={() => setSelectedAddressId(addr.addressId)}
                    className={`border rounded-2xl p-4 cursor-pointer text-left transition-all ${
                      selectedAddressId === addr.addressId
                        ? 'border-primary bg-emerald-50/10 ring-2 ring-primary/10'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xs font-extrabold text-slate-800">{addr.name}</h4>
                      {addr.isDefault && (
                        <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-normal truncate">{addr.address}</p>
                    <p className="text-xs text-slate-500 mt-0.5 font-semibold">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold mt-2">Mobile: +91 {addr.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Methods Choice */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
              <CreditCard size={16} className="text-primary" />
              2. Payment Options
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'UPI', title: 'UPI (GPay / PhonePe)', desc: 'Pay instantly using UPI app or scan code' },
                { id: 'Credit Card', title: 'Credit Card', desc: 'Visa, MasterCard, RuPay cards accepted' },
                { id: 'Debit Card', title: 'Debit Card', desc: 'Secure debit payment via bank gateway' },
                { id: 'Cash On Delivery', title: 'Cash On Delivery', desc: 'Pay cash when package reaches door' }
              ].map(method => (
                <div
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`border rounded-2xl p-4 flex gap-3.5 items-start cursor-pointer select-none transition-all ${
                    paymentMethod === method.id
                      ? 'border-primary bg-emerald-50/10 ring-2 ring-primary/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    id={`payment-method-${method.id.toLowerCase().replace(/\s/g, '-')}`}
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="mt-1 h-4.5 w-4.5 accent-primary cursor-pointer"
                  />
                  <div className="text-left pt-0.5">
                    <h4 className="text-xs font-extrabold text-slate-800 leading-none mb-1">{method.title}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold leading-normal">{method.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Pricing & Summary Panel */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-3 mb-1">
              Order Summary
            </h3>

            {/* List items briefly */}
            <div className="divide-y divide-slate-50 space-y-2 mb-2 max-h-48 overflow-y-auto pr-1">
              {cartItems.map(item => {
                const prod = productsCache[item.productId];
                if (!prod) return null;
                return (
                  <div key={item.productId} className="flex justify-between items-center text-xs py-2 first:pt-0">
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-slate-700 truncate">{prod.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Qty: {item.quantity} x ₹{prod.price}</p>
                    </div>
                    <span className="font-extrabold text-slate-800 whitespace-nowrap">₹{(prod.price * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            {/* Price list */}
            <div className="space-y-3 font-semibold text-xs text-slate-500 border-t border-slate-50 pt-4">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>₹{cartTotals.subtotal.toFixed(2)}</span>
              </div>
              {cartTotals.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>- ₹{cartTotals.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                {cartTotals.deliveryCharges === 0 ? (
                  <span className="text-emerald-600 font-bold">FREE</span>
                ) : (
                  <span>₹{cartTotals.deliveryCharges.toFixed(2)}</span>
                )}
              </div>

              <div className="flex justify-between items-center text-sm font-black text-slate-800 border-t border-slate-50 pt-4 mt-2">
                <span>Total Amount to Pay</span>
                <span className="text-base">₹{cartTotals.finalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-slate-50 text-[10px] text-slate-400 font-semibold p-3.5 rounded-2xl border border-slate-100 mt-2">
              <ShieldCheck size={16} className="text-emerald-500 flex-shrink-0" />
              <span className="leading-tight text-left">Your order is protected under standard pharmacy guidelines.</span>
            </div>

            {/* Place Order Trigger */}
            <button
              id="place-order-submit-button"
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary/95 text-white py-3.5 px-4 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Place Order & Pay</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Checkout;

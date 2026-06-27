import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { MapPin, Plus, Edit2, Trash2, Home, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const Addresses = () => {
  const { currentUser } = useAuth();
  
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form toggles and fields
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const fetchAddressList = async () => {
    if (!currentUser) return;
    try {
      const list = await orderService.getAddresses(currentUser.uid);
      setAddresses(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddressList();
  }, [currentUser]);

  const handleEditClick = (addr) => {
    setIsEditing(true);
    setEditingId(addr.addressId);
    setName(addr.name);
    setPhone(addr.phone);
    setAddress(addr.address);
    setCity(addr.city);
    setState(addr.state);
    setPincode(addr.pincode);
    setIsDefault(addr.isDefault);
    setShowForm(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleAddNewClick = () => {
    setIsEditing(false);
    setEditingId('');
    setName('');
    setPhone('');
    setAddress('');
    setCity('');
    setState('');
    setPincode('');
    setIsDefault(addresses.length === 0); // default if first address
    setShowForm(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setEditingId('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) return setErrorMsg("Full Name is required");
    if (!/^[6-9]\d{9}$/.test(phone)) return setErrorMsg("Enter a valid 10-digit mobile number");
    if (!address.trim()) return setErrorMsg("Detailed Address is required");
    if (!city.trim()) return setErrorMsg("City is required");
    if (!state.trim()) return setErrorMsg("State is required");
    if (!/^\d{6}$/.test(pincode)) return setErrorMsg("Enter a valid 6-digit pin code");

    setSubmitting(true);
    try {
      const addressData = { name, phone, address, city, state, pincode, isDefault };
      
      if (isEditing) {
        await orderService.updateAddress(currentUser.uid, editingId, addressData);
        setSuccessMsg("Address updated successfully.");
      } else {
        await orderService.addAddress(currentUser.uid, addressData);
        setSuccessMsg("New address added successfully.");
      }

      await fetchAddressList();
      setShowForm(false);
      setIsEditing(false);
      setEditingId('');
    } catch (err) {
      setErrorMsg(err.message || "Failed to save address details.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (addressId, addressName) => {
    if (confirm(`Delete shipping address for "${addressName}"?`)) {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');
      try {
        await orderService.deleteAddress(currentUser.uid, addressId);
        setSuccessMsg("Address removed successfully.");
        await fetchAddressList();
      } catch (err) {
        setErrorMsg(err.message || "Failed to delete address.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await orderService.setDefaultAddress(currentUser.uid, addressId);
      setSuccessMsg("Default address updated.");
      await fetchAddressList();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-left">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 m-0">My Addresses</h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">Manage delivery locations and defaults for checkouts</p>
        </div>
        {!showForm && (
          <button
            onClick={handleAddNewClick}
            className="flex items-center gap-1 px-4 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Address</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-start gap-2.5 text-xs font-semibold mb-6 animate-fade-in">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-2xl flex items-start gap-2.5 text-xs font-semibold mb-6 animate-fade-in">
          <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {showForm ? (
        /* Address Input/Edit Form */
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm mb-6 max-w-2xl">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-6 pb-2 border-b border-slate-50">
            {isEditing ? 'Edit Shipping Address' : 'Add New Shipping Address'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="text-left col-span-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">Recipient Name</label>
                <input
                  id="form-addr-name"
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs font-bold text-slate-700 bg-white"
                />
              </div>

              <div className="text-left col-span-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">Mobile Number</label>
                <input
                  id="form-addr-phone"
                  type="tel"
                  placeholder="10-digit mobile"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs font-bold text-slate-700 bg-white"
                />
              </div>

              <div className="text-left col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">Street Address</label>
                <input
                  id="form-addr-text"
                  type="text"
                  placeholder="Flat No, Apartment, Street name, Locality"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs font-bold text-slate-700 bg-white"
                />
              </div>

              <div className="text-left col-span-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">City</label>
                <input
                  id="form-addr-city"
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs font-bold text-slate-700 bg-white"
                />
              </div>

              <div className="text-left col-span-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">State</label>
                <input
                  id="form-addr-state"
                  type="text"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs font-bold text-slate-700 bg-white"
                />
              </div>

              <div className="text-left col-span-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">Pincode</label>
                <input
                  id="form-addr-pincode"
                  type="text"
                  placeholder="6-digit PIN"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs font-bold text-slate-700 bg-white"
                />
              </div>

              <div className="col-span-1 flex items-center justify-end font-bold text-xs select-none">
                <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                  <input
                    id="form-addr-default-checkbox"
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="h-4.5 w-4.5 text-primary border-slate-200 rounded-md cursor-pointer accent-primary"
                  />
                  <span>Set as Default Address</span>
                </label>
              </div>

            </div>

            <div className="flex gap-2 font-bold text-xs pt-4 border-t border-slate-50">
              <button
                id="form-addr-cancel-button"
                type="button"
                onClick={handleCancelForm}
                className="px-4 py-2.5 text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                id="form-addr-save-button"
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl shadow-xs flex items-center gap-1.5"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Save Address</span>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Address Cards Listing */
        loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-40 bg-white border border-slate-100 animate-pulse rounded-3xl"></div>
            <div className="h-40 bg-white border border-slate-100 animate-pulse rounded-3xl"></div>
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl p-8 max-w-md mx-auto">
            <MapPin size={48} className="text-slate-200 mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-800">No Address Found</h3>
            <p className="text-xs text-slate-400 mt-2 font-medium">Add a delivery address to enable checkout speeds.</p>
            <button
              id="empty-add-address-button"
              onClick={handleAddNewClick}
              className="mt-5 px-5 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Add New Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((addr) => (
              <div 
                key={addr.addressId} 
                className={`bg-white border rounded-3xl p-6 shadow-xs flex flex-col justify-between h-48 transition-all ${
                  addr.isDefault ? 'border-primary ring-2 ring-primary/5' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-extrabold text-slate-800">{addr.name}</h4>
                    {addr.isDefault && (
                      <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{addr.address}</p>
                  <p className="text-xs text-slate-500 font-bold mt-1">
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-2">Mobile: +91 {addr.phone}</p>
                </div>

                <div className="flex justify-between items-center border-t border-slate-50 pt-3 mt-4 text-xs font-bold">
                  {/* Default trigger button */}
                  {!addr.isDefault ? (
                    <button
                      id={`set-default-${addr.addressId}`}
                      onClick={() => handleSetDefault(addr.addressId)}
                      className="text-[10px] text-primary hover:underline"
                    >
                      Make Default
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Home size={12} /> Primary Address
                    </span>
                  )}

                  {/* Actions buttons */}
                  <div className="flex items-center gap-3 text-slate-400">
                    <button
                      id={`edit-${addr.addressId}`}
                      onClick={() => handleEditClick(addr)}
                      className="hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      id={`delete-${addr.addressId}`}
                      onClick={() => handleDelete(addr.addressId, addr.name)}
                      className="hover:text-rose-500 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )
      )}

    </div>
  );
};

export default Addresses;

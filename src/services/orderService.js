import { isFirebaseConfigured, db } from './firebase';
import { 
  collection, doc, setDoc, getDoc, getDocs, 
  query, where, updateDoc, deleteDoc, writeBatch 
} from 'firebase/firestore';

// -------------------------------------------------------------
// LOCALSTORAGE DATA HELPERS
// -------------------------------------------------------------
const getLocalData = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const setLocalData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// -------------------------------------------------------------
// EXPORTED ORDER & USER DATA SERVICE
// -------------------------------------------------------------
export const orderService = {
  
  // ==========================================
  // CART ACTIONS
  // ==========================================
  getCart: async (userId) => {
    if (isFirebaseConfigured) {
      try {
        const cartDoc = await getDoc(doc(db, 'cart', userId));
        return cartDoc.exists() ? cartDoc.data().items || [] : [];
      } catch (e) {
        console.error("Firestore getCart error:", e);
      }
    }
    const carts = JSON.parse(localStorage.getItem('littu_mock_carts') || '{}');
    return carts[userId] || [];
  },

  saveCart: async (userId, items) => {
    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'cart', userId), {
          userId,
          items,
          updatedAt: new Date().toISOString()
        });
        return;
      } catch (e) {
        console.error("Firestore saveCart error:", e);
      }
    }
    const carts = JSON.parse(localStorage.getItem('littu_mock_carts') || '{}');
    carts[userId] = items;
    localStorage.setItem('littu_mock_carts', JSON.stringify(carts));
  },

  // ==========================================
  // WISHLIST ACTIONS
  // ==========================================
  getWishlist: async (userId) => {
    if (isFirebaseConfigured) {
      try {
        const wishlistDoc = await getDoc(doc(db, 'wishlist', userId));
        return wishlistDoc.exists() ? wishlistDoc.data().products || [] : [];
      } catch (e) {
        console.error("Firestore getWishlist error:", e);
      }
    }
    const wishlists = JSON.parse(localStorage.getItem('littu_mock_wishlists') || '{}');
    return wishlists[userId] || [];
  },

  saveWishlist: async (userId, productIds) => {
    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'wishlist', userId), {
          userId,
          products: productIds,
          updatedAt: new Date().toISOString()
        });
        return;
      } catch (e) {
        console.error("Firestore saveWishlist error:", e);
      }
    }
    const wishlists = JSON.parse(localStorage.getItem('littu_mock_wishlists') || '{}');
    wishlists[userId] = productIds;
    localStorage.setItem('littu_mock_wishlists', JSON.stringify(wishlists));
  },

  // ==========================================
  // ADDRESS BOOK ACTIONS (CRUD)
  // ==========================================
  getAddresses: async (userId) => {
    if (isFirebaseConfigured) {
      try {
        const q = query(collection(db, 'addresses'), where('userId', '==', userId));
        const snap = await getDocs(q);
        const list = [];
        snap.forEach(doc => {
          list.push({ ...doc.data(), addressId: doc.id });
        });
        return list;
      } catch (e) {
        console.error("Firestore getAddresses error:", e);
      }
    }
    const allAddresses = getLocalData('littu_mock_addresses');
    return allAddresses.filter(a => a.userId === userId);
  },

  addAddress: async (userId, addressData) => {
    const newAddress = {
      userId,
      name: addressData.name,
      phone: addressData.phone,
      address: addressData.address,
      city: addressData.city,
      state: addressData.state,
      pincode: addressData.pincode,
      isDefault: addressData.isDefault || false
    };

    if (isFirebaseConfigured) {
      const docRef = doc(collection(db, 'addresses'));
      newAddress.addressId = docRef.id;
      
      // If setting as default, clear others
      if (newAddress.isDefault) {
        await orderService.clearDefaultAddressFirestore(userId);
      }

      await setDoc(docRef, newAddress);
      return newAddress;
    } else {
      const allAddresses = getLocalData('littu_mock_addresses');
      const addressId = 'addr_' + Math.random().toString(36).substr(2, 9);
      newAddress.addressId = addressId;

      if (newAddress.isDefault) {
        allAddresses.forEach(a => {
          if (a.userId === userId) a.isDefault = false;
        });
      }

      allAddresses.push(newAddress);
      setLocalData('littu_mock_addresses', allAddresses);
      return newAddress;
    }
  },

  updateAddress: async (userId, addressId, addressData) => {
    if (isFirebaseConfigured) {
      const docRef = doc(db, 'addresses', addressId);
      if (addressData.isDefault) {
        await orderService.clearDefaultAddressFirestore(userId);
      }
      await updateDoc(docRef, addressData);
      return { addressId, ...addressData };
    } else {
      const allAddresses = getLocalData('littu_mock_addresses');
      const idx = allAddresses.findIndex(a => a.addressId === addressId);
      if (idx === -1) throw new Error("Address not found");

      if (addressData.isDefault) {
        allAddresses.forEach(a => {
          if (a.userId === userId) a.isDefault = false;
        });
      }

      allAddresses[idx] = { ...allAddresses[idx], ...addressData };
      setLocalData('littu_mock_addresses', allAddresses);
      return allAddresses[idx];
    }
  },

  deleteAddress: async (userId, addressId) => {
    if (isFirebaseConfigured) {
      await deleteDoc(doc(db, 'addresses', addressId));
    } else {
      const allAddresses = getLocalData('littu_mock_addresses');
      const filtered = allAddresses.filter(a => a.addressId !== addressId);
      setLocalData('littu_mock_addresses', filtered);
    }
  },

  setDefaultAddress: async (userId, addressId) => {
    if (isFirebaseConfigured) {
      await orderService.clearDefaultAddressFirestore(userId);
      await updateDoc(doc(db, 'addresses', addressId), { isDefault: true });
    } else {
      const allAddresses = getLocalData('littu_mock_addresses');
      allAddresses.forEach(a => {
        if (a.userId === userId) {
          a.isDefault = a.addressId === addressId;
        }
      });
      setLocalData('littu_mock_addresses', allAddresses);
    }
  },

  clearDefaultAddressFirestore: async (userId) => {
    const q = query(collection(db, 'addresses'), where('userId', '==', userId), where('isDefault', '==', true));
    const snap = await getDocs(q);
    // Use write batch or iterate
    for (const d of snap.docs) {
      await updateDoc(doc(db, 'addresses', d.id), { isDefault: false });
    }
  },

  // ==========================================
  // ORDER ACTIONS
  // ==========================================
  placeOrder: async (userId, { items, amount, deliveryCharges, discount, finalAmount, paymentMethod, address }) => {
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder = {
      orderId,
      userId,
      items,
      amount,
      deliveryCharges,
      discount,
      finalAmount,
      paymentMethod,
      address,
      status: 'Order Placed', // Initial status
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured) {
      await setDoc(doc(db, 'orders', orderId), newOrder);
      // Clear cart in DB
      await orderService.saveCart(userId, []);
      return newOrder;
    } else {
      const allOrders = getLocalData('littu_mock_orders');
      allOrders.push(newOrder);
      setLocalData('littu_mock_orders', allOrders);

      // Clear local cart
      const carts = JSON.parse(localStorage.getItem('littu_mock_carts') || '{}');
      carts[userId] = [];
      localStorage.setItem('littu_mock_carts', JSON.stringify(carts));

      return newOrder;
    }
  },

  getOrders: async (userId) => {
    if (isFirebaseConfigured) {
      try {
        const q = query(collection(db, 'orders'), where('userId', '==', userId));
        const snap = await getDocs(q);
        const list = [];
        snap.forEach(doc => {
          list.push(doc.data());
        });
        // Sort descending by date
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return list;
      } catch (e) {
        console.error("Firestore getOrders error:", e);
      }
    }
    const allOrders = getLocalData('littu_mock_orders');
    const userOrders = allOrders.filter(o => o.userId === userId);
    userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return userOrders;
  },

  getOrderById: async (userId, orderId) => {
    if (isFirebaseConfigured) {
      try {
        const docSnap = await getDoc(doc(db, 'orders', orderId));
        if (docSnap.exists() && docSnap.data().userId === userId) {
          return docSnap.data();
        }
        throw new Error("Order not found");
      } catch (e) {
        console.error("Firestore getOrderById error:", e);
      }
    }
    const allOrders = getLocalData('littu_mock_orders');
    const order = allOrders.find(o => o.orderId === orderId && o.userId === userId);
    if (!order) throw new Error("Order not found");
    return order;
  },

  // Helper for tracking: simulate status updates for testing!
  // In a real system, the admin updates this. For testing purposes, we can advance
  // the order status based on time passed since creation, or let the user click a mock "Step Forward" button.
  // We'll write a simulation helper that updates status automatically as time passes, making the tracking timeline feel alive!
  getSimulatedOrderStatus: (order) => {
    const elapsedMinutes = (new Date() - new Date(order.createdAt)) / 60000;
    
    // Status progression: Order Placed -> Processing -> Packed -> Shipped -> Out For Delivery -> Delivered
    let status = 'Order Placed';
    if (elapsedMinutes >= 15) status = 'Delivered';
    else if (elapsedMinutes >= 10) status = 'Out For Delivery';
    else if (elapsedMinutes >= 5) status = 'Shipped';
    else if (elapsedMinutes >= 3) status = 'Packed';
    else if (elapsedMinutes >= 1) status = 'Processing';
    
    return status;
  }
};

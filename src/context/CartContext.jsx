import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

export const CartProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [cartItems, setCartItems] = useState([]); // [{productId, quantity}]
  const [wishlistItems, setWishlistItems] = useState([]); // [productId]
  const [productsCache, setProductsCache] = useState({}); // cached details to avoid repetitive fetches
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0); // in currency amount
  const [loading, setLoading] = useState(false);

  // Available coupons
  const AVAILABLE_COUPONS = {
    'LITTU10': { type: 'percent', value: 10, minSubtotal: 200 },
    'MED20': { type: 'percent', value: 20, minSubtotal: 500 },
    'FREESHIP': { type: 'freeship', value: 40, minSubtotal: 300 }
  };

  // Load cart and wishlist when current user changes
  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser) {
        setLoading(true);
        try {
          const fetchedCart = await orderService.getCart(currentUser.uid);
          const fetchedWishlist = await orderService.getWishlist(currentUser.uid);
          
          setCartItems(fetchedCart);
          setWishlistItems(fetchedWishlist);

          // Cache product details for items in cart
          const uniqueProductIds = [...new Set(fetchedCart.map(i => i.productId))];
          await fetchAndCacheProducts(uniqueProductIds);
        } catch (error) {
          console.error("Error loading cart/wishlist:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setCartItems([]);
        setWishlistItems([]);
        setCouponCode('');
        setCouponDiscount(0);
      }
    };

    loadUserData();
  }, [currentUser]);

  // Save cart to DB whenever it changes
  const saveCartToDB = async (items) => {
    if (currentUser) {
      try {
        await orderService.saveCart(currentUser.uid, items);
      } catch (error) {
        console.error("Error saving cart to DB:", error);
      }
    }
  };

  // Save wishlist to DB whenever it changes
  const saveWishlistToDB = async (products) => {
    if (currentUser) {
      try {
        await orderService.saveWishlist(currentUser.uid, products);
      } catch (error) {
        console.error("Error saving wishlist to DB:", error);
      }
    }
  };

  const fetchAndCacheProducts = async (ids) => {
    const newCache = { ...productsCache };
    let updated = false;
    for (const id of ids) {
      if (!newCache[id]) {
        try {
          const product = await productService.getProductById(id);
          newCache[id] = product;
          updated = true;
        } catch (e) {
          console.error(`Failed to fetch cache details for product ${id}`, e);
        }
      }
    }
    if (updated) {
      setProductsCache(newCache);
    }
  };

  // 1. Add to Cart
  const addToCart = async (productId, quantity = 1) => {
    if (!currentUser) throw new Error("Please log in to add items to cart.");
    
    // Ensure product details are cached
    await fetchAndCacheProducts([productId]);
    
    const existingIdx = cartItems.findIndex(i => i.productId === productId);
    let updatedCart = [];
    
    if (existingIdx > -1) {
      const newQty = cartItems[existingIdx].quantity + quantity;
      // Check stock limit
      const stock = productsCache[productId]?.stock || 10;
      if (newQty > stock) {
        throw new Error(`Only ${stock} units are currently in stock.`);
      }
      
      updatedCart = [...cartItems];
      updatedCart[existingIdx].quantity = newQty;
    } else {
      updatedCart = [...cartItems, { productId, quantity }];
    }
    
    setCartItems(updatedCart);
    await saveCartToDB(updatedCart);
  };

  // 2. Update Quantity
  const updateQty = async (productId, newQty) => {
    if (newQty <= 0) {
      await removeFromCart(productId);
      return;
    }
    
    const stock = productsCache[productId]?.stock || 10;
    if (newQty > stock) {
      throw new Error(`Only ${stock} units are currently in stock.`);
    }

    const updatedCart = cartItems.map(i => 
      i.productId === productId ? { ...i, quantity: newQty } : i
    );
    
    setCartItems(updatedCart);
    await saveCartToDB(updatedCart);
  };

  // 3. Remove from Cart
  const removeFromCart = async (productId) => {
    const updatedCart = cartItems.filter(i => i.productId !== productId);
    setCartItems(updatedCart);
    await saveCartToDB(updatedCart);
  };

  // 4. Clear Cart
  const clearCart = async () => {
    setCartItems([]);
    setCouponCode('');
    setCouponDiscount(0);
    if (currentUser) {
      await orderService.saveCart(currentUser.uid, []);
    }
  };

  // 5. Toggle Wishlist
  const toggleWishlist = async (productId) => {
    if (!currentUser) throw new Error("Please log in to add items to wishlist.");
    
    let updatedWishlist = [];
    if (wishlistItems.includes(productId)) {
      updatedWishlist = wishlistItems.filter(id => id !== productId);
    } else {
      updatedWishlist = [...wishlistItems, productId];
    }
    
    setWishlistItems(updatedWishlist);
    await saveWishlistToDB(updatedWishlist);
  };

  const isInWishlist = (productId) => wishlistItems.includes(productId);

  const isInCart = (productId) => cartItems.some(i => i.productId === productId);

  // 6. Apply Coupon
  const applyCoupon = (code) => {
    const c = code.toUpperCase().trim();
    if (!AVAILABLE_COUPONS[c]) {
      throw new Error("Invalid Coupon Code.");
    }
    const couponInfo = AVAILABLE_COUPONS[c];
    if (cartTotals.subtotal < couponInfo.minSubtotal) {
      throw new Error(`This coupon requires a minimum subtotal of ₹${couponInfo.minSubtotal}`);
    }
    setCouponCode(c);
  };

  // 7. Remove Coupon
  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
  };

  // Recalculate totals
  const getCartTotals = () => {
    let subtotal = 0;
    let mrpTotal = 0;

    cartItems.forEach(item => {
      const prod = productsCache[item.productId];
      if (prod) {
        subtotal += prod.price * item.quantity;
        mrpTotal += (prod.mrp || prod.price) * item.quantity;
      }
    });

    const savings = mrpTotal - subtotal;
    
    // Calculate delivery charges (free above 500, or flat 40 rupees)
    let deliveryCharges = subtotal > 500 ? 0 : 40;
    
    // Apply coupon logic
    let discount = 0;
    if (couponCode && AVAILABLE_COUPONS[couponCode]) {
      const cp = AVAILABLE_COUPONS[couponCode];
      if (cp.type === 'percent') {
        discount = Math.round((subtotal * cp.value) / 100);
      } else if (cp.type === 'freeship') {
        discount = deliveryCharges; // discounts the delivery fee
        deliveryCharges = 0;
      }
    }

    const finalAmount = Math.max(0, subtotal + deliveryCharges - discount);

    return {
      subtotal,
      mrpTotal,
      savings,
      deliveryCharges,
      discount,
      finalAmount,
      totalItems: cartItems.reduce((acc, item) => acc + item.quantity, 0)
    };
  };

  const cartTotals = getCartTotals();

  // Validate current coupon if subtotal falls below requirement
  useEffect(() => {
    if (couponCode) {
      const cp = AVAILABLE_COUPONS[couponCode];
      if (cp && cartTotals.subtotal < cp.minSubtotal) {
        removeCoupon();
      }
    }
  }, [cartTotals.subtotal, couponCode]);

  const value = {
    cartItems,
    wishlistItems,
    productsCache,
    couponCode,
    couponDiscount: cartTotals.discount,
    cartTotals,
    loading,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    toggleWishlist,
    isInWishlist,
    isInCart,
    applyCoupon,
    removeCoupon,
    fetchAndCacheProducts
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

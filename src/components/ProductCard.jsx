import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist, isInCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState(false);

  const { productId, name, brand, price, mrp, stock, image, category } = product;

  // Calculate discount percentage
  const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const inWishlist = isInWishlist(productId);
  const inCart = isInCart(productId);
  const isOutOfStock = stock <= 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (isOutOfStock) return;
    setAdding(true);
    try {
      await addToCart(productId, 1);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    try {
      await toggleWishlist(productId);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 hover:border-slate-200 p-4 transition-all duration-300 hover:shadow-lg flex flex-col justify-between h-[420px] overflow-hidden">
      {/* Badges / Actions overlay */}
      <div>
        <div className="relative w-full aspect-square bg-slate-50 rounded-xl overflow-hidden mb-3 border border-slate-50/50">
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-rose-500 shadow-sm border border-slate-100/50 transition-colors backdrop-blur-sm"
          >
            <Heart size={16} fill={inWishlist ? "#f43f5e" : "transparent"} className={inWishlist ? "text-rose-500 scale-110 transition-transform" : ""} />
          </button>
          
          {/* Discount Badge */}
          {discountPercent > 0 && (
            <div className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-extrabold px-2 py-1 rounded-md shadow-sm">
              {discountPercent}% OFF
            </div>
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
              <span className="text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 border border-white/30 rounded-lg">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Product Meta */}
        <div className="text-left">
          <span className="text-[10px] font-bold text-primary bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100/50 uppercase tracking-wide">
            {category}
          </span>
          <h3 className="mt-2 text-sm font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors min-h-[40px]">
            <Link to={`/product/${productId}`}>
              {name}
            </Link>
          </h3>
          <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{brand}</p>
        </div>
      </div>

      {/* Pricing and Action */}
      <div className="mt-3">
        {/* Pricing */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-base font-extrabold text-slate-800">₹{price}</span>
          {discountPercent > 0 && (
            <span className="text-xs text-slate-400 line-through">₹{mrp}</span>
          )}
        </div>

        {/* Stock Alerts */}
        {!isOutOfStock && stock <= 5 && (
          <p className="text-[10px] text-amber-600 font-semibold mb-2">Only {stock} left in stock!</p>
        )}
        {!isOutOfStock && stock > 5 && (
          <p className="text-[10px] text-emerald-600 font-medium mb-2">In Stock</p>
        )}
        {isOutOfStock && (
          <p className="text-[10px] text-slate-400 font-medium mb-2">Unavailable</p>
        )}

        {/* Add to Cart Trigger */}
        <div className="flex items-center gap-2">
          <Link
            to={`/product/${productId}`}
            className="flex-1 text-center py-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-100"
          >
            Details
          </Link>
          
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              success
                ? 'bg-emerald-600 text-white shadow-sm'
                : isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/50'
                : 'bg-primary hover:bg-primary/95 text-white hover:shadow-md'
            }`}
          >
            {adding ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : success ? (
              <>
                <Check size={14} />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag size={14} />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

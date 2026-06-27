import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';

const Wishlist = () => {
  const { wishlistItems, productsCache, toggleWishlist, addToCart, fetchAndCacheProducts } = useCart();

  // Make sure product details are loaded for the wishlist items
  useEffect(() => {
    if (wishlistItems.length > 0) {
      fetchAndCacheProducts(wishlistItems);
    }
  }, [wishlistItems]);

  const handleMoveToCart = async (productId, name) => {
    try {
      await addToCart(productId, 1);
      await toggleWishlist(productId); // Remove from wishlist
      alert(`"${name}" has been moved to your shopping cart.`);
    } catch (err) {
      alert(err.message || "Failed to add to cart.");
    }
  };

  const handleRemove = async (productId) => {
    try {
      await toggleWishlist(productId);
    } catch (err) {
      alert(err.message);
    }
  };

  const isWishlistEmpty = wishlistItems.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-left">
      <h1 className="text-2xl font-extrabold text-slate-800 mb-8 border-l-4 border-primary pl-3">My Saved Wishlist</h1>

      {isWishlistEmpty ? (
        <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl p-8 max-w-lg mx-auto shadow-xs">
          <div className="text-slate-300 mb-4 flex justify-center">
            <Heart size={64} className="stroke-[1.5px]" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Your Wishlist is Empty</h3>
          <p className="text-xs text-slate-400 mt-2 font-medium">Keep track of medicines and wellness supplies you want to purchase by saving them here.</p>
          <Link to="/products" className="mt-6 inline-flex items-center gap-1.5 bg-primary text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all">
            Explore Products Catalog <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        /* Wishlist Items List */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((productId) => {
            const prod = productsCache[productId];
            if (!prod) return null; // loading details

            const { name, brand, price, mrp, stock, image } = prod;
            const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
            const isOutOfStock = stock <= 0;

            return (
              <div 
                key={productId}
                className="group bg-white border border-slate-100 hover:border-slate-200 transition-all duration-300 hover:shadow-lg rounded-2xl p-4 flex flex-col justify-between h-[390px]"
              >
                <div>
                  <div className="relative aspect-square rounded-xl bg-slate-50 border border-slate-50 overflow-hidden mb-3">
                    <img
                      src={image}
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {discountPercent > 0 && (
                      <span className="absolute top-2 left-2 bg-rose-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">
                        {discountPercent}% OFF
                      </span>
                    )}

                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border border-white/20 rounded-lg">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  <div className="text-left">
                    <h3 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors min-h-[36px]">
                      <Link to={`/product/${productId}`}>
                        {name}
                      </Link>
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{brand}</p>
                    
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-sm font-extrabold text-slate-800">₹{price}</span>
                      {discountPercent > 0 && (
                        <span className="text-[10px] text-slate-400 line-through">₹{mrp}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  {/* Delete from wishlist */}
                  <button
                    onClick={() => handleRemove(productId)}
                    className="p-2.5 border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-500 rounded-xl transition-all cursor-pointer"
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={15} />
                  </button>

                  {/* Add to cart */}
                  <button
                    onClick={() => handleMoveToCart(productId, name)}
                    disabled={isOutOfStock}
                    className="flex-1 bg-primary hover:bg-primary/95 text-white disabled:bg-slate-100 disabled:text-slate-400 py-2.5 px-3 rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingCart size={14} />
                    <span>Move to Cart</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Wishlist;

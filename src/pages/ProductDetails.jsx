import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { LoadingSkeleton } from '../components/LoadingSpinner';
import { Heart, ShoppingBag, CreditCard, ChevronLeft, ShieldCheck, RefreshCw, Star, Info } from 'lucide-react';

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingCart, setAddingCart] = useState(false);
  const [addingWishlist, setAddingWishlist] = useState(false);

  // Reload product details on route parameter change
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setErrorMsg('');
      setQuantity(1); // reset quantity selector
      try {
        const prod = await productService.getProductById(productId);
        setProduct(prod);

        // Fetch similar items
        const similar = await productService.getSimilarProducts(prod.productId, prod.category);
        setSimilarProducts(similar);
      } catch (e) {
        setErrorMsg("Failed to load product details. It may have been discontinued.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <LoadingSkeleton type="product-details" />
      </div>
    );
  }

  if (errorMsg || !product) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="text-slate-300 mb-4 flex justify-center">
          <Info size={48} />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Product Not Found</h3>
        <p className="text-xs text-slate-400 mt-2 font-medium">{errorMsg}</p>
        <Link to="/products" className="mt-6 inline-block bg-primary text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const { name, brand, manufacturer, description, uses, sideEffects, dosageInfo, price, mrp, stock, image, category } = product;

  const isOutOfStock = stock <= 0;
  const isWish = isInWishlist(productId);
  const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const handleQtyAdjust = (amt) => {
    const target = quantity + amt;
    if (target >= 1 && target <= stock) {
      setQuantity(target);
    }
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    setAddingCart(true);
    try {
      await addToCart(productId, quantity);
      alert(`${quantity} unit(s) of "${name}" added to your cart.`);
    } catch (err) {
      alert(err.message);
    } finally {
      setAddingCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    try {
      await addToCart(productId, quantity);
      navigate('/checkout');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleWishlistToggle = async () => {
    setAddingWishlist(true);
    try {
      await toggleWishlist(productId);
    } catch (err) {
      alert(err.message);
    } finally {
      setAddingWishlist(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-left">
      
      {/* Back button link */}
      <Link to="/products" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary mb-6 transition-colors">
        <ChevronLeft size={16} />
        Back to Medicines Catalog
      </Link>

      {/* Main Grid: Images & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs">
        
        {/* Product Photo Box */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-rose-500 text-white font-extrabold text-xs px-3 py-1 rounded-lg shadow-sm">
                {discountPercent}% OFF
              </span>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
                <span className="text-white text-sm font-bold uppercase tracking-wider px-4 py-2 border border-white/30 rounded-xl">Out of Stock</span>
              </div>
            )}
          </div>
        </div>

        {/* Product Details & Actions */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100/50 uppercase tracking-wide">
                {category}
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-full border border-amber-100/50">
                <Star size={12} fill="#f59e0b" />
                <span>4.8</span>
              </div>
            </div>
            
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-800 mt-4 mb-1">
              {name}
            </h1>
            <p className="text-sm text-slate-400 font-semibold mb-3">
              Brand: <span className="text-slate-600 font-extrabold">{brand}</span> | Mfr: <span className="text-slate-500">{manufacturer}</span>
            </p>

            <div className="border-t border-b border-slate-50 py-4 my-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Price list */}
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-0.5">Special Price</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-800">₹{price}</span>
                  {discountPercent > 0 && (
                    <span className="text-sm font-semibold text-slate-400 line-through">MRP ₹{mrp}</span>
                  )}
                </div>
              </div>

              {/* Stock status indicator */}
              <div className="text-left sm:text-right">
                <span className="text-xs font-semibold text-slate-400 block mb-1">Availability</span>
                {isOutOfStock ? (
                  <span className="text-xs font-bold text-rose-500 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl">Temporarily Out of Stock</span>
                ) : stock <= 5 ? (
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl">Only {stock} units left!</span>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">In Stock & Ready to Ship</span>
                )}
              </div>
            </div>

            {/* Product Summary description */}
            <div className="text-xs text-slate-500 font-medium leading-relaxed my-4">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">Description</h3>
              <p>{description}</p>
            </div>
          </div>

          {/* Action Blocks */}
          <div className="space-y-4 pt-4 border-t border-slate-50">
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-extrabold text-slate-700">Quantity</span>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    onClick={() => handleQtyAdjust(-1)}
                    disabled={quantity <= 1}
                    className="p-2.5 hover:bg-slate-100 text-slate-500 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="px-5 text-sm font-extrabold text-slate-700 min-w-[36px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQtyAdjust(1)}
                    disabled={quantity >= stock}
                    className="p-2.5 hover:bg-slate-100 text-slate-500 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft size={16} className="rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* Cart, Buy and Wishlist buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingCart}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:bg-slate-50 disabled:text-slate-400 py-3.5 px-4 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag size={16} />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 bg-primary hover:bg-primary/95 text-white disabled:bg-slate-100 disabled:text-slate-400 py-3.5 px-4 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CreditCard size={16} />
                <span>Buy Now</span>
              </button>

              <button
                onClick={handleWishlistToggle}
                disabled={addingWishlist}
                className="p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-rose-500 transition-all flex items-center justify-center cursor-pointer"
              >
                <Heart size={18} fill={isWish ? "#f43f5e" : "transparent"} className={isWish ? "text-rose-500" : ""} />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Medical Disclosures Tab (uses, side effects) */}
      <section className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 mt-8 shadow-xs space-y-6">
        <h2 className="text-base font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-3">Medicine Guide & Disclosures</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Uses */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50">
            <h4 className="font-extrabold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-primary" />
              Primary Uses
            </h4>
            <p className="text-slate-500 font-medium leading-relaxed">{uses || 'Consult a medical professional for therapeutic indications.'}</p>
          </div>

          {/* Side Effects */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50">
            <h4 className="font-extrabold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <RefreshCw size={14} className="text-rose-500" />
              Possible Side Effects
            </h4>
            <p className="text-slate-500 font-medium leading-relaxed">{sideEffects || 'Mild symptoms may arise. If reactions persist, consult a doctor immediately.'}</p>
          </div>

          {/* Dosage Info */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50">
            <h4 className="font-extrabold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Info size={14} className="text-blue-500" />
              Dosage Guidelines
            </h4>
            <p className="text-slate-500 font-medium leading-relaxed">{dosageInfo || 'Take as recommended by your health practitioner. Do not exceed prescribed amounts.'}</p>
          </div>
        </div>
      </section>

      {/* Related Products Grid */}
      {similarProducts.length > 0 && (
        <section className="mt-12 flex flex-col gap-6">
          <h2 className="text-lg font-bold text-slate-800 m-0 border-l-4 border-primary pl-3">Related Healthcare Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {similarProducts.map(prod => (
              <ProductCard key={prod.productId} product={prod} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default ProductDetails;

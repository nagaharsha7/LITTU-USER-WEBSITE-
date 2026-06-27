import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { productsCache, updateQty, removeFromCart } = useCart();
  const [updating, setUpdating] = useState(false);

  const product = productsCache[item.productId];
  if (!product) return null; // loading fallback

  const { name, brand, price, mrp, stock, image, productId } = product;
  const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const itemSubtotal = price * item.quantity;

  const handleQtyChange = async (newQty) => {
    if (newQty <= 0) {
      handleRemove();
      return;
    }
    if (newQty > stock) return; // shouldn't happen due to disabled UI
    setUpdating(true);
    try {
      await updateQty(productId, newQty);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (confirm(`Remove "${name}" from your cart?`)) {
      setUpdating(true);
      try {
        await removeFromCart(productId);
      } catch (err) {
        alert(err.message);
      } finally {
        setUpdating(false);
      }
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 transition-all ${updating ? 'opacity-60 pointer-events-none' : ''}`}>
      {/* Product Image and Meta */}
      <div className="flex gap-4 items-center flex-1 min-w-0">
        <img
          src={image}
          alt={name}
          className="w-16 h-16 rounded-xl object-cover bg-slate-50 border border-slate-100/50 flex-shrink-0"
        />
        <div className="text-left min-w-0">
          <h4 className="text-sm font-bold text-slate-800 hover:text-primary transition-colors truncate">
            <Link to={`/product/${productId}`}>
              {name}
            </Link>
          </h4>
          <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{brand}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-bold text-slate-800">₹{price}</span>
            {discountPercent > 0 && (
              <span className="text-xs text-slate-400 line-through">₹{mrp}</span>
            )}
          </div>
        </div>
      </div>

      {/* Quantity & Total Section */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-slate-50 pt-3 sm:pt-0">
        {/* Quantity Controls */}
        <div className="flex flex-col items-center">
          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
            <button
              onClick={() => handleQtyChange(item.quantity - 1)}
              className="p-2 hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
            >
              <Minus size={14} />
            </button>
            <span className="px-3 text-sm font-bold text-slate-700 min-w-[24px] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQtyChange(item.quantity + 1)}
              disabled={item.quantity >= stock}
              className={`p-2 hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer ${item.quantity >= stock ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <Plus size={14} />
            </button>
          </div>
          {item.quantity >= stock && (
            <span className="text-[10px] text-amber-500 font-bold mt-1">Stock limit reached</span>
          )}
        </div>

        {/* Subtotal & Delete */}
        <div className="flex items-center gap-4 text-right min-w-[120px] justify-end">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-400">Subtotal</span>
            <span className="text-sm font-extrabold text-slate-800">₹{itemSubtotal.toFixed(2)}</span>
          </div>
          <button
            onClick={handleRemove}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;

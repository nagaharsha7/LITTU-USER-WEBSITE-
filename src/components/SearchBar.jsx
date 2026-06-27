import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { productService } from '../services/productService';

const SearchBar = ({ placeholder = "Search for medicines, brands, wellness items...", className = "" }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const result = await productService.getProducts({
          search: query,
          limitItems: 5
        });
        setSuggestions(result.products);
        setIsOpen(true);
      } catch (e) {
        console.error("Suggestions fetch error:", e);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestionClick = (productId) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/product/${productId}`);
  };

  return (
    <div className={`relative w-full max-w-xl ${className}`} ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          id="search-bar-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-11 pr-10 py-3 rounded-full border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-700 bg-white placeholder-slate-400 transition-all shadow-sm text-sm"
        />
        <div className="absolute left-4 text-slate-400">
          <Search size={18} />
        </div>
        {loading ? (
          <div className="absolute right-4 text-primary animate-spin">
            <Loader2 size={18} />
          </div>
        ) : query ? (
          <button
            id="clear-search-button"
            type="button"
            onClick={() => { setQuery(''); setSuggestions([]); }}
            className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        ) : null}
      </form>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-50">
          {suggestions.map((prod) => (
            <div
              key={prod.productId}
              onClick={() => handleSuggestionClick(prod.productId)}
              className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <img
                src={prod.image}
                alt={prod.name}
                className="w-10 h-10 rounded-lg object-cover bg-slate-50 border border-slate-100 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{prod.name}</p>
                <p className="text-xs text-slate-400 truncate">{prod.brand} · <span className="text-primary font-semibold">₹{prod.price}</span></p>
              </div>
              <div className="text-xs text-slate-300 bg-slate-50 px-2 py-1 rounded-md flex-shrink-0 border border-slate-100">
                {prod.category}
              </div>
            </div>
          ))}
          <div 
            onClick={handleSubmit} 
            className="p-3 text-center text-xs font-semibold text-primary hover:bg-emerald-50/50 cursor-pointer transition-colors"
          >
            Show all results for "{query}"
          </div>
        </div>
      )}

      {isOpen && query.trim().length >= 2 && suggestions.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-4 text-center text-sm text-slate-400">
          No medicines found matching "{query}"
        </div>
      )}
    </div>
  );
};

export default SearchBar;

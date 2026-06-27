import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService';
import ProductCard from '../components/ProductCard';
import { LoadingSkeleton } from '../components/LoadingSpinner';
import { SlidersHorizontal, ArrowUpDown, RefreshCw } from 'lucide-react';

const CATEGORIES = [
  'All', 'Tablets', 'Capsules', 'Syrups', 'Injection', 'Diabetes Care',
  'Baby Care', 'Skin Care', 'Personal Care', 'Vitamins', 'Healthcare Devices'
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State from URL parameters
  const categoryParam = searchParams.get('category') || 'All';
  const searchParam = searchParams.get('search') || '';
  const pageParam = parseInt(searchParams.get('page') || '1');

  // Filter States
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(2500);
  const [sortBy, setSortBy] = useState('popularity');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch products whenever search/filter params change
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const result = await productService.getProducts({
          category: categoryParam === 'All' ? '' : categoryParam,
          search: searchParam,
          minPrice: Number(minPrice),
          maxPrice: Number(maxPrice),
          sortBy,
          page: pageParam,
          limitItems: 8
        });

        setProducts(result.products);
        setTotalCount(result.totalCount);
        setTotalPages(result.totalPages);
      } catch (e) {
        console.error("Failed to load products:", e);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [categoryParam, searchParam, pageParam, minPrice, maxPrice, sortBy]);

  // Handler helpers
  const handleCategorySelect = (cat) => {
    searchParams.set('category', cat);
    searchParams.set('page', '1'); // reset page
    setSearchParams(searchParams);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    searchParams.set('page', newPage.toString());
    setSearchParams(searchParams);
  };

  const handleClearFilters = () => {
    setMinPrice(0);
    setMaxPrice(2500);
    setSortBy('popularity');
    searchParams.delete('category');
    searchParams.delete('search');
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Header and Sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 text-left mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 m-0">
            {categoryParam === 'All' ? 'Browse All Medicines' : categoryParam}
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            {loading ? 'Searching medicines...' : `Showing ${products.length} of ${totalCount} medicines`}
            {searchParam && ` matching "${searchParam}"`}
          </p>
        </div>

        {/* Sort Selector and mobile filter button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex lg:hidden items-center gap-1.5 px-4 py-2.5 bg-slate-50 border border-slate-200/50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-bold text-slate-700">
            <ArrowUpDown size={14} className="text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-700"
            >
              <option value="popularity">Popularity</option>
              <option value="priceLowHigh">Price: Low to High</option>
              <option value="priceHighLow">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        
        {/* SIDEBAR FILTERS (Desktop) */}
        <aside className="hidden lg:flex flex-col gap-6 w-60 flex-shrink-0 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs text-left">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-800 tracking-wide uppercase">Filters</h3>
            <button
              onClick={handleClearFilters}
              className="text-[10px] font-bold text-slate-400 hover:text-primary flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={10} />
              Reset All
            </button>
          </div>

          {/* Categories list */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Categories</h4>
            <div className="flex flex-col gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    categoryParam === cat
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="border-t border-slate-50 pt-5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Price Range</h4>
            <div className="flex flex-col gap-3">
              <input
                id="price-range-slider"
                type="range"
                min="0"
                max="2500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Min: ₹{minPrice}</span>
                <span>Max: ₹{maxPrice}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* MOBILE FILTERS MODAL */}
        {showMobileFilters && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex justify-end animate-fade-in">
            <div className="bg-white w-72 h-full p-6 flex flex-col justify-between overflow-y-auto animate-fade-in">
              <div className="space-y-6 text-left">
                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase">Filters</h3>
                  <button onClick={() => setShowMobileFilters(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600">Close</button>
                </div>

                {/* Categories */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase mb-3">Categories</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => { handleCategorySelect(cat); setShowMobileFilters(false); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                          categoryParam === cat
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-slate-500 border-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price range */}
                <div className="border-t border-slate-50 pt-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase mb-3">Max Price: ₹{maxPrice}</h4>
                  <input
                    id="mobile-price-range-slider"
                    type="range"
                    min="0"
                    max="2500"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full h-1 bg-slate-100 rounded-lg accent-primary"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-4 border-t border-slate-50">
                <button
                  id="mobile-clear-filters-button"
                  onClick={() => { handleClearFilters(); setShowMobileFilters(false); }}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl"
                >
                  Reset
                </button>
                <button
                  id="mobile-apply-filters-button"
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary/95 rounded-xl shadow-xs"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN PRODUCT CATALOG GRID */}
        <div className="flex-1">
          {loading ? (
            <LoadingSkeleton type="card" count={4} />
          ) : products.length > 0 ? (
            <div className="flex flex-col gap-8">
              {/* Product Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(prod => (
                  <ProductCard key={prod.productId} product={prod} />
                ))}
              </div>

              {/* PAGINATOR */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 border-t border-slate-100 pt-6">
                  <button
                    id="prev-page-button"
                    onClick={() => handlePageChange(pageParam - 1)}
                    disabled={pageParam === 1}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 transition-colors ${
                      pageParam === 1 
                        ? 'text-slate-300 bg-slate-50 cursor-not-allowed border-slate-200/50' 
                        : 'text-slate-600 hover:bg-slate-50 bg-white cursor-pointer'
                    }`}
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-9 h-9 text-xs font-extrabold rounded-xl transition-all ${
                            pageParam === pageNum
                              ? 'bg-primary text-white shadow-xs'
                              : 'text-slate-500 hover:bg-slate-50 bg-white border border-slate-200/30'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    id="next-page-button"
                    onClick={() => handlePageChange(pageParam + 1)}
                    disabled={pageParam === totalPages}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 transition-colors ${
                      pageParam === totalPages 
                        ? 'text-slate-300 bg-slate-50 cursor-not-allowed border-slate-200/50' 
                        : 'text-slate-600 hover:bg-slate-50 bg-white cursor-pointer'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl p-8">
              <p className="text-sm font-semibold text-slate-400">No medicines found matching your filters.</p>
              <button
                id="reset-catalog-filters-button"
                onClick={handleClearFilters}
                className="mt-4 px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary/95 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Products;

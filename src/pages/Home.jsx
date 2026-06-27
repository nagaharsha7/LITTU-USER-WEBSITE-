import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import { LoadingSkeleton } from '../components/LoadingSpinner';
import { 
  ArrowRight, 
  Truck, 
  Lock, 
  RotateCcw, 
  HeartHandshake,
  Tag,
  Copy,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const CATEGORIES = [
  'Tablets', 'Capsules', 'Syrups', 'Injection', 'Diabetes Care',
  'Baby Care', 'Skin Care', 'Personal Care', 'Vitamins', 'Healthcare Devices'
];

const HERO_SLIDES = [
  {
    title: "Your Health, Our Priority",
    subtitle: "Get up to 20% off on all essential prescription medicines. Fast door-step delivery.",
    bg: "from-emerald-600 to-teal-800 text-white",
    btnText: "Shop Medicines",
    link: "/products?category=Tablets"
  },
  {
    title: "Vitamins & Immunity Boosters",
    subtitle: "Strengthen your daily health with premium supplements and wellness essentials.",
    bg: "from-indigo-600 to-sky-700 text-white",
    btnText: "Browse Vitamins",
    link: "/products?category=Vitamins"
  },
  {
    title: "Baby Care Essentials",
    subtitle: "Gentle baby powders, oils, and hygiene necessities from top trusted brands.",
    bg: "from-pink-500 to-purple-700 text-white",
    btnText: "Shop Baby Care",
    link: "/products?category=Baby%20Care"
  }
];

const Home = () => {
  const [popularProds, setPopularProds] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [healthEssentials, setHealthEssentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [copiedCoupon, setCopiedCoupon] = useState('');

  // Auto slide interval
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        // Seed database if Firebase config is on and empty
        await productService.seedProductsIfEmpty();

        // Popular Medicines
        const popularRes = await productService.getProducts({ limitItems: 4, sortBy: 'popularity' });
        setPopularProds(popularRes.products);

        // Best Sellers
        const bestSellerRes = await productService.getProducts({ limitItems: 4 });
        setBestSellers(bestSellerRes.products.filter(p => p.isBestSeller || p.productId.includes('01')));

        // Health Essentials (Personal Care, Skin Care, Baby Care)
        const essentialsRes = await productService.getProducts({ limitItems: 12 });
        setHealthEssentials(essentialsRes.products.filter(p => 
          ['Baby Care', 'Personal Care', 'Skin Care'].includes(p.category)
        ).slice(0, 4));

      } catch (error) {
        console.error("Error loading homepage catalog:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(''), 2000);
  };

  const nextSlide = () => setActiveSlide(prev => (prev + 1) % HERO_SLIDES.length);
  const prevSlide = () => setActiveSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-12 animate-fade-in">
      
      {/* 1. Hero Promotional Slider */}
      <section className="relative rounded-3xl overflow-hidden shadow-lg h-[260px] sm:h-[350px]">
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 bg-gradient-to-r ${slide.bg} px-8 sm:px-16 flex flex-col justify-center items-start text-left transition-opacity duration-1000 ${
              idx === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="max-w-md md:max-w-lg flex flex-col gap-3 sm:gap-5">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight m-0 select-none">
                {slide.title}
              </h1>
              <p className="text-xs sm:text-base text-white/95 font-medium leading-relaxed select-none">
                {slide.subtitle}
              </p>
              <Link
                to={slide.link}
                className="mt-2 w-fit bg-white text-slate-800 hover:bg-slate-50 px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                {slide.btnText}
              </Link>
            </div>
          </div>
        ))}

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white z-20 backdrop-blur-xs transition-all border border-white/10 cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white z-20 backdrop-blur-xs transition-all border border-white/10 cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-2 rounded-full transition-all ${idx === activeSlide ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
            />
          ))}
        </div>
      </section>

      {/* 2. Offers / Coupons Section */}
      <section className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-2 border-l-4 border-primary pl-3 text-left">
          <h2 className="text-lg font-bold text-slate-800 m-0">Special Savings For You</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { code: 'LITTU10', discount: '10% OFF', desc: 'On orders above ₹200', bg: 'from-emerald-50 to-teal-50 border-emerald-100 text-emerald-700' },
            { code: 'MED20', discount: '20% OFF', desc: 'On orders above ₹500', bg: 'from-sky-50 to-blue-50 border-sky-100 text-blue-700' },
            { code: 'FREESHIP', discount: 'FREE DELIVERY', desc: 'On orders above ₹300', bg: 'from-amber-50 to-orange-50 border-amber-100 text-orange-700' }
          ].map((coupon) => (
            <div
              key={coupon.code}
              className={`flex items-center justify-between p-4 rounded-2xl border bg-gradient-to-r ${coupon.bg}`}
            >
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded-md border border-white">Promo</span>
                <p className="text-sm font-extrabold mt-1.5">{coupon.discount}</p>
                <p className="text-xs text-slate-500 font-medium">{coupon.desc}</p>
              </div>
              <button
                onClick={() => handleCopyCoupon(coupon.code)}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200/50 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:shadow-xs transition-all cursor-pointer"
              >
                {copiedCoupon === coupon.code ? 'Copied' : (
                  <>
                    <Copy size={13} />
                    <span>{coupon.code}</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Shop by Category */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 border-l-4 border-primary pl-3 text-left">
            <h2 className="text-lg font-bold text-slate-800 m-0">Shop by Category</h2>
          </div>
          <Link to="/products" className="text-xs font-bold text-primary hover:text-primary/90 flex items-center gap-1">
            See All Medicines <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-4">
          {CATEGORIES.map(category => (
            <CategoryCard key={category} category={category} />
          ))}
        </div>
      </section>

      {/* 4. Popular Medicines */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 border-l-4 border-primary pl-3 text-left">
            <h2 className="text-lg font-bold text-slate-800 m-0">Popular Medicines</h2>
          </div>
          <Link to="/products" className="text-xs font-bold text-primary hover:text-primary/90 flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton type="card" count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {popularProds.map(prod => (
              <ProductCard key={prod.productId} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Best Sellers */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 border-l-4 border-primary pl-3 text-left">
            <h2 className="text-lg font-bold text-slate-800 m-0">Best Sellers</h2>
          </div>
          <Link to="/products" className="text-xs font-bold text-primary hover:text-primary/90 flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton type="card" count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bestSellers.map(prod => (
              <ProductCard key={prod.productId} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* 6. Health & Wellness Essentials */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 border-l-4 border-primary pl-3 text-left">
            <h2 className="text-lg font-bold text-slate-800 m-0">Health & Wellness Essentials</h2>
          </div>
          <Link to="/products?category=Personal%20Care" className="text-xs font-bold text-primary hover:text-primary/90 flex items-center gap-1">
            View All Essentials <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton type="card" count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {healthEssentials.map(prod => (
              <ProductCard key={prod.productId} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* 7. Trust Banners */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-50 border border-slate-100 rounded-3xl p-8">
        {[
          { icon: Truck, title: "Super Fast Delivery", desc: "Get medicines delivered inside 2-4 hours locally." },
          { icon: Lock, title: "100% Secure Checkout", desc: "UPI, Cards, and Cash options supported." },
          { icon: RotateCcw, title: "Easy Return/Refund", desc: "Return sealed items within 7 days hassle-free." },
          { icon: HeartHandshake, title: "Dermatologist Verified", desc: "Top clinical formulations and brand products." }
        ].map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div key={idx} className="flex gap-4 items-start text-left">
              <div className="p-3 bg-white text-primary rounded-2xl shadow-sm border border-slate-100">
                <Icon size={20} className="stroke-[2.5px]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{feature.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-normal">{feature.desc}</p>
              </div>
            </div>
          );
        })}
      </section>

    </div>
  );
};

export default Home;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product, Category } from '../types';
import { ArrowRight, ArrowLeft, Star, TrendingUp, Filter } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';

interface HomeProps {
  products: Product[];
  categories: Category[];
}

const Home: React.FC<HomeProps> = ({ products, categories }) => {
  const { t, language, dir } = useLanguage();
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  // Update filtered products when products prop changes or category selection changes
  useEffect(() => {
    if (selectedCategoryId === null) {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.categoryId === selectedCategoryId));
    }
  }, [selectedCategoryId, products]);

  const handleCategoryClick = (id: number) => {
    if (selectedCategoryId === id) {
      setSelectedCategoryId(null); // Toggle off if already selected
    } else {
      setSelectedCategoryId(id);
      // Scroll to products section
      const productsSection = document.getElementById('products');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="pb-20">
      {/* Brutalist Hero Section */}
      <section className="relative h-screen bg-brand-black overflow-hidden flex flex-col justify-end">
        {/* Background Video Wrapper */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-black">
          {/* Fallback Image (visible while video loads or if video fails) */}
          <img 
            src="https://images.unsplash.com/photo-1523396870176-237e77b407bc?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero Background" 
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
          
          {/* Cloudinary Video Iframe */}
          <iframe
            src="https://player.cloudinary.com/embed/?cloud_name=dua3y4qmf&public_id=PinDown.io__conrable_1771477496_mxuiwe&autoplay=true&muted=true&loop=true&controls=false&hide_controls=true"
            className="absolute inset-0 w-full h-full object-cover opacity-80"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
            frameBorder="0"
            title="Hero Video"
            style={{ pointerEvents: 'none' }}
          ></iframe>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
        </div>
        
        {/* Main Content */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-32">
          <div className="flex flex-col items-start max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-brand-yellow text-black px-4 py-2 font-black text-sm tracking-widest uppercase mb-6 transform -rotate-2 inline-block shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
            >
              {t('heroBadge')}
            </motion.div>
            
            <h1 className="text-7xl md:text-9xl font-black text-white leading-[0.85] tracking-tighter mb-6 uppercase overflow-hidden">
              <motion.span 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400"
              >
                {t('heroTitle1')}
              </motion.span>
              <motion.span 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                className="block text-brand-yellow drop-shadow-lg"
              >
                {t('heroTitle2')}
              </motion.span>
            </h1>
            
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-gray-300 text-lg md:text-xl font-light max-w-lg mb-10 leading-relaxed border-l-4 border-brand-yellow pl-4 backdrop-blur-sm bg-black/30 p-4 rounded-r-lg"
            >
              {t('heroDesc')}
            </motion.p>
            
            <motion.a 
              href="#categories" 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.4, delay: 1 }}
              className="group relative inline-flex items-center gap-4 bg-white text-black px-10 py-5 font-black text-xl uppercase tracking-wider hover:bg-brand-yellow transition-colors duration-300 shadow-[8px_8px_0px_0px_rgba(255,215,0,0.5)] hover:shadow-[12px_12px_0px_0px_rgba(255,215,0,0.8)]"
            >
              {t('shopNow')}
              <ArrowIcon className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-2 rtl:group-hover:-translate-x-2" />
              <div className="absolute bottom-0 left-0 w-full h-1 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </motion.a>
          </div>
        </div>

        {/* Marquee Strip */}
        <div className="absolute bottom-0 w-full bg-brand-yellow border-y-4 border-black py-3 overflow-hidden z-20">
          <div className="animate-marquee whitespace-nowrap inline-block">
            <span className="text-2xl font-black text-black uppercase tracking-widest mx-4">
               {t('marqueeText')} &nbsp;&nbsp;&nbsp; {t('marqueeText')} &nbsp;&nbsp;&nbsp; {t('marqueeText')}
            </span>
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section id="categories" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex items-center gap-4 mb-12">
              <div className="w-4 h-12 bg-black"></div>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                {language === 'ar' ? 'تسوق حسب الصنف' : 'SHOP BY CATEGORY'}
              </h2>
           </div>
           
           {categories.length === 0 ? (
               <div className="text-center py-10 text-gray-500 font-bold uppercase">Loading Categories...</div>
           ) : (
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {categories.map((cat) => (
                      <div 
                        key={cat.id} 
                        onClick={() => handleCategoryClick(cat.id)}
                        className={`group relative aspect-square cursor-pointer overflow-hidden border-2 transition-all duration-300 ${selectedCategoryId === cat.id ? 'border-brand-yellow ring-4 ring-brand-yellow/30' : 'border-transparent hover:border-black'}`}
                      >
                         <img 
                            src={cat.image} 
                            alt={language === 'ar' ? cat.nameAr : cat.nameEn} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                         />
                         <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                         <div className="absolute bottom-4 left-4 right-4">
                            <span className={`block text-2xl font-black uppercase text-white drop-shadow-md ${selectedCategoryId === cat.id ? 'text-brand-yellow' : 'group-hover:text-brand-yellow'} transition-colors`}>
                                {language === 'ar' ? cat.nameAr : cat.nameEn}
                            </span>
                         </div>
                      </div>
                  ))}
               </div>
           )}
        </div>
      </section>

      {/* Features Banner */}
      <section className="bg-white py-12 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4 p-6 border border-gray-100 hover:border-black transition-colors">
            <div className="bg-black text-brand-yellow p-3">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg uppercase">{t('deliveryTitle')}</h3>
              <p className="text-sm text-gray-500">{t('deliveryDesc')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 border border-gray-100 hover:border-black transition-colors">
            <div className="bg-black text-brand-yellow p-3">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg uppercase">{t('qualityTitle')}</h3>
              <p className="text-sm text-gray-500">{t('qualityDesc')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 border border-gray-100 hover:border-black transition-colors">
            <div className="bg-black text-brand-yellow p-3">
              <ArrowIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg uppercase">{t('codTitle')}</h3>
              <p className="text-sm text-gray-500">{t('codDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-[600px]">
        <div className="flex items-end justify-between mb-16">
          <div>
            <div className="flex items-center gap-4 mb-2">
                {selectedCategoryId && (
                   <button 
                     onClick={() => setSelectedCategoryId(null)}
                     className="bg-black text-white px-3 py-1 text-sm font-bold uppercase flex items-center gap-2 hover:bg-gray-800"
                   >
                       <Filter className="w-3 h-3" />
                       Clear Filter
                   </button>
                )}
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-2 uppercase tracking-tighter text-black outline-text">
              {selectedCategoryId 
                  ? categories.find(c => c.id === selectedCategoryId)?.[language === 'ar' ? 'nameAr' : 'nameEn'] 
                  : t('featuredProducts')}
            </h2>
            <div className="h-4 w-32 bg-brand-yellow"></div>
          </div>
          <Link to="/" onClick={() => setSelectedCategoryId(null)} className="hidden md:flex text-black hover:text-brand-yellow font-black items-center gap-2 uppercase text-lg tracking-wide border-b-2 border-black pb-1 hover:border-brand-yellow transition-colors">
            {t('viewAll')} <ArrowIcon className="w-5 h-5" />
          </Link>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-200">
            <p className="text-gray-500 font-bold uppercase text-xl">No products found in this category.</p>
            <button 
                onClick={() => setSelectedCategoryId(null)}
                className="mt-4 text-brand-yellow font-black uppercase hover:underline"
            >
                View all products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-16 sm:gap-x-8">
            {filteredProducts.map((product) => (
              <Link to={`/product/${product.id}`} key={product.id} className="group cursor-pointer">
                <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-6 border-2 border-transparent group-hover:border-black transition-all duration-300">
                  <img 
                    src={product.image} 
                    alt={language === 'ar' ? product.nameAr : product.nameEn} 
                    className="w-full h-full object-cover transition-all duration-500"
                  />
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="absolute top-0 right-0 bg-brand-yellow text-black text-sm font-black px-4 py-2 uppercase">
                      {t('sale')}
                    </div>
                  )}
                  {/* Quick Add Overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-black/80 backdrop-blur text-white py-4 text-center transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 font-bold uppercase tracking-wider text-sm hidden md:block">
                    {t('shopNow')}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-black text-xl leading-tight group-hover:text-brand-yellow transition-colors truncate text-start uppercase tracking-tight">
                    {language === 'ar' ? product.nameAr : product.nameEn}
                  </h3>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-2xl">{product.price} {t('price')}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-gray-400 text-base line-through font-medium">
                        {product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {/* Mobile View All */}
        <div className="mt-12 md:hidden text-center">
             <Link to="/" onClick={() => setSelectedCategoryId(null)} className="inline-flex text-black border-2 border-black px-8 py-3 font-black items-center gap-2 uppercase text-lg tracking-wide hover:bg-black hover:text-white transition-colors">
            {t('viewAll')} <ArrowIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
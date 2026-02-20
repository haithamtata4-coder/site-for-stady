import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, Search, Globe } from 'lucide-react';
import { LOGO_URL } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount, onOpenCart }) => {
  const { t, language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Mobile Menu Button (Placeholder) */}
          <div className="flex items-center md:hidden">
            <button className="p-2 text-gray-600 hover:text-black">
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center md:justify-start flex-1 md:flex-none">
            <Link to="/" className="flex items-center gap-2">
              <img src={LOGO_URL} alt="YourTshirtDZ2" className="h-12 w-12 rounded-full object-cover border-2 border-brand-yellow" />
              <span className="font-black text-xl tracking-tighter uppercase hidden sm:block">
                YourTshirt<span className="text-brand-yellow">DZ2</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-900 hover:text-brand-yellow font-bold text-sm uppercase tracking-wide transition-colors">{t('home')}</Link>
            <Link to="/products" className="text-gray-500 hover:text-brand-yellow font-bold text-sm uppercase tracking-wide transition-colors">{t('products')}</Link>
            <Link to="/about-us" className="text-gray-500 hover:text-brand-yellow font-bold text-sm uppercase tracking-wide transition-colors">{t('aboutUs')}</Link>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-sm font-bold text-gray-600 hover:text-black transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'en' ? 'AR' : 'EN'}</span>
            </button>

            <button className="p-2 text-gray-500 hover:text-brand-yellow transition-colors hidden sm:block">
              <Search className="w-5 h-5" />
            </button>
            <button 
              onClick={onOpenCart}
              className="group flex items-center gap-2 bg-black text-white px-4 py-2 rounded-none hover:bg-brand-yellow hover:text-black transition-all duration-300"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="font-bold text-sm hidden sm:block">{t('cart')}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import About from './pages/About';
import CartDrawer from './components/CartDrawer';
import { Product, CartItem, Category } from './types';
import { Facebook, Instagram, Twitter, Loader2 } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { supabase } from './lib/supabase';

function AppContent() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch Categories
        const { data: categoriesData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .order('id');

        if (catError) throw catError;

        if (categoriesData) {
          setCategories(categoriesData.map((c: any) => ({
            id: c.id,
            nameAr: c.name_ar,
            nameEn: c.name_en,
            image: c.image_url
          })));
        }

        // 2. Fetch Products
        const { data: productsData, error: prodError } = await supabase
          .from('products')
          .select(`
            *,
            variants:product_variants(*),
            category:categories(name_en)
          `);

        if (prodError) throw prodError;

        if (productsData) {
          const mappedProducts: Product[] = productsData.map((p: any) => ({
            id: p.id,
            categoryId: p.category_id,
            nameAr: p.name_ar,
            nameEn: p.name_en,
            descriptionAr: p.description_ar,
            descriptionEn: p.description_en,
            price: p.price,
            originalPrice: p.original_price,
            image: p.image_url,
            category: p.category ? p.category.name_en : 'Uncategorized', // Fallback for display
            variants: p.variants.map((v: any) => ({
              id: v.id,
              size: v.size,
              color: v.color,
              quantity: v.quantity,
              sku: v.sku
            }))
          }));
          setProducts(mappedProducts);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addToCart = (product: Product, size: string, color: string, quantity: number) => {
    const selectedVariant = product.variants.find(v => v.size === size && v.color === color);
    const selectedVariantId = selectedVariant ? selectedVariant.id : 'unknown';

    const newItem: CartItem = {
      ...product,
      selectedVariantId: String(selectedVariantId),
      selectedSize: size,
      selectedColor: color,
      quantity,
      cartId: `${product.id}-${size}-${color}-${Date.now()}`
    };

    setCart(prev => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-brand-yellow" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans text-brand-black">
        <Navbar cartCount={cart.length} onOpenCart={() => setIsCartOpen(true)} />
        
        <CartDrawer 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          items={cart} 
          onRemove={removeFromCart}
          total={cartTotal}
        />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home products={products} categories={categories} />} />
            <Route path="/product/:id" element={<ProductDetails products={products} onAddToCart={addToCart} />} />
            <Route path="/checkout" element={
              <Checkout 
                cart={cart} 
                total={cartTotal} 
                onClearCart={clearCart} 
              />
            } />
            <Route path="/about-us" element={<About />} />
          </Routes>
        </main>

        <footer className="bg-black text-white py-12">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-black mb-4">YourTshirt<span className="text-brand-yellow">DZ2</span></h3>
              <p className="text-gray-400 max-w-sm">
                {t('aboutText')}
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">{t('quickLinks')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about-us" className="hover:text-brand-yellow">{t('aboutUs')}</Link></li>
                <li><a href="#" className="hover:text-brand-yellow">{t('deliveryPolicy')}</a></li>
                <li><a href="#" className="hover:text-brand-yellow">{t('faq')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">{t('contactUs')}</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-brand-yellow hover:text-black transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-brand-yellow hover:text-black transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-brand-yellow hover:text-black transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="text-center text-gray-600 mt-12 pt-8 border-t border-gray-800">
            {t('rights')}
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
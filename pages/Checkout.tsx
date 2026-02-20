import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { OrderFormState, CartItem, WilayaData, BaladiyaData } from '../types';
import { ArrowLeft, ArrowRight, Truck, MapPin, Instagram, CheckCircle, Building2, Home, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CheckoutProps {
  cart: CartItem[];
  total: number;
  onClearCart: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cart, total, onClearCart }) => {
  const navigate = useNavigate();
  const { t, language, dir } = useLanguage();
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [formData, setFormData] = useState<OrderFormState>({
    firstName: '',
    lastName: '',
    phone: '',
    wilayaId: 0,
    baladiyaId: 0,
    instagram: '',
    deliveryMethod: 'stopdesk',
    address: ''
  });
  
  const [wilayas, setWilayas] = useState<WilayaData[]>([]);
  const [baladiyas, setBaladiyas] = useState<BaladiyaData[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Fetch Wilayas and Baladiyas from Supabase
  useEffect(() => {
    const fetchLocations = async () => {
        try {
            const { data: wilayasData } = await supabase.from('wilayas').select('*').order('code');
            const { data: baladiyasData } = await supabase.from('baladiyas').select('*').order('name_ar');
            
            if (wilayasData) {
                setWilayas(wilayasData.map(w => ({
                    id: w.id,
                    code: w.code,
                    nameAr: w.name_ar,
                    nameEn: w.name_en,
                    deliveryPriceHome: w.delivery_price_home,
                    deliveryPriceDesk: w.delivery_price_desk
                })));
            }
            if (baladiyasData) {
                setBaladiyas(baladiyasData.map(b => ({
                    id: b.id,
                    wilayaId: b.wilaya_id,
                    nameAr: b.name_ar,
                    nameEn: b.name_en || b.name_ar
                })));
            }
        } catch (err) {
            console.error("Error fetching locations", err);
        } finally {
            setLoadingLocations(false);
        }
    };
    fetchLocations();
  }, []);

  // Filter baladiyas based on selected wilaya
  const filteredBaladiyas = baladiyas.filter(b => b.wilayaId === Number(formData.wilayaId));

  // Recalculate delivery price when Wilaya or Method changes
  useEffect(() => {
    const wilaya = wilayas.find(w => w.id === Number(formData.wilayaId));
    if (wilaya) {
        if (formData.deliveryMethod === 'home') {
            setDeliveryPrice(wilaya.deliveryPriceHome);
        } else {
            setDeliveryPrice(wilaya.deliveryPriceDesk);
        }
    } else {
        setDeliveryPrice(0);
    }
  }, [formData.wilayaId, formData.deliveryMethod, wilayas]);

  const finalTotal = total + deliveryPrice;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDeliveryChange = (method: 'home' | 'stopdesk') => {
    setFormData(prev => ({ ...prev, deliveryMethod: method }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
        // 1. Insert Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                first_name: formData.firstName,
                last_name: formData.lastName,
                phone: formData.phone,
                wilaya_id: Number(formData.wilayaId),
                baladiya_id: Number(formData.baladiyaId),
                address: formData.address,
                instagram_handle: formData.instagram,
                delivery_method: formData.deliveryMethod,
                shipping_fee: deliveryPrice,
                total_amount: finalTotal,
                status: 'pending'
            })
            .select()
            .single();

        if (orderError) throw orderError;

        if (order) {
            // 2. Insert Order Items
            const orderItems = cart.map(item => ({
                order_id: order.id,
                product_id: item.id,
                variant_id: Number(item.selectedVariantId),
                quantity: item.quantity,
                price_at_purchase: item.price
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);
            
            if (itemsError) throw itemsError;

            // Success
            setIsSuccess(true);
            onClearCart();
        }
    } catch (err: any) {
        console.error("Order submission error:", err);
        setSubmitError(err.message || "Failed to submit order. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    const successMsg = t('successMessage')
      .replace('{name}', formData.firstName)
      .replace('{phone}', formData.phone);

    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="bg-green-100 p-6 rounded-full mb-6 animate-bounce">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>
        <h2 className="text-3xl font-black mb-4 uppercase">{t('successTitle')}</h2>
        <p className="text-gray-600 max-w-md mb-8">
          {successMsg}
        </p>
        <button 
          onClick={() => navigate('/')}
          className="bg-black text-white px-8 py-3 rounded-none font-bold hover:bg-gray-800 transition-colors uppercase"
        >
          {t('backToStore')}
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <p className="text-xl font-bold mb-4 uppercase">{t('emptyCart')}</p>
        <button 
          onClick={() => navigate('/')}
          className="text-brand-yellow font-bold underline uppercase"
        >
          {t('browseProducts')}
        </button>
      </div>
    );
  }

  const selectedWilayaData = wilayas.find(w => w.id === Number(formData.wilayaId));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black mb-8 text-center uppercase tracking-tight">{t('checkoutTitle')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Order Summary */}
        <div className="md:col-span-1 order-2 md:order-1">
          <div className="bg-gray-50 p-6 rounded-none sticky top-24 border border-gray-100">
            <h3 className="font-bold text-lg mb-4 uppercase">{t('orderSummary')}</h3>
            <div className="space-y-4 mb-6">
              {cart.map(item => (
                <div key={item.cartId} className="flex gap-3 text-sm">
                  <div className="w-12 h-12 bg-white rounded-none overflow-hidden flex-shrink-0 border border-gray-200">
                    <img src={item.image} alt={language === 'ar' ? item.nameAr : item.nameEn} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold line-clamp-1 uppercase">{language === 'ar' ? item.nameAr : item.nameEn}</p>
                    <p className="text-gray-500">{item.selectedSize} / {item.selectedColor} x {item.quantity}</p>
                  </div>
                  <div className="font-bold">{item.price * item.quantity} {t('price')}</div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 uppercase text-xs font-bold">{t('subtotal')}</span>
                <span className="font-bold">{total} {t('price')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 uppercase text-xs font-bold">{t('delivery')}</span>
                <span className="font-bold">{deliveryPrice > 0 ? `${deliveryPrice} ${t('price')}` : '-'}</span>
              </div>
              <div className="flex justify-between text-xl font-black pt-2 border-t border-gray-200 mt-2 uppercase">
                <span>{t('total')}</span>
                <span className="text-black bg-brand-yellow px-2 rounded-none">{finalTotal} {t('price')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="md:col-span-2 order-1 md:order-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Delivery Method */}
            <div className="bg-white p-6 rounded-none border-2 border-gray-100 shadow-none">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 uppercase">
                <Truck className="w-5 h-5 text-brand-yellow" />
                {t('deliveryMethod')}
              </h3>
              
              {!formData.wilayaId && (
                  <div className="mb-4 bg-yellow-50 p-3 text-sm font-bold text-yellow-800 border border-yellow-200">
                      Please select a Wilaya first to see shipping rates.
                  </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div 
                  onClick={() => handleDeliveryChange('stopdesk')}
                  className={`cursor-pointer p-4 rounded-none border-2 transition-all flex items-center justify-between ${formData.deliveryMethod === 'stopdesk' ? 'border-brand-yellow bg-yellow-50' : 'border-gray-200 hover:border-black'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-none border-2 flex items-center justify-center ${formData.deliveryMethod === 'stopdesk' ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="font-bold text-sm uppercase block">{t('stopdesk')}</span>
                        <span className="text-xs text-gray-500">Yalidine / Desk</span>
                    </div>
                  </div>
                  <span className="font-bold text-gray-500">
                      {selectedWilayaData ? selectedWilayaData.deliveryPriceDesk : '-'} {t('price')}
                  </span>
                </div>

                <div 
                  onClick={() => handleDeliveryChange('home')}
                  className={`cursor-pointer p-4 rounded-none border-2 transition-all flex items-center justify-between ${formData.deliveryMethod === 'home' ? 'border-brand-yellow bg-yellow-50' : 'border-gray-200 hover:border-black'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-none border-2 flex items-center justify-center ${formData.deliveryMethod === 'home' ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                        <Home className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="font-bold text-sm uppercase block">{t('homeDelivery')}</span>
                        <span className="text-xs text-gray-500">Door to Door</span>
                    </div>
                  </div>
                  <span className="font-bold text-gray-500">
                       {selectedWilayaData ? selectedWilayaData.deliveryPriceHome : '-'} {t('price')}
                  </span>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="bg-white p-6 rounded-none border-2 border-gray-100 shadow-none">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 uppercase">
                <MapPin className="w-5 h-5 text-brand-yellow" />
                {t('shippingInfo')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 uppercase">{t('firstName')}</label>
                  <input 
                    type="text" 
                    name="firstName"
                    required 
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-none p-3 focus:outline-none focus:border-black focus:ring-0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 uppercase">{t('lastName')}</label>
                  <input 
                    type="text" 
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-none p-3 focus:outline-none focus:border-black focus:ring-0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 uppercase">{t('phone')}</label>
                  <input 
                    type="tel" 
                    name="phone"
                    required
                    placeholder="05/06/07..."
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-none p-3 focus:outline-none focus:border-black focus:ring-0"
                  />
                </div>
                
                {/* Wilaya Selector */}
                <div>
                  <label className="block text-sm font-bold mb-2 uppercase">{t('wilaya')}</label>
                  <select 
                    name="wilayaId"
                    required
                    value={formData.wilayaId}
                    onChange={handleChange}
                    disabled={loadingLocations}
                    className="w-full bg-gray-50 border border-gray-200 rounded-none p-3 focus:outline-none focus:border-black focus:ring-0"
                  >
                    <option value="">{loadingLocations ? "Loading..." : t('selectWilaya')}</option>
                    {wilayas.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.code} - {language === 'ar' ? w.nameAr : w.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Baladiya Selector (Dynamic) */}
                <div className={formData.deliveryMethod === 'home' ? '' : 'sm:col-span-2'}>
                  <label className="block text-sm font-bold mb-2 uppercase">{t('baladiya')}</label>
                  {filteredBaladiyas.length > 0 ? (
                      <select 
                        name="baladiyaId"
                        required
                        value={formData.baladiyaId}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-none p-3 focus:outline-none focus:border-black focus:ring-0"
                      >
                        <option value="">Select Baladiya</option>
                        {filteredBaladiyas.map(b => (
                            <option key={b.id} value={b.id}>
                                {language === 'ar' ? b.nameAr : b.nameEn}
                            </option>
                        ))}
                      </select>
                  ) : (
                    <input 
                        type="text" 
                        name="baladiya" 
                        required={filteredBaladiyas.length === 0}
                        placeholder={t('baladiya')}
                        disabled
                        className="w-full bg-gray-100 border border-gray-200 rounded-none p-3 focus:outline-none cursor-not-allowed"
                        value={formData.wilayaId ? "No Baladiyas found" : t('selectWilaya')}
                    />
                  )}
                </div>

                {/* Conditional Address Field */}
                {formData.deliveryMethod === 'home' && (
                  <div className="sm:col-span-1 animate-fadeIn">
                    <label className="block text-sm font-bold mb-2 text-brand-yellow uppercase">{t('address')}</label>
                    <input 
                      type="text" 
                      name="address"
                      required
                      placeholder={t('addressPlaceholder')}
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full bg-yellow-50 border border-brand-yellow rounded-none p-3 focus:outline-none focus:ring-1 focus:ring-brand-yellow"
                    />
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold mb-2 flex items-center gap-2 uppercase">
                    <Instagram className="w-4 h-4" />
                    {t('instagram')}
                  </label>
                  <input 
                    type="text" 
                    name="instagram"
                    placeholder="@username"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-none p-3 focus:outline-none focus:border-black focus:ring-0"
                  />
                </div>
              </div>
            </div>

            {submitError && (
                <div className="bg-red-50 text-red-600 p-4 border border-red-200 font-bold">
                    {submitError}
                </div>
            )}

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-black text-brand-yellow font-black text-xl py-4 rounded-none hover:bg-gray-900 transition-all shadow-none border-b-4 border-yellow-600 active:border-b-0 active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase tracking-wider"
            >
              {isSubmitting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    {t('processing')}
                  </>
              ) : (
                  <>
                    {t('confirmOrder')}
                    <ArrowIcon className="w-6 h-6" />
                  </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Product } from '../types';
import { I18N } from '../constants';
import { Search, ShoppingCart, Filter, ChevronDown, ImageOff } from 'lucide-react';
import { ShopCategory } from '../App';
import { fetchProducts, getDiscountedPrice } from '../services/productService';

interface ShopProps {
  addToCart: (product: Product) => void;
  lang: 'en' | 'am';
  categoryFilter: ShopCategory;
}

const Shop: React.FC<ShopProps> = ({ addToCart, lang, categoryFilter }) => {
  const t = I18N[lang];
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<'all' | 'new' | 'used'>('all');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const loadProducts = useCallback(async (isMountedRef?: { current: boolean }) => {
    try {
      const data = await fetchProducts();
      if (!isMountedRef || isMountedRef.current) {
        setProducts(data);
        setLoadError('');
      }
    } catch (err: any) {
      if (!isMountedRef || isMountedRef.current) {
        setLoadError(err?.message || 'Failed to load products.');
      }
    } finally {
      if (!isMountedRef || isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const isMountedRef = { current: true };
    setIsLoading(true);
    setLoadError('');
    loadProducts(isMountedRef);

    const refresh = () => loadProducts(isMountedRef);
    const poll = window.setInterval(refresh, 15000);
    const handleInventoryUpdate = () => refresh();
    const handleFocus = () => refresh();

    window.addEventListener('inventory-updated', handleInventoryUpdate);
    window.addEventListener('focus', handleFocus);

    return () => {
      isMountedRef.current = false;
      window.clearInterval(poll);
      window.removeEventListener('inventory-updated', handleInventoryUpdate);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadProducts]);

  useEffect(() => {
    setActiveType('all');
    setConditionFilter('all');
  }, [categoryFilter]);

  const filteredProducts = useMemo(() => {
    // 1. Base criteria that apply to everything (Search & Condition)
    const baseFiltered = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCondition = conditionFilter === 'all' || p.condition === conditionFilter;
      return matchesSearch && matchesCondition;
    });

    if (categoryFilter === 'phones') {
      // Logic for Phones page
      let result = baseFiltered.filter(p => p.category === 'Phone');
      
      if (activeType !== 'all') {
        if (activeType === 'brick') {
          result = result.filter(p => 
            p.description.toLowerCase().includes('brick') || 
            p.description.toLowerCase().includes('feature phone') ||
            p.name.toLowerCase().includes('nokia 105') ||
            p.name.toLowerCase().includes('tecno t301')
          );
        } else {
          result = result.filter(p => p.name.toLowerCase().includes(activeType.toLowerCase()));
        }
      }
      return result;
    } else {
      // Logic for Accessories page
      if (activeType === 'all') {
        // Show all accessories only
        return baseFiltered.filter(p => p.category !== 'Phone');
      }

      return baseFiltered.filter(
        p => p.category !== 'Phone' && p.category.toLowerCase() === activeType.toLowerCase()
      );
    }
  }, [searchTerm, activeType, conditionFilter, categoryFilter, products]);

  const discountedProducts = useMemo(
    () => filteredProducts.filter(p => (p.discountPercent ?? 0) > 0),
    [filteredProducts]
  );
  const regularProducts = useMemo(
    () => filteredProducts.filter(p => !p.discountPercent || p.discountPercent <= 0),
    [filteredProducts]
  );

  const renderFilters = () => {
    if (categoryFilter === 'phones') {
      const phoneTypes = [
        { id: 'all', label: 'All Brands' },
        { id: 'iphone', label: 'iPhone' },
        { id: 'samsung', label: 'Samsung' },
        { id: 'pixel', label: 'Google Pixel' },
        { id: 'tecno', label: 'Tecno' },
        { id: 'infinix', label: 'Infinix' },
        { id: 'redmi', label: 'Redmi' },
        { id: 'itel', label: 'Itel' },
        { id: 'oppo', label: 'Oppo' },
        { id: 'brick', label: 'Brick Phones' },
      ];
      return phoneTypes.map(ft => (
        <button
            key={ft.id}
            onClick={() => setActiveType(ft.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeType === ft.id ? 'bg-[var(--primary)] text-white shadow-lg' : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:text-white hover:border-[var(--primary)]'}`}
        >
            {ft.label}
        </button>
      ));
    } else {
      const accTypes = [
        { id: 'all', label: 'All Accessories' },
        { id: 'case', label: 'Cases' },
        { id: 'charger', label: 'Chargers' },
        { id: 'audio', label: 'Audio' },
        { id: 'wearable', label: 'Wearables' },
      ];
      return accTypes.map(ft => (
        <button
            key={ft.id}
            onClick={() => setActiveType(ft.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeType === ft.id ? 'bg-[var(--primary)] text-white shadow-lg' : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:text-white hover:border-[var(--primary)]'}`}
        >
            {ft.label}
        </button>
      ));
    }
  };

  return (
    <div className="py-9 px-[5%] max-w-[1120px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-end mb-7 gap-5 border-b border-[var(--border)] pb-5">
        <div>
            <h2 className="text-2xl md:text-3xl font-black text-[var(--text-main)] mb-1 tracking-tight">
                {categoryFilter === 'phones' ? 'Mobile Phones' : 'Accessories'}
            </h2>
            <p className="text-xs md:text-sm text-[var(--text-muted)]">
                {categoryFilter === 'phones' ? 'Latest smartphones and durable button phones.' : 'Enhance your daily tech.'}
            </p>
        </div>
        <div className="relative w-full md:w-80 group">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)]" size={20} />
             <input 
               type="text" 
               placeholder={t.searchPlaceholder}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="form-control pl-10"
             />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-7 items-center">
        <div className="flex gap-2 flex-wrap items-center flex-1">
            <Filter size={16} className="text-[var(--text-muted)]" />
            {renderFilters()}
        </div>
        <div className="relative min-w-[150px]">
            <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value as any)}
                className="appearance-none bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] py-2 pl-4 pr-10 rounded-full focus:outline-none focus:border-[var(--primary)] cursor-pointer text-sm font-medium w-full"
            >
                <option value="all">Any Condition</option>
                <option value="new">Brand New</option>
                <option value="used">Used / Refurbished</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" size={16} />
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-16 text-[var(--text-muted)]">Loading products...</div>
      )}

      {!isLoading && loadError && (
        <div className="text-center py-16 text-red-500">{loadError}</div>
      )}

      {!isLoading && !loadError && discountedProducts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg md:text-xl font-black text-[var(--text-main)] tracking-tight">Discounted Deals</h3>
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
              Limited Offers
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {discountedProducts.map(product => {
              const finalPrice = getDiscountedPrice(product);
              const hasDiscount = (product.discountPercent ?? 0) > 0;
              const isOutOfStock = product.stock <= 0 || product.status === 'out_of_stock';
              const isLowStock = product.stock > 0 && product.stock <= 5;
              return (
                <div key={`discount-${product.id}`} className="card group flex flex-col justify-between overflow-hidden p-0 border-0 bg-[var(--bg-card)] ring-1 ring-[var(--border)] hover:ring-[var(--primary)] transition-all aspect-square min-h-[22rem]">
                  <div className="h-[52%] relative overflow-hidden bg-[#0F1014] flex items-center justify-center">
                      {!imageErrors[product.id] ? (
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-contain p-2 md:p-3 transition-transform duration-700 group-hover:scale-105" 
                            onError={() => setImageErrors(prev => ({...prev, [product.id]: true}))}
                        />
                      ) : (
                        <div className="flex flex-col items-center text-[var(--text-muted)] opacity-50"><ImageOff size={40} /></div>
                      )}
                      <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                          <span className="backdrop-blur-md bg-black/60 text-white text-xs font-bold px-2 py-1 rounded border border-white/10 uppercase">
                              {product.category}
                          </span>
                          {product.condition === 'used' && (
                              <span className="bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded uppercase">Used</span>
                          )}
                          {hasDiscount && (
                              <span className="bg-emerald-500 text-black text-xs font-bold px-2 py-1 rounded uppercase">
                                -{product.discountPercent}%
                              </span>
                          )}
                      </div>
                  </div>

                  <div className="p-3 md:p-4 flex flex-col flex-1 min-h-0">
                      <div className="flex-1">
                          <h3 className="font-bold text-sm md:text-base mb-1 text-[var(--text-main)] line-clamp-2">{product.name}</h3>
                          <p className="text-[var(--text-muted)] text-xs md:text-sm line-clamp-2 mb-3 min-h-[2.5rem] md:min-h-[3rem]">{product.description}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                            <span className={`${isOutOfStock ? 'text-red-500' : 'text-emerald-500'}`}>
                              {isOutOfStock ? 'Out of stock' : `${product.stock} in stock`}
                            </span>
                            {isLowStock && (
                              <span className="text-amber-500">Only {product.stock} left</span>
                            )}
                          </div>
                      </div>
                      <div className="flex items-center justify-between gap-3 mt-auto pt-3 border-t border-[var(--border)]">
                          <div className="flex flex-col">
                            <span className="text-sm md:text-base font-bold text-[var(--text-main)]">{finalPrice.toLocaleString()} ETB</span>
                            <span className="text-xs text-[var(--text-muted)] line-through">{product.price.toLocaleString()} ETB</span>
                          </div>
                          <button 
                              onClick={() => addToCart(product)}
                              disabled={isOutOfStock}
                              className="btn btn-primary btn-sm relative overflow-hidden w-full sm:w-12 sm:hover:w-36 px-3 sm:px-0 justify-center sm:justify-start transition-all duration-300 group/btn text-xs"
                          >
                              <span className="hidden sm:flex absolute inset-0 items-center justify-center transition-opacity duration-200 group-hover/btn:opacity-0">
                                  <ShoppingCart size={16} />
                              </span>
                              <span className="flex items-center gap-2 whitespace-nowrap sm:opacity-0 sm:group-hover/btn:opacity-100 transition-opacity duration-200">
                                  <ShoppingCart size={16} /> Add to cart
                              </span>
                          </button>
                      </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!isLoading && !loadError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {regularProducts.map(product => {
          const finalPrice = getDiscountedPrice(product);
          const hasDiscount = (product.discountPercent ?? 0) > 0;
          const isOutOfStock = product.stock <= 0 || product.status === 'out_of_stock';
          const isLowStock = product.stock > 0 && product.stock <= 5;
          return (
          <div key={product.id} className="card group flex flex-col justify-between overflow-hidden p-0 border-0 bg-[var(--bg-card)] ring-1 ring-[var(--border)] hover:ring-[var(--primary)] transition-all aspect-square min-h-[22rem]">
            <div className="h-[52%] relative overflow-hidden bg-[#0F1014] flex items-center justify-center">
                {!imageErrors[product.id] ? (
                  <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-contain p-2 md:p-3 transition-transform duration-700 group-hover:scale-105" 
                      onError={() => setImageErrors(prev => ({...prev, [product.id]: true}))}
                  />
                ) : (
                  <div className="flex flex-col items-center text-[var(--text-muted)] opacity-50"><ImageOff size={40} /></div>
                )}
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    <span className="backdrop-blur-md bg-black/60 text-white text-xs font-bold px-2 py-1 rounded border border-white/10 uppercase">
                        {product.category}
                    </span>
                    {product.condition === 'used' && (
                        <span className="bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded uppercase">Used</span>
                    )}
                    {hasDiscount && (
                        <span className="bg-emerald-500 text-black text-xs font-bold px-2 py-1 rounded uppercase">
                          -{product.discountPercent}%
                        </span>
                    )}
                </div>
            </div>

            <div className="p-3 md:p-4 flex flex-col flex-1 min-h-0">
                <div className="flex-1">
                    <h3 className="font-bold text-sm md:text-base mb-1 text-[var(--text-main)] line-clamp-2">{product.name}</h3>
                    <p className="text-[var(--text-muted)] text-xs md:text-sm line-clamp-2 mb-3 min-h-[2.5rem] md:min-h-[3rem]">{product.description}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                      <span className={`${isOutOfStock ? 'text-red-500' : 'text-emerald-500'}`}>
                        {isOutOfStock ? 'Out of stock' : `${product.stock} in stock`}
                      </span>
                      {isLowStock && (
                        <span className="text-amber-500">Only {product.stock} left</span>
                      )}
                    </div>
                </div>
                <div className="flex items-center justify-between gap-3 mt-auto pt-3 border-t border-[var(--border)]">
                    <div className="flex flex-col">
                      <span className="text-sm md:text-base font-bold text-[var(--text-main)]">{finalPrice.toLocaleString()} ETB</span>
                      {hasDiscount && (
                        <span className="text-xs text-[var(--text-muted)] line-through">{product.price.toLocaleString()} ETB</span>
                      )}
                    </div>
                    <button 
                        onClick={() => addToCart(product)}
                        disabled={isOutOfStock}
                        className="btn btn-primary btn-sm relative overflow-hidden w-full sm:w-12 sm:hover:w-36 px-3 sm:px-0 justify-center sm:justify-start transition-all duration-300 group/btn text-xs"
                    >
                        <span className="hidden sm:flex absolute inset-0 items-center justify-center transition-opacity duration-200 group-hover/btn:opacity-0">
                            <ShoppingCart size={16} />
                        </span>
                        <span className="flex items-center gap-2 whitespace-nowrap sm:opacity-0 sm:group-hover/btn:opacity-100 transition-opacity duration-200">
                            <ShoppingCart size={16} /> Add to cart
                        </span>
                    </button>
                </div>
            </div>
          </div>
          );
        })}
      </div>
      )}
      
      {!isLoading && !loadError && filteredProducts.length === 0 && (
        <div className="text-center py-20 bg-[var(--bg-card)] rounded-[2rem] border border-dashed border-[var(--border)]">
           <div className="text-[var(--text-muted)] mb-4"><Filter size={48} className="mx-auto opacity-20" /></div>
           <h3 className="text-xl font-bold text-[var(--text-main)]">No products found</h3>
           <p className="text-[var(--text-muted)]">Try adjusting your filters or search term.</p>
        </div>
      )}
    </div>
  );
};

export default Shop;

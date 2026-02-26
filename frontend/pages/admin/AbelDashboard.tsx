import React, { useState, useRef, useEffect } from 'react';
import { RepairStatus, Product, RepairRequest } from '../../types';
import { DollarSign, PenTool, AlertTriangle, Check, X, Plus, Upload, Trash2, Pencil, Search } from 'lucide-react';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProductImages,
  getDiscountedPrice,
  CreateProductInput
} from '../../services/productService';
import { fetchRepairs, updateRepairStatus as updateRepairStatusApi } from '../../services/repairService';
import { fetchProfile, updateProfile } from '../../services/userService';

const PRODUCT_NAME_OPTIONS = [
  'iPhone 15 Pro Max',
  'iPhone 15 Pro',
  'iPhone 15 Plus',
  'iPhone 15',
  'iPhone 14 Pro Max',
  'iPhone 14 Pro',
  'iPhone 13 (Refurbished)',
  'Samsung Galaxy S24 Ultra',
  'Samsung Galaxy S24+',
  'Samsung Galaxy S24',
  'Samsung Galaxy A54',
  'Google Pixel 8 Pro',
  'Google Pixel 8',
  'Tecno Spark 10 Pro',
  'Tecno Camon 20',
  'Infinix Note 30',
  'Infinix Hot 30',
  'Redmi Note 12 Pro',
  'Redmi Note 12',
  'Itel P40',
  'Oppo Reno 10',
  'Nokia 105 (Brick Phone)',
  'Tecno T301',
  'Anker 737 Power Bank',
  'Anker 20W Wall Charger',
  'MagSafe Clear Case',
  'Silicone Case (Universal)',
  'Privacy Screen Protector',
  'Airpods Pro (2nd Gen)',
  'USB-C to Lightning Cable',
  'USB-C to USB-C Cable (60W)',
];

type ProductFormState = {
  name: string;
  category: string;
  condition: 'new' | 'used';
  price: number;
  discountPercent: number;
  stock: number;
  description: string;
  image: string;
  brand: string;
};

const AbelDashboard: React.FC = () => {
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [isLoadingRepairs, setIsLoadingRepairs] = useState(true);
  const [repairError, setRepairError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productError, setProductError] = useState('');
  const [activeView, setActiveView] = useState<'overview' | 'repairs' | 'products' | 'profile'>('overview');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modal State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productFormError, setProductFormError] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<ProductFormState>({
    name: PRODUCT_NAME_OPTIONS[0],
    category: 'Phone',
    condition: 'new',
    price: 0,
    discountPercent: 0,
    stock: 0,
    description: '',
    image: '',
    brand: ''
  });
  const [imageQuery, setImageQuery] = useState('');
  const [imageResults, setImageResults] = useState<string[]>([]);
  const [isImageSearching, setIsImageSearching] = useState(false);
  const [imageSearchError, setImageSearchError] = useState('');
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileStatus, setProfileStatus] = useState('');
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoadingProducts(true);
    setProductError('');
    const storedUser = localStorage.getItem('abel_user');
    const shopId = storedUser ? JSON.parse(storedUser).shopId : undefined;
    fetchProducts({ shopId })
      .then(data => {
        if (isMounted) setProducts(data);
      })
      .catch(err => {
        if (isMounted) setProductError(err?.message || 'Failed to load products.');
      })
      .finally(() => {
        if (isMounted) setIsLoadingProducts(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingRepairs(true);
    setRepairError('');
    fetchRepairs()
      .then(data => {
        if (isMounted) setRepairs(data);
      })
      .catch(err => {
        if (isMounted) setRepairError(err?.message || 'Failed to load repairs.');
      })
      .finally(() => {
        if (isMounted) setIsLoadingRepairs(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchProfile()
      .then(profile => {
        if (!isMounted) return;
        setProfileForm({
          name: profile.name || '',
          email: profile.email || '',
          password: '',
          confirmPassword: ''
        });
      })
      .catch(err => {
        if (!isMounted) return;
        setProfileError(err?.message || 'Failed to load profile.');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const updateRepairStatus = async (id: string, status: RepairStatus) => {
    try {
      const updated = await updateRepairStatusApi(id, status);
      setRepairs(prev => prev.map(r => (r.id === updated.id ? updated : r)));
    } catch (err: any) {
      setRepairError(err?.message || 'Failed to update repair.');
    }
  };

  const resetProductForm = () => {
    setNewProduct({
      name: PRODUCT_NAME_OPTIONS[0],
      category: 'Phone',
      condition: 'new',
      price: 0,
      discountPercent: 0,
      stock: 0,
      description: '',
      image: '',
      brand: ''
    });
    setEditingProduct(null);
    setImageQuery('');
    setImageResults([]);
    setImageSearchError('');
    setProductFormError('');
  };

  const openAddProduct = () => {
    resetProductForm();
    setIsAddProductOpen(true);
  };

  const closeProductModal = () => {
    setIsAddProductOpen(false);
    resetProductForm();
  };

  const buildPayload = (): CreateProductInput => {
    const isPhone = newProduct.category.toLowerCase() === 'phone';
    const category = isPhone ? 'phone' : 'accessory';
    const subcategory = isPhone ? undefined : newProduct.category.toLowerCase();
    const trimmedName = newProduct.name.trim();
    const brand = newProduct.brand.trim() || trimmedName.split(' ')[0] || '';

    const discountPercent = Math.min(90, Math.max(0, Number(newProduct.discountPercent) || 0));

    return {
      name: trimmedName,
      description: newProduct.description.trim(),
      category,
      subcategory,
      brand,
      condition: newProduct.condition,
      price: Number(newProduct.price),
      discountPercent,
      stock: Number(newProduct.stock),
      imageUrl: newProduct.image
    };
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProduct(true);
    setProductFormError('');
    try {
      const payload = buildPayload();
      if (!payload.name || !payload.price) {
        setProductFormError('Please provide a product name and price.');
        return;
      }
      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, payload);
        setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
      } else {
        const created = await createProduct(payload);
        setProducts(prev => [created, ...prev]);
      }
      setIsAddProductOpen(false);
      resetProductForm();
    } catch (err: any) {
      setProductFormError(err?.message || 'Failed to save product.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      category: product.category,
      condition: product.condition,
      price: product.price,
      discountPercent: product.discountPercent ?? 0,
      stock: product.stock,
      description: product.description,
      image: product.image,
      brand: product.brand || ''
    });
    setProductFormError('');
    setImageQuery('');
    setImageResults([]);
    setImageSearchError('');
    setIsAddProductOpen(true);
  };

  const handleDeleteProduct = async (product: Product) => {
    const confirmed = window.confirm(`Delete "${product.name}"? This will remove it from the store.`);
    if (!confirmed) return;
    try {
      await deleteProduct(product.id);
      setProducts(prev => prev.filter(p => p.id !== product.id));
    } catch (err: any) {
      setProductError(err?.message || 'Failed to delete product.');
    }
  };

  const handleImageSearch = async () => {
    if (!imageQuery.trim()) return;
    setIsImageSearching(true);
    setImageSearchError('');
    try {
      const results = await searchProductImages(imageQuery.trim());
      setImageResults(results);
      if (results.length === 0) {
        setImageSearchError('No images found. Try a different query.');
      }
    } catch (err: any) {
      setImageSearchError(err?.message || 'Image search failed.');
    } finally {
      setIsImageSearching(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileStatus('');
    setProfileError('');
    if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
      setProfileError('Passwords do not match.');
      setProfileSaving(false);
      return;
    }
    try {
      const updated = await updateProfile({
        name: profileForm.name,
        email: profileForm.email,
        password: profileForm.password || undefined
      });
      localStorage.setItem('abel_user', JSON.stringify(updated));
      setProfileStatus('Profile updated successfully.');
      setProfileForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err: any) {
      setProfileError(err?.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const totalSalesToday = 12500;
  const pendingRepairsCount = repairs.filter(r =>
    r.repairStatus === RepairStatus.RECEIVED ||
    r.repairStatus === RepairStatus.IN_PROGRESS ||
    r.repairStatus === RepairStatus.READY
  ).length;
  const lowStockCount = products.filter(p => p.stock < 10).length;

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Shop Dashboard</h1>
        <div className="flex gap-2 bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border)]">
            <button 
                onClick={() => setActiveView('overview')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'overview' ? 'bg-[var(--primary)] text-white shadow-lg' : 'text-[var(--text-muted)] hover:bg-[var(--bg-body)]'}`}
            >
                Overview
            </button>
            <button 
                onClick={() => setActiveView('repairs')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'repairs' ? 'bg-[var(--primary)] text-white shadow-lg' : 'text-[var(--text-muted)] hover:bg-[var(--bg-body)]'}`}
            >
                Repairs
            </button>
            <button 
                onClick={() => setActiveView('products')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'products' ? 'bg-[var(--primary)] text-white shadow-lg' : 'text-[var(--text-muted)] hover:bg-[var(--bg-body)]'}`}
            >
                Inventory
            </button>
            <button 
                onClick={() => setActiveView('profile')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'profile' ? 'bg-[var(--primary)] text-white shadow-lg' : 'text-[var(--text-muted)] hover:bg-[var(--bg-body)]'}`}
            >
                Profile
            </button>
        </div>
      </div>

      {activeView === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="card p-8 border-[var(--border)] bg-[var(--bg-card)] flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <DollarSign size={32} />
                  </div>
                  <div>
                      <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-wider mb-1">Daily Revenue</p>
                      <h3 className="text-3xl font-black text-[var(--text-main)]">{totalSalesToday.toLocaleString()} ETB</h3>
                  </div>
              </div>
              <div className="card p-8 border-[var(--border)] bg-[var(--bg-card)] flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                      <PenTool size={32} />
                  </div>
                  <div>
                      <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-wider mb-1">Active Repairs</p>
                      <h3 className="text-3xl font-black text-[var(--text-main)]">{pendingRepairsCount}</h3>
                  </div>
              </div>
              <div className="card p-8 border-[var(--border)] bg-[var(--bg-card)] flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                      <AlertTriangle size={32} />
                  </div>
                  <div>
                      <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-wider mb-1">Low Stock Alerts</p>
                      <h3 className="text-3xl font-black text-[var(--text-main)]">{lowStockCount}</h3>
                  </div>
              </div>
          </div>
      )}

      {activeView === 'repairs' && (
          <div className="card overflow-hidden border-[var(--border)] animate-in fade-in p-0">
              <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
                  <h3 className="text-xl font-bold text-[var(--text-main)]">Live Repair Queue</h3>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-[var(--bg-body)] text-[var(--text-muted)] uppercase text-[10px] font-black tracking-widest">
                          <tr>
                              <th className="px-6 py-5">Tracking ID</th>
                              <th className="px-6 py-5">Customer</th>
                              <th className="px-6 py-5">Device</th>
                              <th className="px-6 py-5">Status</th>
                              <th className="px-6 py-5">Action</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)] text-[var(--text-main)]">
                          {isLoadingRepairs ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-8 text-center text-[var(--text-muted)]">
                                Loading repairs...
                              </td>
                            </tr>
                          ) : repairError ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-8 text-center text-red-500">
                                {repairError}
                              </td>
                            </tr>
                          ) : (
                            repairs.map(repair => (
                                <tr key={repair.id} className="hover:bg-[var(--bg-body)] transition-colors">
                                    <td className="px-6 py-5 font-mono font-bold text-[var(--primary)]">{repair.trackingCode}</td>
                                    <td className="px-6 py-5">
                                        <div className="font-bold">{repair.customerName}</div>
                                        <div className="text-xs text-[var(--text-muted)]">{repair.phone}</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="font-medium">{repair.deviceModel}</div>
                                        <div className="text-xs text-[var(--text-muted)] truncate max-w-xs">{repair.issueDescription}</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter
                                            ${repair.repairStatus === RepairStatus.COMPLETED ? 'bg-emerald-500/10 text-emerald-500' : 
                                              repair.repairStatus === RepairStatus.RECEIVED ? 'bg-orange-500/10 text-orange-500' :
                                              repair.repairStatus === RepairStatus.IN_PROGRESS ? 'bg-blue-500/10 text-blue-500' :
                                              repair.repairStatus === RepairStatus.READY ? 'bg-amber-500/10 text-amber-500' :
                                              'bg-red-500/10 text-red-500'}
                                        `}>
                                            {repair.repairStatus.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex gap-1">
                                            <button onClick={() => updateRepairStatus(repair.id, RepairStatus.IN_PROGRESS)} className="p-2 hover:bg-blue-500/10 rounded-lg text-blue-500" title="Work in Progress"><PenTool size={18} /></button>
                                            <button onClick={() => updateRepairStatus(repair.id, RepairStatus.READY)} className="p-2 hover:bg-amber-500/10 rounded-lg text-amber-500" title="Ready"><Check size={18} /></button>
                                            <button onClick={() => updateRepairStatus(repair.id, RepairStatus.COMPLETED)} className="p-2 hover:bg-emerald-500/10 rounded-lg text-emerald-500" title="Mark Done"><Check size={18} /></button>
                                            <button onClick={() => updateRepairStatus(repair.id, RepairStatus.REJECTED)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-500" title="Cancel/Reject"><X size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {activeView === 'products' && (
          <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tight">Inventory Control</h2>
                  <button onClick={openAddProduct} className="btn btn-primary">
                      <Plus size={18} /> New Product
                  </button>
              </div>

              <div className="card overflow-hidden border-[var(--border)] p-0">
                  <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                          <thead className="bg-[var(--bg-body)] text-[var(--text-muted)] uppercase text-[10px] font-black tracking-widest">
                              <tr>
                                  <th className="px-6 py-5">Item</th>
                                  <th className="px-6 py-5">Category</th>
                                  <th className="px-6 py-5">Condition</th>
                                  <th className="px-6 py-5">Price</th>
                                  <th className="px-6 py-5">Discount</th>
                                  <th className="px-6 py-5">Stock</th>
                                  <th className="px-6 py-5">Status</th>
                                  <th className="px-6 py-5">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border)] text-[var(--text-main)]">
                              {isLoadingProducts ? (
                                <tr>
                                  <td colSpan={8} className="px-6 py-8 text-center text-[var(--text-muted)]">
                                    Loading products...
                                  </td>
                                </tr>
                              ) : productError ? (
                                <tr>
                                  <td colSpan={8} className="px-6 py-8 text-center text-red-500">
                                    {productError}
                                  </td>
                                </tr>
                              ) : (
                                products.map(product => {
                                  const finalPrice = getDiscountedPrice(product);
                                  const hasDiscount = (product.discountPercent ?? 0) > 0;
                                  return (
                                    <tr key={product.id} className="hover:bg-[var(--bg-body)] transition-colors">
                                        <td className="px-6 py-5 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl border border-[var(--border)] overflow-hidden bg-slate-900">
                                              <img src={product.image} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <span className="font-bold">{product.name}</span>
                                        </td>
                                        <td className="px-6 py-5 text-[var(--text-muted)] font-medium">{product.category}</td>
                                        <td className="px-6 py-5">
                                          {product.condition === 'new' ? (
                                              <span className="text-emerald-500 font-black text-[10px] px-2 py-0.5 bg-emerald-500/10 rounded-full uppercase">New</span>
                                          ) : (
                                              <span className="text-amber-500 font-black text-[10px] px-2 py-0.5 bg-amber-500/10 rounded-full uppercase">Used</span>
                                          )}
                                        </td>
                                        <td className="px-6 py-5">
                                          <div className="font-black text-lg">{finalPrice.toLocaleString()} ETB</div>
                                          {hasDiscount && (
                                            <div className="text-xs text-[var(--text-muted)] line-through">
                                              {product.price.toLocaleString()} ETB
                                            </div>
                                          )}
                                        </td>
                                        <td className="px-6 py-5">
                                          {hasDiscount ? (
                                            <span className="text-emerald-500 font-black text-[10px] px-2 py-0.5 bg-emerald-500/10 rounded-full uppercase">
                                              -{product.discountPercent}%
                                            </span>
                                          ) : (
                                            <span className="text-[var(--text-muted)] text-xs">—</span>
                                          )}
                                        </td>
                                        <td className="px-6 py-5">
                                          <div className="flex items-center gap-2">
                                              <span className={`w-2 h-2 rounded-full ${product.stock < 10 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                                              {product.stock} units
                                          </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${product.stock > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                {product.stock > 0 ? 'Available' : 'Sold Out'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                          <div className="flex items-center gap-2">
                                            <button
                                              onClick={() => handleEditProduct(product)}
                                              className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/10"
                                              title="Edit"
                                            >
                                              <Pencil size={16} />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteProduct(product)}
                                              className="p-2 rounded-lg text-red-500 hover:bg-red-500/10"
                                              title="Delete"
                                            >
                                              <Trash2 size={16} />
                                            </button>
                                          </div>
                                        </td>
                                    </tr>
                                  );
                                })
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}

      {activeView === 'profile' && (
          <div className="max-w-3xl">
              <div className="card p-8 border-[var(--border)] bg-[var(--bg-card)]">
                  <h3 className="text-2xl font-black text-[var(--text-main)] mb-6">Profile Settings</h3>
                  {profileStatus && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-3 rounded-lg mb-4 text-sm">
                      {profileStatus}
                    </div>
                  )}
                  {profileError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-4 text-sm">
                      {profileError}
                    </div>
                  )}
                  <form onSubmit={handleProfileSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Full Name</label>
                          <input
                              type="text"
                              className="form-control h-12 font-bold"
                              value={profileForm.name}
                              onChange={e => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Email</label>
                          <input
                              type="email"
                              className="form-control h-12 font-bold"
                              value={profileForm.email}
                              onChange={e => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">New Password</label>
                          <input
                              type="password"
                              className="form-control h-12 font-bold"
                              value={profileForm.password}
                              onChange={e => setProfileForm(prev => ({ ...prev, password: e.target.value }))}
                              placeholder="Leave blank to keep current"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Confirm Password</label>
                          <input
                              type="password"
                              className="form-control h-12 font-bold"
                              value={profileForm.confirmPassword}
                              onChange={e => setProfileForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              placeholder="Confirm new password"
                          />
                      </div>
                      <div className="md:col-span-2 flex justify-end">
                          <button type="submit" disabled={profileSaving} className="btn btn-primary px-6">
                            {profileSaving ? 'Saving...' : 'Update Profile'}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Add Product Modal */}
      {isAddProductOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
              <div className="bg-[var(--bg-card)] w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl border border-[var(--border)] animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
                  <div className="flex justify-between items-center mb-8">
                      <div>
                          <h3 className="text-2xl font-black text-[var(--text-main)] tracking-tight">
                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                          </h3>
                          <p className="text-[var(--text-muted)] text-sm mt-1">
                            {editingProduct ? 'Update product details and pricing.' : 'Update shop inventory with real-time stock.'}
                          </p>
                      </div>
                      <button onClick={closeProductModal} className="text-[var(--text-muted)] hover:text-white p-2 hover:bg-white/5 rounded-full"><X size={24} /></button>
                  </div>

                  {productFormError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">
                      {productFormError}
                    </div>
                  )}
                  
                  <form onSubmit={handleSaveProduct} className="space-y-6">
                      <div className="mb-8">
                          <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Product Visual</label>
                          <div 
                            onClick={triggerFileInput}
                            className="w-full aspect-video rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--bg-body)] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--primary)] transition-all overflow-hidden group shadow-inner relative"
                          >
                              {newProduct.image ? (
                                  <div className="relative w-full h-full">
                                      <img src={newProduct.image} alt="Preview" className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                                          <div className="flex flex-col items-center gap-2">
                                              <Upload className="text-white" size={32} />
                                              <span className="text-white font-bold text-sm">Change Image</span>
                                          </div>
                                      </div>
                                  </div>
                              ) : (
                                  <div className="flex flex-col items-center gap-3">
                                      <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                                          <Upload size={32} />
                                      </div>
                                      <span className="text-sm font-bold text-[var(--text-muted)]">Click to upload product photo</span>
                                  </div>
                              )}
                          </div>
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileChange}
                          />

                          <div className="mt-6 space-y-3">
                            <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">AI Image Search</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={imageQuery}
                                onChange={(e) => setImageQuery(e.target.value)}
                                placeholder="Search online images (e.g., iPhone 15 Pro Max)"
                                className="form-control h-12 font-medium flex-1"
                              />
                              <button
                                type="button"
                                onClick={handleImageSearch}
                                disabled={isImageSearching}
                                className="btn btn-outline h-12 px-4"
                              >
                                {isImageSearching ? 'Searching...' : <Search size={18} />}
                              </button>
                            </div>
                            {imageSearchError && (
                              <div className="text-xs text-red-500">{imageSearchError}</div>
                            )}
                            {imageResults.length > 0 && (
                              <div className="grid grid-cols-3 gap-3">
                                {imageResults.map((url) => (
                                  <button
                                    key={url}
                                    type="button"
                                    onClick={() => setNewProduct({ ...newProduct, image: url })}
                                    className="relative aspect-square rounded-xl overflow-hidden border border-[var(--border)] hover:border-[var(--primary)] transition-all"
                                  >
                                    <img src={url} alt="Search result" className="w-full h-full object-cover" />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="col-span-1 md:col-span-2">
                              <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Product Name</label>
                              <input
                                  list="product-name-options"
                                  required
                                  className="form-control h-12 font-bold"
                                  value={newProduct.name}
                                  onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                  placeholder="Enter product name"
                              />
                              <datalist id="product-name-options">
                                {PRODUCT_NAME_OPTIONS.map(opt => (
                                  <option key={opt} value={opt} />
                                ))}
                              </datalist>
                          </div>
                          
                          <div>
                              <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Category</label>
                              <select 
                                  className="form-control h-12 font-bold"
                                  value={newProduct.category}
                                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                              >
                                  <option value="Phone">Phone</option>
                                  <option value="Charger">Charger</option>
                                  <option value="Case">Case</option>
                                  <option value="Audio">Audio</option>
                                  <option value="Wearable">Wearable</option>
                                  <option value="Accessory">Accessory</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Condition</label>
                              <select 
                                  className="form-control h-12 font-bold"
                                  value={newProduct.condition}
                                  onChange={e => setNewProduct({...newProduct, condition: e.target.value as 'new' | 'used'})}
                              >
                                  <option value="new">Brand New</option>
                                  <option value="used">Used / Refurbished</option>
                              </select>
                          </div>

                          <div>
                              <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Brand</label>
                              <input 
                                  type="text" 
                                  className="form-control h-12 font-bold" 
                                  value={newProduct.brand}
                                  onChange={e => setNewProduct({...newProduct, brand: e.target.value})}
                                  placeholder="Apple, Samsung, etc."
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Discount (%)</label>
                              <input 
                                  type="number" 
                                  min={0}
                                  max={90}
                                  className="form-control h-12 font-bold" 
                                  value={newProduct.discountPercent}
                                  onChange={e => setNewProduct({...newProduct, discountPercent: Number(e.target.value)})}
                              />
                          </div>

                          <div>
                              <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Price (ETB)</label>
                              <input 
                                  type="number" 
                                  required 
                                  className="form-control h-12 font-black text-lg" 
                                  value={newProduct.price}
                                  onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Stock Level</label>
                              <input 
                                  type="number" 
                                  required 
                                  className="form-control h-12 font-bold" 
                                  value={newProduct.stock}
                                  onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Description</label>
                          <textarea
                              className="form-control min-h-[110px] font-medium"
                              value={newProduct.description}
                              onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                              placeholder="Short description for customers..."
                          />
                      </div>

                      <div className="pt-6 flex gap-4">
                          <button type="button" onClick={closeProductModal} className="btn btn-outline flex-1 py-4 text-base">Cancel</button>
                          <button type="submit" disabled={isSavingProduct} className="btn btn-primary flex-1 py-4 text-base">
                            {isSavingProduct ? 'Saving...' : editingProduct ? 'Update Product' : 'Save to Inventory'}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default AbelDashboard;

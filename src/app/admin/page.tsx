'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, Order } from '@/types';
import {
  getStoreProducts,
  updateProductPrice,
  updateProductCutModifier,
  getStoreDeliverySettings,
  updateStoreDeliverySettings,
  StoreDeliverySettings,
  getOrders,
  fetchOrdersFromDb,
  updateOrderStatusInDb,
  mapDbRowToOrder,
  generateWhatsAppOrderUrl,
} from '@/lib/store';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import {
  PackageCheck,
  RefreshCw,
  Phone,
  MessageSquare,
  ArrowLeft,
  CheckCircle,
  Scissors,
  Store,
  Clock,
  MapPin,
  ExternalLink,
  Truck,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('navarang_admin_auth') === 'true';
    }
    return false;
  });
  const [activeTab, setActiveTab] = useState<'prices' | 'orders'>('orders');

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [editingPrices, setEditingPrices] = useState<Record<string, number>>({});
  const [editingCutModifiers, setEditingCutModifiers] = useState<Record<string, number>>({});
  const [deliverySettings, setDeliverySettings] = useState<StoreDeliverySettings>({
    defaultDeliveryFee: 35,
    freeDeliveryThreshold: 499,
  });
  const [orderFilter, setOrderFilter] = useState<string>('all');

  const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || '1234';
  const ownerWhatsApp = process.env.NEXT_PUBLIC_OWNER_WHATSAPP || '917989493162';

  const loadData = async () => {
    const prods = getStoreProducts();
    setProducts(prods);
    const initialPriceMap: Record<string, number> = {};
    const initialCutMap: Record<string, number> = {};
    prods.forEach((p) => {
      initialPriceMap[p.id] = p.basePricePerKg;
      p.cuts.forEach((c) => {
        initialCutMap[`${p.id}-${c.id}`] = c.priceModifier || 0;
      });
    });
    setEditingPrices(initialPriceMap);
    setEditingCutModifiers(initialCutMap);
    setDeliverySettings(getStoreDeliverySettings());

    // Initial local cache
    setOrders(getOrders());

    // Fetch from Supabase
    setIsLoadingOrders(true);
    const freshOrders = await fetchOrdersFromDb();
    setOrders(freshOrders);
    setIsLoadingOrders(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      // Defer execution to avoid synchronous cascading render warning
      const timer = setTimeout(() => {
        loadData();
      }, 0);

      // Setup Supabase Realtime subscription for orders
      let channel: RealtimeChannel | null = null;
      if (isSupabaseConfigured && supabase) {
        const client = supabase;
        channel = client
          .channel('admin_orders_realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newOrder = mapDbRowToOrder(payload.new);
                setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
                setStatusMessage(`🔔 New Order #${newOrder.id} received!`);
                setTimeout(() => setStatusMessage(''), 4000);
              } else if (payload.eventType === 'UPDATE') {
                const updated = mapDbRowToOrder(payload.new);
                setOrders((prev) =>
                  prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
                );
              }
            }
          )
          .subscribe();

        return () => {
          clearTimeout(timer);
          if (channel) {
            client.removeChannel(channel);
          }
        };
      }

      return () => {
        clearTimeout(timer);
      };
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setIsAuthenticated(true);
      sessionStorage.setItem('navarang_admin_auth', 'true');
    } else {
      alert('Incorrect Security PIN! Default PIN is 1234');
    }
  };

  const handleSavePrice = (productId: string) => {
    const newPrice = editingPrices[productId];
    if (newPrice && newPrice > 0) {
      const updated = updateProductPrice(productId, newPrice);
      setProducts(updated);
      setStatusMessage(`Base price updated successfully.`);
      setTimeout(() => setStatusMessage(''), 2500);
    }
  };

  const handleSaveCutModifier = (productId: string, cutId: string) => {
    const key = `${productId}-${cutId}`;
    const newModifier = editingCutModifiers[key];
    if (newModifier !== undefined) {
      const updated = updateProductCutModifier(productId, cutId, Number(newModifier));
      setProducts(updated);
      setStatusMessage(`Cut style price modifier updated.`);
      setTimeout(() => setStatusMessage(''), 2500);
    }
  };

  const handleSaveDeliverySettings = () => {
    const updated = updateStoreDeliverySettings({
      defaultDeliveryFee: Number(deliverySettings.defaultDeliveryFee),
      freeDeliveryThreshold: Number(deliverySettings.freeDeliveryThreshold),
    });
    setDeliverySettings(updated);
    setStatusMessage(`Delivery rates & free delivery threshold saved.`);
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleToggleStock = (productId: string, currentStock: boolean) => {
    const p = products.find((x) => x.id === productId);
    if (p) {
      const updated = updateProductPrice(productId, p.basePricePerKg, !currentStock);
      setProducts(updated);
      setStatusMessage(`Stock availability updated.`);
      setTimeout(() => setStatusMessage(''), 2500);
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: Order['orderStatus'],
    paymentStatus?: Order['paymentStatus']
  ) => {
    const updated = await updateOrderStatusInDb(orderId, status, paymentStatus);
    setOrders(updated);
  };

  // Metrics
  const totalRevenue = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const pendingOrdersCount = orders.filter((o) => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length;

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'all') return true;
    if (orderFilter === 'pending') return o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled';
    if (orderFilter === 'delivered') return o.orderStatus === 'Delivered';
    return true;
  });

  // PIN Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F4F1EA] text-[#1F1A17] flex items-center justify-center p-4">
        <div className="bg-[#FAF8F5] border border-stone-200 p-8 rounded-3xl max-w-sm w-full space-y-6 shadow-culinary">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#7C1818]/10 text-[#7C1818] border border-[#7C1818]/20 flex items-center justify-center mx-auto">
              <Store className="w-7 h-7" />
            </div>
            <h1 className="font-heading font-black text-2xl text-stone-900">Owner Portal</h1>
            <p className="text-xs text-stone-500">
              Navarang Mutton &amp; Chicken Center • Madhuranagar
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-heading font-bold text-stone-700">
                Enter Shopkeeper PIN
              </label>
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••"
                className="w-full mt-1.5 bg-white border border-stone-300 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest text-stone-900 focus:outline-none focus:border-[#7C1818] shadow-2xs"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-[#7C1818] hover:bg-[#661212] text-white font-heading font-bold text-sm shadow-xs transition cursor-pointer"
            >
              Unlock Control Panel
            </button>
          </form>

          <div className="text-center">
            <Link href="/" className="text-xs font-heading font-bold text-stone-500 hover:text-stone-900 flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Customer Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#1F1A17] pb-16">
      {/* Top Navbar */}
      <header className="bg-[#FAF8F5] border-b border-stone-200/90 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-stone-500 hover:text-stone-900 p-2 rounded-xl hover:bg-stone-100 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-heading font-black text-base sm:text-lg text-stone-900 flex items-center gap-2 leading-none">
              <span>Navarang Store Dispatcher</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                Online
              </span>
            </h1>
            <p className="text-[11px] text-stone-500 mt-0.5">Madhuranagar, Vijayawada</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={loadData}
            disabled={isLoadingOrders}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-heading font-bold transition cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOrders ? 'animate-spin text-[#7C1818]' : ''}`} />
            <span className="hidden sm:inline">{isLoadingOrders ? 'Syncing...' : 'Refresh Data'}</span>
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem('navarang_admin_auth');
              setIsAuthenticated(false);
            }}
            className="text-xs text-[#7C1818] hover:underline px-2 font-heading font-bold cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Toast */}
        {statusMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-heading font-bold rounded-2xl animate-in fade-in flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Store Dashboard Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#FAF8F5] p-5 rounded-3xl border border-stone-200/90 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#7C1818]/10 text-[#7C1818] flex items-center justify-center shrink-0 font-black text-xl">
              ₹
            </div>
            <div>
              <span className="text-[11px] font-heading font-bold text-stone-500 uppercase tracking-wider">Total Sales Volume</span>
              <div className="font-heading font-black text-2xl text-stone-900">₹{totalRevenue}</div>
            </div>
          </div>

          <div className="bg-[#FAF8F5] p-5 rounded-3xl border border-stone-200/90 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-800 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-heading font-bold text-stone-500 uppercase tracking-wider">Pending Dispatches</span>
              <div className="font-heading font-black text-2xl text-stone-900">{pendingOrdersCount} orders</div>
            </div>
          </div>

          <div className="bg-[#FAF8F5] p-5 rounded-3xl border border-stone-200/90 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-heading font-bold text-stone-500 uppercase tracking-wider">Active Inventory Items</span>
              <div className="font-heading font-black text-2xl text-stone-900">{products.length} fresh cuts</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-300/70 pb-3">
          <div className="inline-flex p-1 rounded-2xl bg-stone-200/70 border border-stone-300/70 gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-heading font-bold transition cursor-pointer whitespace-nowrap active:scale-95 ${
                activeTab === 'orders'
                  ? 'bg-[#7C1818] text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              Customer Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('prices')}
              className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-heading font-bold transition cursor-pointer whitespace-nowrap active:scale-95 ${
                activeTab === 'prices'
                  ? 'bg-[#7C1818] text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              Price &amp; Stock Rates ({products.length})
            </button>
          </div>

          {activeTab === 'orders' && (
            <div className="flex items-center gap-1.5 text-xs overflow-x-auto no-scrollbar">
              <button
                onClick={() => setOrderFilter('all')}
                className={`px-3 py-1.5 rounded-full font-bold transition cursor-pointer active:scale-95 ${
                  orderFilter === 'all' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setOrderFilter('pending')}
                className={`px-3 py-1.5 rounded-full font-bold transition cursor-pointer active:scale-95 ${
                  orderFilter === 'pending' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                Active Only
              </button>
              <button
                onClick={() => setOrderFilter('delivered')}
                className={`px-3 py-1.5 rounded-full font-bold transition cursor-pointer active:scale-95 ${
                  orderFilter === 'delivered' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                Completed
              </button>
            </div>
          )}
        </div>

        {/* TAB 1: DAILY PRICE & STOCK MANAGER */}
        {activeTab === 'prices' && (
          <div className="space-y-6">
            {/* Store Delivery & Minimum Order Settings Card */}
            <div className="bg-[#FAF8F5] p-5 sm:p-6 rounded-3xl border border-stone-200/90 shadow-culinary space-y-4">
              <div className="flex items-center gap-3 border-b border-stone-200/80 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-[#7C1818]/10 text-[#7C1818] flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-stone-900 text-base">
                    Vijayawada Delivery Charges &amp; Free Delivery Threshold
                  </h3>
                  <p className="text-xs text-stone-500">
                    Control doorstep delivery fee across Madhuranagar &amp; Vijayawada
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-1.5">
                  <label className="text-xs font-heading font-bold text-stone-700 block">
                    Standard Delivery Fee (₹)
                  </label>
                  <p className="text-[11px] text-stone-500">
                    Charged on orders below the free threshold
                  </p>
                  <input
                    type="number"
                    value={deliverySettings.defaultDeliveryFee}
                    onChange={(e) =>
                      setDeliverySettings({
                        ...deliverySettings,
                        defaultDeliveryFee: Number(e.target.value),
                      })
                    }
                    className="w-full mt-2 bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-sm font-heading font-bold text-stone-900 focus:outline-none focus:border-[#7C1818]"
                  />
                </div>

                <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-1.5">
                  <label className="text-xs font-heading font-bold text-stone-700 block">
                    Free Delivery Threshold (₹)
                  </label>
                  <p className="text-[11px] text-stone-500">
                    Orders at or above this amount get FREE delivery
                  </p>
                  <input
                    type="number"
                    value={deliverySettings.freeDeliveryThreshold}
                    onChange={(e) =>
                      setDeliverySettings({
                        ...deliverySettings,
                        freeDeliveryThreshold: Number(e.target.value),
                      })
                    }
                    className="w-full mt-2 bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-sm font-heading font-bold text-stone-900 focus:outline-none focus:border-[#7C1818]"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleSaveDeliverySettings}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#7C1818] hover:bg-[#661212] text-white font-heading font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Save Delivery Settings</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-stone-200/90 text-xs text-stone-600 shadow-2xs">
              <strong className="text-stone-900 font-heading">Pricing &amp; Cut Rates Guide:</strong> Edit base rate per kg or individual cut preparation modifiers (e.g. Boneless, Biryani Cut, Keema). All modifications immediately reflect on the live customer catalog and basket!
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#FAF8F5] border border-stone-200/90 rounded-3xl p-5 space-y-4 shadow-culinary flex flex-col justify-between"
                >
                  <div>
                    <div className="flex gap-4">
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-heading font-bold text-stone-900 text-sm sm:text-base truncate">
                            {product.name}
                          </h3>
                          <button
                            type="button"
                            onClick={() => handleToggleStock(product.id, product.inStock)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-heading font-bold border transition cursor-pointer shrink-0 ${
                              product.inStock
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                : 'bg-red-50 border-red-300 text-red-800'
                            }`}
                          >
                            {product.inStock ? 'In Stock' : 'Sold Out'}
                          </button>
                        </div>
                        {product.teluguName && (
                          <p className="text-xs font-semibold text-[#7C1818] mt-0.5">{product.teluguName}</p>
                        )}
                        <span className="text-[11px] text-stone-500 capitalize block mt-1">
                          Category: <strong className="text-stone-700">{product.category}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Base Price Editor */}
                    <div className="mt-4 pt-3 border-t border-stone-200/80">
                      <label className="text-[10px] font-heading font-bold text-stone-500 uppercase tracking-wider block">
                        Base Rate per {product.unit} (₹):
                      </label>
                      <div className="flex items-center gap-2 mt-1.5">
                        <input
                          type="number"
                          value={editingPrices[product.id] ?? product.basePricePerKg}
                          onChange={(e) =>
                            setEditingPrices({
                              ...editingPrices,
                              [product.id]: Number(e.target.value),
                            })
                          }
                          className="w-28 bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-heading font-bold text-stone-900 focus:outline-none focus:border-[#7C1818]"
                        />
                        <button
                          type="button"
                          onClick={() => handleSavePrice(product.id)}
                          className="px-4 py-2 rounded-xl bg-[#7C1818] hover:bg-[#661212] text-white font-heading font-bold text-xs transition cursor-pointer"
                        >
                          Update Base
                        </button>
                      </div>
                    </div>

                    {/* Cut Style Pricing Modifiers */}
                    <div className="mt-4 pt-3 border-t border-stone-200/80 space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-heading font-bold text-stone-800 uppercase tracking-wider">
                        <Scissors className="w-3.5 h-3.5 text-[#7C1818]" />
                        <span>Cut Style Price Modifiers (₹ / kg)</span>
                      </div>
                      <div className="space-y-2">
                        {product.cuts.map((cut) => {
                          const cutKey = `${product.id}-${cut.id}`;
                          const currentModifier = editingCutModifiers[cutKey] ?? (cut.priceModifier || 0);

                          return (
                            <div
                              key={cut.id}
                              className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-stone-200/80 text-xs"
                            >
                              <div className="min-w-0 flex-1">
                                <span className="font-heading font-bold text-stone-900 block truncate">
                                  {cut.name}
                                </span>
                                <span className="text-[10px] text-stone-400 truncate block">
                                  {cut.description || 'Standard cut style'}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[11px] text-stone-500 font-bold">+₹</span>
                                <input
                                  type="number"
                                  value={currentModifier}
                                  onChange={(e) =>
                                    setEditingCutModifiers({
                                      ...editingCutModifiers,
                                      [cutKey]: Number(e.target.value),
                                    })
                                  }
                                  className="w-16 bg-stone-50 border border-stone-300 rounded-lg px-2 py-1 text-xs font-bold text-stone-900 text-center focus:outline-none focus:border-[#7C1818]"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveCutModifier(product.id, cut.id)}
                                  className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-black text-white font-bold text-[11px] transition cursor-pointer"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: LIVE ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-20 bg-[#FAF8F5] rounded-3xl border border-stone-200/90 space-y-3 shadow-2xs">
                <PackageCheck className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="font-heading font-bold text-stone-900 text-base">No customer orders found</h3>
                <p className="text-xs text-stone-500">
                  Customer orders placed on the store will appear here immediately for preparation.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const whatsAppSlipUrl = generateWhatsAppOrderUrl(order, ownerWhatsApp);

                  return (
                    <div
                      key={order.id}
                      className="bg-[#FAF8F5] border border-stone-200/90 rounded-3xl p-5 space-y-4 shadow-culinary"
                    >
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-stone-200/80">
                        <div className="flex items-center gap-3">
                          <span className="font-heading font-black text-[#7C1818] text-base sm:text-lg">
                            Order #{order.id}
                          </span>
                          <span className="text-xs text-stone-500">
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })} • {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-heading font-bold border ${
                              order.paymentStatus === 'Paid via UPI'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-900 border-amber-200'
                            }`}
                          >
                            {order.paymentMethod}: {order.paymentStatus}
                          </span>
                          <span className="text-xs px-3 py-1 rounded-full bg-stone-200/70 text-stone-800 font-heading font-bold">
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>

                      {/* Customer Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-700">
                        <div className="space-y-1">
                          <div className="text-stone-400 font-heading font-bold uppercase text-[10px] tracking-wider">
                            Customer Details:
                          </div>
                          <div className="text-stone-900 font-heading font-bold text-sm">
                            {order.customerName}
                          </div>
                          <a
                            href={`tel:${order.customerPhone}`}
                            className="text-[#7C1818] hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Phone className="w-3.5 h-3.5" /> {order.customerPhone}
                          </a>
                          <div className="text-stone-500 text-[11px] pt-0.5">
                            <strong>Slot:</strong> {order.deliverySlot}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-stone-400 font-heading font-bold uppercase text-[10px] tracking-wider">
                            Delivery Destination:
                          </div>
                          <div className="text-stone-900 font-semibold">{order.area}</div>
                          <div className="text-stone-600">
                            {order.address}{order.landmark ? ` (Near ${order.landmark})` : ''}
                          </div>
                          {order.googleMapsUrl && (
                            <div className="pt-1">
                              <a
                                href={order.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-heading font-bold text-[11px] border border-blue-200 transition"
                              >
                                <MapPin className="w-3.5 h-3.5 text-red-500" />
                                <span>Open Delivery GPS Map</span>
                                <ExternalLink className="w-3 h-3 text-blue-500" />
                              </a>
                            </div>
                          )}
                          {order.specialInstructions && (
                            <div className="text-[#7C1818] bg-red-50 p-2 rounded-xl border border-red-100 mt-1">
                              <strong>Butcher Note:</strong> {order.specialInstructions}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Meat Cuts Item List */}
                      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 space-y-2 shadow-2xs">
                        <div className="text-[11px] font-heading font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                          <Scissors className="w-3.5 h-3.5 text-[#7C1818]" />
                          <span>Cuts to Prepare:</span>
                        </div>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs border-b border-stone-100 pb-1.5 last:border-0"
                            >
                              <div>
                                <span className="text-stone-900 font-heading font-bold">{item.productName}</span>
                                <span className="text-[#7C1818] font-semibold ml-2">({item.weightLabel})</span>
                                <div className="text-[11px] text-stone-500">
                                  Cut: <strong className="text-stone-700">{item.cut.name}</strong>
                                  {item.skinPreference && ` • ${item.skinPreference}`}
                                </div>
                              </div>
                              <span className="font-heading font-black text-stone-900">₹{item.totalPrice}</span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-2 flex justify-between text-xs font-heading font-black text-stone-900 border-t border-stone-200">
                          <span>Total Amount to Collect:</span>
                          <span className="text-[#7C1818] text-base">₹{order.totalAmount}</span>
                        </div>
                        {order.upiRefNumber && (
                          <div className="text-[11px] text-stone-500 pt-0.5">
                            UPI Reference Number: <span className="font-mono text-stone-900 font-bold">{order.upiRefNumber}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-heading font-bold text-stone-500 uppercase tracking-wider">
                            Status:
                          </label>
                          <select
                            value={order.orderStatus}
                            onChange={(e) =>
                              handleUpdateOrderStatus(order.id, e.target.value as Order['orderStatus'])
                            }
                            className="bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-[#7C1818]"
                          >
                            <option value="New">New Order</option>
                            <option value="Cutting & Cleaning">Cutting & Cleaning</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>

                          {order.paymentStatus !== 'Paid via UPI' && (
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateOrderStatus(order.id, order.orderStatus, 'Paid via UPI')
                              }
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-heading font-bold hover:bg-emerald-100 cursor-pointer"
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>

                        <a
                          href={whatsAppSlipUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-heading font-bold text-xs shadow-xs transition cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp Slip to Delivery Boy</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

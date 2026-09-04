'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, Order } from '@/types';
import {
  getStoreProducts,
  updateProductPrice,
  getOrders,
  updateOrderStatus,
  generateWhatsAppOrderUrl,
} from '@/lib/store';
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
  const [statusMessage, setStatusMessage] = useState('');
  const [editingPrices, setEditingPrices] = useState<Record<string, number>>({});
  const [orderFilter, setOrderFilter] = useState<string>('all');

  const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || '1234';
  const ownerWhatsApp = process.env.NEXT_PUBLIC_OWNER_WHATSAPP || '917989493162';

  const loadData = () => {
    const prods = getStoreProducts();
    setProducts(prods);
    const initialPriceMap: Record<string, number> = {};
    prods.forEach((p) => {
      initialPriceMap[p.id] = p.basePricePerKg;
    });
    setEditingPrices(initialPriceMap);

    const ords = getOrders();
    setOrders(ords);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
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
      setStatusMessage(`Rate updated successfully.`);
      setTimeout(() => setStatusMessage(''), 2500);
    }
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

  const handleUpdateOrderStatus = (
    orderId: string,
    status: Order['orderStatus'],
    paymentStatus?: Order['paymentStatus']
  ) => {
    const updated = updateOrderStatus(orderId, status, paymentStatus);
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
                Enter Shopkeeper PIN (Default: 1234)
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
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-heading font-bold transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh Data</span>
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
        <div className="flex items-center justify-between border-b border-stone-300/70 pb-3">
          <div className="inline-flex p-1 rounded-2xl bg-stone-200/70 border border-stone-300/70 gap-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-heading font-bold transition cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#7C1818] text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              Customer Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('prices')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-heading font-bold transition cursor-pointer ${
                activeTab === 'prices'
                  ? 'bg-[#7C1818] text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              Price &amp; Stock Rates ({products.length})
            </button>
          </div>

          {activeTab === 'orders' && (
            <div className="hidden sm:flex items-center gap-1 text-xs">
              <button
                onClick={() => setOrderFilter('all')}
                className={`px-3 py-1.5 rounded-full font-bold transition ${
                  orderFilter === 'all' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setOrderFilter('pending')}
                className={`px-3 py-1.5 rounded-full font-bold transition ${
                  orderFilter === 'pending' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200'
                }`}
              >
                Active Only
              </button>
              <button
                onClick={() => setOrderFilter('delivered')}
                className={`px-3 py-1.5 rounded-full font-bold transition ${
                  orderFilter === 'delivered' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200'
                }`}
              >
                Completed
              </button>
            </div>
          )}
        </div>

        {/* TAB 1: DAILY PRICE & STOCK MANAGER */}
        {activeTab === 'prices' && (
          <div className="space-y-4">
            <div className="bg-[#FAF8F5] p-4.5 rounded-3xl border border-stone-200/90 text-xs text-stone-600 shadow-2xs">
              <strong className="text-stone-900 font-heading">Market Rate Guide:</strong> Type today&apos;s Vijayawada rate per kg for farm chicken and fresh goat mutton below and tap <strong>&quot;Update Rate&quot;</strong>. The storefront recalculates all cut weights automatically.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#FAF8F5] border border-stone-200/90 rounded-3xl p-5 space-y-4 shadow-culinary flex flex-col justify-between"
                >
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
                    <div>
                      <h3 className="font-heading font-bold text-stone-900 text-sm sm:text-base">
                        {product.name}
                      </h3>
                      {product.teluguName && (
                        <p className="text-xs font-semibold text-[#7C1818] mt-0.5">{product.teluguName}</p>
                      )}
                      <span className="text-[11px] text-stone-500 capitalize block mt-1">
                        Category: <strong className="text-stone-700">{product.category}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-200/80 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <label className="text-[10px] font-heading font-bold text-stone-500 uppercase tracking-wider">
                          Rate per {product.unit} (₹):
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="number"
                            value={editingPrices[product.id] ?? product.basePricePerKg}
                            onChange={(e) =>
                              setEditingPrices({
                                ...editingPrices,
                                [product.id]: Number(e.target.value),
                              })
                            }
                            className="w-24 bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-sm font-heading font-bold text-stone-900 focus:outline-none focus:border-[#7C1818]"
                          />
                          <button
                            type="button"
                            onClick={() => handleSavePrice(product.id)}
                            className="px-3.5 py-2 rounded-xl bg-[#7C1818] hover:bg-[#661212] text-white font-heading font-bold text-xs transition cursor-pointer"
                          >
                            Update
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <label className="text-[10px] font-heading font-bold text-stone-500 uppercase tracking-wider block mb-1">
                          Counter Stock:
                        </label>
                        <button
                          type="button"
                          onClick={() => handleToggleStock(product.id, product.inStock)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border transition cursor-pointer ${
                            product.inStock
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : 'bg-red-50 border-red-300 text-red-800'
                          }`}
                        >
                          {product.inStock ? 'Available' : 'Sold Out'}
                        </button>
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

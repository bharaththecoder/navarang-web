'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { Order, CartItem } from '@/types';
import { fetchCustomerOrdersFromDb, mapDbRowToOrder } from '@/lib/store';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  X,
  Package,
  Clock,
  CheckCircle2,
  Bike,
  Scissors,
  RefreshCw,
  ExternalLink,
  MapPin,
} from 'lucide-react';

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerPhone?: string;
  customerEmail?: string;
  customerName?: string;
}

type OrderCategory = 'all' | 'active' | 'completed' | 'cancelled';

export default function MyOrdersModal({
  isOpen,
  onClose,
  customerPhone = '',
  customerEmail = '',
  customerName = '',
}: MyOrdersModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<OrderCategory>('all');

  const lastPhone = typeof window !== 'undefined' ? localStorage.getItem('navarang_last_phone') || '' : '';
  const lastName = typeof window !== 'undefined' ? localStorage.getItem('navarang_last_name') || '' : '';

  const userQuery = useMemo(() => {
    return (
      customerName ||
      lastName ||
      customerPhone ||
      lastPhone ||
      customerEmail ||
      ''
    );
  }, [customerName, lastName, customerPhone, lastPhone, customerEmail]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const results = await fetchCustomerOrdersFromDb(userQuery, customerPhone || lastPhone);
      setOrders(results);
    } catch (err) {
      console.error('Error fetching my orders:', err);
    } finally {
      setLoading(false);
    }
  }, [userQuery, customerPhone, lastPhone]);

  // Load orders whenever modal opens (deferred to prevent cascading render warnings)
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        loadOrders();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, loadOrders]);

  // Realtime subscription for customer's orders
  useEffect(() => {
    if (isOpen && isSupabaseConfigured && supabase) {
      const client = supabase;
      const channel = client
        .channel('customer_orders_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updatedRow = payload.new as any;
            if (updatedRow && updatedRow.id) {
              setOrders((prev) => {
                const existing = prev.find((o) => o.id === String(updatedRow.id));
                if (existing) {
                  return prev.map((o) =>
                    o.id === String(updatedRow.id)
                      ? {
                          ...o,
                          orderStatus: updatedRow.order_status,
                          upiRefNumber: updatedRow.upi_ref_number || o.upiRefNumber,
                        }
                      : o
                  );
                } else if (
                  (customerPhone && updatedRow.customer_phone?.includes(customerPhone)) ||
                  (customerName && updatedRow.customer_name?.toLowerCase().includes(customerName.toLowerCase()))
                ) {
                  return [mapDbRowToOrder(updatedRow), ...prev];
                }
                return prev;
              });
            }
          }
        )
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    }
  }, [isOpen, customerPhone, customerName]);

  // Tab categorization counts
  const activeOrdersCount = useMemo(
    () => orders.filter((o) => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length,
    [orders]
  );
  const completedOrdersCount = useMemo(
    () => orders.filter((o) => o.orderStatus === 'Delivered').length,
    [orders]
  );
  const cancelledOrdersCount = useMemo(
    () => orders.filter((o) => o.orderStatus === 'Cancelled').length,
    [orders]
  );

  // Filtered orders list based on selected category tab
  const filteredOrders = useMemo(() => {
    switch (activeTab) {
      case 'active':
        return orders.filter((o) => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled');
      case 'completed':
        return orders.filter((o) => o.orderStatus === 'Delivered');
      case 'cancelled':
        return orders.filter((o) => o.orderStatus === 'Cancelled');
      case 'all':
      default:
        return orders;
    }
  }, [orders, activeTab]);

  if (!isOpen) return null;

  const getStatusBadge = (status: Order['orderStatus']) => {
    switch (status) {
      case 'New':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3" /> Order Received
          </span>
        );
      case 'Cutting & Cleaning':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
            <Scissors className="w-3 h-3" /> Butcher Preparing Cuts
          </span>
        );
      case 'Out for Delivery':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            <Bike className="w-3 h-3" /> Out for Delivery
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Delivered
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-stone-950/65 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] text-[#1F1A17] rounded-t-3xl sm:rounded-4xl shadow-2xl border-t sm:border border-stone-200/90 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
        
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto mt-2 sm:hidden shrink-0" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200/90 flex items-center justify-between bg-[#FDFCFB]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#7C1818]/10 text-[#7C1818] flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-black text-base sm:text-xl text-stone-900 leading-none">
                My Meat Orders
              </h2>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Real-time butcher cutting, packaging &amp; doorstep delivery
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadOrders}
              disabled={loading}
              className="p-2 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
              title="Refresh Orders"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#7C1818]' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customer Account Indicator Bar */}
        <div className="px-4 py-2.5 bg-stone-100/80 border-b border-stone-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-stone-600 truncate">
            <span className="font-heading font-bold text-stone-900">Signed In Account:</span>
            <span className="truncate text-stone-700 font-medium">
              {customerName || customerEmail || (customerPhone ? `+91 ${customerPhone}` : 'Customer')}
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#7C1818] bg-[#7C1818]/10 px-2 py-0.5 rounded-full shrink-0">
            {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
          </span>
        </div>

        {/* Amazon/District-Style Categorized Tabs */}
        <div className="flex border-b border-stone-200 bg-white px-3 sm:px-6 gap-1 sm:gap-2 overflow-x-auto no-scrollbar touch-pan-x text-xs font-heading font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'border-[#7C1818] text-[#7C1818]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>All Orders</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-100 text-stone-700">
              {orders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'active'
                ? 'border-[#7C1818] text-[#7C1818]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
            <span>Active &amp; Preparing</span>
            {activeOrdersCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-bold">
                {activeOrdersCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'completed'
                ? 'border-[#7C1818] text-[#7C1818]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>Delivered / Completed</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
              {completedOrdersCount}
            </span>
          </button>

          {cancelledOrdersCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('cancelled')}
              className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'cancelled'
                  ? 'border-[#7C1818] text-[#7C1818]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <span>Cancelled</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-100 text-red-800">
                {cancelledOrdersCount}
              </span>
            </button>
          )}
        </div>

        {/* Orders List Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {loading ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-8 h-8 border-3 border-[#7C1818] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-stone-500 font-medium">Fetching your orders from Supabase...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <Package className="w-7 h-7" />
              </div>
              <h3 className="font-heading font-bold text-stone-900 text-sm">
                {activeTab === 'active'
                  ? 'No active orders in progress'
                  : activeTab === 'completed'
                  ? 'No completed orders yet'
                  : 'No orders found'}
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                {orders.length === 0
                  ? 'You haven’t placed any orders yet. Add your favorite fresh cuts to basket to order!'
                  : `No orders found under "${activeTab}" category.`}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs space-y-4"
              >
                {/* Order Top Bar with Status and ID */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-heading font-extrabold text-[#7C1818] bg-[#7C1818]/10 px-2.5 py-1 rounded-md">
                      Order #{order.id}
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="text-[11px] text-stone-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div>{getStatusBadge(order.orderStatus)}</div>
                </div>

                {/* Items Summary */}
                <div className="space-y-2.5">
                  {order.items.map((item: CartItem, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-stone-50/60 p-2.5 rounded-xl border border-stone-100">
                      <div className="flex items-center gap-2.5">
                        {item.image ? (
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-stone-200 shrink-0">
                            <Image
                              src={item.image}
                              alt={item.productName}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-stone-200 flex items-center justify-center text-stone-400 text-sm font-bold">
                            🍗
                          </div>
                        )}
                        <div>
                          <p className="font-heading font-bold text-stone-900 line-clamp-1">
                            {item.productName}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            {item.weightLabel} • {item.cut?.name || 'Curry Cut'}
                          </p>
                        </div>
                      </div>
                      <span className="font-heading font-black text-stone-900 text-sm">
                        ₹{item.totalPrice}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Address & Google Maps Location */}
                <div className="bg-stone-50/70 p-3 rounded-xl border border-stone-200/60 space-y-1.5 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-stone-600">
                      <span className="font-bold text-stone-800">Delivery Address: </span>
                      {order.address}{order.landmark ? ` (${order.landmark})` : ''}, {order.area}
                    </div>
                  </div>

                  {order.googleMapsUrl && (
                    <div className="pt-1">
                      <a
                        href={order.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition"
                      >
                        <MapPin className="w-3 h-3 text-red-500" />
                        <span>View Google Maps Pin</span>
                        <ExternalLink className="w-3 h-3 text-blue-500" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Footer Details: Slot & Total Payable */}
                <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="text-[11px] text-stone-500">
                    Slot: <span className="font-bold text-stone-800">{order.deliverySlot}</span> •{' '}
                    <span>{order.paymentMethod}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-stone-500 text-xs">Total:</span>
                    <span className="font-heading font-black text-base text-[#7C1818]">
                      ₹{order.totalAmount}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

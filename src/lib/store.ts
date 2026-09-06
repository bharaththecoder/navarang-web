import { Product, Order, INITIAL_PRODUCTS } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

const PRODUCTS_STORAGE_KEY = 'navarang_products_v3';
const ORDERS_STORAGE_KEY = 'navarang_orders_v2';

let cachedProducts: Product[] | null = null;
let lastRawProducts: string | null = null;

// Convert database snake_case row to frontend Order model
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapDbRowToOrder = (row: any): Order => {
  // Extract google maps url if stored in landmark or address
  let extractedMapsUrl: string | undefined = undefined;
  const cleanLandmark = row.landmark || '';
  if (cleanLandmark.includes('maps.google.com') || cleanLandmark.includes('maps.app.goo.gl') || cleanLandmark.includes('goo.gl/maps')) {
    extractedMapsUrl = cleanLandmark;
  }

  return {
    id: String(row.id),
    createdAt: row.created_at || new Date().toISOString(),
    customerName: row.customer_name || '',
    customerPhone: row.customer_phone || '',
    address: row.address || '',
    landmark: cleanLandmark,
    area: row.area || '',
    deliverySlot: row.delivery_slot || 'Express (30-45 mins)',
    items: Array.isArray(row.items) ? row.items : [],
    itemTotal: Number(row.total_amount) || 0,
    deliveryFee: 0,
    discount: 0,
    totalAmount: Number(row.total_amount) || 0,
    paymentMethod: (row.payment_method as Order['paymentMethod']) || 'UPI',
    paymentStatus: row.payment_method === 'UPI' && row.upi_ref_number ? 'Paid via UPI' : 'Pending at Delivery',
    orderStatus: (row.order_status as Order['orderStatus']) || 'New',
    upiRefNumber: row.upi_ref_number || undefined,
    googleMapsUrl: extractedMapsUrl || row.google_maps_url,
  };
};

// Convert frontend Order model to database snake_case payload
export const mapOrderToDbRow = (order: Order) => {
  // Storing googleMapsUrl in landmark if no dedicated maps column, or concatenated with landmark
  const combinedLandmark = order.googleMapsUrl 
    ? (order.landmark ? `${order.landmark} | Map: ${order.googleMapsUrl}` : order.googleMapsUrl)
    : (order.landmark || '');

  return {
    id: String(order.id),
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    address: order.address,
    landmark: combinedLandmark,
    area: order.area,
    delivery_slot: order.deliverySlot,
    items: order.items,
    total_amount: order.totalAmount,
    payment_method: order.paymentMethod,
    order_status: order.orderStatus,
    upi_ref_number: order.upiRefNumber || '',
  };
};

export const getStoreProducts = (): Product[] => {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      cachedProducts = INITIAL_PRODUCTS;
      lastRawProducts = JSON.stringify(INITIAL_PRODUCTS);
      return cachedProducts;
    }
    if (raw === lastRawProducts && cachedProducts) {
      return cachedProducts;
    }
    lastRawProducts = raw;
    const parsed = JSON.parse(raw) as Product[];
    // Ensure image paths stay synchronized with INITIAL_PRODUCTS
    const merged = parsed.map((p) => {
      const init = INITIAL_PRODUCTS.find((item) => item.id === p.id);
      return init ? { ...p, image: init.image } : p;
    });
    cachedProducts = merged;
    return cachedProducts;
  } catch {
    return INITIAL_PRODUCTS;
  }
};

export const saveStoreProducts = (products: Product[]) => {
  if (typeof window === 'undefined') return;
  cachedProducts = products;
  lastRawProducts = JSON.stringify(products);
  localStorage.setItem(PRODUCTS_STORAGE_KEY, lastRawProducts);
  window.dispatchEvent(new Event('navarang_products_updated'));
};

// Sync products to Supabase cloud table `store_settings` under id 'products'
export const syncProductsToDb = async (products: Product[]) => {
  saveStoreProducts(products);
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('store_settings')
        .upsert([{ id: 'products', data: products, updated_at: new Date().toISOString() }], { onConflict: 'id' });
    } catch (err) {
      console.warn('Notice: Could not sync products to Supabase store_settings table:', err);
    }
  }
};

// Fetch latest products from Supabase (called on app startup and realtime event)
export const fetchProductsFromDb = async (): Promise<Product[]> => {
  const local = getStoreProducts();
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('data')
        .eq('id', 'products')
        .maybeSingle();

      if (!error && data?.data && Array.isArray(data.data)) {
        const remoteProducts = data.data as Product[];
        // Re-attach static local images if remote data has relative images
        const merged = remoteProducts.map((p) => {
          const init = INITIAL_PRODUCTS.find((item) => item.id === p.id);
          return init ? { ...p, image: init.image } : p;
        });
        saveStoreProducts(merged);
        return merged;
      }
    } catch {
      // Fall back to local products
    }
  }
  return local;
};

export const subscribeToStoreProducts = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('navarang_products_updated', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('navarang_products_updated', callback);
    window.removeEventListener('storage', callback);
  };
};

export const updateProductPrice = (productId: string, newBasePrice: number, inStock?: boolean) => {
  const products = getStoreProducts();
  const updated = products.map((p) => {
    if (p.id === productId) {
      return {
        ...p,
        basePricePerKg: newBasePrice,
        inStock: inStock !== undefined ? inStock : p.inStock,
      };
    }
    return p;
  });
  syncProductsToDb(updated);
  return updated;
};

export const updateProductCutModifier = (
  productId: string,
  cutId: string,
  newPriceModifier: number
) => {
  const products = getStoreProducts();
  const updated = products.map((p) => {
    if (p.id === productId) {
      const updatedCuts = p.cuts.map((c) => {
        if (c.id === cutId) {
          return {
            ...c,
            priceModifier: newPriceModifier,
          };
        }
        return c;
      });
      return {
        ...p,
        cuts: updatedCuts,
      };
    }
    return p;
  });
  syncProductsToDb(updated);
  return updated;
};

// Delivery Settings (charges and free delivery threshold)
export interface StoreDeliverySettings {
  defaultDeliveryFee: number;
  freeDeliveryThreshold: number;
}

const DEFAULT_DELIVERY_SETTINGS: StoreDeliverySettings = {
  defaultDeliveryFee: 35,
  freeDeliveryThreshold: 499,
};

const DELIVERY_SETTINGS_KEY = 'navarang_delivery_settings_v1';

export const getStoreDeliverySettings = (): StoreDeliverySettings => {
  if (typeof window === 'undefined') return DEFAULT_DELIVERY_SETTINGS;
  try {
    const raw = localStorage.getItem(DELIVERY_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_DELIVERY_SETTINGS;
  } catch {
    return DEFAULT_DELIVERY_SETTINGS;
  }
};

export const saveStoreDeliverySettings = (settings: StoreDeliverySettings) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DELIVERY_SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event('navarang_delivery_settings_updated'));
};

// Sync delivery settings to Supabase
export const syncDeliverySettingsToDb = async (settings: StoreDeliverySettings) => {
  saveStoreDeliverySettings(settings);
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('store_settings')
        .upsert([{ id: 'delivery_settings', data: settings, updated_at: new Date().toISOString() }], { onConflict: 'id' });
    } catch (err) {
      console.warn('Notice: Could not sync delivery settings to Supabase:', err);
    }
  }
};

export const fetchDeliverySettingsFromDb = async (): Promise<StoreDeliverySettings> => {
  const local = getStoreDeliverySettings();
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('data')
        .eq('id', 'delivery_settings')
        .maybeSingle();

      if (!error && data?.data) {
        const remoteSettings = data.data as StoreDeliverySettings;
        saveStoreDeliverySettings(remoteSettings);
        return remoteSettings;
      }
    } catch {
      // Fall back to local
    }
  }
  return local;
};

export const updateStoreDeliverySettings = (settings: Partial<StoreDeliverySettings>) => {
  if (typeof window === 'undefined') return DEFAULT_DELIVERY_SETTINGS;
  const current = getStoreDeliverySettings();
  const updated: StoreDeliverySettings = {
    ...current,
    ...settings,
  };
  syncDeliverySettingsToDb(updated);
  return updated;
};

export const subscribeToDeliverySettings = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('navarang_delivery_settings_updated', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('navarang_delivery_settings_updated', callback);
    window.removeEventListener('storage', callback);
  };
};

// Local storage fallback order reading
export const getOrders = (): Order[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Local storage fallback order saving
export const saveOrder = (order: Order) => {
  if (typeof window === 'undefined') return;
  const current = getOrders();
  const filtered = current.filter((o) => o.id !== order.id);
  const updated = [order, ...filtered];
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

// Database-backed order saving (with local cache fallback)
export const saveOrderToDb = async (order: Order): Promise<Order> => {
  // Always save locally for immediate offline/client responsiveness
  saveOrder(order);

  if (isSupabaseConfigured && supabase) {
    try {
      const payload = mapOrderToDbRow(order);
      const { data, error } = await supabase
        .from('orders')
        .upsert([payload], { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.warn('Supabase order upsert notice:', error.message);
      } else if (data) {
        return mapDbRowToOrder(data);
      }
    } catch (err) {
      console.warn('Network error saving order to Supabase, local cache retained:', err);
    }
  }

  return order;
};

// Database-backed order fetching
export const fetchOrdersFromDb = async (): Promise<Order[]> => {
  const localOrders = getOrders();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch orders error:', error.message);
        return localOrders;
      }

      if (data && data.length > 0) {
        const dbOrders = data.map(mapDbRowToOrder);
        // Merge with local orders in case any were saved offline
        const localMap = new Map(localOrders.map((o) => [o.id, o]));
        dbOrders.forEach((o) => localMap.set(o.id, o));
        const merged = Array.from(localMap.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        if (typeof window !== 'undefined') {
          localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(merged));
        }
        return merged;
      }
    } catch (err) {
      console.warn('Error fetching orders from Supabase:', err);
    }
  }

  return localOrders;
};

// Database-backed fetching for customer orders by phone or customer identity
export const fetchCustomerOrdersFromDb = async (
  queryIdentifier: string,
  extraPhone?: string
): Promise<Order[]> => {
  const localOrders = getOrders();
  const cleanQuery = queryIdentifier.trim();
  const cleanPhone = cleanQuery.replace(/\D/g, '');
  const cleanExtraPhone = extraPhone ? extraPhone.replace(/\D/g, '') : '';

  // Get locally tracked order IDs
  let savedOrderIds: string[] = [];
  if (typeof window !== 'undefined') {
    try {
      savedOrderIds = JSON.parse(localStorage.getItem('navarang_my_order_ids') || '[]');
    } catch {
      savedOrderIds = [];
    }
  }

  const localCustomerOrders = localOrders.filter((o) => {
    if (savedOrderIds.includes(o.id)) return true;
    const oPhone = o.customerPhone.replace(/\D/g, '');
    if (cleanPhone && cleanPhone.length >= 6) {
      if (oPhone.includes(cleanPhone) || cleanPhone.includes(oPhone)) return true;
    }
    if (cleanExtraPhone && cleanExtraPhone.length >= 6) {
      if (oPhone.includes(cleanExtraPhone) || cleanExtraPhone.includes(oPhone)) return true;
    }
    if (cleanQuery && o.customerName.toLowerCase().includes(cleanQuery.toLowerCase())) {
      return true;
    }
    return false;
  });

  if (isSupabaseConfigured && supabase) {
    try {
      // Build conditions for Supabase
      const filters: string[] = [];
      if (cleanPhone && cleanPhone.length >= 6) {
        filters.push(`customer_phone.ilike.%${cleanPhone.slice(-10)}%`);
      }
      if (cleanExtraPhone && cleanExtraPhone.length >= 6 && cleanExtraPhone !== cleanPhone) {
        filters.push(`customer_phone.ilike.%${cleanExtraPhone.slice(-10)}%`);
      }
      if (cleanQuery && !cleanPhone) {
        filters.push(`customer_name.ilike.%${cleanQuery}%`);
      }
      if (savedOrderIds.length > 0) {
        filters.push(`id.in.(${savedOrderIds.map((id) => `"${id}"`).join(',')})`);
      }

      let req = supabase.from('orders').select('*');
      if (filters.length > 0) {
        req = req.or(filters.join(','));
      } else {
        // Fallback to fetch all orders placed in this browser
        return localCustomerOrders;
      }

      const { data, error } = await req.order('created_at', { ascending: false });

      if (!error && data) {
        const dbOrders = data.map(mapDbRowToOrder);
        const map = new Map<string, Order>();
        localCustomerOrders.forEach((o) => map.set(o.id, o));
        dbOrders.forEach((o) => map.set(o.id, o));
        return Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    } catch (err) {
      console.warn('Error fetching customer orders:', err);
    }
  }

  return localCustomerOrders;
};

// Realtime order status update
export const updateOrderStatusInDb = async (
  orderId: string,
  status: Order['orderStatus'],
  paymentStatus?: Order['paymentStatus']
): Promise<Order[]> => {
  // Update local storage first
  const updatedLocal = updateOrderStatus(orderId, status, paymentStatus);

  if (isSupabaseConfigured && supabase) {
    try {
      const updatePayload: Record<string, unknown> = {
        order_status: status,
      };
      if (paymentStatus === 'Paid via UPI') {
        // preserve or set
      }

      await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', orderId);
    } catch (err) {
      console.warn('Failed to update order status in Supabase:', err);
    }
  }

  return updatedLocal;
};

export const updateOrderStatus = (
  orderId: string,
  status: Order['orderStatus'],
  paymentStatus?: Order['paymentStatus']
) => {
  const current = getOrders();
  const updated = current.map((ord) => {
    if (ord.id === orderId) {
      return {
        ...ord,
        orderStatus: status,
        paymentStatus: paymentStatus || ord.paymentStatus,
      };
    }
    return ord;
  });
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

// UPI String generator following NPCI standard
export const generateUpiDeepLink = (options: {
  upiId: string;
  payeeName: string;
  amount: number;
  orderId: string;
  notes?: string;
}) => {
  const { upiId, payeeName, amount, orderId, notes } = options;
  const formattedAmount = amount.toFixed(2);
  const cleanPayee = encodeURIComponent(payeeName);
  const cleanNotes = encodeURIComponent(notes || `Navarang Meat Order #${orderId}`);
  
  // Standard NPCI UPI URI Scheme
  return `upi://pay?pa=${upiId}&pn=${cleanPayee}&am=${formattedAmount}&cu=INR&tn=${cleanNotes}&tr=${orderId}`;
};

// WhatsApp Order Formatter
export const generateWhatsAppOrderUrl = (order: Order, ownerWhatsApp: string) => {
  const itemsText = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.productName}*\n   - Weight: ${item.weightLabel}\n   - Cut: ${item.cut.name}${item.skinPreference ? `\n   - Skin: ${item.skinPreference === 'skinless' ? 'Skinless' : 'With Skin'}` : ''}\n   - Price: ₹${item.totalPrice}`
    )
    .join('\n\n');

  const text = `🍗 *NEW MEAT ORDER #${order.id}* 🍗
---------------------------------
*Customer:* ${order.customerName}
*Phone:* ${order.customerPhone}
*Area:* ${order.area}
*Address:* ${order.address}${order.landmark ? ` (Near ${order.landmark})` : ''}
${order.googleMapsUrl ? `📍 *Google Maps Location:* ${order.googleMapsUrl}\n` : ''}*Delivery Slot:* ${order.deliverySlot}

*ORDER ITEMS:*
${itemsText}

---------------------------------
*Item Total:* ₹${order.itemTotal}
*Delivery Fee:* ₹${order.deliveryFee === 0 ? 'FREE' : order.deliveryFee}
*Total Payable:* ₹${order.totalAmount}
*Payment Method:* ${order.paymentMethod} (${order.paymentStatus})
${order.upiRefNumber ? `*UPI UTR / Ref:* ${order.upiRefNumber}` : ''}
${order.specialInstructions ? `*Instructions:* ${order.specialInstructions}` : ''}
---------------------------------
*Navarang Mutton & Chicken Center - Madhuranagar, Vijayawada*`;

  return `https://wa.me/${ownerWhatsApp}?text=${encodeURIComponent(text)}`;
};

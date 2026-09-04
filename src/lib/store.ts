import { Product, Order, INITIAL_PRODUCTS } from '@/types';

const PRODUCTS_STORAGE_KEY = 'navarang_products_v3';
const ORDERS_STORAGE_KEY = 'navarang_orders_v2';

let cachedProducts: Product[] | null = null;
let lastRawProducts: string | null = null;

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
  saveStoreProducts(updated);
  return updated;
};

export const getOrders = (): Order[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const saveOrder = (order: Order) => {
  if (typeof window === 'undefined') return;
  const current = getOrders();
  const filtered = current.filter((o) => o.id !== order.id);
  const updated = [order, ...filtered];
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const updateOrderStatus = (orderId: string, status: Order['orderStatus'], paymentStatus?: Order['paymentStatus']) => {
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
*Delivery Slot:* ${order.deliverySlot}

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

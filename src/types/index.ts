export interface CutOption {
  id: string;
  name: string;
  description: string;
  priceModifier?: number; // e.g. +20 for boneless/cleaning
}

export interface Product {
  id: string;
  name: string;
  teluguName?: string;
  category: 'chicken' | 'mutton';
  description: string;
  basePricePerKg: number; // Base rate in INR
  image: string;
  badge?: string;
  availableWeights: { label: string; weightKg: number }[];
  cuts: CutOption[];
  hasSkinOption?: boolean;
  inStock: boolean;
  unit: string;
}

export interface CartItem {
  cartItemId: string;
  productId: string;
  productName: string;
  category: string;
  weightKg: number;
  weightLabel: string;
  cut: CutOption;
  skinPreference?: 'with-skin' | 'skinless';
  unitPrice: number;
  totalPrice: number;
  image: string;
}

export interface Order {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  address: string;
  landmark?: string;
  area: string;
  deliverySlot: 'Express (30-45 mins)' | 'Morning (7:00 AM - 9:00 AM)' | 'Afternoon (11:00 AM - 1:00 PM)' | 'Evening (5:00 PM - 7:30 PM)';
  items: CartItem[];
  itemTotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: 'UPI' | 'COD';
  paymentStatus: 'Pending' | 'Paid via UPI' | 'Pending at Delivery';
  orderStatus: 'New' | 'Cutting & Cleaning' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  upiRefNumber?: string;
  specialInstructions?: string;
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'broiler-chicken',
    name: 'Fresh Farm Broiler Chicken',
    teluguName: 'ఫ్రెష్ బ్రాయిలర్ చికెన్',
    category: 'chicken',
    description: 'Freshly slaughtered farm broiler chicken cleaned hygienically. Tender, juicy, and ideal for authentic Andhra curries, fry, or biryani.',
    basePricePerKg: 240,
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80',
    badge: 'Daily Fresh Best Seller',
    availableWeights: [
      { label: '500 g', weightKg: 0.5 },
      { label: '1 kg', weightKg: 1.0 },
      { label: '1.5 kg', weightKg: 1.5 },
      { label: '2 kg', weightKg: 2.0 },
    ],
    cuts: [
      { id: 'curry-cut', name: 'Curry Cut (Medium)', description: 'Bone-in medium pieces for juicy gravies' },
      { id: 'biryani-cut', name: 'Biryani Cut (Large)', description: 'Generous pieces that hold moisture during dum cooking' },
      { id: 'boneless', name: 'Boneless Cubes', description: 'Hand-trimmed breast & thigh meat, zero bone (+₹40/kg)', priceModifier: 40 },
      { id: 'fry-cut', name: 'Fry Small Cut', description: 'Small crispy bite-size cuts for Andhra chicken fry' },
      { id: 'keema', name: 'Chicken Keema (Minced)', description: 'Finely minced fresh chicken breast & leg meat (+₹30/kg)', priceModifier: 30 },
      { id: 'lollipop', name: 'Chicken Lollipops / Wings', description: 'Cleaned winglets shaped into party lollipops (+₹20/kg)', priceModifier: 20 },
    ],
    hasSkinOption: true,
    inStock: true,
    unit: 'kg',
  },
  {
    id: 'chicken-liver-gizzard',
    name: 'Fresh Chicken Liver & Gizzard',
    teluguName: 'ఫ్రెష్ చికెన్ లివర్ & గుండెకాయలు',
    category: 'chicken',
    description: 'Fresh farm chicken liver and gizzard. Washed thoroughly with fresh water, highly nutrient-rich and tender for pepper fry.',
    basePricePerKg: 200,
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80',
    badge: 'High Protein Favorite',
    availableWeights: [
      { label: '250 g', weightKg: 0.25 },
      { label: '500 g', weightKg: 0.5 },
      { label: '1 kg', weightKg: 1.0 },
    ],
    cuts: [
      { id: 'liver-only', name: 'Liver Cubes Only', description: 'Tender fresh chicken liver cubes for pan fry' },
      { id: 'liver-gizzard-mix', name: 'Liver + Gizzard Mix', description: 'Crispy gizzard with tender liver pieces' },
    ],
    hasSkinOption: false,
    inStock: true,
    unit: 'kg',
  },
  {
    id: 'fresh-mutton-curry',
    name: 'Tender Goat Mutton (Premium)',
    teluguName: 'లేత మేక మటన్',
    category: 'mutton',
    description: 'Fresh, 100% tender local goat meat selected daily. Rich in taste, soft texture, ideal for Pulao and Rayalaseema/Andhra Mutton Kura.',
    basePricePerKg: 850,
    image: '/fresh-mutton.jpg',
    badge: '100% Tender Goat',
    availableWeights: [
      { label: '250 g', weightKg: 0.25 },
      { label: '500 g', weightKg: 0.5 },
      { label: '1 kg', weightKg: 1.0 },
      { label: '1.5 kg', weightKg: 1.5 },
    ],
    cuts: [
      { id: 'curry-cut', name: 'Curry Cut (Mix Meat & Bone)', description: 'Balanced ratio of succulent meat, ribs & soft bones' },
      { id: 'biryani-cut', name: 'Biryani Cut (Big Pieces)', description: 'Selected shoulder & leg pieces for Vijayawada Dum Biryani' },
      { id: 'boneless-mutton', name: 'Boneless Mutton', description: '100% pure lean meat cuts, trimmed fat (+₹100/kg)', priceModifier: 100 },
      { id: 'chops', name: 'Mutton Chops / Ribs', description: 'Juicy rib chops for Pan Fry and Roast (+₹50/kg)', priceModifier: 50 },
      { id: 'mutton-keema', name: 'Hand-cut Mutton Keema', description: 'Cleaned, ground meat for meatballs & keema fry (+₹60/kg)', priceModifier: 60 },
    ],
    inStock: true,
    unit: 'kg',
  },
  {
    id: 'mutton-liver-paya',
    name: 'Mutton Liver & Paya (Kidney/Liver/Trottles)',
    teluguName: 'మేక లివర్ & పాయా',
    category: 'mutton',
    description: 'Fresh goat liver, kidneys and cleaned bone trottles. Nutrient-dense, fresh off the morning slaughter.',
    basePricePerKg: 880,
    image: '/fresh-mutton-liver-paya.jpg',
    badge: 'Fresh Morning Stock',
    availableWeights: [
      { label: '250 g', weightKg: 0.25 },
      { label: '500 g', weightKg: 0.5 },
      { label: '1 kg', weightKg: 1.0 },
    ],
    cuts: [
      { id: 'liver-cubes', name: 'Liver Only (Cleaned Cubes)', description: 'Tender fresh goat liver pieces for fry' },
      { id: 'liver-kidney-mix', name: 'Liver + Boti / Kidney Mix', description: 'Healthy mix for rich pepper masala fry' },
      { id: 'paya-pack', name: 'Cleaned Paya (4 Pcs Set)', description: 'Singed, cleaned and split for traditional Paya shorba' },
    ],
    inStock: true,
    unit: 'kg',
  },
];

export const VIJAYAWADA_AREAS = [
  'Madhuranagar (Express 20-30 mins)',
  'Satyanarayanapuram',
  'Moghalrajpuram',
  'Labbipet / MG Road',
  'Governorpet',
  'Bhavanipuram',
  'Suryaraopet',
  'Gunadala',
  'Auto Nagar',
  'Patamata',
  'Benz Circle',
  'Ramavarappadu',
  'One Town / Kaleswara Rao Market',
  'Other Vijayawada Area',
];

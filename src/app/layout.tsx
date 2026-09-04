import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Outfit } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Navarang Mutton & Chicken Center | Fresh Meat Online Delivery in Vijayawada',
  description:
    'Order 100% Halal fresh tender goat mutton, broiler chicken, and fresh liver & paya online in Vijayawada. Express 30-45 min doorstep delivery in Madhuranagar & surrounding areas. Direct UPI payments.',
  keywords: [
    'Navarang Mutton & Chicken',
    'Vijayawada meat delivery',
    'fresh mutton online Vijayawada',
    'fresh chicken Madhuranagar',
    'Halal butcher shop Vijayawada',
    'tender goat mutton Vijayawada',
  ],
  authors: [{ name: 'Navarang Mutton & Chicken Center' }],
  openGraph: {
    title: 'Navarang Mutton & Chicken Center | Vijayawada',
    description: 'Fresh cuts delivered to your doorstep in 30-45 mins. 100% Halal & Hygienic.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`scroll-smooth ${jakarta.variable} ${outfit.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="font-sans bg-[#F4F1EA] text-[#1F1A17] min-h-screen antialiased selection:bg-[#7C1818] selection:text-white">
        <AuthProvider>
          <CartProvider>
            {children}
            <AuthModal />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

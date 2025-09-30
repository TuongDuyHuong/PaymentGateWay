import React, { useState, createContext, useContext, useEffect } from 'react';

// Component imports
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetail } from './components/ProductDetail';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { PaymentMethods } from './components/PaymentMethods';
import { OrderConfirmation } from './components/OrderConfirmation';
import { Login } from './components/Login';
import { TransactionManage } from './components/ui/transfaction_manage';
import { EmailDemo } from './components/EmailDemo';
import { Toaster } from './components/ui/sonner';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  description: string;
  material: string;
  size?: string;
  inStock: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  date: string;
  amount: number;
  paymentMethod: string;
  status: 'completed' | 'processing' | 'failed' | 'refunded';
  items: CartItem[];
  paymentDetails?: any;
  updatedAt?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  updateTransactionStatus: (transactionId: string, status: Transaction['status']) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

type Page = 'home' | 'product' | 'cart' | 'checkout' | 'payment' | 'confirmation' | 'login' | 'admin-dashboard' | 'email-demo';

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  notes: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    notes: ''
  });

  // Log EmailJS setup instructions on app startup
  useEffect(() => {
    console.log('%c📧 AGUST Email Service Ready', 'color: #ca8a04; font-size: 16px; font-weight: bold;');
    console.log('Email service đã được tích hợp với EmailJS để gửi email thật.');
    console.log('Tính năng email sẽ hoạt động khi khách hàng xác nhận chuyển khoản và admin duyệt thanh toán.');
  }, []);

  // Load transactions from localStorage on component mount
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const savedTransactions = localStorage.getItem('agust_transactions');
      return savedTransactions ? JSON.parse(savedTransactions) : [];
    } catch (error) {
      console.error('Error loading transactions from localStorage:', error);
      return [];
    }
  });

  // Save transactions to localStorage whenever transactions change
  useEffect(() => {
    try {
      localStorage.setItem('agust_transactions', JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transactions to localStorage:', error);
    }
  }, [transactions]);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const addTransaction = (transaction: Transaction) => {
    console.log('Adding new transaction:', transaction);
    setTransactions(prev => {
      const newTransactions = [transaction, ...prev];
      console.log('Total transactions after adding:', newTransactions.length);
      return newTransactions;
    });
  };

  const updateTransactionStatus = (transactionId: string, status: Transaction['status']) => {
    console.log('Updating transaction status:', transactionId, status);
    setTransactions(prev => {
      const updated = prev.map(transaction => 
        transaction.id === transactionId 
          ? { ...transaction, status, updatedAt: new Date().toISOString() }
          : transaction
      );
      console.log('Transaction status updated. Total transactions:', updated.length);
      return updated;
    });
  };

  const cartContextValue = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    transactions,
    addTransaction,
    updateTransactionStatus,
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product');
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  const handleOrderComplete = (details: any) => {
    // Tạo transaction mới từ order details
    // Tất cả giao dịch đều bắt đầu với status 'pending' để cần được admin duyệt
    const newTransaction: Transaction = {
      id: `TXN_${Date.now()}`,
      orderNumber: details.orderNumber,
      customerName: `${customerInfo.firstName} ${customerInfo.lastName}`.trim() || 'Khách hàng',
      customerEmail: customerInfo.email || 'customer@example.com',
      date: new Date().toISOString(),
      amount: details.totalAmount,
      paymentMethod: details.paymentMethod === 'bank_transfer' ? 'Chuyển khoản ngân hàng' :
                    details.paymentMethod === 'vnpay' ? 'VNPay' :
                    details.paymentMethod === 'zalopay' ? 'ZaloPay' :
                    details.paymentMethod === 'viettel_money' ? 'Viettel Money' :
                    details.paymentMethod === 'momo' ? 'Momo' :
                    details.paymentMethod === 'paypal' ? 'PayPal' :
                    details.paymentMethod === 'cod' ? 'COD' : details.paymentMethod,
      status: 'processing', // Tất cả giao dịch đều bắt đầu với trạng thái đang xử lý
      items: details.items || cartItems,
      paymentDetails: details
    };

    console.log('Creating new transaction for customer:', newTransaction.customerName, newTransaction.customerEmail);
    console.log('Order details:', details);

    // Thêm thông tin khách hàng vào orderDetails
    const orderDetailsWithCustomer = {
      ...details,
      customerInfo: customerInfo
    };

    addTransaction(newTransaction);
    setOrderDetails(orderDetailsWithCustomer);
    clearCart();
    setCurrentPage('confirmation');
  };

  const handleAdminLogin = (email: string, password: string) => {
    console.log('Admin login attempt:', email);
    console.log('Current transactions count:', transactions.length);
    
    if (email === 'Agust2004@gmail.com' && password === 'hihihoho') {
      setIsAdminLoggedIn(true);
      setCurrentPage('admin-dashboard');
      console.log('Admin login successful');
      return true;
    }
    console.log('Admin login failed');
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setCurrentPage('home');
  };

  return (
    <CartContext.Provider value={cartContextValue}>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Header onNavigate={handleNavigate} currentPage={currentPage} isAdminLoggedIn={isAdminLoggedIn} onAdminLogout={handleAdminLogout} />
        
        <main className="flex-1">
          {currentPage === 'home' && (
            <ProductGrid onProductClick={handleProductClick} />
          )}
          
          {currentPage === 'product' && selectedProduct && (
            <ProductDetail 
              product={selectedProduct} 
              onBack={() => setCurrentPage('home')}
              onAddToCart={() => {
                addToCart(selectedProduct);
                setCurrentPage('cart');
              }}
            />
          )}
          
          {currentPage === 'cart' && (
            <Cart onNavigate={handleNavigate} />
          )}
          
          {currentPage === 'checkout' && (
            <Checkout 
              onNavigate={handleNavigate} 
              customerInfo={customerInfo}
              onCustomerInfoChange={setCustomerInfo}
            />
          )}
          
          {currentPage === 'payment' && (
            <PaymentMethods onOrderComplete={handleOrderComplete} customerInfo={customerInfo} />
          )}
          
          {currentPage === 'confirmation' && orderDetails && (
            <OrderConfirmation 
              orderDetails={orderDetails}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === 'login' && (
            <Login onAdminLogin={handleAdminLogin} onNavigate={handleNavigate} />
          )}

          {currentPage === 'admin-dashboard' && isAdminLoggedIn && (
            <TransactionManage onNavigate={handleNavigate} />
          )}

          {currentPage === 'email-demo' && (
            <EmailDemo />
          )}
        </main>
        
        <Footer onNavigate={handleNavigate} />
        <Toaster />
      </div>
    </CartContext.Provider>
  );
}
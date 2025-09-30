import React, { useState, useMemo } from 'react';
import { ArrowLeft, CreditCard, Banknote, Truck, Shield, Clock, Copy, Check, QrCode, CheckCircle, AlertCircle, Mail, ChevronRight } from 'lucide-react';
import vnpayLogo from 'figma:asset/9da583f9c2bd0b8148828f07933dfd333f05f3a4.png';
import momoLogo from 'figma:asset/336e5016f2972fd79467240c1551b8fa764426ee.png';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { useCart, CustomerInfo } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PayPalButton } from './PayPalButton';
import { PayPalQRCode } from './PayPalQRCode';
import { VNPayButton } from './VNPayButton';
import { VNPayCheckout } from './VNPayCheckout';
import { ZaloPayButton } from './ZaloPayButton';
import { ViettelMoney } from './ViettelMoney';
import { MomoButton } from './MomoButton';
import { MomoCheckout } from './MomoCheckout';
import { EmailService } from './EmailService';

interface PaymentMethodsProps {
  onOrderComplete: (orderDetails: any) => void;
  customerInfo?: CustomerInfo;
}

export function PaymentMethods({ onOrderComplete, customerInfo }: PaymentMethodsProps) {
  const { cartItems, getTotalPrice } = useCart();
  const [selectedMainMethod, setSelectedMainMethod] = useState<'transfer' | 'cod'>('transfer');
  const [selectedSubMethod, setSelectedSubMethod] = useState('bank_transfer');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  const [paypalError, setPaypalError] = useState<string | null>(null);
  const [paypalSuccess, setPaypalSuccess] = useState<any>(null);
  const [showPayPalQR, setShowPayPalQR] = useState(false);
  const [vnpayError, setVnpayError] = useState<string | null>(null);
  const [vnpaySuccess, setVnpaySuccess] = useState<any>(null);
  const [zalopayError, setZalopayError] = useState<string | null>(null);
  const [zalopaySuccess, setZalopaySuccess] = useState<any>(null);
  const [viettelMoneyError, setViettelMoneyError] = useState<string | null>(null);
  const [viettelMoneySuccess, setViettelMoneySuccess] = useState<any>(null);
  const [momoError, setMomoError] = useState<string | null>(null);
  const [momoSuccess, setMomoSuccess] = useState<any>(null);
  const [showVNPayCheckout, setShowVNPayCheckout] = useState(false);
  const [showMomoCheckout, setShowMomoCheckout] = useState(false);


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const shippingCost = getTotalPrice() >= 1000000 ? 0 : 50000;
  const totalPrice = getTotalPrice() + shippingCost;
  
  // Generate order number once and keep it consistent throughout the session
  const orderNumber = useMemo(() => `HD${Date.now().toString().slice(-8)}`, []);

  const bankInfo = {
    bank: 'Ngân hàng Techcombank',
    accountNumber: '7869 0052 61',
    accountName: 'NGUYEN THI TRA MY',
    branch: 'Chi nhánh Hà Nội',
    transferContent: orderNumber
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Generate VietQR URL for bank transfer
  const generateQRCode = () => {
    const bankCode = '970407'; // Techcombank bank code
    const accountNumber = bankInfo.accountNumber.replace(/\s/g, '');
    const amount = totalPrice;
    const transferContent = encodeURIComponent(bankInfo.transferContent);
    
    // VietQR URL format
    return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${transferContent}&accountName=${encodeURIComponent(bankInfo.accountName)}`;
  };

  const handlePayment = async () => {
    if (selectedMainMethod === 'cod') {
      setIsProcessing(true);
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const orderDetails = {
        orderNumber: orderNumber,
        items: cartItems,
        totalAmount: totalPrice,
        paymentMethod: 'cod',
        orderDate: new Date().toISOString(),
        status: 'confirmed'
      };
      
      onOrderComplete(orderDetails);
      return;
    }

    // Handle transfer methods
    const selectedMethod = selectedSubMethod;
    
    if (selectedMethod === 'bank_transfer') {
      setShowQRCode(true);
      
      // Tự động xử lý đơn hàng cho chuyển khoản ngân hàng 
      // sau khi hiển thị thông tin QR
      setTimeout(async () => {
        setIsProcessing(true);
        
        // Gửi email chờ xác nhận cho khách hàng
        if (customerInfo?.email) {
          const customerName = `${customerInfo.firstName} ${customerInfo.lastName}`.trim() || 'Khách hàng';
          
          try {
            await EmailService.sendPendingConfirmationEmail(
              customerInfo.email,
              customerName,
              orderNumber,
              totalPrice,
              bankInfo
            );
            
            console.log('📧 Email chờ xác nhận đã được gửi đến:', customerInfo.email);
          } catch (error) {
            console.error('❌ Lỗi gửi email:', error);
          }
        }
        
        // Tạo đơn hàng tự động
        const orderDetails = {
          orderNumber: orderNumber,
          items: cartItems,
          totalAmount: totalPrice,
          paymentMethod: 'bank_transfer',
          orderDate: new Date().toISOString(),
          status: 'pending_payment'
        };
        
        onOrderComplete(orderDetails);
      }, 3000); // Delay 3 giây để người dùng có thể thấy QR code
      
      return;
    }

    if (selectedMethod === 'paypal' && !paypalSuccess) {
      return;
    }

    if (selectedMethod === 'vnpay' && !vnpaySuccess) {
      return;
    }

    if (selectedMethod === 'zalopay' && !zalopaySuccess) {
      return;
    }

    if (selectedMethod === 'viettel_money' && !viettelMoneySuccess) {
      return;
    }

    if (selectedMethod === 'momo' && !momoSuccess) {
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const orderDetails = {
      orderNumber: orderNumber,
      items: cartItems,
      totalAmount: totalPrice,
      paymentMethod: selectedMethod,
      orderDate: new Date().toISOString(),
      status: selectedMethod === 'cod' ? 'confirmed' : (paypalSuccess || vnpaySuccess || zalopaySuccess || viettelMoneySuccess || momoSuccess ? 'confirmed' : 'pending_payment'),
      paypalDetails: paypalSuccess,
      vnpayDetails: vnpaySuccess,
      zalopayDetails: zalopaySuccess,
      viettelMoneyDetails: viettelMoneySuccess,
      momoDetails: momoSuccess
    };
    
    onOrderComplete(orderDetails);
  };



  // Handle success methods for various payment providers
  const handlePayPalSuccess = (details: any) => {
    setPaypalSuccess(details);
    setPaypalError(null);
    
    setTimeout(() => {
      const orderDetails = {
        orderNumber: orderNumber,
        items: cartItems,
        totalAmount: totalPrice,
        paymentMethod: 'paypal',
        orderDate: new Date().toISOString(),
        status: 'confirmed',
        paypalDetails: details
      };
      onOrderComplete(orderDetails);
    }, 1000);
  };

  const handlePayPalError = (error: any) => {
    setPaypalError(error.message || 'Có lỗi xảy ra khi thanh toán PayPal');
    setPaypalSuccess(null);
  };

  const handlePayPalCancel = () => {
    setPaypalError('Thanh toán PayPal đã bị hủy');
    setPaypalSuccess(null);
  };

  const handleVNPaySuccess = (details: any) => {
    setVnpaySuccess(details);
    setVnpayError(null);
    setShowVNPayCheckout(false);
    
    setTimeout(() => {
      const orderDetails = {
        orderNumber: orderNumber,
        items: cartItems,
        totalAmount: totalPrice,
        paymentMethod: 'vnpay',
        orderDate: new Date().toISOString(),
        status: 'confirmed',
        vnpayDetails: details
      };
      onOrderComplete(orderDetails);
    }, 1000);
  };

  const handleVNPayError = (error: any) => {
    setVnpayError(error.message || 'Có lỗi xảy ra khi thanh toán VNPay');
    setVnpaySuccess(null);
    setShowVNPayCheckout(false);
  };

  const handleVNPayCancel = () => {
    setVnpayError('Thanh toán VNPay đã bị hủy');
    setVnpaySuccess(null);
    setShowVNPayCheckout(false);
  };

  const handleZaloPaySuccess = (details: any) => {
    setZalopaySuccess(details);
    setZalopayError(null);
    
    setTimeout(() => {
      const orderDetails = {
        orderNumber: orderNumber,
        items: cartItems,
        totalAmount: totalPrice,
        paymentMethod: 'zalopay',
        orderDate: new Date().toISOString(),
        status: 'confirmed',
        zalopayDetails: details
      };
      onOrderComplete(orderDetails);
    }, 1000);
  };

  const handleZaloPayError = (error: any) => {
    setZalopayError(error.message || 'Có lỗi xảy ra khi thanh toán ZaloPay');
    setZalopaySuccess(null);
  };

  const handleZaloPayCancel = () => {
    setZalopayError('Thanh toán ZaloPay đã bị hủy');
    setZalopaySuccess(null);
  };

  const handleViettelMoneySuccess = (details: any) => {
    setViettelMoneySuccess(details);
    setViettelMoneyError(null);
    
    setTimeout(() => {
      const orderDetails = {
        orderNumber: orderNumber,
        items: cartItems,
        totalAmount: totalPrice,
        paymentMethod: 'viettel_money',
        orderDate: new Date().toISOString(),
        status: 'confirmed',
        viettelMoneyDetails: details
      };
      onOrderComplete(orderDetails);
    }, 1000);
  };

  const handleViettelMoneyError = (error: any) => {
    setViettelMoneyError(error.message || 'Có lỗi xảy ra khi thanh toán Viettel Money');
    setViettelMoneySuccess(null);
  };

  const handleViettelMoneyCancel = () => {
    setViettelMoneyError('Thanh toán Viettel Money đã bị hủy');
    setViettelMoneySuccess(null);
  };

  const handleMomoSuccess = (details: any) => {
    setMomoSuccess(details);
    setMomoError(null);
    setShowMomoCheckout(false);
    
    setTimeout(() => {
      const orderDetails = {
        orderNumber: orderNumber,
        items: cartItems,
        totalAmount: totalPrice,
        paymentMethod: 'momo',
        orderDate: new Date().toISOString(),
        status: 'confirmed',
        momoDetails: details
      };
      onOrderComplete(orderDetails);
    }, 1000);
  };

  const handleMomoError = (error: any) => {
    setMomoError(error.message || 'Có lỗi xảy ra khi thanh toán Momo');
    setMomoSuccess(null);
    setShowMomoCheckout(false);
  };

  const handleMomoCancel = () => {
    setMomoError('Thanh toán Momo đã bị hủy');
    setMomoSuccess(null);
    setShowMomoCheckout(false);
  };

  // Main Payment Methods
  const mainPaymentMethods = [
    {
      id: 'transfer',
      name: 'Chuyển khoản',
      description: 'Thanh toán online qua các ví điện tử và ngân hàng',
      icon: <CreditCard className="w-6 h-6" />,
      processingTime: 'Xử lý ngay lập tức'
    },
    {
      id: 'cod',
      name: 'Thanh toán khi nhận hàng (COD)',
      description: 'Thanh toán bằng tiền mặt khi nhận hàng',
      icon: <Truck className="w-6 h-6" />,
      processingTime: 'Thanh toán khi giao hàng'
    }
  ];

  // Sub Payment Methods for Transfer
  const transferSubMethods = [
    {
      id: 'bank_transfer',
      name: 'Chuyển khoản ngân hàng',
      description: 'Chuyển khoản trực tiếp qua ngân hàng',
      icon: <Banknote className="w-5 h-5" />,
      color: 'border-blue-500 hover:border-blue-400'
    },
    {
      id: 'vnpay',
      name: 'VNPay',
      description: 'Hỗ trợ tất cả ngân hàng Việt Nam',
      icon: <ImageWithFallback src={vnpayLogo} alt="VNPay" className="w-6 h-4 object-contain" />,
      color: 'border-blue-600 hover:border-blue-500'
    },
    {
      id: 'zalopay',
      name: 'ZaloPay',
      description: 'Ví điện tử ZaloPay',
      icon: <CreditCard className="w-5 h-5" />,
      color: 'border-blue-500 hover:border-blue-400'
    },
    {
      id: 'viettel_money',
      name: 'Viettel Money',
      description: 'Ví điện tử Viettel Money',
      icon: <CreditCard className="w-5 h-5" />,
      color: 'border-red-500 hover:border-red-400'
    },
    {
      id: 'momo',
      name: 'Momo',
      description: 'Ví điện tử Momo',
      icon: <ImageWithFallback src={momoLogo} alt="Momo" className="w-5 h-5 object-contain" />,
      color: 'border-pink-500 hover:border-pink-400'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Thanh toán quốc tế PayPal',
      icon: <CreditCard className="w-5 h-5" />,
      color: 'border-blue-500 hover:border-blue-400'
    }
  ];

  // Hiển thị VNPay Checkout nếu được chọn
  if (showVNPayCheckout) {
    return (
      <VNPayCheckout
        amount={totalPrice}
        orderNumber={orderNumber}
        orderInfo={`Thanh toan don hang ${orderNumber} - AGUST Jewelry`}
        onSuccess={handleVNPaySuccess}
        onError={handleVNPayError}
        onCancel={handleVNPayCancel}
      />
    );
  }

  // Hiển thị Momo Checkout nếu được chọn
  if (showMomoCheckout) {
    return (
      <MomoCheckout
        amount={totalPrice}
        orderNumber={orderNumber}
        orderInfo={`Thanh toan don hang ${orderNumber} - AGUST Jewelry`}
        onSuccess={handleMomoSuccess}
        onError={handleMomoError}
        onCancel={handleMomoCancel}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section with better spacing */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="text-white hover:text-yellow-600 hover:bg-yellow-600 hover:bg-opacity-10 mr-4 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Phương thức thanh toán</h1>
            <p className="text-gray-400">Chọn cách thức thanh toán phù hợp với bạn</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Payment Methods */}
          <div className="xl:col-span-3 space-y-8">
            {/* Step 1: Main Payment Method Selection */}
            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700/50 shadow-2xl">
              <CardHeader className="pb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center">
                    <span className="text-black font-bold text-sm">1</span>
                  </div>
                  <CardTitle className="text-white text-xl">Chọn hình thức thanh toán</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mainPaymentMethods.map((method) => (
                    <div 
                      key={method.id}
                      className={`group relative p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        selectedMainMethod === method.id 
                          ? 'border-yellow-600 bg-gradient-to-br from-yellow-600/20 to-yellow-600/5 shadow-yellow-600/20' 
                          : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'
                      }`}
                      onClick={() => setSelectedMainMethod(method.id as 'transfer' | 'cod')}
                    >
                      {selectedMainMethod === method.id && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-yellow-600 flex items-center justify-center">
                          <Check className="w-4 h-4 text-black" />
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className={`p-4 rounded-full transition-colors ${
                          selectedMainMethod === method.id 
                            ? 'bg-yellow-600 text-black' 
                            : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700'
                        }`}>
                          {method.icon}
                        </div>
                        
                        <div>
                          <div className={`font-semibold text-lg mb-2 ${
                            selectedMainMethod === method.id ? 'text-yellow-600' : 'text-white'
                          }`}>
                            {method.name}
                          </div>
                          <div className="text-gray-400 text-sm leading-relaxed">{method.description}</div>
                          <div className="text-gray-500 text-xs mt-2 flex items-center justify-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {method.processingTime}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Sub Method Selection (only for transfer) */}
            {selectedMainMethod === 'transfer' && (
              <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700/50 shadow-2xl animate-in slide-in-from-top-4 duration-500">
                <CardHeader className="pb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center">
                      <span className="text-black font-bold text-sm">2</span>
                    </div>
                    <CardTitle className="text-white text-xl">Chọn phương thức chuyển khoản</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {transferSubMethods.map((method) => (
                      <div 
                        key={method.id}
                        className={`group relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md ${
                          selectedSubMethod === method.id 
                            ? 'border-yellow-600 bg-gradient-to-br from-yellow-600/20 to-yellow-600/5 shadow-yellow-600/20' 
                            : `border-gray-700 hover:border-gray-600 hover:bg-gray-800/30`
                        }`}
                        onClick={() => setSelectedSubMethod(method.id)}
                      >
                        {selectedSubMethod === method.id && (
                          <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-yellow-600 flex items-center justify-center">
                            <Check className="w-3 h-3 text-black" />
                          </div>
                        )}
                        
                        <div className="flex flex-col items-center text-center space-y-3">
                          <div className={`p-3 rounded-lg transition-colors ${
                            selectedSubMethod === method.id 
                              ? 'bg-yellow-600/20' 
                              : 'bg-gray-800/50 group-hover:bg-gray-700/50'
                          }`}>
                            <div className={`${selectedSubMethod === method.id ? 'text-yellow-600' : 'text-gray-400'}`}>
                              {method.icon}
                            </div>
                          </div>
                          
                          <div>
                            <div className={`font-medium text-sm mb-1 ${
                              selectedSubMethod === method.id ? 'text-yellow-600' : 'text-white'
                            }`}>
                              {method.name}
                            </div>
                            <div className="text-gray-400 text-xs leading-relaxed">{method.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payment Details */}
            {selectedMainMethod === 'transfer' && selectedSubMethod === 'bank_transfer' && (
              <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700/50 shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="pb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center">
                      <span className="text-black font-bold text-sm">3</span>
                    </div>
                    <CardTitle className="text-white text-xl">Thông tin chuyển khoản</CardTitle>
                  </div>
                </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="text-gray-300">
                    Vui lòng chuyển khoản chính xác số tiền và nội dung chuyển khoản để đơn hàng được xử lý nhanh nhất.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                    <div className="text-gray-400 text-sm mb-2 flex items-center">
                      <Banknote className="w-4 h-4 mr-2" />
                      Ngân hàng
                    </div>
                    <div className="text-white font-medium">{bankInfo.bank}</div>
                  </div>
                  
                  <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                    <div className="text-gray-400 text-sm mb-2">Chi nhánh</div>
                    <div className="text-white font-medium">{bankInfo.branch}</div>
                  </div>
                  
                  <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 group hover:bg-gray-700/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-gray-400 text-sm mb-2">Số tài khoản</div>
                        <div className="text-white font-mono text-lg">{bankInfo.accountNumber}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bankInfo.accountNumber, 'account')}
                        className="text-yellow-600 hover:text-yellow-500 hover:bg-yellow-600/10 ml-2"
                      >
                        {copiedField === 'account' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                    <div className="text-gray-400 text-sm mb-2">Chủ tài khoản</div>
                    <div className="text-white font-medium">{bankInfo.accountName}</div>
                  </div>
                  
                  <div className="md:col-span-2 p-4 bg-gradient-to-r from-yellow-600/20 to-yellow-600/10 rounded-xl border border-yellow-600/50 group hover:from-yellow-600/30 hover:to-yellow-600/20 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-yellow-600 text-sm mb-2 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Nội dung chuyển khoản (Quan trọng)
                        </div>
                        <div className="text-white font-mono text-lg">{bankInfo.transferContent}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bankInfo.transferContent, 'content')}
                        className="text-yellow-600 hover:text-yellow-400 hover:bg-yellow-600/10 ml-2"
                      >
                        {copiedField === 'content' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 p-6 bg-gradient-to-r from-green-600/20 to-green-600/10 rounded-xl border border-green-600/50">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="text-green-600 text-sm mb-2 flex items-center">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Số tiền cần chuyển
                        </div>
                        <div className="text-white text-2xl font-bold">{formatPrice(totalPrice)}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(totalPrice.toString(), 'amount')}
                        className="text-green-600 hover:text-green-400 hover:bg-green-600/10 ml-2"
                      >
                        {copiedField === 'amount' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* QR Code Section */}
                {!showQRCode && (
                  <div className="mt-6">
                    <Button
                      onClick={() => setShowQRCode(true)}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                    >
                      <QrCode className="w-5 h-5 mr-3" />
                      Hiển thị mã QR chuyển khoản
                    </Button>
                  </div>
                )}

                {showQRCode && (
                  <div className="mt-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="text-center">
                      <h3 className="text-white font-semibold text-lg mb-4">Quét mã QR để chuyển khoản</h3>
                      <div className="bg-white p-6 rounded-2xl inline-block shadow-2xl">
                        <ImageWithFallback
                          src={generateQRCode()}
                          alt="QR Code chuyển khoản"
                          className="w-52 h-52 mx-auto"
                        />
                      </div>
                      <p className="text-gray-400 text-sm mt-4 max-w-sm mx-auto leading-relaxed">
                        Quét mã QR bằng ứng dụng ngân hàng để chuyển khoản tự động với đầy đủ thông tin
                      </p>
                    </div>

                    <Alert className="bg-blue-600 bg-opacity-20 border-blue-600">
                      <Clock className="h-4 w-4" />
                      <AlertDescription className="text-blue-300">
                        Sau khi chuyển khoản thành công, hệ thống sẽ tự động cập nhật trạng thái đơn hàng trong vòng 5-10 phút.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-3">
                      <Button
                        variant="ghost"
                        onClick={() => setShowQRCode(false)}
                        className="w-full text-gray-400 hover:text-white hover:bg-gray-800/50 py-2 rounded-xl transition-all duration-200"
                      >
                        Ẩn mã QR
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

            {/* VNPay Method */}
            {selectedMainMethod === 'transfer' && selectedSubMethod === 'vnpay' && (
              <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700/50 shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="pb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center">
                      <span className="text-black font-bold text-sm">3</span>
                    </div>
                    <CardTitle className="text-white text-xl">Thanh toán VNPay</CardTitle>
                  </div>
                </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <CreditCard className="h-4 w-4" />
                  <AlertDescription className="text-gray-300">
                    Thanh toán an toàn qua VNPay. Hỗ trợ tất cả ngân hàng tại Việt Nam, thẻ ATM, thẻ tín dụng và ví điện tử.
                  </AlertDescription>
                </Alert>

                {vnpayError && (
                  <Alert className="bg-red-600 bg-opacity-20 border-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-300">
                      {vnpayError}
                    </AlertDescription>
                  </Alert>
                )}

                {vnpaySuccess && (
                  <Alert className="bg-green-600 bg-opacity-20 border-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-green-300">
                      <div>
                        <div>Thanh toán VNPay thành công!</div>
                        <div className="text-xs mt-1">Mã giao dịch: {vnpaySuccess.vnp_TransactionNo}</div>
                        <div className="text-xs">Ngân hàng: {vnpaySuccess.vnp_BankCode}</div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <Button
                    onClick={() => setShowVNPayCheckout(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                    size="lg"
                  >
                    <ImageWithFallback src={vnpayLogo} alt="VNPay" className="w-8 h-8 mr-3" />
                    Thanh toán {formatPrice(totalPrice)} qua VNPay
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ZaloPay Method */}
          {selectedMainMethod === 'transfer' && selectedSubMethod === 'zalopay' && (
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Bước 3: Thanh toán ZaloPay</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <CreditCard className="h-4 w-4" />
                  <AlertDescription className="text-gray-300">
                    Thanh toán qua ví điện tử ZaloPay. Hỗ trợ tất cả ngân hàng tại Việt Nam, thẻ ATM, thẻ tín dụng và ví điện tử.
                  </AlertDescription>
                </Alert>

                {zalopayError && (
                  <Alert className="bg-red-600 bg-opacity-20 border-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-300">
                      {zalopayError}
                    </AlertDescription>
                  </Alert>
                )}

                {zalopaySuccess && (
                  <Alert className="bg-green-600 bg-opacity-20 border-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-green-300">
                      <div>
                        <div>Thanh toán ZaloPay thành công!</div>
                        <div className="text-xs mt-1">Mã giao dịch: {zalopaySuccess.transactionId}</div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <ZaloPayButton
                    amount={totalPrice}
                    orderInfo={`Thanh toan don hang ${orderNumber} - AGUST Jewelry`}
                    onSuccess={handleZaloPaySuccess}
                    onError={handleZaloPayError}
                    onCancel={handleZaloPayCancel}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Viettel Money Method */}
          {selectedMainMethod === 'transfer' && selectedSubMethod === 'viettel_money' && (
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Bước 3: Thanh toán Viettel Money</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <CreditCard className="h-4 w-4" />
                  <AlertDescription className="text-gray-300">
                    Thanh toán qua ví điện tử Viettel Money. Hỗ trợ nhiều nhà mạng, ngân hàng và ví điện tử.
                  </AlertDescription>
                </Alert>

                {viettelMoneyError && (
                  <Alert className="bg-red-600 bg-opacity-20 border-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-300">
                      {viettelMoneyError}
                    </AlertDescription>
                  </Alert>
                )}

                {viettelMoneySuccess && (
                  <Alert className="bg-green-600 bg-opacity-20 border-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-green-300">
                      <div>
                        <div>Thanh toán Viettel Money thành công!</div>
                        <div className="text-xs mt-1">Mã giao dịch: {viettelMoneySuccess.transactionId}</div>
                        {viettelMoneySuccess.provider_name && (
                          <div className="text-xs">Nhà cung cấp: {viettelMoneySuccess.provider_name}</div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <ViettelMoney
                    amount={totalPrice}
                    orderInfo={`Thanh toan don hang ${orderNumber} - AGUST Jewelry`}
                    orderNumber={orderNumber}
                    onSuccess={handleViettelMoneySuccess}
                    onError={handleViettelMoneyError}
                    onCancel={handleViettelMoneyCancel}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Momo Method */}
          {selectedMainMethod === 'transfer' && selectedSubMethod === 'momo' && (
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Bước 3: Thanh toán Momo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <CreditCard className="h-4 w-4" />
                  <AlertDescription className="text-gray-300">
                    Thanh toán qua ví điện tử Momo. Hỗ trợ quét QR code hoặc chuyển tiền trực tiếp.
                  </AlertDescription>
                </Alert>

                {momoError && (
                  <Alert className="bg-red-600 bg-opacity-20 border-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-300">
                      {momoError}
                    </AlertDescription>
                  </Alert>
                )}

                {momoSuccess && (
                  <Alert className="bg-green-600 bg-opacity-20 border-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-green-300">
                      <div>
                        <div>Thanh toán Momo thành công!</div>
                        <div className="text-xs mt-1">Mã giao dịch: {momoSuccess.transactionId}</div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <Button
                    onClick={() => setShowMomoCheckout(true)}
                    className="w-full bg-pink-600 hover:bg-pink-500 text-white"
                    size="lg"
                  >
                    <CreditCard className="w-6 h-6 mr-2" />
                    Thanh toán {formatPrice(totalPrice)} qua Momo
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* PayPal Method */}
          {selectedMainMethod === 'transfer' && selectedSubMethod === 'paypal' && (
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Bước 3: Thanh toán PayPal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <CreditCard className="h-4 w-4" />
                  <AlertDescription className="text-gray-300">
                    Thanh toán an toàn với PayPal. Hỗ trợ thẻ tín dụng, thẻ ghi nợ và tài khoản PayPal.
                  </AlertDescription>
                </Alert>

                {paypalError && (
                  <Alert className="bg-red-600 bg-opacity-20 border-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-300">
                      {paypalError}
                    </AlertDescription>
                  </Alert>
                )}

                {paypalSuccess && (
                  <Alert className="bg-green-600 bg-opacity-20 border-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-green-300">
                      <div>
                        <div>Thanh toán PayPal thành công!</div>
                        <div className="text-xs mt-1">Mã giao dịch: {paypalSuccess.paymentID}</div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <PayPalButton
                    amount={totalPrice}
                    onSuccess={handlePayPalSuccess}
                    onError={handlePayPalError}
                    onCancel={handlePayPalCancel}
                  />
                  
                  <div className="text-center">
                    <Button
                      onClick={() => setShowPayPalQR(!showPayPalQR)}
                      variant="outline"
                      className="text-blue-400 border-blue-400 hover:bg-blue-600 hover:bg-opacity-20"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      {showPayPalQR ? 'Ẩn PayPal QR Code' : 'Hiện PayPal QR Code'}
                    </Button>
                  </div>
                  
                  {showPayPalQR && (
                    <PayPalQRCode
                      amount={totalPrice}
                      usdAmount={Number((totalPrice / 24000).toFixed(2))}
                      paypalMeLink="https://paypal.me/NguyenMy2004"
                      onPaymentComplete={handlePayPalSuccess}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

            {/* COD Details */}
            {selectedMainMethod === 'cod' && (
              <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700/50 shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="pb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center">
                      <span className="text-black font-bold text-sm">2</span>
                    </div>
                    <CardTitle className="text-white text-xl">Thông tin thanh toán khi nhận hàng</CardTitle>
                  </div>
                </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-gray-800 border-gray-600">
                  <Truck className="h-4 w-4 text-gray-400" />
                  <AlertDescription className="text-gray-200">
                    Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng. Vui lòng chuẩn bị đúng số tiền hoặc số tiền lẻ.
                  </AlertDescription>
                </Alert>

                {/* Amount to pay */}
                <div className="p-6 bg-gradient-to-r from-green-600/20 to-green-600/10 rounded-xl border border-green-600/50">
                  <div className="text-green-600 text-sm mb-2 flex items-center">
                    <Truck className="w-4 h-4 mr-2" />
                    Số tiền cần thanh toán khi nhận hàng
                  </div>
                  <div className="text-white text-3xl font-bold">{formatPrice(totalPrice)}</div>
                </div>

                {/* COD Instructions */}
                <div className="p-6 bg-gradient-to-r from-orange-600/20 to-orange-600/10 rounded-xl border border-orange-600/50">
                  <div className="text-orange-400 font-semibold mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Lưu ý quan trọng
                  </div>
                  <div className="text-orange-300 space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2"></div>
                      <span>Vui lòng kiểm tra kỹ sản phẩm trước khi thanh toán</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2"></div>
                      <span>Chuẩn bị đúng số tiền hoặc số tiền lẻ</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2"></div>
                      <span>Đơn hàng COD có thể mất thêm 1-2 ngày để xử lý</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-gray-800 bg-opacity-50 border border-gray-600 rounded">
                    <div className="text-gray-400 text-sm">Thông tin giao hàng COD</div>
                    <div className="text-white mt-1">
                      <div className="text-sm">Thời gian giao hàng: <span className="text-green-400">3-5 ngày làm việc</span></div>
                      <div className="text-sm">Phí COD: <span className="text-green-400">Miễn phí</span></div>
                      <div className="text-xs text-gray-400 mt-2">
                        AGUST sẽ liên hệ xác nhận địa chỉ giao hàng trước khi giao
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-600 bg-opacity-20 border border-green-600 rounded">
                    <div className="text-green-400 text-sm">Ưu điểm COD</div>
                    <div className="text-gray-300 text-sm mt-2">
                      • Kiểm tra hàng trước khi thanh toán<br/>
                      • Không cần thẻ tín dụng hoặc tài khoản ngân hàng<br/>
                      • Đổi trả dễ dàng nếu có vấn đề<br/>
                      • Thanh toán trực tiếp với shipper<br/>
                      • An toàn và tiện lợi
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

          {/* Order Summary */}
          <div className="xl:col-span-1">
            <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50 sticky top-8 shadow-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-xl flex items-center">
                  <CreditCard className="w-5 h-5 mr-3" />
                  Tóm tắt đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-300">
                    <span>Tạm tính:</span>
                    <span className="font-medium">{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Phí vận chuyển:</span>
                    <span className="font-medium">
                      {getTotalPrice() >= 1000000 ? (
                        <span className="text-green-400 font-semibold">Miễn phí</span>
                      ) : (
                        formatPrice(shippingCost)
                      )}
                    </span>
                  </div>
                </div>
                
                <Separator className="bg-gray-700/50" />
                
                <div className="flex justify-between text-xl text-white font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-yellow-600">{formatPrice(totalPrice)}</span>
                </div>
                
                <div className="pt-2">
                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang xử lý...</span>
                      </div>
                    ) : (
                      <span className="flex items-center justify-center">
                        {selectedMainMethod === 'cod' ? (
                          <>
                            <Truck className="w-5 h-5 mr-3" />
                            Đặt hàng {formatPrice(totalPrice)}
                          </>
                        ) : selectedSubMethod === 'bank_transfer' ? (
                          <>
                            <Banknote className="w-5 h-5 mr-3" />
                            Xem thông tin chuyển khoản
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5 mr-3" />
                            Xác nhận thanh toán
                          </>
                        )}
                      </span>
                    )}
                  </Button>
                </div>
                
                <div className="text-center text-sm text-gray-400 pt-2">
                  <div className="flex items-center justify-center space-x-2 p-3 bg-gray-800/30 rounded-lg">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span>Giao dịch được bảo mật SSL 256-bit</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
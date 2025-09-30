import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Smartphone, QrCode, Shield, CheckCircle, Clock, AlertCircle, ExternalLink, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface VNPayCheckoutProps {
  amount: number;
  orderNumber: string;
  orderInfo: string;
  onSuccess: (paymentDetails: any) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

export function VNPayCheckout({ amount, orderNumber, orderInfo, onSuccess, onError, onCancel }: VNPayCheckoutProps) {
  const [currentStep, setCurrentStep] = useState<'order' | 'payment' | 'processing' | 'result'>('order');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 phút
  const [paymentResult, setPaymentResult] = useState<any>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Countdown timer
  useEffect(() => {
    if (currentStep === 'payment' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      handleTimeout();
    }
  }, [countdown, currentStep]);

  const handleTimeout = () => {
    onError({ message: 'Phiên thanh toán đã hết hạn. Vui lòng thực hiện lại.' });
  };

  const paymentMethods = [
    {
      id: 'ATM_CARD',
      name: 'Thẻ ATM/Tài khoản ngân hàng',
      description: 'Thanh toán bằng thẻ ATM hoặc Internet Banking',
      icon: <CreditCard className="w-5 h-5" />,
      popular: true
    },
    {
      id: 'QRCODE',
      name: 'Quét mã QR',
      description: 'Quét mã QR bằng ứng dụng ngân hàng',
      icon: <QrCode className="w-5 h-5" />,
      popular: false
    },
    {
      id: 'CREDIT_CARD',
      name: 'Thẻ thanh toán quốc tế',
      description: 'Visa, MasterCard, JCB, AMEX',
      icon: <CreditCard className="w-5 h-5" />,
      popular: false
    }
  ];

  const banks = [
    { code: 'TCB', name: 'Techcombank', logo: '🏦' },
    { code: 'VIETCOMBANK', name: 'Vietcombank', logo: '🏛️' },
    { code: 'BIDV', name: 'BIDV', logo: '🏧' },
    { code: 'VTB', name: 'VietinBank', logo: '💳' },
    { code: 'AGRIBANK', name: 'Agribank', logo: '🌾' },
    { code: 'ACB', name: 'Á Châu Bank', logo: '🏦' },
    { code: 'TPB', name: 'TPBank', logo: '💰' },
    { code: 'SACOMBANK', name: 'Sacombank', logo: '🏪' },
    { code: 'VPB', name: 'VPBank', logo: '💎' },
    { code: 'MB', name: 'MBBank', logo: '💼' },
    { code: 'SHB', name: 'SHB', logo: '🏨' },
    { code: 'OJB', name: 'OceanBank', logo: '🌊' }
  ];

  const handleStartPayment = () => {
    if (!selectedMethod) {
      alert('Vui lòng chọn phương thức thanh toán');
      return;
    }

    if (selectedMethod === 'ATM_CARD' && !selectedBank) {
      alert('Vui lòng chọn ngân hàng');
      return;
    }

    setCurrentStep('payment');
    setCountdown(600); // Reset countdown
  };

  const handleProcessPayment = () => {
    setCurrentStep('processing');
    setIsProcessing(true);

    // Mô phỏng quá trình thanh toán
    setTimeout(() => {
      // Mô phỏng kết quả thành công
      const mockResult = {
        vnp_Amount: (amount * 100).toString(),
        vnp_BankCode: selectedBank || 'VNPAYQR',
        vnp_BankTranNo: `VNP${Date.now()}`,
        vnp_CardType: selectedMethod === 'ATM_CARD' ? 'ATM' : selectedMethod === 'CREDIT_CARD' ? 'CREDIT' : 'QRCODE',
        vnp_OrderInfo: orderInfo,
        vnp_PayDate: new Date().toISOString().replace(/[-T:]/g, '').slice(0, 14),
        vnp_ResponseCode: '00',
        vnp_TmnCode: 'AGUST001',
        vnp_TransactionNo: `${Date.now()}`,
        vnp_TxnRef: orderNumber,
        status: 'success',
        message: 'Giao dịch thành công',
        paymentMethod: selectedMethod,
        bankName: banks.find(b => b.code === selectedBank)?.name || 'VNPay'
      };

      setPaymentResult(mockResult);
      setIsProcessing(false);
      setCurrentStep('result');

      // Auto redirect sau 3 giây
      setTimeout(() => {
        onSuccess(mockResult);
      }, 3000);
    }, 3000);
  };

  // Order Details Step
  if (currentStep === 'order') {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={onCancel}
                className="text-white hover:bg-blue-700 mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
              <h1 className="text-xl font-medium">Thanh toán VNPay</h1>
            </div>
            <div className="text-sm">
              <div>Powered by</div>
              <div className="font-medium">VNPAY</div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Info */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-800 flex items-center">
                    <Info className="w-5 h-5 mr-2 text-blue-600" />
                    Thông tin đơn hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mã đơn hàng:</span>
                      <span className="font-medium text-gray-800">{orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mô tả:</span>
                      <span className="font-medium text-gray-800">{orderInfo}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-gray-600">Số tiền thanh toán:</span>
                      <span className="text-xl font-bold text-blue-600">{formatPrice(amount)}</span>
                    </div>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription className="text-gray-700">
                      Giao dịch được bảo mật bởi VNPay với công nghệ mã hóa SSL 256-bit
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep('payment')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                      size="lg"
                    >
                      Tiếp tục thanh toán
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Info */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-800">Merchant</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-600">Tên merchant</div>
                      <div className="font-medium">AGUST Jewelry</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Mã merchant</div>
                      <div className="font-medium">AGUST001</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Website</div>
                      <div className="text-blue-600 text-sm">agust-jewelry.com</div>
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

  // Payment Method Selection Step
  if (currentStep === 'payment') {
    return (
      <div className="min-h-screen bg-white">
        {/* Header with countdown */}
        <div className="bg-blue-600 text-white p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep('order')}
                className="text-white hover:bg-blue-700 mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
              <h1 className="text-xl font-medium">Chọn phương thức thanh toán</h1>
            </div>
            <div className="text-right">
              <div className="text-sm">Thời gian còn lại</div>
              <div className="text-xl font-mono font-bold text-yellow-300">
                {formatTime(countdown)}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Payment Methods */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-800">Chọn phương thức thanh toán</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="space-y-3">
                        <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                          <RadioGroupItem value={method.id} id={method.id} />
                          <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="text-blue-600">{method.icon}</div>
                                <div>
                                  <div className="font-medium text-gray-800 flex items-center">
                                    {method.name}
                                    {method.popular && (
                                      <Badge variant="secondary" className="ml-2 text-xs">
                                        Phổ biến
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600">{method.description}</div>
                                </div>
                              </div>
                            </div>
                          </Label>
                        </div>
                        
                        {/* Bank selection for ATM_CARD */}
                        {selectedMethod === method.id && method.id === 'ATM_CARD' && (
                          <div className="ml-8 pl-4 border-l-2 border-gray-200">
                            <h4 className="font-medium text-gray-800 mb-3">Chọn ngân hàng</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {banks.map((bank) => (
                                <Button
                                  key={bank.code}
                                  variant={selectedBank === bank.code ? "default" : "outline"}
                                  onClick={() => setSelectedBank(bank.code)}
                                  className={`justify-start text-left p-3 ${
                                    selectedBank === bank.code 
                                      ? 'bg-blue-600 text-white' 
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <span className="text-lg mr-2">{bank.logo}</span>
                                  <span className="text-sm">{bank.name}</span>
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </RadioGroup>

                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={handleProcessPayment}
                      disabled={!selectedMethod || (selectedMethod === 'ATM_CARD' && !selectedBank)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                      size="lg"
                    >
                      Thanh toán {formatPrice(amount)}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-800">Chi tiết đơn hàng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mã đơn hàng:</span>
                      <span className="font-medium">{orderNumber}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-medium">Tổng tiền:</span>
                      <span className="text-lg font-bold text-blue-600">{formatPrice(amount)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-green-800">Bảo mật tuyệt đối</div>
                    <div className="text-green-700">
                      Giao dịch được bảo vệ bởi công nghệ SSL 256-bit của VNPay
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Processing Step
  if (currentStep === 'processing') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto p-6">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          
          <div>
            <h2 className="text-xl font-medium text-gray-800 mb-2">
              Đang xử lý thanh toán
            </h2>
            <p className="text-gray-600">
              Vui lòng không đóng cửa sổ này trong quá trình xử lý
            </p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <div className="font-medium">Đang kết nối với ngân hàng...</div>
              <div>Thời gian xử lý: 1-3 phút</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Result Step
  if (currentStep === 'result' && paymentResult) {
    const isSuccess = paymentResult.vnp_ResponseCode === '00';
    
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto p-6">
          <div className="text-center space-y-6">
            {isSuccess ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-medium text-gray-800 mb-2">
                    Thanh toán thành công!
                  </h2>
                  <p className="text-gray-600">
                    Cảm ơn bạn đã sử dụng dịch vụ thanh toán VNPay
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-medium text-gray-800 mb-2">
                    Thanh toán thất bại
                  </h2>
                  <p className="text-gray-600">
                    Đã có lỗi xảy ra trong quá trình thanh toán
                  </p>
                </div>
              </>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-gray-800">Thông tin giao dịch</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã giao dịch VNPay:</span>
                    <span className="font-medium">{paymentResult.vnp_TransactionNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã đơn hàng:</span>
                    <span className="font-medium">{paymentResult.vnp_TxnRef}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngân hàng:</span>
                    <span className="font-medium">{paymentResult.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số tiền:</span>
                    <span className="font-medium">{formatPrice(amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian:</span>
                    <span className="font-medium">{new Date().toLocaleString('vi-VN')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-sm text-gray-500">
              Tự động chuyển hướng sau 3 giây...
            </div>

            <Button
              onClick={() => onSuccess(paymentResult)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Quay về trang chủ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
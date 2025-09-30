import React, { useState, useEffect } from 'react';
import { ArrowLeft, Smartphone, QrCode, CheckCircle, AlertCircle, Copy, Check, CreditCard } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { ImageWithFallback } from './figma/ImageWithFallback';
import momoLogo from 'figma:asset/336e5016f2972fd79467240c1551b8fa764426ee.png';

interface MomoCheckoutProps {
  amount: number;
  orderNumber: string;
  orderInfo: string;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

export function MomoCheckout({ 
  amount, 
  orderNumber, 
  orderInfo, 
  onSuccess, 
  onError, 
  onCancel 
}: MomoCheckoutProps) {
  const [step, setStep] = useState<'init' | 'qr' | 'waiting' | 'success'>('init');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string>('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Tạo QR code data cho Momo
  const generateMomoQRData = () => {
    const momoData = {
      partnerCode: 'MOMO',
      partnerName: 'AGUST',
      storeId: 'AGUST_STORE',
      requestId: orderNumber,
      amount: amount,
      orderId: orderNumber,
      orderInfo: orderInfo,
      redirectUrl: window.location.origin,
      ipnUrl: window.location.origin + '/momo/callback',
      extraData: '',
      requestType: 'captureWallet',
      signature: 'demo_signature'
    };
    
    return JSON.stringify(momoData);
  };

  // Tạo QR code URL
  const generateQRCodeURL = () => {
    const qrData = generateMomoQRData();
    const encodedData = encodeURIComponent(qrData);
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&format=png&data=${encodedData}`;
  };

  // Momo payment info
  const momoInfo = {
    phone: '0789123456',
    name: 'NGUYEN THI TRA MY',
    transferContent: orderNumber
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Countdown timer
  useEffect(() => {
    if (step === 'qr' || step === 'waiting') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            onError({ message: 'Hết thời gian thanh toán. Vui lòng thử lại.' });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step, onError]);

  // Auto success after 15 seconds for demo
  useEffect(() => {
    if (step === 'waiting') {
      const successTimer = setTimeout(() => {
        const txnId = `MOMO_${Date.now()}`;
        setTransactionId(txnId);
        setStep('success');
        
        setTimeout(() => {
          onSuccess({
            transactionId: txnId,
            amount: amount,
            orderNumber: orderNumber,
            paymentTime: new Date().toISOString(),
            status: 'SUCCESS',
            message: 'Thanh toán Momo thành công',
            momoPhone: momoInfo.phone,
            momoName: momoInfo.name
          });
        }, 2000);
      }, 15000);

      return () => clearTimeout(successTimer);
    }
  }, [step, amount, orderNumber, onSuccess]);

  const handleStartPayment = () => {
    setStep('qr');
  };

  const handleOpenMomoApp = () => {
    const deepLink = `momo://payment?amount=${amount}&description=${encodeURIComponent(orderInfo)}&orderNumber=${orderNumber}`;
    
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      window.location.href = deepLink;
    } else {
      window.open('https://momo.vn/download', '_blank');
    }
    
    setStep('waiting');
  };

  const simulateSuccess = () => {
    const txnId = `MOMO_${Date.now()}`;
    setTransactionId(txnId);
    setStep('success');
    
    setTimeout(() => {
      onSuccess({
        transactionId: txnId,
        amount: amount,
        orderNumber: orderNumber,
        paymentTime: new Date().toISOString(),
        status: 'SUCCESS',
        message: 'Thanh toán Momo thành công',
        momoPhone: momoInfo.phone,
        momoName: momoInfo.name
      });
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={onCancel}
            className="text-white hover:text-pink-400 mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-xl text-white">Thanh toán Momo</h1>
        </div>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-center">
              {step === 'init' && 'Xác nhận thanh toán'}
              {step === 'qr' && 'Quét mã QR để thanh toán'}
              {step === 'waiting' && 'Đang chờ thanh toán'}
              {step === 'success' && 'Thanh toán thành công!'}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Payment Amount */}
            <div className="text-center p-4 bg-pink-600 bg-opacity-20 border border-pink-600 rounded-lg">
              <div className="text-pink-400 text-sm">Số tiền thanh toán</div>
              <div className="text-white text-2xl font-semibold mt-1">{formatPrice(amount)}</div>
              <div className="text-gray-400 text-sm mt-1">Đơn hàng: {orderNumber}</div>
            </div>

            {/* Init Step */}
            {step === 'init' && (
              <div className="space-y-4">
                <Alert>
                  <img src={momoLogo} alt="Momo" className="h-4 w-4" />
                  <AlertDescription className="text-gray-300">
                    Bạn sẽ thanh toán {formatPrice(amount)} qua ví điện tử Momo
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div className="p-3 bg-gray-800 rounded">
                    <div className="text-gray-400 text-sm">Nội dung thanh toán</div>
                    <div className="text-white text-sm">{orderInfo}</div>
                  </div>
                </div>

                <Button
                  onClick={handleStartPayment}
                  className="w-full bg-pink-600 hover:bg-pink-500 text-white py-3"
                  size="lg"
                >
                  <img src={momoLogo} alt="Momo" className="w-5 h-5 mr-2" />
                  Bắt đầu thanh toán
                </Button>
              </div>
            )}

            {/* QR Step */}
            {step === 'qr' && (
              <div className="space-y-4">
                {/* Timer */}
                <div className="text-center">
                  <div className="text-pink-400 font-mono text-lg">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-gray-400 text-sm">Thời gian còn lại</div>
                </div>

                {/* QR Code */}
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <img
                      src={generateQRCodeURL()}
                      alt="Momo QR Code"
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-pink-600 bg-opacity-20 border border-pink-600 rounded-lg p-4">
                  <div className="text-pink-400 text-sm font-medium mb-2">Hướng dẫn thanh toán:</div>
                  <div className="text-pink-300 text-sm space-y-1">
                    <div>1. Mở ứng dụng Momo</div>
                    <div>2. Chọn "Quét QR" từ màn hình chính</div>
                    <div>3. Quét mã QR phía trên</div>
                    <div>4. Xác nhận thanh toán</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleOpenMomoApp}
                    className="w-full bg-pink-600 hover:bg-pink-500 text-white"
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Mở ứng dụng Momo
                  </Button>

                  <Button
                    onClick={simulateSuccess}
                    className="w-full bg-green-600 hover:bg-green-500 text-white"
                  >
                    ✓ Demo: Thanh toán thành công
                  </Button>
                </div>

                {/* Alternative: Manual Transfer */}
                <div className="border-t border-gray-700 pt-4">
                  <div className="text-white text-sm font-medium mb-3">Hoặc chuyển khoản trực tiếp:</div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                      <div>
                        <div className="text-gray-400 text-sm">Số điện thoại Momo</div>
                        <div className="text-white font-mono">{momoInfo.phone}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(momoInfo.phone, 'phone')}
                        className="text-pink-400 hover:text-pink-300"
                      >
                        {copiedField === 'phone' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                      <div>
                        <div className="text-gray-400 text-sm">Tên tài khoản</div>
                        <div className="text-white">{momoInfo.name}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-pink-600 bg-opacity-20 border border-pink-600 rounded">
                      <div>
                        <div className="text-pink-400 text-sm">Nội dung chuyển khoản</div>
                        <div className="text-white font-mono">{momoInfo.transferContent}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(momoInfo.transferContent, 'content')}
                        className="text-pink-400 hover:text-pink-300"
                      >
                        {copiedField === 'content' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Waiting Step */}
            {step === 'waiting' && (
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <div className="w-16 h-16 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
                </div>

                <div>
                  <div className="text-white font-medium">Đang chờ xác nhận thanh toán</div>
                  <div className="text-gray-400 text-sm mt-1">
                    Vui lòng hoàn tất thanh toán trong ứng dụng Momo
                  </div>
                </div>

                <div className="text-pink-400 font-mono text-lg">
                  {formatTime(timeLeft)}
                </div>

                <Button
                  onClick={simulateSuccess}
                  className="w-full bg-green-600 hover:bg-green-500 text-white"
                >
                  ✓ Demo: Xác nhận đã thanh toán
                </Button>
              </div>
            )}

            {/* Success Step */}
            {step === 'success' && (
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>

                <div>
                  <div className="text-white text-lg font-medium">Thanh toán thành công!</div>
                  <div className="text-gray-400 text-sm mt-1">
                    Giao dịch đã được xử lý thành công
                  </div>
                </div>

                <Alert className="bg-green-600 bg-opacity-20 border-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-green-300">
                    <div className="space-y-1">
                      <div>Mã giao dịch: {transactionId}</div>
                      <div>Số tiền: {formatPrice(amount)}</div>
                      <div>Thời gian: {new Date().toLocaleString('vi-VN')}</div>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="text-sm text-gray-400">
                  Đơn hàng sẽ được xử lý trong ít phút...
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
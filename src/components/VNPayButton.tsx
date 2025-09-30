import React, { useState } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { CreditCard, Clock, CheckCircle, ExternalLink, Shield } from 'lucide-react';
import vnpayLogo from 'figma:asset/9da583f9c2bd0b8148828f07933dfd333f05f3a4.png';

interface VNPayButtonProps {
  amount: number;
  orderInfo: string;
  onSuccess: (paymentDetails: any) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

export function VNPayButton({ amount, orderInfo, onSuccess, onError, onCancel }: VNPayButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBankList, setShowBankList] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Mock VNPay configuration (trong thực tế sẽ được cấu hình trên server)
  const vnpayConfig = {
    vnp_TmnCode: '58RCH842', // Mã website merchant
    vnp_HashSecret: 'KSSV1MGJ82G9AHSMIM0PT2U6TK4SZNFK', // Secret key
    vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html', // Sandbox URL
    vnp_ReturnUrl: window.location.origin + '/payment-return'
  };

  // Danh sách ngân hàng hỗ trợ VNPay
  const supportedBanks = [
    { code: 'VNPAYQR', name: 'VNPay QR', logo: '🏦' },
    { code: 'VNBANK', name: 'VietinBank', logo: '🏛️' },
    { code: 'VIETCOMBANK', name: 'Vietcombank', logo: '🏦' },
    { code: 'TCB', name: 'Techcombank', logo: '💳' },
    { code: 'BIDV', name: 'BIDV', logo: '🏧' },
    { code: 'AGRIBANK', name: 'Agribank', logo: '🌾' },
    { code: 'TPB', name: 'TPBank', logo: '💰' },
    { code: 'SACOMBANK', name: 'Sacombank', logo: '🏪' },
    { code: 'ACB', name: 'ACB', logo: '🏦' },
    { code: 'VPB', name: 'VPBank', logo: '💎' }
  ];

  const generateVNPayUrl = (bankCode?: string) => {
    const vnp_CreateDate = new Date().toISOString().replace(/[-T:]/g, '').slice(0, 14);
    const vnp_TxnRef = `AGUST${Date.now()}`;
    
    const vnpParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: vnpayConfig.vnp_TmnCode,
      vnp_Amount: (amount * 100).toString(), // VNPay yêu cầu số tiền * 100
      vnp_CurrCode: 'VND',
      vnp_TxnRef: vnp_TxnRef,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: vnp_CreateDate,
      ...(bankCode && { vnp_BankCode: bankCode })
    };

    // Trong thực tế, việc tạo secure hash phải được thực hiện trên server
    // Đây là mock implementation cho demo
    const queryString = Object.entries(vnpParams)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    return `${vnpayConfig.vnp_Url}?${queryString}&vnp_SecureHash=MOCK_SECURE_HASH`;
  };

  const handleVNPayPayment = async (bankCode?: string) => {
    setIsProcessing(true);
    setShowBankList(false);

    try {
      // Mô phỏng việc tạo payment URL và redirect
      const paymentUrl = generateVNPayUrl(bankCode);
      
      // Trong thực tế, sẽ redirect đến VNPay
      // window.location.href = paymentUrl;
      
      // Mock thành công sau 3 giây để demo
      setTimeout(() => {
        const mockPaymentResult = {
          vnp_Amount: (amount * 100).toString(),
          vnp_BankCode: bankCode || 'VNPAYQR',
          vnp_BankTranNo: `VNP${Date.now()}`,
          vnp_CardType: 'ATM',
          vnp_OrderInfo: orderInfo,
          vnp_PayDate: new Date().toISOString().replace(/[-T:]/g, '').slice(0, 14),
          vnp_ResponseCode: '00',
          vnp_TmnCode: vnpayConfig.vnp_TmnCode,
          vnp_TransactionNo: `${Date.now()}`,
          vnp_TxnRef: `AGUST${Date.now()}`,
          vnp_SecureHash: 'MOCK_HASH',
          status: 'success',
          message: 'Thanh toán thành công qua VNPay'
        };

        setIsProcessing(false);
        onSuccess(mockPaymentResult);
      }, 3000);

    } catch (error) {
      setIsProcessing(false);
      onError({ message: 'Có lỗi xảy ra khi kết nối VNPay' });
    }
  };

  const handleCancel = () => {
    setIsProcessing(false);
    setShowBankList(false);
    onCancel();
  };

  if (isProcessing) {
    return (
      <div className="space-y-4">
        <Alert className="bg-blue-600 bg-opacity-20 border-blue-600">
          <Clock className="h-4 w-4 animate-spin" />
          <AlertDescription className="text-blue-300">
            <div className="space-y-2">
              <div className="font-medium">Đang xử lý thanh toán VNPay...</div>
              <div className="text-sm">Vui lòng không đóng cửa sổ này</div>
            </div>
          </AlertDescription>
        </Alert>
        
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-sm text-gray-400">Đang chuyển hướng đến VNPay...</div>
          <Button
            variant="ghost" 
            onClick={handleCancel}
            className="text-red-400 hover:text-red-300"
          >
            Hủy thanh toán
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!showBankList ? (
        <div className="space-y-3">
          <Button
            onClick={() => handleVNPayPayment()}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white"
            size="lg"
          >
            <img src={vnpayLogo} alt="VNPay" className="w-6 h-6 mr-2" />
            Thanh toán {formatPrice(amount)} qua VNPay
          </Button>
          
          <Button
            onClick={() => setShowBankList(true)}
            variant="outline"
            className="w-full text-blue-400 border-blue-400 hover:bg-blue-600 hover:bg-opacity-20"
          >
            <Shield className="w-4 h-4 mr-2" />
            Chọn ngân hàng cụ thể
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-medium">Chọn ngân hàng</h4>
            <Button
              variant="ghost"
              onClick={() => setShowBankList(false)}
              className="text-gray-400 hover:text-white text-sm"
            >
              ← Quay lại
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {supportedBanks.map((bank) => (
              <Button
                key={bank.code}
                onClick={() => handleVNPayPayment(bank.code)}
                variant="outline"
                className="text-left justify-start text-white border-gray-600 hover:border-blue-400 hover:bg-blue-600 hover:bg-opacity-20 p-3"
              >
                <span className="text-lg mr-2">{bank.logo}</span>
                <span className="text-sm">{bank.name}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Alert className="bg-green-600 bg-opacity-20 border-green-600">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-300">
            <div className="space-y-1">
              <div className="font-medium">VNPay - Thanh toán an toàn</div>
              <div className="text-sm">
                • Bảo mật SSL 256-bit<br/>
                • Hỗ trợ tất cả ngân hàng tại Việt Nam<br/>
                • Phí giao dịch 0% cho khách hàng<br/>
                • Xử lý giao dịch 24/7
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <div className="p-3 bg-gray-800 bg-opacity-50 border border-gray-600 rounded text-center">
          <div className="text-gray-400 text-sm">Được hỗ trợ bởi</div>
          <div className="text-blue-400 font-medium">VNPay - Cổng thanh toán hàng đầu Việt Nam</div>
          <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
            <Shield className="w-3 h-3 mr-1" />
            Được cấp phép bởi Ngân hàng Nhà nước Việt Nam
          </div>
        </div>
      </div>
    </div>
  );
}
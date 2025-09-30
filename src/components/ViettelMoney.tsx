import React, { useState } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Copy, Check, QrCode } from 'lucide-react';
import { useCart } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ViettelMoneyProps {
  amount: number;
  orderInfo: string;
  orderNumber: string;
  onSuccess: (paymentDetails: any) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

// Danh sách nhà mạng và ví điện tử hỗ trợ ViettelMoney
const SUPPORTED_PROVIDERS = [
  { code: 'viettel', name: 'Ví Viettel Money', logo: '📱', type: 'wallet' },
  { code: 'vinaphone', name: 'Vinaphone', logo: '📞', type: 'telecom' },
  { code: 'mobifone', name: 'MobiFone', logo: '📞', type: 'telecom' },
  { code: 'vietnamobile', name: 'Vietnamobile', logo: '📞', type: 'telecom' },
  { code: 'momo', name: 'MoMo Wallet', logo: '💳', type: 'wallet' },
  { code: 'airpay', name: 'AirPay', logo: '💳', type: 'wallet' },
  { code: 'vtcpay', name: 'VTC Pay', logo: '💳', type: 'wallet' },
  { code: 'vcb', name: 'Vietcombank', logo: '🏦', type: 'bank' },
  { code: 'tcb', name: 'Techcombank', logo: '🏦', type: 'bank' },
  { code: 'acb', name: 'ACB', logo: '🏦', type: 'bank' },
  { code: 'bidv', name: 'BIDV', logo: '🏦', type: 'bank' },
  { code: 'vtb', name: 'VietinBank', logo: '🏦', type: 'bank' },
];

// Email notification service cho ViettelMoney
const sendViettelMoneyEmail = async (email: string, orderDetails: any) => {
  try {
    const emailData = {
      to: email,
      subject: 'Xác nhận thanh toán Viettel Money - AGUST Jewelry',
      content: `
        Kính chào quý khách,
        
        AGUST Jewelry xin xác nhận đơn hàng của bạn đã được thanh toán thành công qua Viettel Money:
        
        🧾 Thông tin đơn hàng:
        - Mã đơn hàng: ${orderDetails.orderNumber}
        - Mã giao dịch Viettel Money: ${orderDetails.transactionId}
        - Nhà mạng/Ví: ${orderDetails.provider_name}
        - Số tiền: ${orderDetails.amount.toLocaleString('vi-VN')} VND
        - Thời gian: ${new Date().toLocaleString('vi-VN')}
        
        🚚 Thông tin giao hàng:
        - Thời gian dự kiến: 3-5 ngày làm việc
        - AGUST sẽ liên hệ xác nhận địa chỉ giao hàng
        
        📞 Hỗ trợ khách hàng:
        - Hotline: 0981 654 116
        - Email: support@agust.vn
        
        Cảm ơn bạn đã tin tưởng và mua sắm tại AGUST!
        
        Trân trọng,
        AGUST Jewelry Team
      `
    };
    
    console.log('📧 Sending Viettel Money email notification:', emailData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, messageId: `msg_vt_${Date.now()}` };
  } catch (error) {
    console.error('❌ Viettel Money email notification failed:', error);
    throw error;
  }
};

export function ViettelMoney({ amount, orderInfo, orderNumber, onSuccess, onError, onCancel }: ViettelMoneyProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('viettel');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { cartItems } = useCart();

  // Thông tin tài khoản Viettel Money
  const viettelAccountInfo = {
    accountNumber: '9704229201917379882',
    accountName: 'VUONG THI THU NGUYEN',
    serviceName: 'Viettel Money'
  };

  const getSelectedProviderInfo = () => {
    return SUPPORTED_PROVIDERS.find(provider => provider.code === selectedProvider) || SUPPORTED_PROVIDERS[0];
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getProviderTypeColor = (type: string) => {
    switch (type) {
      case 'wallet': return 'text-green-400';
      case 'telecom': return 'text-blue-400';
      case 'bank': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Generate VietQR URL for Viettel Money (MB Bank)
  const generateViettelMoneyQR = () => {
    // MB Bank code for VietQR
    const bankCode = '970422'; // MB Bank (Viettel Money uses MB Bank infrastructure)
    const accountNumber = viettelAccountInfo.accountNumber;
    const transferAmount = amount;
    const transferContent = encodeURIComponent(orderNumber); // Sử dụng mã đơn hàng làm nội dung
    const accountName = encodeURIComponent(viettelAccountInfo.accountName);
    
    // VietQR URL format for Viettel Money via MB Bank
    return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${transferAmount}&addInfo=${transferContent}&accountName=${accountName}`;
  };

  const handlePaymentClick = () => {
    if (!selectedProvider) {
      onError(new Error('Vui lòng chọn nhà mạng hoặc ví điện tử'));
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmPayment = async () => {
    setShowConfirmDialog(false);
    setIsProcessing(true);
    
    try {
      const selectedProviderInfo = getSelectedProviderInfo();
      
      // Mock Viettel Money payment process
      const paymentData = {
        merchant_id: "AGUST_VIETTEL", 
        transaction_id: `VT_${Date.now()}`,
        amount: amount,
        description: orderInfo,
        provider_code: selectedProvider,
        return_url: window.location.origin,
        cancel_url: window.location.origin,
        items: JSON.stringify(cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))),
        extra_data: JSON.stringify({
          store_name: "AGUST Jewelry",
          provider_type: selectedProviderInfo.type,
          provider_name: selectedProviderInfo.name
        })
      };

      console.log('Viettel Money Payment Data:', paymentData);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3500));
      
      // Mock successful payment response
      const successResponse = {
        transaction_id: paymentData.transaction_id,
        vt_trans_id: `VTM_${Date.now()}`,
        transactionId: `VTM_${Date.now()}`,
        amount: paymentData.amount,
        status: "SUCCESS",
        message: "Thanh toán thành công",
        payment_method: "ViettelMoney",
        provider_code: selectedProvider,
        provider_name: selectedProviderInfo.name,
        provider_type: selectedProviderInfo.type,
        created_time: new Date().toISOString(),
        orderNumber: paymentData.transaction_id
      };

      // Gửi email notification
      try {
        await sendViettelMoneyEmail('buiquanghuyhuy667@gmail.com', successResponse);
        console.log('✅ Viettel Money email notification sent successfully');
      } catch (emailError) {
        console.warn('⚠️ Viettel Money email notification failed, but payment was successful:', emailError);
      }

      onSuccess(successResponse);
      
    } catch (error) {
      console.error('Viettel Money payment error:', error);
      onError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelPayment = () => {
    setShowConfirmDialog(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-red-800 rounded flex items-center justify-center">
            <span className="text-red-100 font-bold text-sm">V</span>
          </div>
          <h3 className="text-white font-medium">Viettel Money</h3>
        </div>
        
        <div className="text-gray-300 text-sm space-y-2">
          <p>• Thanh toán qua ví điện tử Viettel Money</p>
          <p>• Hỗ trợ nhiều nhà mạng và ví điện tử</p>
          <p>• Thanh toán nhanh chóng, bảo mật cao</p>
          <p>• Ưu đãi đặc biệt cho thuê bao Viettel</p>
        </div>
      </div>

      {/* Provider Selection */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
        <h4 className="text-white font-medium mb-3">Chọn nhà mạng/ví điện tử</h4>
        <Select value={selectedProvider} onValueChange={setSelectedProvider}>
          <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Chọn nhà cung cấp..." />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            {SUPPORTED_PROVIDERS.map((provider) => (
              <SelectItem 
                key={provider.code} 
                value={provider.code}
                className="text-white hover:bg-gray-700 focus:bg-gray-700"
              >
                <div className="flex items-center space-x-2">
                  <span>{provider.logo}</span>
                  <span>{provider.name}</span>
                  <span className={`text-xs ${getProviderTypeColor(provider.type)}`}>
                    {provider.type === 'wallet' && '(Ví)'}
                    {provider.type === 'telecom' && '(Nhà mạng)'}
                    {provider.type === 'bank' && '(Ngân hàng)'}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedProvider && (
          <div className="mt-3 p-3 bg-red-900 bg-opacity-30 border border-red-800 rounded">
            <div className="flex items-center space-x-2 text-red-200 text-sm">
              <span>{getSelectedProviderInfo().logo}</span>
              <span>Đã chọn: {getSelectedProviderInfo().name}</span>
              <span className={`text-xs ${getProviderTypeColor(getSelectedProviderInfo().type)}`}>
                {getSelectedProviderInfo().type === 'wallet' && '(Ví điện tử)'}
                {getSelectedProviderInfo().type === 'telecom' && '(Nhà mạng)'}
                {getSelectedProviderInfo().type === 'bank' && '(Ngân hàng)'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Account Information */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
        <h4 className="text-white font-medium mb-3">Thông tin tài khoản Viettel Money</h4>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
            <div>
              <div className="text-gray-400 text-sm">Số tài khoản</div>
              <div className="text-white font-mono">{viettelAccountInfo.accountNumber}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(viettelAccountInfo.accountNumber, 'account')}
              className="text-red-300 hover:text-red-200"
            >
              {copiedField === 'account' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
            <div>
              <div className="text-gray-400 text-sm">Chủ tài khoản</div>
              <div className="text-white">{viettelAccountInfo.accountName}</div>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-red-900 bg-opacity-25 border border-red-800 rounded">
            <div>
              <div className="text-red-200 text-sm">Số tiền cần thanh toán</div>
              <div className="text-white text-lg font-semibold">{formatPrice(amount)}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(amount.toString(), 'amount')}
              className="text-red-300 hover:text-red-200"
            >
              {copiedField === 'amount' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* QR Code Section */}
        {!showQRCode && (
          <div className="mt-4">
            <Button
              onClick={() => setShowQRCode(true)}
              className="w-full bg-red-800 hover:bg-red-700 text-red-100"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Hiển thị mã QR Viettel Money
            </Button>
          </div>
        )}

        {showQRCode && (
          <div className="mt-4 space-y-4">
            {/* Viettel Money QR Card Style */}
            <div className="bg-gradient-to-br from-red-800 to-red-900 p-6 rounded-lg text-center">
              {/* Header with logos */}
              <div className="flex justify-center items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center">
                    <span className="text-red-800 font-bold text-sm">V</span>
                  </div>
                  <span className="text-red-100 font-bold">viettel money</span>
                </div>
                <div className="text-red-100 font-bold">VietQR</div>
              </div>
              
              {/* QR Scan instruction */}
              <div className="flex items-center justify-center text-red-100 mb-4">
                <QrCode className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">QUÉT MÃ ĐỂ SỬ DỤNG</span>
              </div>
              
              {/* QR Code */}
              <div className="bg-white p-4 rounded-xl inline-block mb-4">
                <ImageWithFallback
                  src={generateViettelMoneyQR()}
                  alt="QR Code Viettel Money"
                  className="w-48 h-48 mx-auto"
                />
              </div>
              
              {/* Account name */}
              <div className="text-red-100 text-lg font-bold mb-2">
                {viettelAccountInfo.accountName}
              </div>
              
              {/* Additional info */}
              <div className="text-red-200 text-sm mb-2">
                Chuyển tiền theo số tài khoản
              </div>
              <div className="text-red-200 text-sm mb-4">
                Số tài khoản ViettelPay (MB Bank)
              </div>
              <div className="text-red-100 font-mono text-lg">
                {viettelAccountInfo.accountNumber.replace(/(\d{4})/g, '$1 ').trim()}
              </div>
            </div>

            {/* Amount and order info */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Số tiền cần thanh toán:</span>
                <span className="text-white font-semibold">{formatPrice(amount)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Nội dung:</span>
                <span className="text-white font-mono text-sm">{orderNumber}</span>
              </div>
              <div className="text-center mt-3">
                <p className="text-gray-400 text-xs">
                  Quét mã QR bằng ứng dụng Viettel Money để thanh toán tự động với đầy đủ thông tin
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={() => setShowQRCode(false)}
              className="w-full text-gray-400 hover:text-white"
            >
              Ẩn mã QR
            </Button>
          </div>
        )}
      </div>

      <Button
        onClick={handlePaymentClick}
        disabled={isProcessing || !selectedProvider}
        className="w-full bg-red-800 hover:bg-red-700 text-red-100 py-3 rounded-lg transition-colors disabled:opacity-50"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-red-100 border-t-transparent rounded-full animate-spin"></div>
            <span>Đang xử lý với {getSelectedProviderInfo().name}...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 bg-red-100 rounded flex items-center justify-center">
              <span className="text-red-800 font-bold text-xs">V</span>
            </div>
            <span>Xác nhận đã thanh toán qua Viettel Money</span>
          </div>
        )}
      </Button>

      {isProcessing && (
        <div className="bg-red-900/30 border border-red-800 p-3 rounded-lg">
          <p className="text-red-200 text-sm text-center">
            Đang chuyển hướng đến {getSelectedProviderInfo().name} để hoàn tất thanh toán...
          </p>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-gray-900 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center">
              <div className="w-6 h-6 bg-red-800 rounded flex items-center justify-center mr-2">
                <span className="text-red-100 font-bold text-xs">V</span>
              </div>
              Xác nhận thanh toán Viettel Money
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              <div className="space-y-3">
                <p>Bạn có chắc chắn muốn tiến hành thanh toán với thông tin sau không?</p>
                
                <div className="bg-gray-800 p-3 rounded border">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Số tiền:</span>
                      <span className="text-white font-semibold">{formatPrice(amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tài khoản:</span>
                      <span className="text-white font-mono text-xs">{viettelAccountInfo.accountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Chủ TK:</span>
                      <span className="text-white text-xs">{viettelAccountInfo.accountName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Nhà cung cấp:</span>
                      <span className="text-white">{getSelectedProviderInfo().name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phương thức:</span>
                      <span className="text-red-300">Viettel Money</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-600 bg-opacity-20 border border-yellow-600 p-3 rounded">
                  <p className="text-yellow-300 text-sm">
                    💡 Sau khi thanh toán thành công, bạn sẽ nhận được email xác nhận tại: <strong>buiquanghuyhuy667@gmail.com</strong>
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="space-x-2">
            <AlertDialogCancel 
              onClick={handleCancelPayment}
              className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
            >
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmPayment}
              className="bg-red-800 hover:bg-red-700 text-red-100"
            >
              Xác nhận thanh toán
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Copy, Check, QrCode } from 'lucide-react';
import { useCart } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';
import zaloPayQRCode from 'figma:asset/b9d29449e21485a20c0bde057900203c56f2c67a.png';
import zaloPayLogo from 'figma:asset/c9eaa3b260d6477c7b2fe71f970bec6fc927d814.png';

interface ZaloPayButtonProps {
  amount: number;
  orderInfo: string;
  onSuccess: (paymentDetails: any) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

// Danh sách ngân hàng hỗ trợ ZaloPay
const SUPPORTED_BANKS = [
  { code: 'vcb', name: 'Vietcombank', logo: '🏦' },
  { code: 'tcb', name: 'Techcombank', logo: '🏦' },
  { code: 'acb', name: 'ACB', logo: '🏦' },
  { code: 'bidv', name: 'BIDV', logo: '🏦' },
  { code: 'vtb', name: 'VietinBank', logo: '🏦' },
  { code: 'mb', name: 'MB Bank', logo: '🏦' },
  { code: 'vpb', name: 'VPBank', logo: '🏦' },
  { code: 'agb', name: 'Agribank', logo: '🏦' },
  { code: 'scb', name: 'Sacombank', logo: '🏦' },
  { code: 'stb', name: 'Saigonbank', logo: '🏦' },
  { code: 'eib', name: 'Eximbank', logo: '🏦' },
  { code: 'msb', name: 'MSB', logo: '🏦' },
  { code: 'hdbank', name: 'HDBank', logo: '🏦' },
  { code: 'tpb', name: 'TPBank', logo: '🏦' },
  { code: 'seab', name: 'SeABank', logo: '🏦' },
];

// Email notification service (mock implementation)
const sendEmailNotification = async (email: string, orderDetails: any) => {
  try {
    // Trong thực tế, bạn sẽ gọi API backend để gửi email
    const emailData = {
      to: email,
      subject: 'Xác nhận thanh toán ZaloPay - AGUST Jewelry',
      content: `
        Kính chào quý khách,
        
        AGUST Jewelry xin xác nhận đơn hàng của bạn đã được thanh toán thành công qua ZaloPay:
        
        🧾 Thông tin đơn hàng:
        - Mã đơn hàng: ${orderDetails.orderNumber}
        - Mã giao dịch ZaloPay: ${orderDetails.transactionId}
        - Ngân hàng thanh toán: ${orderDetails.bank_name}
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
    
    // Mock API call - trong thực tế sẽ gọi service email như SendGrid, AWS SES, etc.
    console.log('📧 Sending email notification:', emailData);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful response
    return { success: true, messageId: `msg_${Date.now()}` };
  } catch (error) {
    console.error('❌ Email notification failed:', error);
    throw error;
  }
};

export function ZaloPayButton({ amount, orderInfo, onSuccess, onError, onCancel }: ZaloPayButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedBank, setSelectedBank] = useState('vcb');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { cartItems } = useCart();

  const getSelectedBankInfo = () => {
    return SUPPORTED_BANKS.find(bank => bank.code === selectedBank) || SUPPORTED_BANKS[0];
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePaymentClick = () => {
    if (!selectedBank) {
      onError(new Error('Vui lòng chọn ngân hàng thanh toán'));
      return;
    }
    // Hiển thị dialog xác nhận
    setShowConfirmDialog(true);
  };

  const handleConfirmPayment = async () => {
    setShowConfirmDialog(false);
    setIsProcessing(true);
    
    try {
      const selectedBankInfo = getSelectedBankInfo();
      
      // Mock ZaloPay payment process
      // Trong thực tế, bạn sẽ gọi API ZaloPay để tạo giao dịch
      const paymentData = {
        app_id: 2554, // ZaloPay App ID demo
        app_trans_id: `AGUST_${Date.now()}`, // Transaction ID
        app_user: `user_${Date.now()}`,
        amount: amount,
        description: orderInfo,
        bank_code: selectedBank, // Mã ngân hàng được chọn
        item: JSON.stringify(cartItems.map(item => ({
          itemid: item.id,
          itemname: item.name,
          itemprice: item.price,
          itemquantity: item.quantity
        }))),
        embed_data: JSON.stringify({
          merchantinfo: "AGUST Jewelry",
          promotioninfo: "",
          redirecturl: window.location.origin,
          bankinfo: selectedBankInfo.name
        }),
        callback_url: `${window.location.origin}/zalopay/callback`,
        mac: "mock_mac_signature" // Trong thực tế cần tính MAC signature
      };

      // Mô phỏng việc redirect đến ZaloPay
      console.log('ZaloPay Payment Data:', paymentData);
      
      // Simulate payment processing delay (longer for bank selection)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock successful payment response
      const successResponse = {
        app_trans_id: paymentData.app_trans_id,
        zp_trans_id: `ZP_${Date.now()}`,
        transactionId: `ZP_${Date.now()}`,
        amount: paymentData.amount,
        status: 1, // 1 = success
        message: "Thanh toán thành công",
        payment_method: "ZaloPay",
        bank_code: selectedBank,
        bank_name: selectedBankInfo.name,
        created_time: new Date().toISOString(),
        orderNumber: paymentData.app_trans_id
      };

      // Gửi email notification sau khi thanh toán thành công
      try {
        await sendEmailNotification('Agust2004@gmail.com', successResponse);
        console.log('✅ Email notification sent successfully');
      } catch (emailError) {
        console.warn('⚠️ Email notification failed, but payment was successful:', emailError);
        // Không throw error để không làm fail payment flow
      }

      onSuccess(successResponse);
      
    } catch (error) {
      console.error('ZaloPay payment error:', error);
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
          <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center p-1">
            <ImageWithFallback
              src={zaloPayLogo}
              alt="ZaloPay Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h3 className="text-white font-medium">ZaloPay</h3>
        </div>
        
        <div className="text-gray-300 text-sm space-y-2">
          <p>• Thanh toán qua ví điện tử ZaloPay</p>
          <p>• Hỗ trợ thanh toán bằng thẻ ngân hàng, ví ZaloPay</p>
          <p>• Bảo mật cao với công nghệ mã hóa</p>
          <p>• Giao dịch nhanh chóng, tiện lợi</p>
        </div>
      </div>

      {/* Bank Selection */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
        <h4 className="text-white font-medium mb-3">Chọn ngân hàng thanh toán</h4>
        <Select value={selectedBank} onValueChange={setSelectedBank}>
          <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Chọn ngân hàng..." />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            {SUPPORTED_BANKS.map((bank) => (
              <SelectItem 
                key={bank.code} 
                value={bank.code}
                className="text-white hover:bg-gray-700 focus:bg-gray-700"
              >
                <div className="flex items-center space-x-2">
                  <span>{bank.logo}</span>
                  <span>{bank.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedBank && (
          <div className="mt-3 p-3 bg-blue-600 bg-opacity-20 border border-blue-600 rounded">
            <div className="flex items-center space-x-2 text-blue-300 text-sm">
              <span>{getSelectedBankInfo().logo}</span>
              <span>Đã chọn: {getSelectedBankInfo().name}</span>
            </div>
          </div>
        )}

        {/* QR Code Section */}
        {!showQRCode && (
          <div className="mt-4">
            <Button
              onClick={() => setShowQRCode(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Hiển thị mã QR ZaloPay
            </Button>
          </div>
        )}

        {showQRCode && (
          <div className="mt-4 space-y-4">
            {/* ZaloPay QR Card Style */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-lg text-center">
              {/* QR Scan instruction */}
              <div className="flex items-center justify-center text-white mb-4">
                <QrCode className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">QUÉT MÃ ĐỂ THANH TOÁN</span>
              </div>
              
              {/* QR Code */}
              <div className="bg-white p-4 rounded-xl inline-block mb-4">
                <ImageWithFallback
                  src={zaloPayQRCode}
                  alt="QR Code ZaloPay"
                  className="w-48 h-48 mx-auto"
                />
              </div>
              
              {/* Payment method */}
              <div className="text-white text-lg font-bold mb-2">
                AGUST Jewelry
              </div>
              
              {/* Additional info */}
              <div className="text-blue-100 text-sm mb-2">
                Thanh toán qua ví điện tử ZaloPay
              </div>
              <div className="text-blue-100 text-sm mb-4">
                Hỗ trợ thanh toán ngân hàng & thẻ tín dụng
              </div>
              <div className="text-white font-semibold text-lg">
                {formatPrice(amount)}
              </div>
            </div>

            {/* Payment and order info */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Số tiền cần thanh toán:</span>
                <span className="text-white font-semibold">{formatPrice(amount)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Ngân hàng đã chọn:</span>
                <span className="text-white text-sm">{getSelectedBankInfo().name}</span>
              </div>
              <div className="text-center mt-3">
                <p className="text-gray-400 text-xs">
                  Quét mã QR bằng ứng dụng ZaloPay hoặc camera điện thoại để thanh toán tự động
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
        disabled={isProcessing || !selectedBank}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors disabled:opacity-50"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Đang xử lý với {getSelectedBankInfo().name}...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <span>Thanh toán với ZaloPay</span>
            <span className="text-blue-200">qua {getSelectedBankInfo().name}</span>
          </div>
        )}
      </Button>

      {isProcessing && (
        <div className="bg-blue-900/30 border border-blue-600 p-3 rounded-lg">
          <p className="text-blue-300 text-sm text-center">
            Đang chuyển hướng đến {getSelectedBankInfo().name} để hoàn tất thanh toán...
          </p>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-gray-900 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center">
              <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center mr-2 p-0.5">
                <ImageWithFallback
                  src={zaloPayLogo}
                  alt="ZaloPay Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              Xác nhận thanh toán ZaloPay
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
                      <span className="text-gray-400">Ngân hàng:</span>
                      <span className="text-white">{getSelectedBankInfo().name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phương thức:</span>
                      <span className="text-blue-400">ZaloPay</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-600 bg-opacity-20 border border-yellow-600 p-3 rounded">
                  <p className="text-yellow-300 text-sm">
                    💡 Sau khi thanh toán thành công, bạn sẽ nhận được email xác nhận từ: <strong>Agust2004@gmail.com</strong>
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
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Xác nhận thanh toán
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
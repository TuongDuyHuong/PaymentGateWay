import React, { useState } from 'react';
import { Button } from './ui/button';
import { Smartphone, QrCode } from 'lucide-react';
import { MomoCheckout } from './MomoCheckout';
import momoLogo from 'figma:asset/336e5016f2972fd79467240c1551b8fa764426ee.png';

interface MomoButtonProps {
  amount: number;
  orderInfo: string;
  orderNumber: string;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

export function MomoButton({ 
  amount, 
  orderInfo, 
  orderNumber, 
  onSuccess, 
  onError, 
  onCancel 
}: MomoButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleMomoPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Giả lập API call tạo transaction Momo
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowCheckout(true);
      setIsProcessing(false);
    } catch (error) {
      setIsProcessing(false);
      onError({ message: 'Có lỗi xảy ra khi tạo giao dịch Momo' });
    }
  };

  const handleCheckoutCancel = () => {
    setShowCheckout(false);
    onCancel();
  };

  if (showCheckout) {
    return (
      <MomoCheckout
        amount={amount}
        orderNumber={orderNumber}
        orderInfo={orderInfo}
        onSuccess={onSuccess}
        onError={onError}
        onCancel={handleCheckoutCancel}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleMomoPayment}
        disabled={isProcessing}
        className="w-full bg-pink-600 hover:bg-pink-500 text-white py-3 text-lg"
        size="lg"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Đang tạo giao dịch...
          </>
        ) : (
          <>
            <img src={momoLogo} alt="Momo" className="w-6 h-6 mr-2" />
            Thanh toán {formatPrice(amount)} qua Momo
          </>
        )}
      </Button>

      <div className="text-center">
        <div className="text-sm text-gray-400">
          Bạn sẽ được chuyển hướng đến ứng dụng Momo để thanh toán
        </div>
      </div>
    </div>
  );
}
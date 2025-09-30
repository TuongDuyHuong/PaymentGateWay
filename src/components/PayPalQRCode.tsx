import React, { useState } from 'react';
import { QrCode, Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface PayPalQRCodeProps {
  amount: number; // VND
  usdAmount: number;
  paypalMeLink: string;
  onPaymentComplete?: (details: any) => void;
}

export function PayPalQRCode({ 
  amount, 
  usdAmount, 
  paypalMeLink, 
  onPaymentComplete 
}: PayPalQRCodeProps) {
  const [copySuccess, setCopySuccess] = useState('');
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const formatVND = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  // Single optimized QR code
  const qrCode = {
    id: 'paypal-me',
    name: 'PayPal.me QR',
    url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${paypalMeLink}/${usdAmount}USD`)}`,
    link: `${paypalMeLink}/${usdAmount}USD`,
    description: 'Quét để thanh toán qua PayPal.me'
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(label);
    setTimeout(() => setCopySuccess(''), 2000);
  };

  const handlePaymentConfirmation = () => {
    setPaymentConfirmed(true);
    
    if (onPaymentComplete) {
      onPaymentComplete({
        orderID: 'QR_PAYMENT_' + Date.now(),
        payerID: 'qr_scanner',
        captureResult: { status: 'COMPLETED' },
        vndAmount: amount,
        usdAmount,
        paymentMethod: 'PayPal QR Code',
        qrType: qrCode.id,
        timestamp: new Date().toISOString()
      });
    }
  };

  const openPayPalLink = () => {
    window.open(qrCode.link, '_blank');
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <QrCode className="w-5 h-5 mr-2 text-blue-400" />
          PayPal QR Code Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Payment Info */}
        <Alert className="bg-blue-600 bg-opacity-20 border-blue-600">
          <QrCode className="h-4 w-4" />
          <AlertDescription className="text-blue-300">
            <div className="space-y-1">
              <div>Số tiền: {formatVND(amount)}</div>
              <div>Tương đương: ${usdAmount} USD</div>
              <div className="text-xs text-blue-400">PayPal: paypal.me/NguyenMy2004</div>
            </div>
          </AlertDescription>
        </Alert>

        {/* QR Code Display */}
        <div className="text-center">
          <h3 className="text-white font-medium mb-4">PayPal QR Code</h3>
          <div className="bg-white p-4 rounded-lg inline-block">
            <ImageWithFallback
              src={qrCode.url}
              alt="PayPal QR Code"
              className="w-56 h-56 mx-auto"
            />
          </div>
          <p className="text-gray-300 text-sm mt-2">{qrCode.description}</p>
          <p className="text-blue-400 text-xs mt-1">
            Thanh toán ${usdAmount} USD
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={openPayPalLink}
            className="bg-blue-600 hover:bg-blue-500 text-white"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Mở Link
          </Button>
          
          <Button
            onClick={() => copyToClipboard(qrCode.link, qrCode.name)}
            variant="outline"
            className="text-gray-400 border-gray-600"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
        </div>

        {/* Payment Link Info */}
        <div className="p-3 bg-gray-800 bg-opacity-50 rounded border border-gray-600">
          <div className="text-gray-400 text-xs mb-1">Link thanh toán:</div>
          <div className="text-white text-sm font-mono break-all">
            {qrCode.link}
          </div>
        </div>

        {/* Payment Confirmation */}
        {!paymentConfirmed && (
          <Alert className="bg-yellow-600 bg-opacity-20 border-yellow-600">
            <QrCode className="h-4 w-4" />
            <AlertDescription className="text-yellow-300">
              <div className="space-y-3">
                <div>Sau khi quét QR và thanh toán thành công, vui lòng xác nhận bên dưới:</div>
                <Button
                  onClick={handlePaymentConfirmation}
                  className="w-full bg-green-600 hover:bg-green-500 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Đã thanh toán thành công
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {paymentConfirmed && (
          <Alert className="bg-green-600 bg-opacity-20 border-green-600">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-300">
              <div>✅ Cảm ơn bạn đã xác nhận thanh toán!</div>
              <div className="text-sm mt-1">Đơn hàng sẽ được xử lý trong ít phút.</div>
            </AlertDescription>
          </Alert>
        )}

        {copySuccess && (
          <Alert className="bg-green-600 bg-opacity-20 border-green-600">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-300">
              {copySuccess} đã được copy!
            </AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <div className="p-3 bg-gray-800 bg-opacity-30 rounded border border-gray-600">
          <div className="text-gray-400 text-sm">
            <div className="font-medium mb-2">Hướng dẫn thanh toán:</div>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Mở ứng dụng camera hoặc PayPal trên điện thoại</li>
              <li>Quét mã QR code ở trên</li>
              <li>Xác nhận thanh toán ${usdAmount} USD</li>
              <li>Bấm "Đã thanh toán thành công" sau khi hoàn tất</li>
            </ol>
          </div>
        </div>

        {/* Security Info */}
        <div className="text-center text-xs text-gray-400">
          <div>🔒 Bảo mật bởi PayPal SSL 256-bit</div>
          <div>Tài khoản nhận: <span className="text-blue-400">paypal.me/NguyenMy2004</span></div>
        </div>
      </CardContent>
    </Card>
  );
}
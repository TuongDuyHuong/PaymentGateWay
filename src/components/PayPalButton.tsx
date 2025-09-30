import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle, Clock, ExternalLink, TestTube, QrCode } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface PayPalButtonProps {
  amount: number; // số tiền VND
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  onCancel?: () => void;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

export function PayPalButton({
  amount,
  onSuccess,
  onError,
  onCancel,
}: PayPalButtonProps) {
  const paypalRef = useRef<HTMLDivElement | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showQR, setShowQR] = useState(false);

  // Tỉ giá VND → USD
  const EXCHANGE_RATE = 24000;
  const usdAmount = Number((amount / EXCHANGE_RATE).toFixed(2));

  // PayPal Sandbox Configuration 
  const PAYPAL_CONFIG = {
    // SANDBOX Client ID để test
    clientId: 'AR_1gNPFKzIC5UIe5uSajc2RnolimIBc4KZq_XN0xfmd9U4OEroBKu6DonZm1WSgs3K0fA8rYMkqD-vw',
    environment: 'sandbox', // Sử dụng Sandbox để test
    businessEmail: 'sb-n6bw346227518@business.example.com', // Sandbox business email
    paypalMeLink: 'https://paypal.me/NguyenMy2004',
    sandboxUrl: 'https://sandbox.paypal.com'
  };

  // Format tiền VND
  const formatVND = (v: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  // Generate PayPal QR Code URL
  const generatePayPalQR = () => {
    // PayPal QR code API format
    const qrData = `https://www.paypal.com/qrcodes/managed/08c9b8b7-0b8d-4c2b-8c7d-7b8b8b8b8b8b?amount=${usdAmount}&currency=USD&locale=en_US`;
    // Alternative: Use QR code generator service
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${PAYPAL_CONFIG.paypalMeLink}/${usdAmount}USD`)}`;
  };

  const loadPayPalSDK = async () => {
    try {
      const scriptId = 'paypal-sdk';
      
      // Remove existing script if retry
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }

      // Wait a bit before retry
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CONFIG.clientId}&currency=USD&intent=capture&components=buttons&disable-funding=credit,card`;
      script.async = true;

      return new Promise<void>((resolve, reject) => {
        script.onload = () => {
          // Add a small delay to ensure PayPal is fully loaded
          setTimeout(() => {
            if (window.paypal && typeof window.paypal.Buttons === 'function') {
              setSdkReady(true);
              setLoading(false);
              setLoadError(null);
              resolve();
            } else {
              reject(new Error('PayPal SDK không khả dụng'));
            }
          }, 500);
        };
        
        script.onerror = () => {
          reject(new Error('Không thể tải PayPal SDK'));
        };

        document.body.appendChild(script);
      });
    } catch (error) {
      throw error;
    }
  };

  // Load PayPal SDK script with retry mechanism
  useEffect(() => {
    const initPayPal = async () => {
      // Check if PayPal is already loaded
      if (window.paypal && typeof window.paypal.Buttons === 'function') {
        setSdkReady(true);
        setLoading(false);
        return;
      }

      try {
        await loadPayPalSDK();
      } catch (error: any) {
        console.error('PayPal SDK load error:', error);
        
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
          return; // This will trigger useEffect again with new retryCount
        }
        
        setLoadError(error.message || 'Không thể tải PayPal SDK');
        setLoading(false);
      }
    };

    initPayPal();
  }, [retryCount]);

  // Render PayPal Buttons
  useEffect(() => {
    if (!sdkReady || !paypalRef.current || !window.paypal || typeof window.paypal.Buttons !== 'function') {
      return;
    }

    // Clear container
    paypalRef.current.innerHTML = '';

    try {
      window.paypal
        .Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            height: 45,
          },

          createOrder: (_data: any, actions: any) => {
            return actions.order.create({
              intent: 'CAPTURE',
              purchase_units: [
                {
                  amount: {
                    currency_code: 'USD',
                    value: usdAmount.toString(),
                  },
                  description: 'Thanh toán đơn hàng AGUST - Trang sức bạc S925 (TEST)',
                  payee: {
                    email_address: PAYPAL_CONFIG.businessEmail
                  }
                },
              ],
              application_context: {
                brand_name: 'AGUST - Trang sức bạc cao cấp (SANDBOX)',
                landing_page: 'BILLING',
                user_action: 'PAY_NOW'
              }
            });
          },

          onApprove: async (data: any, actions: any) => {
            try {
              const details = await actions.order.capture();
              onSuccess({
                orderID: data.orderID,
                payerID: data.payerID,
                captureResult: details,
                vndAmount: amount,
                usdAmount,
                exchangeRate: EXCHANGE_RATE,
                paymentMethod: 'PayPal Sandbox',
                environment: 'sandbox',
                businessEmail: PAYPAL_CONFIG.businessEmail
              });
            } catch (err) {
              console.error('PayPal capture error:', err);
              onError(err);
            }
          },

          onError: (err: any) => {
            console.error('PayPal error:', err);
            onError(err);
          },

          onCancel: () => {
            if (onCancel) onCancel();
          },
        })
        .render(paypalRef.current)
        .catch((err: any) => {
          console.error('PayPal render error:', err);
          setLoadError('Lỗi hiển thị PayPal button');
        });
    } catch (err) {
      console.error('PayPal initialization error:', err);
      setLoadError('Lỗi khởi tạo PayPal');
    }
  }, [sdkReady, usdAmount, amount, onSuccess, onError, onCancel]);

  // Handle PayPal.me fallback
  const handlePayPalMeFallback = () => {
    const paypalUrl = `${PAYPAL_CONFIG.paypalMeLink}/${usdAmount}USD`;
    window.open(paypalUrl, '_blank');
    
    // Simulate successful payment for demo purposes
    setTimeout(() => {
      onSuccess({
        orderID: 'PAYPAL_ME_' + Date.now(),
        payerID: 'manual_payment',
        captureResult: { status: 'COMPLETED' },
        vndAmount: amount,
        usdAmount,
        exchangeRate: EXCHANGE_RATE,
        paymentMethod: 'PayPal.me',
        paypalMe: PAYPAL_CONFIG.paypalMeLink,
        businessEmail: PAYPAL_CONFIG.businessEmail
      });
    }, 3000);
  };

  // UI trạng thái
  if (loading) {
    return (
      <div className="space-y-4">
        <Alert className="bg-blue-600 bg-opacity-20 border-blue-600">
          <Clock className="h-4 w-4" />
          <AlertDescription className="text-blue-300">
            <div className="flex items-center justify-between">
              <span>Đang tải PayPal SDK (Sandbox)...</span>
              {retryCount > 0 && (
                <span className="text-xs text-blue-400">Lần thử {retryCount + 1}/4</span>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-4">
        <Alert className="bg-yellow-600 bg-opacity-20 border-yellow-600">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-yellow-300">
            <div className="space-y-2">
              <div>{loadError}</div>
              <div className="text-sm">Bạn có thể sử dụng PayPal.me thay thế</div>
            </div>
          </AlertDescription>
        </Alert>
        
        {/* PayPal.me fallback only */}
        <div className="p-4 bg-blue-600 bg-opacity-20 border border-blue-600 rounded">
          <div className="space-y-3">
            <div className="text-blue-300">
              <div>Thanh toán qua PayPal.me</div>
              <div className="text-sm mt-1">Số tiền: {formatVND(amount)} (${usdAmount} USD)</div>
            </div>
            
            <Button
              onClick={handlePayPalMeFallback}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Mở PayPal.me
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-600 bg-opacity-20 border-blue-600">
        <TestTube className="h-4 w-4" />
        <AlertDescription className="text-blue-300">
          <div className="space-y-1">
            <div>Số tiền: {formatVND(amount)}</div>
            <div>Tương đương: ${usdAmount} USD</div>
            <div className="text-xs text-blue-400">Tỷ giá: 1 USD ≈ {EXCHANGE_RATE.toLocaleString()} VND</div>
            <div className="text-xs text-orange-400">🧪 Môi trường: {PAYPAL_CONFIG.environment.toUpperCase()} (TEST)</div>
            <div className="text-xs text-blue-400">Tài khoản nhận: {PAYPAL_CONFIG.businessEmail}</div>
          </div>
        </AlertDescription>
      </Alert>

      <div ref={paypalRef} className="paypal-button-container min-h-[50px]"></div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowQR(!showQR)}
          className="flex-1 text-blue-400 border-blue-400 hover:bg-blue-600 hover:bg-opacity-20"
        >
          <QrCode className="w-4 h-4 mr-2" />
          {showQR ? 'Ẩn QR' : 'QR Code'}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handlePayPalMeFallback}
          className="flex-1 text-blue-400 border-blue-400 hover:bg-blue-600 hover:bg-opacity-20"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          PayPal.me
        </Button>
      </div>
      
      {showQR && (
        <div className="p-4 bg-gray-800 bg-opacity-50 rounded border border-gray-600">
          <div className="text-center">
            <h3 className="text-white font-medium mb-3">PayPal QR Code</h3>
            <div className="bg-white p-4 rounded-lg inline-block">
              <ImageWithFallback
                src={generatePayPalQR()}
                alt="PayPal QR Code"
                className="w-40 h-40 mx-auto"
              />
            </div>
            <div className="mt-3 text-sm text-gray-300">
              <div>Quét để thanh toán ${usdAmount} USD</div>
              <div className="text-xs text-blue-400 mt-1">
                paypal.me/NguyenMy2004/{usdAmount}USD
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-1 text-center text-xs text-gray-400">
        <div>🧪 Bảo mật bởi PayPal SSL 256-bit (SANDBOX)</div>
        <div>Tài khoản test: <span className="text-blue-400">{PAYPAL_CONFIG.businessEmail}</span></div>
        <div>Môi trường: <span className="text-orange-400">{PAYPAL_CONFIG.environment.toUpperCase()}</span></div>
        <div className="text-xs text-yellow-400 mt-2">⚠️ Đây là môi trường test - không thể thực hiện thanh toán thực</div>
      </div>
    </div>
  );
}
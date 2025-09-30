import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { TestTube, Copy, Eye, EyeOff, ExternalLink, CheckCircle } from 'lucide-react';

export function PayPalTestInfo() {
  const [showCredentials, setShowCredentials] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');

  const SANDBOX_INFO = {
    clientId: 'AR_1gNPFKzIC5UIe5uSajc2RnolimIBc4KZq_XN0xfmd9U4OEroBKu6DonZm1WSgs3K0fA8rYMkqD-vw',
    secretKey: 'EEsTC7DT4sOf76Kp8xEtsmh8ojHr8iAY7nYxQdcnU4_Vmn24zgX8x6htzrExS6W0sBaDTKw6RgSDVFz5',
    businessEmail: 'sb-n6bw346227518@business.example.com',
    sandboxUrl: 'https://sandbox.paypal.com',
    environment: 'sandbox'
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(label);
    setTimeout(() => setCopySuccess(''), 2000);
  };

  return (
    <Card className="bg-gray-900 border-gray-700 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <TestTube className="w-5 h-5 mr-2 text-orange-400" />
          PayPal Sandbox Test Environment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Status */}
        <Alert className="bg-orange-600 bg-opacity-20 border-orange-600">
          <TestTube className="h-4 w-4" />
          <AlertDescription className="text-orange-300">
            <div className="space-y-1">
              <div><strong>✅ PayPal Sandbox đã được cấu hình</strong></div>
              <div className="text-sm">Bạn có thể test thanh toán mà không tốn tiền thật</div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Environment Info */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-800 rounded border border-gray-600">
          <div>
            <div className="text-sm text-gray-400">Environment</div>
            <div className="text-white">{SANDBOX_INFO.environment.toUpperCase()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Business Email</div>
            <div className="text-blue-400 text-sm">{SANDBOX_INFO.businessEmail}</div>
          </div>
        </div>

        {/* Credentials Toggle */}
        <div className="space-y-3">
          <Button
            onClick={() => setShowCredentials(!showCredentials)}
            variant="outline"
            className="w-full text-gray-400 border-gray-600"
          >
            {showCredentials ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showCredentials ? 'Ẩn thông tin' : 'Hiện thông tin Sandbox'}
          </Button>

          {showCredentials && (
            <div className="space-y-3 p-4 bg-gray-800 rounded border border-gray-600">
              
              {/* Client ID */}
              <div className="space-y-2">
                <div className="text-sm text-gray-400">Client ID (Sandbox)</div>
                <div className="flex gap-2">
                  <div className="flex-1 p-2 bg-black rounded text-xs text-green-400 font-mono break-all">
                    {SANDBOX_INFO.clientId}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(SANDBOX_INFO.clientId, 'Client ID')}
                    className="text-gray-400"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Secret Key */}
              <div className="space-y-2">
                <div className="text-sm text-gray-400">Secret Key (Backend only)</div>
                <div className="flex gap-2">
                  <div className="flex-1 p-2 bg-black rounded text-xs text-red-400 font-mono break-all">
                    {SANDBOX_INFO.secretKey}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(SANDBOX_INFO.secretKey, 'Secret Key')}
                    className="text-gray-400"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-xs text-red-400">⚠️ Chỉ sử dụng cho server-side, không expose trong frontend</div>
              </div>

              {/* Sandbox URL */}
              <div className="space-y-2">
                <div className="text-sm text-gray-400">Sandbox URL</div>
                <div className="flex gap-2">
                  <div className="flex-1 p-2 bg-black rounded text-xs text-blue-400">
                    {SANDBOX_INFO.sandboxUrl}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(SANDBOX_INFO.sandboxUrl, '_blank')}
                    className="text-gray-400"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Test Instructions */}
        <Alert className="bg-blue-600 bg-opacity-20 border-blue-600">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-blue-300">
            <div className="space-y-2">
              <div><strong>Cách test thanh toán:</strong></div>
              <ol className="list-decimal list-inside text-sm space-y-1">
                <li>Thêm sản phẩm vào giỏ hàng và chọn PayPal</li>
                <li>Bấm nút PayPal (sẽ mở popup PayPal Sandbox)</li>
                <li>Đăng nhập bằng tài khoản PayPal test (tạo tại sandbox.paypal.com)</li>
                <li>Hoàn tất thanh toán (không tốn tiền thật)</li>
                <li>Xem kết quả thanh toán trên website</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>

        {/* Copy Success */}
        {copySuccess && (
          <Alert className="bg-green-600 bg-opacity-20 border-green-600">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-300">
              {copySuccess} đã được copy!
            </AlertDescription>
          </Alert>
        )}

        {/* Links */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://sandbox.paypal.com', '_blank')}
            className="text-blue-400 border-blue-400"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            PayPal Sandbox
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://developer.paypal.com', '_blank')}
            className="text-blue-400 border-blue-400"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            PayPal Developer
          </Button>
        </div>

        {/* Warning */}
        <div className="p-3 bg-yellow-600 bg-opacity-20 border border-yellow-600 rounded">
          <div className="text-yellow-300 text-sm">
            <strong>⚠️ Lưu ý quan trọng:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Đây là môi trường TEST - không có tiền thật bị trừ</li>
              <li>Để chuyển sang PRODUCTION, cần thay Client ID thành Live Client ID</li>
              <li>Cần tạo PayPal Business Account thật để nhận tiền</li>
              <li>Secret Key chỉ dùng backend, không để trong frontend</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
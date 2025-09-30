import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';

interface PayPalConfigProps {
  onConfigSave?: (config: PayPalConfigData) => void;
}

export interface PayPalConfigData {
  clientId: string;
  environment: 'sandbox' | 'live';
  businessEmail: string;
  webhookUrl?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export function PayPalConfig({ onConfigSave }: PayPalConfigProps) {
  const [config, setConfig] = useState<PayPalConfigData>({
    clientId: '',
    environment: 'sandbox',
    businessEmail: 'nguyenmy2004@gmail.com',
    webhookUrl: '',
    returnUrl: window.location.origin + '/payment-success',
    cancelUrl: window.location.origin + '/payment-cancel'
  });

  const [showSecret, setShowSecret] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');

  const handleInputChange = (field: keyof PayPalConfigData, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (onConfigSave) {
      onConfigSave(config);
    }
    alert('Cấu hình PayPal đã được lưu!');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(label);
    setTimeout(() => setCopySuccess(''), 2000);
  };

  const openPayPalDeveloper = () => {
    window.open('https://developer.paypal.com/developer/applications/', '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
            Cấu hình PayPal cho AGUST
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* PayPal Developer Link */}
          <Alert className="bg-blue-600 bg-opacity-20 border-blue-600">
            <ExternalLink className="h-4 w-4" />
            <AlertDescription className="text-blue-300">
              <div className="space-y-2">
                <div>Bước 1: Tạo PayPal App để lấy Client ID</div>
                <Button
                  onClick={openPayPalDeveloper}
                  variant="outline"
                  size="sm"
                  className="text-blue-400 border-blue-400 hover:bg-blue-600 hover:bg-opacity-20"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Mở PayPal Developer Portal
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          {/* Environment Selection */}
          <div className="space-y-2">
            <Label className="text-white">Environment</Label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 text-gray-300">
                <input
                  type="radio"
                  name="environment"
                  value="sandbox"
                  checked={config.environment === 'sandbox'}
                  onChange={(e) => handleInputChange('environment', e.target.value as 'sandbox' | 'live')}
                  className="text-blue-600"
                />
                <span>Sandbox (Test)</span>
              </label>
              <label className="flex items-center space-x-2 text-gray-300">
                <input
                  type="radio"
                  name="environment"
                  value="live"
                  checked={config.environment === 'live'}
                  onChange={(e) => handleInputChange('environment', e.target.value as 'sandbox' | 'live')}
                  className="text-blue-600"
                />
                <span>Live (Production)</span>
              </label>
            </div>
          </div>

          {/* Client ID */}
          <div className="space-y-2">
            <Label className="text-white">PayPal Client ID *</Label>
            <div className="flex gap-2">
              <Input
                type={showSecret ? 'text' : 'password'}
                placeholder={config.environment === 'sandbox' 
                  ? 'Nhập Sandbox Client ID' 
                  : 'Nhập Live Client ID'
                }
                value={config.clientId}
                onChange={(e) => handleInputChange('clientId', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSecret(!showSecret)}
                className="text-gray-400"
              >
                {showSecret ? 'Ẩn' : 'Hiện'}
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              Lấy từ PayPal Developer Portal > My Apps & Credentials
            </p>
          </div>

          {/* Business Email */}
          <div className="space-y-2">
            <Label className="text-white">Email tài khoản PayPal Business</Label>
            <Input
              type="email"
              placeholder="your-business@email.com"
              value={config.businessEmail}
              onChange={(e) => handleInputChange('businessEmail', e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
            />
            <p className="text-xs text-gray-400">
              Email của tài khoản PayPal nhận thanh toán
            </p>
          </div>

          {/* URLs Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Return URL</Label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  value={config.returnUrl}
                  onChange={(e) => handleInputChange('returnUrl', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(config.returnUrl || '', 'Return URL')}
                  className="text-gray-400"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Cancel URL</Label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  value={config.cancelUrl}
                  onChange={(e) => handleInputChange('cancelUrl', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(config.cancelUrl || '', 'Cancel URL')}
                  className="text-gray-400"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Webhook URL */}
          <div className="space-y-2">
            <Label className="text-white">Webhook URL (Tùy chọn)</Label>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://yourdomain.com/api/paypal-webhook"
                value={config.webhookUrl}
                onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(config.webhookUrl || '', 'Webhook URL')}
                className="text-gray-400"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              Để nhận thông báo khi thanh toán hoàn tất
            </p>
          </div>

          {/* Current Configuration Display */}
          <Alert className="bg-gray-800 bg-opacity-50 border-gray-600">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-gray-300">
              <div className="space-y-1">
                <div><strong>Cấu hình hiện tại:</strong></div>
                <div>Environment: <span className="text-blue-400">{config.environment}</span></div>
                <div>PayPal.me: <span className="text-blue-400">paypal.me/NguyenMy2004</span></div>
                <div>Client ID: <span className="text-yellow-400">
                  {config.clientId ? `${config.clientId.slice(0, 8)}...` : 'Chưa nhập'}
                </span></div>
              </div>
            </AlertDescription>
          </Alert>

          {copySuccess && (
            <Alert className="bg-green-600 bg-opacity-20 border-green-600">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-300">
                {copySuccess} đã được copy!
              </AlertDescription>
            </Alert>
          )}

          {/* Save Button */}
          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-500 text-white"
              disabled={!config.clientId}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Lưu cấu hình PayPal
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.open('/PayPalSetup.md', '_blank')}
              className="text-gray-400 border-gray-600"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Xem hướng dẫn chi tiết
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Setup Guide */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Hướng dẫn nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start gap-2">
              <span className="text-blue-400 font-mono">1.</span>
              <span>Truy cập PayPal Developer Portal và tạo app mới</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 font-mono">2.</span>
              <span>Copy Client ID từ app vừa tạo và paste vào ô trên</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 font-mono">3.</span>
              <span>Chọn Sandbox để test hoặc Live để production</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 font-mono">4.</span>
              <span>Cấu hình Return/Cancel URLs trong PayPal app settings</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 font-mono">5.</span>
              <span>Lưu cấu hình và test thanh toán</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
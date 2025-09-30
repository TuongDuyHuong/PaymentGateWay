import React, { useState } from 'react';
import { PayPalConfig, PayPalConfigData } from './PayPalConfig';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Settings, CreditCard, BarChart3, Shield } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface AdminPanelProps {
  onClose?: () => void;
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const [paypalConfig, setPaypalConfig] = useState<PayPalConfigData | null>(null);
  const [activeTab, setActiveTab] = useState('paypal');

  const handlePayPalConfigSave = (config: PayPalConfigData) => {
    setPaypalConfig(config);
    localStorage.setItem('agust_paypal_config', JSON.stringify(config));
  };

  const testPayPalConnection = async () => {
    if (!paypalConfig?.clientId) {
      alert('Vui lòng cấu hình PayPal Client ID trước');
      return;
    }

    try {
      // Test PayPal SDK loading
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${paypalConfig.clientId}&currency=USD`;
      
      script.onload = () => {
        alert('✅ Kết nối PayPal thành công!');
        document.body.removeChild(script);
      };
      
      script.onerror = () => {
        alert('❌ Lỗi: Không thể kết nối PayPal. Kiểm tra Client ID.');
        document.body.removeChild(script);
      };
      
      document.body.appendChild(script);
    } catch (error) {
      alert('❌ Lỗi kết nối PayPal: ' + error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">AGUST Admin Panel</h1>
            <p className="text-gray-400 mt-2">Quản lý cấu hình hệ thống thanh toán</p>
          </div>
          {onClose && (
            <Button
              onClick={onClose}
              variant="outline"
              className="text-gray-400 border-gray-600"
            >
              Đóng Admin Panel
            </Button>
          )}
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">PayPal Status</p>
                  <p className="text-white font-medium">
                    {paypalConfig?.clientId ? 'Đã cấu hình' : 'Chưa cấu hình'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">Environment</p>
                  <p className="text-white font-medium">
                    {paypalConfig?.environment || 'Sandbox'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-400">PayPal.me</p>
                  <p className="text-white font-medium">NguyenMy2004</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Settings className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Cấu hình</p>
                  <p className="text-white font-medium">
                    {paypalConfig ? 'Hoàn tất' : 'Cần setup'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-900 border-gray-700">
            <TabsTrigger value="paypal" className="data-[state=active]:bg-blue-600">
              <CreditCard className="w-4 h-4 mr-2" />
              Cấu hình PayPal
            </TabsTrigger>
            <TabsTrigger value="test" className="data-[state=active]:bg-green-600">
              <Shield className="w-4 h-4 mr-2" />
              Test & Verify
            </TabsTrigger>
            <TabsTrigger value="docs" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Hướng dẫn
            </TabsTrigger>
          </TabsList>

          <TabsContent value="paypal" className="space-y-6">
            <PayPalConfig onConfigSave={handlePayPalConfigSave} />
          </TabsContent>

          <TabsContent value="test" className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Test PayPal Connection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-blue-600 bg-opacity-20 border-blue-600">
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="text-blue-300">
                    Kiểm tra kết nối PayPal và cấu hình của bạn
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <Button
                    onClick={testPayPalConnection}
                    className="bg-green-600 hover:bg-green-500 text-white"
                    disabled={!paypalConfig?.clientId}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Test PayPal Connection
                  </Button>

                  {paypalConfig && (
                    <div className="p-4 bg-gray-800 rounded border border-gray-600">
                      <h4 className="text-white font-medium mb-2">Cấu hình hiện tại:</h4>
                      <div className="space-y-1 text-sm text-gray-300">
                        <div>Client ID: {paypalConfig.clientId.slice(0, 12)}...</div>
                        <div>Environment: {paypalConfig.environment}</div>
                        <div>Business Email: {paypalConfig.businessEmail}</div>
                        <div>Return URL: {paypalConfig.returnUrl}</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="docs" className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Hướng dẫn setup PayPal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-invert max-w-none">
                  <h3 className="text-white">Bước cần thiết để PayPal hoạt động:</h3>
                  
                  <ol className="text-gray-300 space-y-2">
                    <li><strong className="text-white">PayPal Business Account:</strong> Đã có (paypal.me/NguyenMy2004)</li>
                    <li><strong className="text-white">PayPal Developer App:</strong> Tạo tại developer.paypal.com</li>
                    <li><strong className="text-white">Client ID:</strong> Lấy từ app vừa tạo</li>
                    <li><strong className="text-white">Domain Verification:</strong> Verify domain trong PayPal</li>
                    <li><strong className="text-white">SSL Certificate:</strong> Website cần HTTPS</li>
                  </ol>

                  <h3 className="text-white mt-6">Links quan trọng:</h3>
                  <ul className="text-gray-300 space-y-1">
                    <li><a href="https://developer.paypal.com" target="_blank" className="text-blue-400 hover:underline">PayPal Developer Portal</a></li>
                    <li><a href="https://paypal.me/NguyenMy2004" target="_blank" className="text-blue-400 hover:underline">PayPal.me Profile</a></li>
                    <li><a href="/PayPalSetup.md" target="_blank" className="text-blue-400 hover:underline">Chi tiết hướng dẫn</a></li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
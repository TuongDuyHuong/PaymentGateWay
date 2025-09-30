// EmailDemo.tsx - Component để test và demo email service
import React, { useState } from 'react';
import { Mail, Send, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { EmailService } from './EmailService';

export function EmailDemo() {
  const [testEmail, setTestEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestEmail = async () => {
    if (!testEmail || !customerName) {
      setTestResult({ success: false, message: 'Vui lòng nhập email và tên khách hàng' });
      return;
    }

    setIsSending(true);
    setTestResult(null);

    try {
      const success = await EmailService.sendPendingConfirmationEmail(
        testEmail,
        customerName,
        'TEST123456',
        1500000,
        {
          bank: 'Ngân hàng Techcombank',
          accountNumber: '7869 0052 61',
          accountName: 'NGUYEN THI TRA MY',
          transferContent: 'TEST123456'
        }
      );

      setTestResult({
        success,
        message: success 
          ? `Email test đã được gửi thành công đến ${testEmail}` 
          : 'Có lỗi xảy ra khi gửi email. Kiểm tra console để biết chi tiết.'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `Lỗi: ${error instanceof Error ? error.message : 'Không xác định'}`
      });
    } finally {
      setIsSending(false);
    }
  };

  const setupInstructions = `
HƯỚNG DẪN SETUP EMAILJS CHO AGUST JEWELRY:

1. Truy cập https://www.emailjs.com/ và đăng ký tài khoản

2. Tạo Email Service:
   - Chọn "Add New Service"
   - Chọn Gmail (hoặc email provider bạn muốn)
   - Nhập thông tin email AGUST: nguyenmy2004@gmail.com
   - Service ID sẽ được tạo tự động (ví dụ: service_agust2024)

3. Tạo Email Template:
   - Chọn "Create New Template" 
   - Template Name: "AGUST Order Notification"
   - Subject: {{subject}}
   - Content: {{message_content}}
   - Lưu template và copy Template ID

4. Lấy Public Key:
   - Vào Account > API Keys
   - Copy Public Key

5. Cập nhật EmailService.tsx:
   - SERVICE_ID = 'your_service_id'
   - TEMPLATE_ID = 'your_template_id' 
   - PUBLIC_KEY = 'your_public_key'

6. Test email bên dưới để đảm bảo hoạt động đúng.

Lưu ý: EmailJS có giới hạn 200 email/tháng cho tài khoản miễn phí.
  `;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl text-white mb-2">📧 Email Service Demo</h1>
          <p className="text-gray-400">Test và cấu hình hệ thống email của AGUST Jewelry</p>
        </div>

        {/* Setup Instructions */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Hướng dẫn cấu hình EmailJS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={setupInstructions}
              readOnly
              className="bg-gray-800 border-gray-600 text-gray-300 h-80 font-mono text-sm"
            />
          </CardContent>
        </Card>

        {/* Test Email Form */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Test gửi email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-white text-sm mb-2 block">Email nhận test:</label>
              <Input
                type="email"
                placeholder="your-email@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="text-white text-sm mb-2 block">Tên khách hàng test:</label>
              <Input
                type="text"
                placeholder="Nguyễn Văn A"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <Button
              onClick={handleTestEmail}
              disabled={isSending || !testEmail || !customerName}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Đang gửi email test...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Gửi email test (Demo mode)
                </>
              )}
            </Button>

            <div className="text-xs text-gray-400 text-center">
              💡 Hiện tại đang ở chế độ demo - email sẽ được mô phỏng, không gửi thật
            </div>

            {/* Test Result */}
            {testResult && (
              <div className={`p-3 rounded border ${
                testResult.success 
                  ? 'bg-green-600 bg-opacity-20 border-green-600' 
                  : 'bg-red-600 bg-opacity-20 border-red-600'
              }`}>
                <div className="flex items-center">
                  {testResult.success ? (
                    <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 mr-2 text-red-400" />
                  )}
                  <span className={testResult.success ? 'text-green-300' : 'text-red-300'}>
                    {testResult.message}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Configuration */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Trạng thái cấu hình
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Configuration Status */}
              <div className="p-3 bg-orange-600 bg-opacity-20 border border-orange-600 rounded">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-orange-400" />
                  <div>
                    <div className="font-medium text-orange-300">Chế độ DEMO đang hoạt động</div>
                    <div className="text-sm text-orange-200 opacity-90">
                      EmailJS chưa được cấu hình - Email sẽ được mô phỏng thay vì gửi thật
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Settings */}
              <div className="space-y-2 text-sm bg-gray-800 p-3 rounded">
                <div className="text-gray-400">
                  Service ID: <span className="text-red-400 font-mono">YOUR_SERVICE_ID</span> 
                  <span className="text-red-400 ml-2">❌ Chưa cấu hình</span>
                </div>
                <div className="text-gray-400">
                  Template ID: <span className="text-red-400 font-mono">YOUR_TEMPLATE_ID</span>
                  <span className="text-red-400 ml-2">❌ Chưa cấu hình</span>
                </div>
                <div className="text-gray-400">
                  Public Key: <span className="text-red-400 font-mono">YOUR_PUBLIC_KEY</span>
                  <span className="text-red-400 ml-2">❌ Chưa cấu hình</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="text-xs text-gray-400 bg-gray-800 p-2 rounded">
                <div className="font-medium text-yellow-400 mb-1">📝 Để kích hoạt email thật:</div>
                <div>1. Làm theo hướng dẫn setup EmailJS ở trên</div>
                <div>2. Cập nhật các constants trong <code className="text-blue-400">/components/EmailService.tsx</code></div>
                <div>3. Đổi <code className="text-blue-400">DEMO_MODE = false</code> trong EmailService.tsx</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Types */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Các loại email được gửi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-gray-800 rounded">
                <div className="text-yellow-400 font-medium mb-1">📧 Email chờ xác nhận</div>
                <div className="text-gray-300">
                  Gửi ngay khi khách hàng bấm "Đã chuyển khoản thành công" trong thanh toán VietQR
                </div>
              </div>
              
              <div className="p-3 bg-gray-800 rounded">
                <div className="text-green-400 font-medium mb-1">✅ Email xác nhận thanh toán</div>
                <div className="text-gray-300">
                  Gửi khi admin bấm "Duyệt - Hoàn thành" trong trang quản lý giao dịch
                </div>
              </div>
              
              <div className="p-3 bg-gray-800 rounded">
                <div className="text-blue-400 font-medium mb-1">📦 Email cập nhật trạng thái</div>
                <div className="text-gray-300">
                  Gửi khi admin thay đổi trạng thái đơn hàng (Đang xử lý, Thất bại, Hoàn tiền)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
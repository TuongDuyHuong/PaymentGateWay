import React from 'react';
import { CheckCircle, Package, Clock, Mail, Phone, MapPin, CreditCard, Truck, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from "sonner@2.0.3";

interface OrderConfirmationProps {
  orderDetails: any;
  onNavigate: (page: 'home') => void;
}

export function OrderConfirmation({ orderDetails, onNavigate }: OrderConfirmationProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return 'Chuyển khoản ngân hàng';
      case 'vnpay':
        return 'VNPay';
      case 'zalopay':
        return 'ZaloPay';
      case 'viettel_money':
        return 'Viettel Money';
      case 'paypal':
        return 'PayPal';
      case 'cod':
        return 'Thanh toán khi nhận hàng (COD)';
      default:
        return method;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-600">Đã xác nhận</Badge>;
      case 'pending_payment':
        return <Badge className="bg-yellow-600">Chờ thanh toán</Badge>;
      default:
        return <Badge className="bg-gray-600">{status}</Badge>;
    }
  };

  const generateInvoiceHTML = () => {
    const subtotal = orderDetails.totalAmount - (orderDetails.totalAmount >= 1000000 ? 0 : 50000);
    const shippingFee = orderDetails.totalAmount >= 1000000 ? 0 : 50000;
    
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hóa đơn AGUST - ${orderDetails.orderNumber}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background: #f8f9fa; }
        .invoice-container { max-width: 800px; margin: 20px auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 3px solid #ca8a04; padding-bottom: 20px; }
        .logo { font-size: 32px; font-weight: bold; color: #ca8a04; }
        .invoice-info { text-align: right; }
        .invoice-info h2 { color: #333; margin-bottom: 10px; }
        .company-info { margin-bottom: 30px; }
        .company-info h3 { color: #ca8a04; margin-bottom: 10px; }
        .billing-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .billing-info { width: 48%; }
        .billing-info h4 { color: #333; margin-bottom: 15px; font-size: 16px; border-bottom: 2px solid #ca8a04; padding-bottom: 5px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .items-table th { background-color: #ca8a04; color: white; font-weight: bold; }
        .items-table tr:nth-child(even) { background-color: #f8f9fa; }
        .summary { margin-left: auto; width: 300px; }
        .summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .summary-row.total { border-top: 2px solid #ca8a04; font-weight: bold; font-size: 18px; color: #ca8a04; margin-top: 10px; padding-top: 15px; }
        .payment-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .payment-info h4 { color: #ca8a04; margin-bottom: 15px; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
        .status-badge { display: inline-block; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .status-confirmed { background: #16a34a; color: white; }
        .status-pending { background: #ca8a04; color: white; }
        .qr-section { text-align: center; margin: 20px 0; padding: 20px; background: #f0f9ff; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">AGUST</div>
            <div class="invoice-info">
                <h2>HÓA ĐƠN BÁN HÀNG</h2>
                <p><strong>Số hóa đơn:</strong> ${orderDetails.orderNumber}</p>
                <p><strong>Ngày:</strong> ${formatDate(orderDetails.orderDate)}</p>
                <div class="status-badge ${orderDetails.status === 'confirmed' ? 'status-confirmed' : 'status-pending'}">
                    ${orderDetails.status === 'confirmed' ? 'ĐÃ XÁC NHẬN' : 'CHỜ THANH TOÁN'}
                </div>
            </div>
        </div>

        <!-- Company Info -->
        <div class="company-info">
            <h3>CÔNG TY TRANG SỨC AGUST</h3>
            <p><strong>Địa chỉ:</strong> Trần Phú, Hà Nội</p>
            <p><strong>Điện thoại:</strong> 0981 654 116</p>
            <p><strong>Email:</strong> support@agust.vn</p>
            <p><strong>Chuyên:</strong> Trang sức bạc S925 thủ công cao cấp</p>
        </div>

        <!-- Billing Information -->
        <div class="billing-section">
            <div class="billing-info">
                <h4>THÔNG TIN KHÁCH HÀNG</h4>
                <p><strong>Họ tên:</strong> ${orderDetails.customerInfo?.firstName || ''} ${orderDetails.customerInfo?.lastName || ''}</p>
                <p><strong>Email:</strong> ${orderDetails.customerInfo?.email || 'N/A'}</p>
                <p><strong>Điện thoại:</strong> ${orderDetails.customerInfo?.phone || 'N/A'}</p>
                <p><strong>Địa chỉ:</strong> ${orderDetails.customerInfo?.address || 'N/A'}</p>
                <p><strong>Phường/Xã:</strong> ${orderDetails.customerInfo?.ward || 'N/A'}</p>
                <p><strong>Quận/Huyện:</strong> ${orderDetails.customerInfo?.district || 'N/A'}</p>
                <p><strong>Tỉnh/TP:</strong> ${orderDetails.customerInfo?.city || 'N/A'}</p>
            </div>
            <div class="billing-info">
                <h4>THÔNG TIN THANH TOÁN</h4>
                <p><strong>Phương thức:</strong> ${getPaymentMethodName(orderDetails.paymentMethod)}</p>
                <p><strong>Tình trạng:</strong> ${orderDetails.status === 'confirmed' ? 'Đã thanh toán' : 'Chờ thanh toán'}</p>
                ${orderDetails.vnpayDetails ? `<p><strong>Mã GD VNPay:</strong> ${orderDetails.vnpayDetails.vnp_TransactionNo}</p>` : ''}
                ${orderDetails.zalopayDetails ? `<p><strong>Mã GD ZaloPay:</strong> ${orderDetails.zalopayDetails.transactionId}</p>` : ''}
                ${orderDetails.paypalDetails ? `<p><strong>Mã GD PayPal:</strong> ${orderDetails.paypalDetails.paymentID}</p>` : ''}
            </div>
        </div>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th>Sản phẩm</th>
                    <th>Chất liệu</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                </tr>
            </thead>
            <tbody>
                ${orderDetails.items.map((item: any) => `
                <tr>
                    <td><strong>${item.name}</strong></td>
                    <td>${item.material}</td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">${formatPrice(item.price)}</td>
                    <td style="text-align: right;"><strong>${formatPrice(item.price * item.quantity)}</strong></td>
                </tr>
                `).join('')}
            </tbody>
        </table>

        <!-- Summary -->
        <div class="summary">
            <div class="summary-row">
                <span>Tạm tính:</span>
                <span>${formatPrice(subtotal)}</span>
            </div>
            <div class="summary-row">
                <span>Phí vận chuyển:</span>
                <span>${shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
            </div>
            <div class="summary-row total">
                <span>TỔNG CỘNG:</span>
                <span>${formatPrice(orderDetails.totalAmount)}</span>
            </div>
        </div>

        ${orderDetails.paymentMethod === 'bank_transfer' ? `
        <!-- Bank Transfer Info -->
        <div class="payment-info">
            <h4>THÔNG TIN CHUYỂN KHOẢN</h4>
            <p><strong>Ngân hàng:</strong> Vietcombank - Chi nhánh Hà Nội</p>
            <p><strong>Số tài khoản:</strong> 1234567890</p>
            <p><strong>Chủ tài khoản:</strong> CÔNG TY AGUST</p>
            <p><strong>Nội dung CK:</strong> ${orderDetails.orderNumber} - Họ tên KH</p>
            <p style="color: #dc2626; font-weight: bold; margin-top: 10px;">
                * Vui lòng chuyển khoản đúng số tiền và ghi đúng nội dung để được xử lý nhanh chóng
            </p>
        </div>
        ` : ''}

        <!-- QR Code Section for Bank Transfer -->
        ${orderDetails.paymentMethod === 'bank_transfer' ? `
        <div class="qr-section">
            <h4 style="color: #ca8a04; margin-bottom: 15px;">QUÉT MÃ QR ĐỂ CHUYỂN KHOẢN</h4>
            <div style="display: inline-block; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="width: 200px; height: 200px; background: #f3f4f6; border: 2px dashed #ca8a04; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
                    <div style="text-align: center; color: #666;">
                        <div style="font-size: 24px; margin-bottom: 8px;">📱</div>
                        <div style="font-size: 12px;">QR Code</div>
                        <div style="font-size: 12px;">Chuyển khoản</div>
                    </div>
                </div>
            </div>
            <p style="margin-top: 15px; color: #666; font-size: 14px;">
                Quét mã QR bằng app ngân hàng để chuyển khoản tự động với đầy đủ thông tin
            </p>
        </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
            <p><strong>AGUST - Trang sức bạc S925 thủ công cao cấp</strong></p>
            <p>Cảm ơn quý khách đã tin tưởng và lựa chọn sản phẩm của chúng tôi!</p>
            <p>Mọi thắc mắc xin liên hệ: 0981 654 116 | support@agust.vn</p>
            <p style="margin-top: 15px; font-size: 12px; color: #999;">
                Hóa đơn được tạo tự động vào ${formatDate(new Date().toISOString())}
            </p>
        </div>
    </div>
</body>
</html>`;
  };

  const downloadInvoice = () => {
    try {
      const htmlContent = generateInvoiceHTML();
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `AGUST_HoaDon_${orderDetails.orderNumber}.html`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      // Show success notification
      toast.success("Hóa đơn đã được tải xuống!", {
        description: `File: AGUST_HoaDon_${orderDetails.orderNumber}.html`,
        duration: 5000,
      });
      
      // Also show instructions for printing
      setTimeout(() => {
        toast.info("Hướng dẫn in hóa đơn", {
          description: "Mở file HTML vừa tải → Ctrl+P → Chọn máy in hoặc Save as PDF",
          duration: 8000,
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error("Có lỗi khi tạo hóa đơn", {
        description: "Vui lòng thử lại hoặc liên hệ hỗ trợ",
        duration: 5000,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl text-white mb-2">Đặt hàng thành công!</h1>
        <p className="text-gray-400">Cảm ơn bạn đã tin tưởng và mua sắm tại AGUST</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Thông tin đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-sm">Mã đơn hàng</div>
                  <div className="text-white font-mono">{orderDetails.orderNumber}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Trạng thái</div>
                  <div>{getStatusBadge(orderDetails.status)}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Ngày đặt hàng</div>
                  <div className="text-white">{formatDate(orderDetails.orderDate)}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Phương thức thanh toán</div>
                  <div className="text-white">{getPaymentMethodName(orderDetails.paymentMethod)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Sản phẩm đã đặt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderDetails.items.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-700 rounded-lg">
                    <div className="w-16 h-16 flex-shrink-0">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white">{item.name}</h3>
                      <p className="text-gray-400 text-sm">{item.material}</p>
                      <p className="text-gray-400 text-sm">Số lượng: {item.quantity}</p>
                    </div>
                    <div className="text-white font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          {orderDetails.paymentMethod === 'bank_transfer' && orderDetails.status === 'pending_payment' && (
            <Card className="bg-yellow-600 bg-opacity-20 border-yellow-600">
              <CardHeader>
                <CardTitle className="text-yellow-600 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Bước tiếp theo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-white">
                  <p className="mb-2">Để hoàn tất đơn hàng, vui lòng:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Chuyển khoản theo thông tin đã cung cấp</li>
                    <li>Gửi ảnh chụp biên lai chuyển khoản qua Zalo/Email</li>
                    <li>Chờ xác nhận từ AGUST (1-2 giờ làm việc)</li>
                  </ol>
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" size="sm" className="border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-black">
                    <Phone className="w-4 h-4 mr-2" />
                    Gọi 0981 654 116
                  </Button>
                  <Button variant="outline" size="sm" className="border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-black">
                    <Mail className="w-4 h-4 mr-2" />
                    Email hỗ trợ
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Email confirmation notice for confirmed bank transfer */}
          {orderDetails.paymentMethod === 'bank_transfer' && orderDetails.status === 'confirmed' && (
            <Card className="bg-green-600 bg-opacity-20 border-green-600">
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <Mail className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="text-green-300 text-sm">
                    <p className="font-medium">Email xác nhận đã được gửi!</p>
                    <p className="text-xs mt-1">
                      Chúng tôi đã gửi email xác nhận thanh toán đến <strong>{orderDetails.customerInfo?.email || 'email@example.com'}</strong> với đầy đủ thông tin đơn hàng và hướng dẫn giao hàng.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {orderDetails.paymentMethod === 'vnpay' && orderDetails.vnpayDetails && (
            <Card className="bg-blue-600 bg-opacity-20 border-blue-600">
              <CardHeader>
                <CardTitle className="text-blue-600 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Thông tin thanh toán VNPay
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-white">
                  <p className="mb-2">Thanh toán VNPay thành công!</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mã giao dịch VNPay:</span>
                      <span className="font-mono">{orderDetails.vnpayDetails.vnp_TransactionNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mã tham chiếu:</span>
                      <span className="font-mono">{orderDetails.vnpayDetails.vnp_TxnRef}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ngân hàng:</span>
                      <span>{orderDetails.vnpayDetails.vnp_BankCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Số tiền:</span>
                      <span>{formatPrice(orderDetails.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ngày thanh toán:</span>
                      <span>{formatDate(orderDetails.orderDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Trạng thái:</span>
                      <span className="text-green-400">Thành công</span>
                    </div>
                  </div>
                </div>
                
                {/* Email notification notice for VNPay */}
                <div className="bg-green-600 bg-opacity-20 border border-green-600 p-3 rounded mt-4">
                  <div className="flex items-start space-x-2">
                    <Mail className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="text-green-300 text-sm">
                      <p className="font-medium">📧 Email xác nhận đã được gửi!</p>
                      <p className="text-xs mt-1">
                        Chúng tôi đã gửi email xác nhận thanh toán đến <strong>{orderDetails.customerInfo?.email || 'email@example.com'}</strong> với đầy đủ thông tin đơn hàng và hướng dẫn giao dịch.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {orderDetails.paymentMethod === 'zalopay' && orderDetails.zalopayDetails && (
            <Card className="bg-blue-600 bg-opacity-20 border-blue-600">
              <CardHeader>
                <CardTitle className="text-blue-600 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Thông tin thanh toán ZaloPay
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-white">
                  <p className="mb-2">Thanh toán ZaloPay thành công!</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mã giao dịch ZaloPay:</span>
                      <span className="font-mono">{orderDetails.zalopayDetails.transactionId}</span>
                    </div>
                    {orderDetails.zalopayDetails.bank_name && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Ngân hàng thanh toán:</span>
                        <span>{orderDetails.zalopayDetails.bank_name}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Số tiền:</span>
                      <span>{formatPrice(orderDetails.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ngày thanh toán:</span>
                      <span>{formatDate(orderDetails.orderDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Trạng thái:</span>
                      <span className="text-green-400">Thành công</span>
                    </div>
                  </div>
                </div>
                
                {/* Email notification notice */}
                <div className="bg-green-600 bg-opacity-20 border border-green-600 p-3 rounded mt-4">
                  <div className="flex items-start space-x-2">
                    <Mail className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="text-green-300 text-sm">
                      <p className="font-medium">Email xác nhận đã được gửi!</p>
                      <p className="text-xs mt-1">
                        Chúng tôi đã gửi email xác nhận thanh toán đến <strong>{orderDetails.customerInfo?.email || 'email@example.com'}</strong> với đầy đủ thông tin đơn hàng và hướng dẫn giao dịch.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {orderDetails.paymentMethod === 'viettel_money' && orderDetails.viettelMoneyDetails && (
            <Card className="bg-red-600 bg-opacity-20 border-red-600">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Thông tin thanh toán Viettel Money
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-white">
                  <p className="mb-2">Thanh toán Viettel Money thành công!</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mã giao dịch Viettel Money:</span>
                      <span className="font-mono">{orderDetails.viettelMoneyDetails.transactionId}</span>
                    </div>
                    {orderDetails.viettelMoneyDetails.provider_name && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Nhà cung cấp:</span>
                        <span>{orderDetails.viettelMoneyDetails.provider_name}</span>
                      </div>
                    )}
                    {orderDetails.viettelMoneyDetails.provider_type && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Loại hình:</span>
                        <span className="capitalize">
                          {orderDetails.viettelMoneyDetails.provider_type === 'wallet' && 'Ví điện tử'}
                          {orderDetails.viettelMoneyDetails.provider_type === 'telecom' && 'Nhà mạng'}
                          {orderDetails.viettelMoneyDetails.provider_type === 'bank' && 'Ngân hàng'}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Số tiền:</span>
                      <span>{formatPrice(orderDetails.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ngày thanh toán:</span>
                      <span>{formatDate(orderDetails.orderDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Trạng thái:</span>
                      <span className="text-green-400">Thành công</span>
                    </div>
                  </div>
                </div>
                
                {/* Email notification notice */}
                <div className="bg-green-600 bg-opacity-20 border border-green-600 p-3 rounded mt-4">
                  <div className="flex items-start space-x-2">
                    <Mail className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="text-green-300 text-sm">
                      <p className="font-medium">Email xác nhận đã được gửi!</p>
                      <p className="text-xs mt-1">
                        Chúng tôi đã gửi email xác nhận thanh toán đến <strong>{orderDetails.customerInfo?.email || 'email@example.com'}</strong> với đầy đủ thông tin đơn hàng và hướng dẫn giao dịch.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {orderDetails.paymentMethod === 'paypal' && orderDetails.paypalDetails && (
            <Card className="bg-blue-600 bg-opacity-20 border-blue-600">
              <CardHeader>
                <CardTitle className="text-blue-600 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Thông tin thanh toán PayPal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-white">
                  <p className="mb-2">Thanh toán PayPal thành công!</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mã giao dịch PayPal:</span>
                      <span className="font-mono">{orderDetails.paypalDetails.paymentID}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Số tiền USD:</span>
                      <span>${orderDetails.paypalDetails.usdAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tỷ giá:</span>
                      <span>1 USD = {orderDetails.paypalDetails.exchangeRate?.toLocaleString()} VND</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Trạng thái:</span>
                      <span className="text-green-400">{orderDetails.paypalDetails.status || 'COMPLETED'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Email notification notice for PayPal */}
                <div className="bg-green-600 bg-opacity-20 border border-green-600 p-3 rounded mt-4">
                  <div className="flex items-start space-x-2">
                    <Mail className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="text-green-300 text-sm">
                      <p className="font-medium">📧 Email xác nhận đã được gửi!</p>
                      <p className="text-xs mt-1">
                        Chúng tôi đã gửi email xác nhận thanh toán đến <strong>{orderDetails.customerInfo?.email || 'email@example.com'}</strong> với đầy đủ thông tin đơn hàng và hướng dẫn giao dịch.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {orderDetails.paymentMethod === 'cod' && (
            <Card className="bg-green-600 bg-opacity-20 border-green-600">
              <CardHeader>
                <CardTitle className="text-green-600 flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Thông tin giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-white">
                  <p className="mb-2">Đơn hàng COD đã được xác nhận:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Thời gian giao hàng: 3-5 ngày làm việc</li>
                    <li>Thanh toán khi nhận hàng: {formatPrice(orderDetails.totalAmount)}</li>
                    <li>Vui lòng chuẩn bị đúng số tiền</li>
                    <li>AGUST sẽ liên hệ trước khi giao hàng</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary & Actions */}
        <div className="lg:col-span-1">
          <Card className="bg-gray-900 border-gray-700 sticky top-8">
            <CardHeader>
              <CardTitle className="text-white">Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(orderDetails.totalAmount - 50000)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Phí vận chuyển:</span>
                  <span>
                    {orderDetails.totalAmount >= 1000000 ? (
                      <span className="text-green-500">Miễn phí</span>
                    ) : (
                      formatPrice(50000)
                    )}
                  </span>
                </div>
              </div>
              
              <Separator className="bg-gray-700" />
              
              <div className="flex justify-between text-xl text-white font-semibold">
                <span>Tổng cộng:</span>
                <span>{formatPrice(orderDetails.totalAmount)}</span>
              </div>
              
              <div className="space-y-3 pt-4">
                <Button 
                  className="w-full bg-yellow-600 hover:bg-yellow-500 text-black"
                  onClick={() => onNavigate('home')}
                >
                  Tiếp tục mua sắm
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full border-gray-600 text-white hover:bg-gray-800"
                  onClick={downloadInvoice}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Tải hóa đơn
                </Button>
              </div>
              
              {/* Contact Info */}
              <div className="pt-4 border-t border-gray-700">
                <h4 className="text-white font-medium mb-3">Hỗ trợ khách hàng</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-300">
                    <Phone className="w-4 h-4 mr-2" />
                    0981 654 116
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Mail className="w-4 h-4 mr-2" />
                    support@agust.vn
                  </div>
                  <div className="flex items-start text-gray-300">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                    <div>
                      <div>Showroom: Trần Phú </div>
                      <div>Trần Phú, Hà Nội</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-400 pt-4 border-t border-gray-700">
                Cảm ơn bạn đã lựa chọn AGUST! <br />
                Mọi thắc mắc xin liên hệ hotline.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
// EmailService.tsx - Service để gửi email thông báo cho khách hàng
import emailjs from '@emailjs/browser';

export interface EmailData {
  to: string;
  subject: string;
  customerName: string;
  orderNumber: string;
  amount: number;
  paymentMethod: string;
  type: 'pending_confirmation' | 'payment_confirmed' | 'order_status_update';
  status?: string;
  bankInfo?: {
    bank: string;
    accountNumber: string;
    accountName: string;
    transferContent: string;
  };
}

export class EmailService {
  // EmailJS Configuration - CẦN ĐƯỢC CẬP NHẬT VỚI THÔNG TIN THẬT
  private static readonly SERVICE_ID = 'YOUR_SERVICE_ID'; // Cần thay bằng Service ID thật
  private static readonly TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // Cần thay bằng Template ID thật  
  private static readonly PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Cần thay bằng Public Key thật

  // Demo mode - set to true to use simulation instead of real EmailJS
  private static readonly DEMO_MODE = true;

  // Initialize EmailJS
  static initialize() {
    if (!this.DEMO_MODE && this.PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
      emailjs.init(this.PUBLIC_KEY);
    }
  }

  // Check if EmailJS is properly configured
  static isConfigured(): boolean {
    return this.SERVICE_ID !== 'YOUR_SERVICE_ID' && 
           this.TEMPLATE_ID !== 'YOUR_TEMPLATE_ID' && 
           this.PUBLIC_KEY !== 'YOUR_PUBLIC_KEY';
  }

  // Hàm gửi email - tự động chọn demo mode hoặc EmailJS thật
  static async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      console.log('🔄 Đang gửi email...');
      console.log('📧 Email Data:', emailData);

      // Tạo nội dung email dựa trên type
      const emailContent = this.generateEmailContent(emailData);

      // Kiểm tra nếu đang ở demo mode hoặc chưa cấu hình EmailJS
      if (this.DEMO_MODE || !this.isConfigured()) {
        console.log('📝 Chế độ DEMO - Mô phỏng gửi email');
        console.log('📧 Nội dung email sẽ gửi:', emailContent);
        
        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('✅ Email DEMO đã được "gửi" thành công!');
        
        // Hiển thị thông báo demo cho user
        this.showDemoNotification(emailData, emailContent);
        
        return true;
      }

      // Initialize EmailJS if configured
      this.initialize();
      
      // Prepare template parameters for EmailJS
      const templateParams = {
        to_email: emailData.to,
        to_name: emailData.customerName,
        subject: emailContent.subject,
        customer_name: emailData.customerName,
        order_number: emailData.orderNumber,
        amount: emailContent.amount,
        payment_method: emailData.paymentMethod,
        timestamp: emailContent.timestamp,
        message_content: emailContent.content,
        from_name: 'AGUST Jewelry',
        reply_to: 'support@agust.vn'
      };

      // Send email via EmailJS
      const response = await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID,
        templateParams
      );

      console.log('✅ Email đã được gửi thành công qua EmailJS!', response);
      console.log('📨 Email Response:', response);
      
      // Hiển thị thông báo cho user
      this.showEmailNotification(emailData);
      
      return true;
    } catch (error) {
      console.error('❌ Lỗi gửi email:', error);
      
      // Fallback to demo mode if EmailJS fails
      console.log('🔄 Chuyển sang chế độ demo do lỗi EmailJS...');
      return await this.sendEmailDemo(emailData);
    }
  }

  // Fallback demo email sending
  private static async sendEmailDemo(emailData: EmailData): Promise<boolean> {
    try {
      const emailContent = this.generateEmailContent(emailData);
      
      console.log('📝 Chế độ FALLBACK DEMO - Mô phỏng gửi email');
      console.log('📧 Nội dung email:', emailContent);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.showDemoNotification(emailData, emailContent);
      
      return true;
    } catch (error) {
      console.error('❌ Lỗi trong demo mode:', error);
      this.showErrorNotification(emailData, error);
      return false;
    }
  }

  // Tạo nội dung email dựa trên loại thông báo
  private static generateEmailContent(emailData: EmailData) {
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price);
    };

    const baseContent = {
      to: emailData.to,
      subject: emailData.subject,
      customerName: emailData.customerName,
      orderNumber: emailData.orderNumber,
      amount: formatPrice(emailData.amount),
      paymentMethod: emailData.paymentMethod,
      timestamp: new Date().toLocaleString('vi-VN'),
    };

    switch (emailData.type) {
      case 'pending_confirmation':
        return {
          ...baseContent,
          subject: `[AGUST] Chờ xác nhận thanh toán - Đơn hàng ${emailData.orderNumber}`,
          content: `
Kính chào ${emailData.customerName},

Cảm ơn bạn đã đặt hàng tại AGUST Jewelry!

THÔNG TIN ĐÔN HÀNG:
• Mã đơn hàng: ${emailData.orderNumber}
• Tổng tiền: ${formatPrice(emailData.amount)}
• Phương thức thanh toán: ${emailData.paymentMethod}
• Thời gian: ${new Date().toLocaleString('vi-VN')}

🔄 TRẠNG THÁI: CHỜ XÁC NHẬN THANH TOÁN

Chúng tôi đã nhận được thông báo bạn đã chuyển khoản. Đơn hàng của bạn đang được kiểm tra và sẽ được xác nhận trong vòng 1-2 giờ làm việc.

${emailData.bankInfo ? `
THÔNG TIN CHUYỂN KHOẢN:
• Ngân hàng: ${emailData.bankInfo.bank}
• Số tài khoản: ${emailData.bankInfo.accountNumber}
• Chủ tài khoản: ${emailData.bankInfo.accountName}
• Nội dung CK: ${emailData.bankInfo.transferContent}
` : ''}

📧 Bạn sẽ nhận được email xác nhận khi thanh toán được duyệt.

Cảm ơn bạn đã tin tựởng AGUST Jewelry!

---
AGUST Jewelry - Trang sức bạc S925 cao cấp
Email: support@agust.vn | Hotline: 1900 xxxx
          `,
        };

      case 'payment_confirmed':
        return {
          ...baseContent,
          subject: `[AGUST] ✅ Thanh toán đã được xác nhận - Đơn hàng ${emailData.orderNumber}`,
          content: `
Kính chào ${emailData.customerName},

🎉 THANH TOÁN ĐÃ ĐƯỢC XÁC NHẬN!

THÔNG TIN ĐÔN HÀNG:
• Mã đơn hàng: ${emailData.orderNumber}
• Tổng tiền: ${formatPrice(emailData.amount)}
• Phương thức thanh toán: ${emailData.paymentMethod}
• Trạng thái: ✅ ĐÃ XÁC NHẬN THANH TOÁN

Chúng tôi đã xác nhận thanh toán của bạn thành công. Đơn hàng sẽ được chuẩn bị và giao trong 2-3 ngày làm việc.

📦 Bạn sẽ nhận được thông báo khi đơn hàng được giao cho đơn vị vận chuyển.

Cảm ơn bạn đã mua sắm tại AGUST Jewelry!

---
AGUST Jewelry - Trang sức bạc S925 cao cấp
Email: support@agust.vn | Hotline: 1900 xxxx
          `,
        };

      case 'order_status_update':
        return {
          ...baseContent,
          subject: `[AGUST] Cập nhật đơn hàng ${emailData.orderNumber} - ${emailData.status}`,
          content: `
Kính chào ${emailData.customerName},

Đơn hàng ${emailData.orderNumber} của bạn đã được cập nhật trạng thái.

THÔNG TIN CẬP NHẬT:
• Trạng thái mới: ${emailData.status}
• Thời gian cập nhật: ${new Date().toLocaleString('vi-VN')}

Cảm ơn bạn đã tin tưởng AGUST Jewelry!

---
AGUST Jewelry - Trang sức bạc S925 cao cấp
Email: support@agust.vn | Hotline: 1900 xxxx
          `,
        };

      default:
        return baseContent;
    }
  }

  // Hiển thị thông báo email đã gửi
  private static showEmailNotification(emailData: EmailData) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm animate-slide-in';
    
    const typeLabels = {
      'pending_confirmation': 'Email chờ xác nhận',
      'payment_confirmed': 'Email xác nhận thanh toán',
      'order_status_update': 'Email cập nhật trạng thái'
    };
    
    notification.innerHTML = `
      <div class="flex items-center">
        <div class="mr-3">✅</div>
        <div>
          <div class="font-medium">${typeLabels[emailData.type] || 'Email đã gửi!'}</div>
          <div class="text-sm opacity-90">Đến: ${emailData.to}</div>
          <div class="text-xs opacity-75">Đơn hàng: ${emailData.orderNumber}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Tự động xóa thông báo sau 6 giây
    setTimeout(() => {
      if (notification && notification.parentNode) {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 6000);
  }

  // Gửi email chờ xác nhận sau khi khách hàng báo đã chuyển khoản
  static async sendPendingConfirmationEmail(
    customerEmail: string,
    customerName: string,
    orderNumber: string,
    amount: number,
    bankInfo: any
  ): Promise<boolean> {
    const emailData: EmailData = {
      to: customerEmail,
      subject: `Chờ xác nhận thanh toán - Đơn hàng ${orderNumber}`,
      customerName,
      orderNumber,
      amount,
      paymentMethod: 'Chuyển khoản ngân hàng',
      type: 'pending_confirmation',
      bankInfo
    };

    return await this.sendEmail(emailData);
  }

  // Gửi email xác nhận thanh toán sau khi admin duyệt
  static async sendPaymentConfirmedEmail(
    customerEmail: string,
    customerName: string,
    orderNumber: string,
    amount: number,
    paymentMethod: string
  ): Promise<boolean> {
    const emailData: EmailData = {
      to: customerEmail,
      subject: `Thanh toán đã được xác nhận - Đơn hàng ${orderNumber}`,
      customerName,
      orderNumber,
      amount,
      paymentMethod,
      type: 'payment_confirmed'
    };

    return await this.sendEmail(emailData);
  }

  // Gửi email cập nhật trạng thái đơn hàng
  static async sendOrderStatusUpdateEmail(
    customerEmail: string,
    customerName: string,
    orderNumber: string,
    amount: number,
    paymentMethod: string,
    status: string
  ): Promise<boolean> {
    const statusLabels: { [key: string]: string } = {
      completed: 'Hoàn thành',
      processing: 'Đang xử lý',
      failed: 'Thất bại',
      refunded: 'Hoàn tiền',
      pending: 'Chờ xử lý'
    };

    const emailData: EmailData = {
      to: customerEmail,
      subject: `Cập nhật đơn hàng ${orderNumber}`,
      customerName,
      orderNumber,
      amount,
      paymentMethod,
      type: 'order_status_update',
      status: statusLabels[status] || status
    };

    return await this.sendEmail(emailData);
  }

  // Hiển thị thông báo demo email
  private static showDemoNotification(emailData: EmailData, emailContent: any) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm animate-slide-in border border-blue-500';
    
    notification.innerHTML = `
      <div class="flex items-center">
        <div class="mr-3">📧</div>
        <div>
          <div class="font-medium">Email Demo Sent</div>
          <div class="text-sm opacity-90">Gửi đến: ${emailData.to}</div>
          <div class="text-xs opacity-75 mt-1">Chế độ demo - Email thực sẽ hoạt động sau khi setup EmailJS</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Tự động xóa thông báo sau 6 giây
    setTimeout(() => {
      if (notification && notification.parentNode) {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 6000);
  }

  // Hiển thị thông báo lỗi gửi email
  private static showErrorNotification(emailData: EmailData, error: any) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm animate-slide-in border border-red-500';
    
    const errorMsg = error?.text || error?.message || 'Lỗi không xác định';
    const isConfigError = errorMsg.includes('Account not found') || errorMsg.includes('404');
    
    notification.innerHTML = `
      <div class="flex items-center">
        <div class="mr-3">❌</div>
        <div>
          <div class="font-medium">${isConfigError ? 'EmailJS chưa được cấu hình' : 'Lỗi gửi email'}</div>
          <div class="text-sm opacity-90">${isConfigError ? 'Cần setup EmailJS để gửi email thật' : `Không thể gửi email đến ${emailData.to}`}</div>
          <div class="text-xs opacity-75 mt-1">${isConfigError ? 'Đang sử dụng chế độ demo' : errorMsg}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Tự động xóa thông báo sau 8 giây
    setTimeout(() => {
      if (notification && notification.parentNode) {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 8000);
  }

  // Setup EmailJS Templates (hướng dẫn cho developer)
  static getEmailJSSetupInstructions() {
    return `
HƯỚNG DẪN SETUP EMAILJS:

1. Đăng ký tài khoản tại https://www.emailjs.com/
2. Tạo Email Service (Gmail, Outlook, v.v.)
3. Tạo Email Template với các biến sau:
   - {{to_name}} - Tên khách hàng
   - {{subject}} - Tiêu đề email
   - {{customer_name}} - Tên khách hàng
   - {{order_number}} - Mã đơn hàng
   - {{amount}} - Số tiền
   - {{payment_method}} - Phương thức thanh toán
   - {{timestamp}} - Thời gian
   - {{message_content}} - Nội dung chi tiết
   - {{from_name}} - Tên người gửi
   
4. Cập nhật các constants trong EmailService:
   - SERVICE_ID: ID của service bạn tạo
   - TEMPLATE_ID: ID của template bạn tạo
   - PUBLIC_KEY: Public key từ tài khoản EmailJS

Template mẫu:
Subject: {{subject}}

{{message_content}}

Trân trọng,
{{from_name}}
    `;
  }
}
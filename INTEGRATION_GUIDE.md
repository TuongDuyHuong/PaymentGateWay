# Hướng dẫn Tích hợp Backend Payment Gateway

Hướng dẫn chi tiết cách tích hợp backend payment gateway này với frontend của bạn.

## 📋 Tổng quan

Backend này cung cấp REST APIs để xử lý thanh toán qua nhiều cổng thanh toán khác nhau. Frontend của bạn chỉ cần gọi các API endpoints và xử lý response.

## 🚀 Bắt đầu nhanh

### 1. Khởi động Backend

```bash
cd backend
npm install
cp .env.example .env
npm start
```

Backend sẽ chạy tại: `http://localhost:3001`

### 2. Tích hợp với Frontend

## 📱 Flow Thanh toán Chuẩn

### VNPay / ZaloPay Flow

```
1. User chọn sản phẩm và checkout
2. Frontend gọi API tạo payment URL
3. Backend trả về payment URL
4. Frontend redirect user đến payment URL
5. User thanh toán trên trang payment gateway
6. Payment gateway redirect về callback URL
7. Backend xử lý callback và update transaction
8. Frontend hiển thị kết quả
```

### Momo / ViettelMoney Flow (QR Code)

```
1. User chọn sản phẩm và checkout
2. Frontend gọi API tạo payment
3. Backend trả về QR code URL
4. Frontend hiển thị QR code
5. User quét QR bằng app Momo/ViettelMoney
6. Payment gateway gọi webhook đến backend
7. Backend update transaction
8. Frontend poll hoặc dùng websocket để check status
```

### PayPal Flow

```
1. User chọn sản phẩm và checkout
2. Frontend gọi API tạo PayPal order
3. Backend trả về approve URL
4. Frontend redirect đến approve URL
5. User login PayPal và approve
6. PayPal redirect về return URL
7. Backend capture payment
8. Frontend hiển thị kết quả
```

## 💻 Code Examples

### React/Next.js Integration

#### 1. Tạo Payment Service

```javascript
// services/paymentService.js
const API_BASE_URL = 'http://localhost:3001/api';

export const paymentService = {
  // Tạo giao dịch
  async createTransaction(data) {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // VNPay
  async createVNPayPayment(data) {
    const response = await fetch(`${API_BASE_URL}/vnpay/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Momo
  async createMomoPayment(data) {
    const response = await fetch(`${API_BASE_URL}/momo/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // ZaloPay
  async createZaloPayPayment(data) {
    const response = await fetch(`${API_BASE_URL}/zalopay/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // PayPal
  async createPayPalOrder(data) {
    const response = await fetch(`${API_BASE_URL}/paypal/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async capturePayPalOrder(orderId) {
    const response = await fetch(`${API_BASE_URL}/paypal/capture/${orderId}`, {
      method: 'POST'
    });
    return response.json();
  },

  // Get transaction
  async getTransaction(id) {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`);
    return response.json();
  },

  // Update transaction
  async updateTransaction(id, data) {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Get statistics
  async getStats() {
    const response = await fetch(`${API_BASE_URL}/transactions/stats/summary`);
    return response.json();
  }
};
```

#### 2. Tạo Payment Component

```javascript
// components/PaymentButton.jsx
import { useState } from 'react';
import { paymentService } from '../services/paymentService';

export const PaymentButton = ({ orderData }) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('vnpay');

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Tạo transaction trước
      const transaction = await paymentService.createTransaction({
        orderId: orderData.orderId,
        amount: orderData.amount,
        currency: 'VND',
        paymentMethod: paymentMethod,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        items: orderData.items
      });

      // Tạo payment dựa trên phương thức được chọn
      let result;
      switch (paymentMethod) {
        case 'vnpay':
          result = await paymentService.createVNPayPayment({
            orderId: orderData.orderId,
            amount: orderData.amount,
            orderInfo: `Thanh toan don hang ${orderData.orderId}`,
            bankCode: 'NCB'
          });
          if (result.success) {
            window.location.href = result.paymentUrl;
          }
          break;

        case 'momo':
          result = await paymentService.createMomoPayment({
            orderId: orderData.orderId,
            amount: orderData.amount,
            orderInfo: `Thanh toan don hang ${orderData.orderId}`
          });
          if (result.success) {
            // Hiển thị QR code hoặc redirect đến payUrl
            window.location.href = result.payUrl;
          }
          break;

        case 'zalopay':
          result = await paymentService.createZaloPayPayment({
            orderId: orderData.orderId,
            amount: orderData.amount,
            description: `Thanh toan don hang ${orderData.orderId}`,
            items: orderData.items
          });
          if (result.success) {
            window.location.href = result.orderUrl;
          }
          break;

        case 'paypal':
          result = await paymentService.createPayPalOrder({
            amount: orderData.amount / 23000, // Convert VND to USD
            currency: 'USD',
            orderId: orderData.orderId,
            description: `Payment for order ${orderData.orderId}`
          });
          if (result.success) {
            window.location.href = result.approveUrl;
          }
          break;
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Lỗi khi tạo thanh toán. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <select 
        value={paymentMethod} 
        onChange={(e) => setPaymentMethod(e.target.value)}
        disabled={loading}
      >
        <option value="vnpay">VNPay</option>
        <option value="momo">Momo</option>
        <option value="zalopay">ZaloPay</option>
        <option value="paypal">PayPal</option>
      </select>
      
      <button 
        onClick={handlePayment} 
        disabled={loading}
      >
        {loading ? 'Đang xử lý...' : 'Thanh toán'}
      </button>
    </div>
  );
};
```

#### 3. Xử lý Callback

```javascript
// pages/payment-callback.jsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { paymentService } from '../services/paymentService';

export default function PaymentCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const checkPayment = async () => {
      const { orderId, transactionId } = router.query;
      
      if (!orderId) return;

      try {
        // Get transaction từ backend
        const result = await paymentService.getTransaction(transactionId);
        
        if (result.success) {
          if (result.data.status === 'completed') {
            setStatus('success');
            // Redirect đến success page sau 3s
            setTimeout(() => {
              router.push(`/order-success?orderId=${orderId}`);
            }, 3000);
          } else if (result.data.status === 'failed') {
            setStatus('failed');
          }
        }
      } catch (error) {
        console.error('Check payment error:', error);
        setStatus('error');
      }
    };

    checkPayment();
  }, [router.query]);

  return (
    <div>
      {status === 'processing' && <p>Đang xử lý thanh toán...</p>}
      {status === 'success' && <p>Thanh toán thành công!</p>}
      {status === 'failed' && <p>Thanh toán thất bại!</p>}
      {status === 'error' && <p>Có lỗi xảy ra!</p>}
    </div>
  );
}
```

### Vue.js Integration

```javascript
// services/paymentService.js
export const paymentService = {
  apiUrl: 'http://localhost:3001/api',

  async createVNPayPayment(data) {
    try {
      const response = await fetch(`${this.apiUrl}/vnpay/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('VNPay payment error:', error);
      throw error;
    }
  },

  // Similar methods cho các payment gateways khác...
};
```

```vue
<!-- components/PaymentButton.vue -->
<template>
  <div>
    <select v-model="paymentMethod" :disabled="loading">
      <option value="vnpay">VNPay</option>
      <option value="momo">Momo</option>
      <option value="zalopay">ZaloPay</option>
      <option value="paypal">PayPal</option>
    </select>
    
    <button @click="handlePayment" :disabled="loading">
      {{ loading ? 'Đang xử lý...' : 'Thanh toán' }}
    </button>
  </div>
</template>

<script>
import { ref } from 'vue';
import { paymentService } from '@/services/paymentService';

export default {
  props: ['orderData'],
  setup(props) {
    const loading = ref(false);
    const paymentMethod = ref('vnpay');

    const handlePayment = async () => {
      loading.value = true;
      try {
        const result = await paymentService.createVNPayPayment({
          orderId: props.orderData.orderId,
          amount: props.orderData.amount,
          orderInfo: `Thanh toan don hang ${props.orderData.orderId}`
        });

        if (result.success) {
          window.location.href = result.paymentUrl;
        }
      } catch (error) {
        console.error('Payment error:', error);
        alert('Lỗi khi tạo thanh toán');
      } finally {
        loading.value = false;
      }
    };

    return {
      loading,
      paymentMethod,
      handlePayment
    };
  }
};
</script>
```

### Angular Integration

```typescript
// services/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:3001/api';

  constructor(private http: HttpClient) {}

  createTransaction(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/transactions`, data);
  }

  createVNPayPayment(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/vnpay/create`, data);
  }

  createMomoPayment(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/momo/create`, data);
  }

  getTransaction(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/${id}`);
  }
}
```

```typescript
// components/payment-button.component.ts
import { Component, Input } from '@angular/core';
import { PaymentService } from '../services/payment.service';

@Component({
  selector: 'app-payment-button',
  template: `
    <div>
      <select [(ngModel)]="paymentMethod" [disabled]="loading">
        <option value="vnpay">VNPay</option>
        <option value="momo">Momo</option>
        <option value="zalopay">ZaloPay</option>
      </select>
      
      <button (click)="handlePayment()" [disabled]="loading">
        {{ loading ? 'Đang xử lý...' : 'Thanh toán' }}
      </button>
    </div>
  `
})
export class PaymentButtonComponent {
  @Input() orderData: any;
  
  loading = false;
  paymentMethod = 'vnpay';

  constructor(private paymentService: PaymentService) {}

  async handlePayment() {
    this.loading = true;
    
    try {
      const result = await this.paymentService.createVNPayPayment({
        orderId: this.orderData.orderId,
        amount: this.orderData.amount,
        orderInfo: `Thanh toan don hang ${this.orderData.orderId}`
      }).toPromise();

      if (result.success) {
        window.location.href = result.paymentUrl;
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Lỗi khi tạo thanh toán');
    } finally {
      this.loading = false;
    }
  }
}
```

## 🔧 Advanced Usage

### 1. Polling cho QR Code Payments

```javascript
const pollPaymentStatus = async (transactionId, maxAttempts = 30) => {
  let attempts = 0;
  
  const poll = async () => {
    if (attempts >= maxAttempts) {
      console.log('Payment timeout');
      return null;
    }

    const result = await paymentService.getTransaction(transactionId);
    
    if (result.data.status === 'completed') {
      return result.data;
    }
    
    if (result.data.status === 'failed') {
      throw new Error('Payment failed');
    }

    attempts++;
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
    return poll();
  };

  return poll();
};

// Usage
const transaction = await paymentService.createTransaction({...});
const qrPayment = await paymentService.createMomoPayment({...});

// Show QR code to user
showQRCode(qrPayment.qrCodeUrl);

// Start polling
const result = await pollPaymentStatus(transaction.data.id);
if (result) {
  showSuccessMessage();
}
```

### 2. WebSocket cho Real-time Updates

```javascript
// Backend: Add socket.io
import { Server } from 'socket.io';

const io = new Server(httpServer, {
  cors: { origin: process.env.CORS_ORIGIN }
});

io.on('connection', (socket) => {
  socket.on('subscribe-transaction', (transactionId) => {
    socket.join(`transaction-${transactionId}`);
  });
});

// Emit khi có update
io.to(`transaction-${transactionId}`).emit('transaction-updated', transaction);

// Frontend
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

socket.emit('subscribe-transaction', transactionId);

socket.on('transaction-updated', (transaction) => {
  if (transaction.status === 'completed') {
    showSuccessMessage();
  }
});
```

## 🔒 Security Best Practices

1. **HTTPS trong Production**: Luôn sử dụng HTTPS
2. **API Keys**: Lưu trong environment variables
3. **CORS**: Chỉ cho phép domains cụ thể
4. **Rate Limiting**: Implement để tránh abuse
5. **Input Validation**: Validate tất cả inputs
6. **Signature Verification**: Verify tất cả callbacks

## 📝 Lưu ý quan trọng

1. **Callback URLs**: Phải public và accessible từ internet
2. **Transaction Storage**: Nên dùng database thay vì file
3. **Error Handling**: Xử lý đầy đủ các trường hợp lỗi
4. **Logging**: Log đầy đủ để debug
5. **Testing**: Test kỹ trên sandbox trước production

## 🎯 Next Steps

1. Thay thế file-based storage bằng database (MongoDB/PostgreSQL)
2. Implement authentication/authorization
3. Add rate limiting
4. Setup monitoring và alerting
5. Implement retry logic cho failed payments
6. Add email notifications
7. Setup CI/CD pipeline

## 📞 Support

Nếu có vấn đề, check:
1. Backend logs trong console
2. Network tab trong browser dev tools
3. Verify environment variables
4. Check payment gateway documentation

# Payment Gateway - Backend cho Website Thương mại điện tử

Hệ thống backend thanh toán tích hợp đầy đủ các cổng thanh toán phổ biến tại Việt Nam và quốc tế.

## 🚀 Tính năng

### Backend Payment Gateway
- ✅ **VNPay** - Cổng thanh toán trực tuyến
- ✅ **Momo** - Ví điện tử Momo  
- ✅ **ZaloPay** - Ví điện tử ZaloPay
- ✅ **ViettelMoney** - Ví điện tử ViettelMoney
- ✅ **PayPal** - Thanh toán quốc tế
- 🔐 Xác thực và bảo mật giao dịch
- 📝 Quản lý giao dịch (CRUD)
- 🔔 Xử lý webhook/callback
- 📊 Thống kê giao dịch

### Frontend Demo (React)
- Giao diện demo tích hợp các phương thức thanh toán
- Quản lý giỏ hàng
- Dashboard quản trị

## 📁 Cấu trúc dự án

```
PaymentGateWay/
├── backend/              # Backend API Server
│   ├── routes/          # API endpoints
│   ├── utils/           # Payment gateway utilities
│   ├── data/            # Transaction storage
│   ├── server.js        # Express server
│   ├── package.json
│   └── README.md        # Backend documentation
│
├── src/                 # Frontend React App (Demo)
│   ├── components/      # React components
│   ├── App.tsx
│   └── main.tsx
│
├── package.json         # Frontend dependencies
└── README.md           # This file
```

## 🛠️ Cài đặt

### Backend API Server

1. **Di chuyển vào thư mục backend:**
```bash
cd backend
```

2. **Cài đặt dependencies:**
```bash
npm install
```

3. **Cấu hình môi trường:**
```bash
cp .env.example .env
```
Sau đó cập nhật các thông tin cấu hình trong file `.env`

4. **Khởi chạy server:**
```bash
npm run dev        # Development mode
npm start          # Production mode
```

Server sẽ chạy tại: `http://localhost:3001`

📚 **Chi tiết API Documentation:** Xem [backend/README.md](backend/README.md)

### Frontend Demo (Optional)

1. **Cài đặt dependencies:**
```bash
npm install
```

2. **Khởi chạy development server:**
```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

3. **Build production:**
```bash
npm run build
```

## 📚 API Endpoints

### Các endpoint chính:

- **VNPay**: `/api/vnpay/*`
- **Momo**: `/api/momo/*`
- **ZaloPay**: `/api/zalopay/*`
- **ViettelMoney**: `/api/viettelmoney/*`
- **PayPal**: `/api/paypal/*`
- **Transactions**: `/api/transactions/*`

### Example: Tạo thanh toán VNPay

```bash
curl -X POST http://localhost:3001/api/vnpay/create \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER123456",
    "amount": 100000,
    "orderInfo": "Thanh toan don hang",
    "bankCode": "NCB"
  }'
```

**Response:**
```json
{
  "success": true,
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
  "message": "Payment URL created successfully"
}
```

## 🔒 Bảo mật

- ✅ Xác thực chữ ký (Signature verification)
- ✅ CORS configuration
- ✅ Environment variables cho sensitive data
- ✅ Request validation

## 🧪 Testing

Tất cả payment gateways hỗ trợ sandbox environment:
- **VNPay**: https://sandbox.vnpayment.vn
- **Momo**: https://test-payment.momo.vn
- **ZaloPay**: https://sb-openapi.zalopay.vn
- **PayPal**: https://www.sandbox.paypal.com

## 🚀 Triển khai Production

1. Cập nhật `.env` với production credentials
2. Đổi sandbox URLs sang production URLs
3. Cấu hình HTTPS
4. Thay file-based storage bằng database
5. Setup monitoring và logging
6. Implement rate limiting

## 📖 Tài liệu

- [Backend API Documentation](backend/README.md) - Chi tiết đầy đủ về APIs
- [VNPay Documentation](https://sandbox.vnpayment.vn/apis/)
- [Momo Documentation](https://developers.momo.vn/)
- [ZaloPay Documentation](https://docs.zalopay.vn/)
- [PayPal Documentation](https://developer.paypal.com/)

## 🤝 Tích hợp

Backend này có thể tích hợp với bất kỳ frontend nào (React, Vue, Angular, mobile app) thông qua REST APIs.

### Example tích hợp React:

```javascript
const createPayment = async () => {
  const response = await fetch('http://localhost:3001/api/vnpay/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: 'ORDER123',
      amount: 100000,
      orderInfo: 'Payment for order'
    })
  });
  const data = await response.json();
  if (data.success) {
    window.location.href = data.paymentUrl;
  }
};
```

## 📝 Lưu ý

- Backend sử dụng file-based storage cho demo. Trong production nên dùng database.
- Luôn test trên sandbox trước khi deploy production.
- Không commit file `.env` vào git.
- Callback URLs phải accessible công khai trong production.

## 📄 License

ISC

---

**Happy Coding! 🎉**

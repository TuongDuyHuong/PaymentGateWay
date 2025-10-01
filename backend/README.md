# Payment Gateway Backend

Backend thanh toán cho website thương mại điện tử, hỗ trợ nhiều cổng thanh toán phổ biến tại Việt Nam và quốc tế.

## 🚀 Tính năng

### Cổng thanh toán được hỗ trợ:
- ✅ **VNPay** - Cổng thanh toán trực tuyến phổ biến nhất Việt Nam
- ✅ **Momo** - Ví điện tử Momo
- ✅ **ZaloPay** - Ví điện tử ZaloPay
- ✅ **ViettelMoney** - Ví điện tử ViettelMoney
- ✅ **PayPal** - Thanh toán quốc tế

### Chức năng chính:
- 🔐 Xác thực và bảo mật giao dịch
- 📝 Quản lý giao dịch (CRUD operations)
- 🔔 Xử lý webhook/callback từ cổng thanh toán
- 📊 Thống kê giao dịch
- 🔍 Tra cứu trạng thái giao dịch

## 📋 Yêu cầu hệ thống

- Node.js >= 18.0.0
- npm hoặc yarn

## 🛠️ Cài đặt

### 1. Di chuyển vào thư mục backend:
```bash
cd backend
```

### 2. Cài đặt dependencies:
```bash
npm install
```

### 3. Cấu hình môi trường:
Tạo file `.env` từ file mẫu:
```bash
cp .env.example .env
```

Sau đó cập nhật các thông tin cấu hình trong file `.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5173

# VNPay Configuration
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_HASH_SECRET=your_vnpay_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3001/api/vnpay/callback

# Momo Configuration
MOMO_PARTNER_CODE=your_momo_partner_code
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_RETURN_URL=http://localhost:3001/api/momo/callback

# ... (các cấu hình khác)
```

### 4. Khởi chạy server:

**Development mode (với auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server sẽ chạy tại: `http://localhost:3001`

## 📚 API Documentation

### Health Check
```http
GET /health
```
Kiểm tra trạng thái server.

### VNPay APIs

#### 1. Tạo URL thanh toán VNPay
```http
POST /api/vnpay/create
Content-Type: application/json

{
  "orderId": "ORDER123456",
  "amount": 100000,
  "orderInfo": "Thanh toan don hang ORDER123456",
  "bankCode": "NCB",
  "locale": "vn"
}
```

**Response:**
```json
{
  "success": true,
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
  "message": "Payment URL created successfully"
}
```

#### 2. Callback từ VNPay
```http
GET /api/vnpay/callback?vnp_Amount=...&vnp_BankCode=...
```

#### 3. Tra cứu giao dịch VNPay
```http
POST /api/vnpay/query
Content-Type: application/json

{
  "orderId": "ORDER123456",
  "transactionDate": "20240101123000"
}
```

### Momo APIs

#### 1. Tạo thanh toán Momo
```http
POST /api/momo/create
Content-Type: application/json

{
  "orderId": "ORDER123456",
  "amount": 100000,
  "orderInfo": "Thanh toan don hang ORDER123456",
  "extraData": ""
}
```

**Response:**
```json
{
  "success": true,
  "payUrl": "https://test-payment.momo.vn/...",
  "deeplink": "momo://...",
  "qrCodeUrl": "https://...",
  "message": "Payment created successfully"
}
```

#### 2. Callback từ Momo
```http
GET /api/momo/callback?orderId=...&resultCode=...
```

#### 3. Webhook từ Momo
```http
POST /api/momo/notify
```

### ZaloPay APIs

#### 1. Tạo thanh toán ZaloPay
```http
POST /api/zalopay/create
Content-Type: application/json

{
  "orderId": "ORDER123456",
  "amount": 100000,
  "description": "Thanh toan don hang ORDER123456",
  "items": [],
  "bankCode": ""
}
```

**Response:**
```json
{
  "success": true,
  "orderUrl": "https://sbgateway.zalopay.vn/...",
  "appTransId": "240101_ORDER123456",
  "message": "Payment created successfully"
}
```

#### 2. Callback từ ZaloPay
```http
POST /api/zalopay/callback
```

### ViettelMoney APIs

#### 1. Tạo thanh toán ViettelMoney
```http
POST /api/viettelmoney/create
Content-Type: application/json

{
  "orderId": "ORDER123456",
  "amount": 100000,
  "orderInfo": "Thanh toan don hang ORDER123456",
  "providerCode": "viettelmoney"
}
```

#### 2. Callback từ ViettelMoney
```http
POST /api/viettelmoney/callback
```

### PayPal APIs

#### 1. Tạo đơn hàng PayPal
```http
POST /api/paypal/create
Content-Type: application/json

{
  "amount": 10.00,
  "currency": "USD",
  "orderId": "ORDER123456",
  "description": "Purchase from website"
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "5O190127TN364715T",
  "approveUrl": "https://www.sandbox.paypal.com/checkoutnow?token=...",
  "message": "PayPal order created successfully"
}
```

#### 2. Xác nhận thanh toán PayPal
```http
POST /api/paypal/capture/:orderId
```

#### 3. Lấy thông tin đơn hàng
```http
GET /api/paypal/order/:orderId
```

### Transaction Management APIs

#### 1. Lấy danh sách giao dịch
```http
GET /api/transactions?status=completed&paymentMethod=vnpay
```

**Query Parameters:**
- `status`: pending, completed, failed, refunded
- `paymentMethod`: vnpay, momo, zalopay, viettelmoney, paypal
- `startDate`: ISO date string
- `endDate`: ISO date string

#### 2. Lấy chi tiết giao dịch
```http
GET /api/transactions/:id
```

#### 3. Tạo giao dịch mới
```http
POST /api/transactions
Content-Type: application/json

{
  "orderId": "ORDER123456",
  "amount": 100000,
  "currency": "VND",
  "paymentMethod": "vnpay",
  "customerName": "Nguyen Van A",
  "customerEmail": "customer@example.com",
  "items": [],
  "metadata": {}
}
```

#### 4. Cập nhật trạng thái giao dịch
```http
PATCH /api/transactions/:id
Content-Type: application/json

{
  "status": "completed",
  "paymentDetails": {
    "transactionId": "TXN123456",
    "bankCode": "NCB"
  }
}
```

#### 5. Xóa giao dịch
```http
DELETE /api/transactions/:id
```

#### 6. Thống kê giao dịch
```http
GET /api/transactions/stats/summary
```

## 🔒 Bảo mật

### Xác thực chữ ký (Signature)
Tất cả callback/webhook từ cổng thanh toán đều được xác thực chữ ký để đảm bảo tính xác thực và toàn vẹn dữ liệu.

### CORS
CORS được cấu hình để chỉ cho phép requests từ domain được chỉ định trong biến môi trường `CORS_ORIGIN`.

### Environment Variables
Các thông tin nhạy cảm (API keys, secrets) được lưu trong file `.env` và không được commit vào git.

## 🧪 Testing

### Test với Sandbox Environment

Tất cả các cổng thanh toán đều hỗ trợ môi trường sandbox để test:

**VNPay Sandbox:**
- URL: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
- Test cards: [VNPay Test Guide](https://sandbox.vnpayment.vn/apis/docs/huong-dan-tich-hop/)

**Momo Sandbox:**
- URL: https://test-payment.momo.vn
- Test account: Sử dụng app Momo test

**ZaloPay Sandbox:**
- URL: https://sb-openapi.zalopay.vn
- Test guide: [ZaloPay Docs](https://docs.zalopay.vn/)

**PayPal Sandbox:**
- URL: https://www.sandbox.paypal.com
- Create test accounts: [PayPal Developer](https://developer.paypal.com/)

## 📁 Cấu trúc thư mục

```
backend/
├── config/              # Configuration files
├── controllers/         # Request handlers
├── routes/             # API routes
│   ├── vnpay.routes.js
│   ├── momo.routes.js
│   ├── zalopay.routes.js
│   ├── viettelmoney.routes.js
│   ├── paypal.routes.js
│   └── transaction.routes.js
├── utils/              # Utility functions
│   ├── vnpay.util.js
│   ├── momo.util.js
│   └── zalopay.util.js
├── services/           # Business logic
├── data/              # File-based storage (for demo)
├── .env.example       # Environment variables example
├── server.js          # Entry point
└── package.json
```

## 🔄 Flow thanh toán

### 1. VNPay Flow
```
1. Frontend → POST /api/vnpay/create → Backend tạo payment URL
2. Backend → Response payment URL → Frontend
3. Frontend redirect user → VNPay payment page
4. User thanh toán → VNPay
5. VNPay → Redirect callback → Backend /api/vnpay/callback
6. Backend xác thực → Update transaction → Response
7. Backend redirect → Frontend success page
```

### 2. Momo/ZaloPay Flow
```
1. Frontend → POST /api/momo/create → Backend tạo payment request
2. Backend → Call Momo API → Nhận payUrl/QR code
3. Backend → Response payUrl → Frontend
4. User quét QR hoặc click payUrl → Momo app
5. User xác nhận → Momo
6. Momo → Callback → Backend /api/momo/callback
7. Backend → Update transaction → Response
```

### 3. PayPal Flow
```
1. Frontend → POST /api/paypal/create → Backend tạo order
2. Backend → Call PayPal API → Nhận approve URL
3. Backend → Response approve URL → Frontend
4. User click approve URL → PayPal login & approve
5. PayPal → Redirect → Backend /api/paypal/success
6. Backend → POST /api/paypal/capture → Capture payment
7. Backend → Update transaction → Redirect frontend
```

## 🚀 Triển khai Production

### 1. Cập nhật environment variables
Thay đổi các giá trị trong `.env` từ sandbox sang production:
- VNPay: Sử dụng production URL và credentials
- Momo: Sử dụng production endpoint
- ZaloPay: Sử dụng production endpoint
- PayPal: Set `PAYPAL_MODE=live`

### 2. Cấu hình HTTPS
Đảm bảo server chạy trên HTTPS trong production.

### 3. Database
Thay thế file-based storage bằng database thực (MongoDB, PostgreSQL, MySQL).

### 4. Monitoring & Logging
- Implement proper logging system
- Setup monitoring và alerting
- Track payment failures và errors

### 5. Rate Limiting
Implement rate limiting để tránh abuse.

## 📝 Lưu ý

1. **Sandbox Testing**: Luôn test kỹ trên sandbox trước khi đưa vào production.

2. **Credentials Security**: Không bao giờ commit API keys/secrets vào git.

3. **Callback URL**: Đảm bảo callback URL có thể truy cập công khai (không localhost trong production).

4. **Transaction Storage**: Demo này sử dụng file-based storage. Trong production nên dùng database.

5. **Error Handling**: Xử lý đầy đủ các trường hợp lỗi từ payment gateways.

6. **Webhook Security**: Luôn verify signature của webhook để tránh giả mạo.

## 🤝 Tích hợp với Frontend

### Example: Tạo thanh toán VNPay từ React

```javascript
const handleVNPayPayment = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/vnpay/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: 'ORDER123456',
        amount: 100000,
        orderInfo: 'Thanh toan don hang',
        bankCode: 'NCB'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Redirect to payment URL
      window.location.href = data.paymentUrl;
    }
  } catch (error) {
    console.error('Payment error:', error);
  }
};
```

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs trong console
2. Verify environment variables
3. Test với sandbox credentials trước
4. Đọc documentation của từng payment gateway

## 📄 License

ISC

## 👥 Contributors

Phát triển bởi Payment Gateway Team

---

**Chúc bạn tích hợp thành công! 🎉**

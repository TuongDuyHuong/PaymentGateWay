# API Testing Examples

Các ví dụ để test API endpoints của Payment Gateway Backend.

## Chuẩn bị

Đảm bảo backend đang chạy tại `http://localhost:3001`

```bash
cd backend
npm start
```

## 1. Health Check

```bash
curl http://localhost:3001/health
```

## 2. Transaction APIs

### Tạo giao dịch mới
```bash
curl -X POST http://localhost:3001/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER123456",
    "amount": 100000,
    "currency": "VND",
    "paymentMethod": "vnpay",
    "customerName": "Nguyen Van A",
    "customerEmail": "customer@example.com",
    "items": [
      {
        "id": "PROD001",
        "name": "Product A",
        "price": 50000,
        "quantity": 2
      }
    ]
  }'
```

### Lấy danh sách giao dịch
```bash
curl http://localhost:3001/api/transactions
```

### Lấy giao dịch theo ID
```bash
curl http://localhost:3001/api/transactions/TXN_1234567890
```

### Cập nhật trạng thái giao dịch
```bash
curl -X PATCH http://localhost:3001/api/transactions/TXN_1234567890 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "paymentDetails": {
      "transactionId": "VNPAY_TXN123",
      "bankCode": "NCB"
    }
  }'
```

### Thống kê giao dịch
```bash
curl http://localhost:3001/api/transactions/stats/summary
```

## 3. VNPay APIs

### Tạo URL thanh toán VNPay
```bash
curl -X POST http://localhost:3001/api/vnpay/create \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER123456",
    "amount": 100000,
    "orderInfo": "Thanh toan don hang ORDER123456",
    "bankCode": "NCB",
    "locale": "vn"
  }'
```

### Tra cứu giao dịch VNPay
```bash
curl -X POST http://localhost:3001/api/vnpay/query \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER123456",
    "transactionDate": "20240101120000"
  }'
```

## 4. Momo APIs

### Tạo thanh toán Momo
```bash
curl -X POST http://localhost:3001/api/momo/create \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER123456",
    "amount": 100000,
    "orderInfo": "Thanh toan don hang ORDER123456",
    "extraData": ""
  }'
```

### Tra cứu giao dịch Momo
```bash
curl -X POST http://localhost:3001/api/momo/query \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER123456",
    "requestId": "MOMO_REQ123"
  }'
```

## 5. ZaloPay APIs

### Tạo thanh toán ZaloPay
```bash
curl -X POST http://localhost:3001/api/zalopay/create \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER123456",
    "amount": 100000,
    "description": "Thanh toan don hang ORDER123456",
    "items": [
      {
        "itemid": "PROD001",
        "itemname": "Product A",
        "itemprice": 50000,
        "itemquantity": 2
      }
    ]
  }'
```

### Tra cứu giao dịch ZaloPay
```bash
curl -X POST http://localhost:3001/api/zalopay/query \
  -H "Content-Type: application/json" \
  -d '{
    "appTransId": "240101_ORDER123456"
  }'
```

## 6. ViettelMoney APIs

### Tạo thanh toán ViettelMoney
```bash
curl -X POST http://localhost:3001/api/viettelmoney/create \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER123456",
    "amount": 100000,
    "orderInfo": "Thanh toan don hang ORDER123456",
    "providerCode": "viettelmoney"
  }'
```

### Tra cứu giao dịch ViettelMoney
```bash
curl -X POST http://localhost:3001/api/viettelmoney/query \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER123456",
    "requestId": "VTM_REQ123"
  }'
```

## 7. PayPal APIs

### Tạo đơn hàng PayPal
```bash
curl -X POST http://localhost:3001/api/paypal/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10.00,
    "currency": "USD",
    "orderId": "ORDER123456",
    "description": "Purchase from website"
  }'
```

### Lấy thông tin đơn hàng PayPal
```bash
curl http://localhost:3001/api/paypal/order/PAYPAL_ORDER_ID
```

### Capture thanh toán PayPal
```bash
curl -X POST http://localhost:3001/api/paypal/capture/PAYPAL_ORDER_ID
```

## Testing với Postman

Import collection này vào Postman để test dễ dàng hơn:

### Tạo Environment trong Postman:
- Variable: `baseUrl`
- Value: `http://localhost:3001`

### Example Request trong Postman:

**Create Transaction**
- Method: POST
- URL: `{{baseUrl}}/api/transactions`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "orderId": "ORDER123456",
  "amount": 100000,
  "currency": "VND",
  "paymentMethod": "vnpay",
  "customerName": "Nguyen Van A",
  "customerEmail": "customer@example.com"
}
```

## Testing với JavaScript/Fetch

```javascript
// Example: Create VNPay payment
const createVNPayPayment = async () => {
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
    console.log('Payment URL:', data.paymentUrl);
    
    if (data.success) {
      // Redirect to payment
      window.location.href = data.paymentUrl;
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Lưu ý

1. Thay thế các credentials demo trong file `.env` bằng credentials thật từ các payment gateway
2. Các endpoint callback/webhook cần được public và accessible từ internet trong production
3. Test kỹ trên sandbox trước khi chuyển sang production
4. Verify signature của tất cả callback/webhook để đảm bảo bảo mật

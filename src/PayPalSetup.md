# PayPal Integration Setup Guide

## Bước 1: Tạo PayPal Business App

### 1.1. Đăng nhập PayPal Developer
- Truy cập: https://developer.paypal.com
- Đăng nhập bằng tài khoản: paypal.me/NguyenMy2004

### 1.2. Tạo Application
1. Vào "My Apps & Credentials"
2. Chọn "Live" environment (không phải Sandbox)
3. Click "Create App"
4. Điền thông tin:
   - **App Name**: "HELIOS Jewelry Store"
   - **Merchant**: Chọn tài khoản business của bạn
   - **Features**: Check "Accept Payments"

### 1.3. Lấy Credentials
Sau khi tạo app, bạn sẽ có:
- **Client ID**: (ví dụ: AYaAhWTk7e6LWdRvfbNbIhHLztC7wlE7...)
- **Client Secret**: (bảo mật, chỉ dùng server-side)

## Bước 2: Cấu hình Website

### 2.1. Thay thế Client ID
Trong file `/components/PayPalButton.tsx`, thay:
```javascript
script.src = `https://www.paypal.com/sdk/js?client-id=sb&currency=USD...`
```

Thành:
```javascript
script.src = `https://www.paypal.com/sdk/js?client-id=YOUR_LIVE_CLIENT_ID&currency=USD...`
```

### 2.2. Domain Verification
Trong PayPal App settings:
- **Return URL**: `https://yourdomain.com/payment-success`
- **Cancel URL**: `https://yourdomain.com/payment-cancel`
- **Webhook URL**: `https://yourdomain.com/api/paypal-webhook`

## Bước 3: Webhooks (Tùy chọn)

### 3.1. Tạo Webhook Endpoint
Để nhận thông báo payment status từ PayPal:
- URL: `https://yourdomain.com/api/paypal-webhook`
- Events: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`

### 3.2. Verify Webhook
PayPal sẽ gửi webhook signature để verify tính xác thực.

## Bước 4: Testing & Go Live

### 4.1. Test với Sandbox
- Sử dụng Sandbox Client ID để test
- Tạo test buyer account trong PayPal Sandbox

### 4.2. Go Live
- Thay Sandbox Client ID bằng Live Client ID
- Verify domain và app trong PayPal

## Thông tin cần cung cấp:

1. **Live PayPal Client ID** - Để thay thế "sb" trong code
2. **Domain name** - Để setup return/cancel URLs
3. **Business verification** - PayPal có thể yêu cầu verify business

## Lưu ý quan trọng:

- **Client ID** là public, có thể để trong frontend
- **Client Secret** phải bảo mật, chỉ dùng server-side
- **Sandbox** để test, **Live** để production
- Cần verify domain trước khi go live
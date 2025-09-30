# 📧 Hướng dẫn cấu hình EmailJS cho AGUST Jewelry

## Tổng quan
Hệ thống email của AGUST Jewelry sử dụng EmailJS để gửi email thông báo tự động cho khách hàng khi:
1. Khách hàng xác nhận đã chuyển khoản (Email chờ xác nhận)
2. Admin duyệt thanh toán (Email xác nhận thanh toán)
3. Admin cập nhật trạng thái đơn hàng

## Bước 1: Đăng ký tài khoản EmailJS

1. Truy cập https://www.emailjs.com/
2. Đăng ký tài khoản mới với email: **nguyenmy2004@gmail.com**
3. Xác nhận email và đăng nhập

## Bước 2: Tạo Email Service

1. Trong dashboard, chọn **"Add New Service"**
2. Chọn **Gmail** (hoặc email provider bạn muốn)
3. Nhập thông tin:
   - **Service Name**: `AGUST Jewelry Gmail`
   - **Email**: `nguyenmy2004@gmail.com`
   - **Password**: Mật khẩu ứng dụng Gmail (tạo trong Google Account Settings)
4. Test connection và lưu
5. **Lưu Service ID** (ví dụ: `service_agust2024`)

## Bước 3: Tạo Email Template

1. Chọn **"Create New Template"**
2. Cấu hình template:

### Template Settings:
- **Template Name**: `AGUST Order Notification`
- **Subject**: `{{subject}}`

### Email Content:
```
Kính chào {{to_name}},

{{message_content}}

Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ:
📞 Hotline: 0981 654 346
📧 Email: support@agust.vn

Trân trọng,
{{from_name}}
---
AGUST Jewelry - Trang sức bạc S925 cao cấp
Website: https://agust.vn
```

### Template Variables cần thiết:
- `{{to_name}}` - Tên khách hàng
- `{{subject}}` - Tiêu đề email  
- `{{message_content}}` - Nội dung chi tiết
- `{{from_name}}` - Tên người gửi (AGUST Jewelry)

3. Test template và lưu
4. **Lưu Template ID** (ví dụ: `template_agust`)

## Bước 4: Lấy Public Key

1. Vào **Account > API Keys**
2. **Copy Public Key** (ví dụ: `yIaRLYJ5wZqNcKQpb`)

## Bước 5: Cập nhật code

Mở file `/components/EmailService.tsx` và cập nhật 2 phần:

### 5.1. Cập nhật thông tin EmailJS:
```typescript
// EmailJS Configuration - THAY ĐỔI CÁC GIÁ TRỊ NÀY
private static readonly SERVICE_ID = 'service_abc123';    // Thay bằng Service ID thật từ EmailJS
private static readonly TEMPLATE_ID = 'template_xyz456';  // Thay bằng Template ID thật từ EmailJS  
private static readonly PUBLIC_KEY = 'user_def789';      // Thay bằng Public Key thật từ EmailJS
```

### 5.2. Tắt Demo Mode:
```typescript
// Demo mode - ĐỔI THÀNH FALSE ĐỂ KÍCH HOẠT EMAIL THẬT
private static readonly DEMO_MODE = false;  // Đổi từ true thành false
```

## Bước 6: Test hệ thống

### 6.1. Test Demo Mode (Hiện tại):
1. Đăng nhập admin với: `Agust2004@gmail.com` / `hihihoho`
2. Vào **"📧 Email"** trong header admin
3. Nhập email test và tên khách hàng
4. Bấm **"Gửi email test (Demo mode)"**
5. Kiểm tra console log để xem nội dung email demo

### 6.2. Test Email thật (Sau khi setup):
1. Hoàn thành các bước 1-5 ở trên
2. Refresh trang web
3. Vào trang Email Demo, sẽ thấy trạng thái "✅ EmailJS đã được cấu hình"
4. Test gửi email và kiểm tra hộp thư thật

## Các loại email được gửi

### 1. Email chờ xác nhận (pending_confirmation)
**Khi nào**: Khách hàng bấm "Đã chuyển khoản thành công"
**Nội dung**: Thông báo đã nhận yêu cầu, đang chờ xác nhận từ admin

### 2. Email xác nhận thanh toán (payment_confirmed) 
**Khi nào**: Admin bấm "Duyệt - Hoàn thành" 
**Nội dung**: Xác nhận thanh toán thành công, đơn hàng sẽ được giao

### 3. Email cập nhật trạng thái (order_status_update)
**Khi nào**: Admin thay đổi trạng thái đơn hàng
**Nội dung**: Thông báo trạng thái mới của đơn hàng

## Giới hạn EmailJS

- **Tài khoản miễn phí**: 200 email/tháng
- **Tài khoản trả phí**: Không giới hạn (từ $15/tháng)

## Troubleshooting

### Lỗi "Failed to send email"
1. Kiểm tra Service ID, Template ID, Public Key
2. Kiểm tra template variables
3. Kiểm tra console để xem lỗi chi tiết

### Lỗi Gmail authentication
1. Bật 2-Step Verification trong Google Account
2. Tạo App Password cho EmailJS
3. Sử dụng App Password thay vì mật khẩu thường

### Email không đến
1. Kiểm tra thư mục Spam/Junk
2. Kiểm tra Email Quotas trong EmailJS dashboard
3. Kiểm tra Template format

## Security Notes

- Public Key có thể public, không cần che giấu
- Service ID và Template ID cũng có thể public
- Không bao giờ để lộ Gmail password thật
- Chỉ sử dụng App Password cho EmailJS

## Support

Nếu cần hỗ trợ:
- EmailJS Documentation: https://www.emailjs.com/docs/
- Support: support@emailjs.com
- AGUST Tech Support: support@agust.vn
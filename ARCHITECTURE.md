# Kiến trúc Hệ thống Payment Gateway

## 📐 Sơ đồ kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   React      │  │   Vue.js     │  │   Angular    │         │
│  │   App        │  │   App        │  │   App        │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                 │
│                            │                                     │
│                   HTTP/HTTPS REST APIs                          │
└────────────────────────────┼──────────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────────┐
│                   API GATEWAY LAYER                             │
│                            │                                     │
│         ┌──────────────────▼──────────────────┐                │
│         │   Express.js Server (Port 3001)     │                │
│         │   • CORS Protection                  │                │
│         │   • Request Validation               │                │
│         │   • Error Handling                   │                │
│         │   • Logging                          │                │
│         └──────────────────┬──────────────────┘                │
└────────────────────────────┼──────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
┌─────────▼────────┐  ┌──────▼──────┐  ┌──────▼──────┐
│   VNPay Routes   │  │Momo Routes  │  │Transaction  │
│   • create       │  │• create     │  │Routes       │
│   • callback     │  │• callback   │  │• CRUD ops   │
│   • ipn          │  │• notify     │  │• stats      │
│   • query        │  │• query      │  │• filters    │
└─────────┬────────┘  └──────┬──────┘  └──────┬──────┘
          │                  │                  │
┌─────────▼────────┐  ┌──────▼──────┐  ┌──────▼──────┐
│ZaloPay Routes    │  │ViettelMoney │  │PayPal Routes│
│• create          │  │Routes       │  │• create     │
│• callback        │  │• create     │  │• capture    │
│• query           │  │• callback   │  │• webhook    │
└─────────┬────────┘  └──────┬──────┘  └──────┬──────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                          │
│         ┌──────────────────▼──────────────────┐                │
│         │       Payment Utilities              │                │
│         │  ┌────────────────────────────────┐ │                │
│         │  │  VNPayUtil                     │ │                │
│         │  │  • signature generation        │ │                │
│         │  │  • signature verification      │ │                │
│         │  │  • payment URL creation        │ │                │
│         │  └────────────────────────────────┘ │                │
│         │  ┌────────────────────────────────┐ │                │
│         │  │  MomoUtil                      │ │                │
│         │  │  • HMAC SHA256 signature       │ │                │
│         │  │  • payment request creation    │ │                │
│         │  │  • callback verification       │ │                │
│         │  └────────────────────────────────┘ │                │
│         │  ┌────────────────────────────────┐ │                │
│         │  │  ZaloPayUtil                   │ │                │
│         │  │  • signature with KEY1/KEY2    │ │                │
│         │  │  • order creation              │ │                │
│         │  │  • callback verification       │ │                │
│         │  └────────────────────────────────┘ │                │
│         └─────────────────────────────────────┘                │
└────────────────────────────┬──────────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────────┐
│                   DATA LAYER                                    │
│         ┌──────────────────▼──────────────────┐                │
│         │   Transaction Storage               │                │
│         │   ┌──────────────┐  ┌────────────┐ │                │
│         │   │ File-based   │  │ MongoDB    │ │                │
│         │   │ (Demo)       │  │ (Prod)     │ │                │
│         │   └──────────────┘  └────────────┘ │                │
│         └─────────────────────────────────────┘                │
└────────────────────────────┬──────────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────────┐
│              EXTERNAL PAYMENT GATEWAYS                          │
│                            │                                     │
│   ┌────────────────────────┼────────────────────────┐          │
│   │           │            │            │           │          │
│ ┌─▼───────┐ ┌▼────────┐ ┌▼────────┐ ┌▼─────────┐ ┌▼───────┐  │
│ │ VNPay   │ │  Momo   │ │ ZaloPay │ │Viettel   │ │ PayPal │  │
│ │ API     │ │  API    │ │  API    │ │Money API │ │  API   │  │
│ └─┬───────┘ └┬────────┘ └┬────────┘ └┬─────────┘ └┬───────┘  │
│   │          │           │           │            │           │
│   │ Callbacks│ Webhooks  │ Callbacks │ Callbacks  │Webhooks  │
│   │          │           │           │            │           │
│   └──────────┴───────────┴───────────┴────────────┴───────┐   │
└──────────────────────────────────────────────────────────┼───┘
                                                            │
                          Async Notifications ◄─────────────┘
```

## 🔄 Luồng xử lý thanh toán chi tiết

### 1. VNPay Payment Flow

```
User Action                Backend Process              VNPay
─────────────────────────────────────────────────────────────
1. Click "Thanh toán"
                          ──────►
2. Gọi /api/vnpay/create           
                                Tạo signature với HASH_SECRET
                                Tạo payment URL
                          ◄──────
3. Nhận payment URL
4. Redirect ─────────────────────────────────────► Load form
5. Nhập thông tin thẻ                               Xử lý TT
6.                        ◄──────────────────────── Callback
                                Verify signature
                                Update transaction
                                Response thành công
7. Redirect về success page
```

### 2. Momo QR Payment Flow

```
User Action                Backend Process              Momo
─────────────────────────────────────────────────────────────
1. Click "Momo"
                          ──────►
2. Gọi /api/momo/create           
                                Tạo HMAC SHA256 signature
                                Gọi Momo API
                          ◄──────────────────────────► Create
                                Nhận QR code URL
3. Hiển thị QR code       ◄──────
4. Quét QR với Momo app ─────────────────────────────► Verify
5. Xác nhận thanh toán                                  Process
6.                        ◄──────────────────────────  Webhook
                                Verify signature
                                Update transaction
7. Poll/WebSocket check status
                          ◄──────
8. Nhận success status
```

### 3. PayPal Payment Flow

```
User Action                Backend Process              PayPal
─────────────────────────────────────────────────────────────
1. Click "PayPal"
                          ──────►
2. Gọi /api/paypal/create         
                                Get access token
                                Create order
                          ◄──────────────────────────► Create
                                Nhận approve URL
3. Redirect               ◄──────
4. Login PayPal ─────────────────────────────────────► Auth
5. Approve payment                                      Verify
6.                        ◄──────────────────────────  Return
                                Capture payment
                                Update transaction
7. Redirect về success
```

## 📦 Component Architecture

```
backend/
│
├── server.js                 # Entry point, Express setup
│   ├── Middleware:
│   │   ├── CORS
│   │   ├── Body Parser
│   │   ├── Error Handler
│   │   └── Logger
│   │
│   └── Routes Registration
│
├── routes/                   # API Endpoints
│   ├── vnpay.routes.js      # VNPay endpoints
│   ├── momo.routes.js       # Momo endpoints
│   ├── zalopay.routes.js    # ZaloPay endpoints
│   ├── viettelmoney.routes.js
│   ├── paypal.routes.js     # PayPal endpoints
│   └── transaction.routes.js # Transaction CRUD
│
├── utils/                    # Business Logic
│   ├── vnpay.util.js        # VNPay helpers
│   ├── momo.util.js         # Momo helpers
│   └── zalopay.util.js      # ZaloPay helpers
│
├── services/                 # External Services (Future)
│   ├── email.service.js
│   ├── notification.service.js
│   └── analytics.service.js
│
├── models/                   # Data Models (Future)
│   ├── transaction.model.js
│   └── user.model.js
│
├── config/                   # Configuration
│   ├── database.js
│   └── payment.js
│
└── data/                     # File-based Storage (Demo)
    └── transactions.json
```

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────┐
│              Security Layers                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. Transport Layer Security                        │
│     ├── HTTPS/TLS 1.3                              │
│     └── SSL Certificates                            │
│                                                     │
│  2. API Security                                    │
│     ├── CORS Configuration                          │
│     ├── Rate Limiting (Future)                      │
│     └── Request Validation                          │
│                                                     │
│  3. Authentication & Authorization (Future)         │
│     ├── JWT Tokens                                  │
│     ├── API Keys                                    │
│     └── OAuth 2.0                                   │
│                                                     │
│  4. Payment Security                                │
│     ├── Signature Verification                      │
│     │   ├── VNPay: HMAC SHA512                     │
│     │   ├── Momo: HMAC SHA256                      │
│     │   ├── ZaloPay: HMAC SHA256                   │
│     │   └── PayPal: OAuth 2.0                      │
│     └── Callback Verification                       │
│                                                     │
│  5. Data Security                                   │
│     ├── Environment Variables                       │
│     ├── Secret Management                           │
│     └── Database Encryption                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## ⚡ Performance Optimization

```
Optimization Strategies:
│
├── Caching Layer (Future)
│   ├── Redis for session/token
│   └── Cache payment gateway responses
│
├── Database Optimization
│   ├── Indexes on frequently queried fields
│   ├── Connection pooling
│   └── Query optimization
│
├── Load Balancing (Production)
│   ├── Multiple server instances
│   ├── Nginx load balancer
│   └── Auto-scaling
│
└── CDN Integration
    └── Static assets delivery
```

## 🔄 Deployment Architecture

```
                    ┌──────────────┐
                    │   CloudFlare │
                    │   CDN + DDoS │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │    Nginx     │
                    │  Load Balancer│
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌─────▼─────┐     ┌─────▼─────┐
   │ Server 1│       │ Server 2  │     │ Server 3  │
   │ PM2      │       │ PM2       │     │ PM2       │
   │ Backend  │       │ Backend   │     │ Backend   │
   └────┬────┘       └─────┬─────┘     └─────┬─────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼───────┐
                    │   Database   │
                    │   MongoDB    │
                    │   Master     │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌─────▼─────┐     ┌─────▼─────┐
   │ Replica1│       │ Replica 2 │     │ Replica 3 │
   └─────────┘       └───────────┘     └───────────┘
```

## 📊 Monitoring Architecture

```
Application Metrics:
├── PM2 Dashboard
│   ├── CPU Usage
│   ├── Memory Usage
│   ├── Request Rate
│   └── Error Rate
│
├── Winston Logging
│   ├── Error Logs
│   ├── Access Logs
│   └── Payment Logs
│
├── APM Tools (Optional)
│   ├── New Relic
│   ├── DataDog
│   └── Sentry
│
└── Custom Analytics
    ├── Payment Success Rate
    ├── Gateway Response Times
    └── Transaction Volume
```

## 🎯 Scalability Plan

```
Phase 1: Current (Single Server)
    └── File-based storage
    └── Single Express instance

Phase 2: Horizontal Scaling
    ├── Multiple server instances
    ├── Load balancer
    └── Shared MongoDB

Phase 3: Microservices
    ├── Payment Service
    ├── Transaction Service
    ├── Notification Service
    └── Analytics Service

Phase 4: Cloud Native
    ├── Kubernetes orchestration
    ├── Auto-scaling pods
    ├── Service mesh
    └── Distributed tracing
```

---

**Kiến trúc hiện tại đơn giản nhưng có thể mở rộng theo nhu cầu! 🚀**

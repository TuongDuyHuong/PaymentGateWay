# Hướng dẫn Deploy Production

Hướng dẫn chi tiết để deploy Payment Gateway Backend lên production.

## 📋 Chuẩn bị

### 1. Đăng ký Accounts

Đăng ký và cấu hình accounts ở các payment gateways:

#### VNPay
- Website: https://vnpay.vn
- Đăng ký merchant account
- Nhận `TMN_CODE` và `HASH_SECRET`
- Cấu hình callback URL

#### Momo
- Website: https://business.momo.vn
- Đăng ký business account
- Nhận `PARTNER_CODE`, `ACCESS_KEY`, `SECRET_KEY`
- Cấu hình IPN URL

#### ZaloPay
- Website: https://zalopay.vn/business
- Đăng ký merchant
- Nhận `APP_ID`, `KEY1`, `KEY2`
- Cấu hình callback URL

#### ViettelMoney
- Liên hệ: https://viettelmoney.vn
- Đăng ký doanh nghiệp
- Nhận credentials

#### PayPal
- Website: https://developer.paypal.com
- Tạo app trong dashboard
- Nhận `CLIENT_ID` và `CLIENT_SECRET`
- Switch từ sandbox sang live

### 2. Database Setup (Recommended)

Thay thế file-based storage bằng database thật:

#### Option A: MongoDB

```bash
# Install mongoose
npm install mongoose

# Create database connection
// config/database.js
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create Transaction model
// models/Transaction.js
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'VND' },
  paymentMethod: { type: String, required: true },
  customerName: String,
  customerEmail: String,
  items: Array,
  metadata: Object,
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDetails: Object
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);
```

#### Option B: PostgreSQL

```bash
# Install pg
npm install pg

# Create connection
// config/database.js
import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Create tables
CREATE TABLE transactions (
  id VARCHAR(50) PRIMARY KEY,
  order_id VARCHAR(100) UNIQUE NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'VND',
  payment_method VARCHAR(50) NOT NULL,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  items JSONB,
  metadata JSONB,
  status VARCHAR(20) DEFAULT 'pending',
  payment_details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Deployment Options

### Option 1: VPS/Dedicated Server (DigitalOcean, AWS EC2, etc.)

#### 1. Setup Server

```bash
# SSH vào server
ssh user@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

#### 2. Deploy Application

```bash
# Clone repository
git clone https://github.com/your-username/PaymentGateWay.git
cd PaymentGateWay/backend

# Install dependencies
npm install --production

# Create .env file
nano .env
# Copy và update tất cả production credentials

# Start với PM2
pm2 start server.js --name payment-gateway
pm2 save
pm2 startup
```

#### 3. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/payment-gateway
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/payment-gateway /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. Setup SSL với Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Option 2: Heroku

#### 1. Prepare Application

```bash
# Create Procfile
echo "web: node backend/server.js" > Procfile

# Update package.json
{
  "scripts": {
    "start": "node backend/server.js"
  },
  "engines": {
    "node": "18.x"
  }
}
```

#### 2. Deploy

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create your-payment-gateway

# Add environment variables
heroku config:set NODE_ENV=production
heroku config:set PORT=3001
heroku config:set VNPAY_TMN_CODE=your_code
# ... thêm tất cả environment variables

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Option 3: Docker + Docker Compose

#### 1. Create Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    env_file:
      - ./backend/.env
    restart: unless-stopped
    depends_on:
      - mongodb

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  mongo-data:
```

#### 3. Deploy

```bash
# Build và start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Option 4: Vercel/Netlify (Serverless)

⚠️ **Note**: Cần chuyển đổi sang serverless functions

```javascript
// api/vnpay/create.js (Vercel)
import { VNPayUtil } from '../../utils/vnpay.util';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const vnpay = new VNPayUtil({
      tmnCode: process.env.VNPAY_TMN_CODE,
      hashSecret: process.env.VNPAY_HASH_SECRET,
      url: process.env.VNPAY_URL,
      returnUrl: process.env.VNPAY_RETURN_URL
    });

    const paymentUrl = vnpay.createPaymentUrl({
      ...req.body,
      ipAddr: req.headers['x-forwarded-for'] || req.socket.remoteAddress
    });

    res.json({
      success: true,
      paymentUrl
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
```

## 🔒 Security Checklist

- [ ] Enable HTTPS/SSL
- [ ] Set secure environment variables
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Enable CORS properly
- [ ] Use strong secrets/keys
- [ ] Regular security updates
- [ ] Implement logging
- [ ] Setup monitoring
- [ ] Backup database regularly

## 📊 Monitoring & Logging

### 1. PM2 Monitoring

```bash
# Install PM2 Plus
pm2 plus

# Monitor
pm2 monit
```

### 2. Winston Logger

```bash
npm install winston
```

```javascript
// config/logger.js
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

### 3. Application Performance Monitoring (APM)

Options:
- New Relic
- DataDog
- Sentry
- LogRocket

## 🔄 CI/CD Setup

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd backend
        npm ci
    
    - name: Run tests
      run: |
        cd backend
        npm test
    
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /path/to/app
          git pull
          cd backend
          npm install --production
          pm2 restart payment-gateway
```

## 🎯 Production Checklist

### Before Go-Live:

- [ ] Update all credentials to production
- [ ] Change sandbox URLs to production URLs
- [ ] Setup production database
- [ ] Configure HTTPS/SSL
- [ ] Setup domain và DNS
- [ ] Configure firewall
- [ ] Test all payment flows
- [ ] Setup monitoring
- [ ] Setup backup strategy
- [ ] Configure error tracking
- [ ] Setup rate limiting
- [ ] Document API endpoints
- [ ] Prepare rollback plan
- [ ] Test load capacity
- [ ] Setup alerting
- [ ] Review security measures

### After Go-Live:

- [ ] Monitor logs actively
- [ ] Check payment success rate
- [ ] Monitor server resources
- [ ] Setup scheduled backups
- [ ] Regular security updates
- [ ] Performance optimization
- [ ] Customer support ready

## 🆘 Troubleshooting

### Common Issues:

1. **Port 3001 already in use**
```bash
# Find process
sudo lsof -i :3001
# Kill process
sudo kill -9 <PID>
```

2. **Database connection failed**
- Check database is running
- Verify credentials
- Check firewall rules

3. **Payment gateway errors**
- Verify credentials
- Check sandbox vs production URLs
- Review payment gateway documentation

4. **High CPU usage**
- Check for memory leaks
- Review inefficient code
- Consider horizontal scaling

## 📚 Resources

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/getting-started/)

## 📞 Support

Nếu gặp vấn đề trong quá trình deploy:
1. Check server logs
2. Verify environment variables
3. Test với curl/Postman
4. Review payment gateway documentation
5. Check firewall và network settings

---

**Good luck with your deployment! 🚀**

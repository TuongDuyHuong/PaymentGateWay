import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import vnpayRoutes from './routes/vnpay.routes.js';
import momoRoutes from './routes/momo.routes.js';
import zalopayRoutes from './routes/zalopay.routes.js';
import viettelmoneyRoutes from './routes/viettelmoney.routes.js';
import paypalRoutes from './routes/paypal.routes.js';
import transactionRoutes from './routes/transaction.routes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Payment Gateway Backend is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/vnpay', vnpayRoutes);
app.use('/api/momo', momoRoutes);
app.use('/api/zalopay', zalopayRoutes);
app.use('/api/viettelmoney', viettelmoneyRoutes);
app.use('/api/paypal', paypalRoutes);
app.use('/api/transactions', transactionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Payment Gateway Backend running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

export default app;

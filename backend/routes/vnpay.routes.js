import express from 'express';
import { VNPayUtil } from '../utils/vnpay.util.js';

const router = express.Router();

// Initialize VNPay util
const vnpayConfig = {
  tmnCode: process.env.VNPAY_TMN_CODE,
  hashSecret: process.env.VNPAY_HASH_SECRET,
  url: process.env.VNPAY_URL,
  returnUrl: process.env.VNPAY_RETURN_URL
};

const vnpay = new VNPayUtil(vnpayConfig);

/**
 * Create VNPay payment URL
 * POST /api/vnpay/create
 */
router.post('/create', (req, res) => {
  try {
    const {
      orderId,
      amount,
      orderInfo,
      bankCode,
      locale
    } = req.body;

    // Validate required fields
    if (!orderId || !amount || !orderInfo) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: orderId, amount, orderInfo'
      });
    }

    // Get IP address
    const ipAddr = req.headers['x-forwarded-for'] || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress ||
                   '127.0.0.1';

    const paymentUrl = vnpay.createPaymentUrl({
      orderId,
      amount,
      orderInfo,
      bankCode,
      locale: locale || 'vn',
      ipAddr
    });

    res.json({
      success: true,
      paymentUrl,
      message: 'Payment URL created successfully'
    });
  } catch (error) {
    console.error('VNPay create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment URL',
      error: error.message
    });
  }
});

/**
 * VNPay callback handler
 * GET /api/vnpay/callback
 */
router.get('/callback', (req, res) => {
  try {
    const vnp_Params = req.query;
    
    // Verify signature
    const isValid = vnpay.verifyReturnUrl(vnp_Params);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    const responseCode = vnp_Params.vnp_ResponseCode;
    const orderId = vnp_Params.vnp_TxnRef;
    const amount = vnp_Params.vnp_Amount / 100; // Convert back from smallest unit
    const transactionNo = vnp_Params.vnp_TransactionNo;
    const bankCode = vnp_Params.vnp_BankCode;

    // Check payment status
    if (responseCode === '00') {
      // Payment successful
      res.json({
        success: true,
        message: 'Payment successful',
        data: {
          orderId,
          amount,
          transactionNo,
          bankCode,
          responseCode
        }
      });
    } else {
      // Payment failed
      res.json({
        success: false,
        message: 'Payment failed',
        data: {
          orderId,
          responseCode
        }
      });
    }
  } catch (error) {
    console.error('VNPay callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process callback',
      error: error.message
    });
  }
});

/**
 * VNPay IPN (Instant Payment Notification) handler
 * POST /api/vnpay/ipn
 */
router.post('/ipn', (req, res) => {
  try {
    const vnp_Params = req.body;
    
    // Verify signature
    const isValid = vnpay.verifyReturnUrl(vnp_Params);

    if (!isValid) {
      return res.json({
        RspCode: '97',
        Message: 'Invalid signature'
      });
    }

    const responseCode = vnp_Params.vnp_ResponseCode;
    const orderId = vnp_Params.vnp_TxnRef;

    // TODO: Update order status in database based on responseCode
    // For now, just return success

    res.json({
      RspCode: '00',
      Message: 'Confirm Success'
    });
  } catch (error) {
    console.error('VNPay IPN error:', error);
    res.json({
      RspCode: '99',
      Message: 'Unknown error'
    });
  }
});

/**
 * Query transaction status
 * POST /api/vnpay/query
 */
router.post('/query', async (req, res) => {
  try {
    const {
      orderId,
      transactionDate
    } = req.body;

    if (!orderId || !transactionDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: orderId, transactionDate'
      });
    }

    const ipAddr = req.headers['x-forwarded-for'] || 
                   req.connection.remoteAddress || 
                   '127.0.0.1';

    const queryParams = await vnpay.queryTransaction({
      orderId,
      transactionDate,
      ipAddr
    });

    res.json({
      success: true,
      data: queryParams
    });
  } catch (error) {
    console.error('VNPay query error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to query transaction',
      error: error.message
    });
  }
});

export default router;

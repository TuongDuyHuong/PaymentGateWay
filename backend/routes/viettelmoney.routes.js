import express from 'express';
import crypto from 'crypto';
import axios from 'axios';

const router = express.Router();

// ViettelMoney configuration
const config = {
  partnerCode: process.env.VIETTELMONEY_PARTNER_CODE,
  accessKey: process.env.VIETTELMONEY_ACCESS_KEY,
  secretKey: process.env.VIETTELMONEY_SECRET_KEY,
  endpoint: process.env.VIETTELMONEY_ENDPOINT,
  callbackUrl: process.env.VIETTELMONEY_CALLBACK_URL
};

/**
 * Create HMAC SHA256 signature
 */
const createSignature = (data, key) => {
  return crypto
    .createHmac('sha256', key)
    .update(data)
    .digest('hex');
};

/**
 * Create ViettelMoney payment
 * POST /api/viettelmoney/create
 */
router.post('/create', async (req, res) => {
  try {
    const {
      orderId,
      amount,
      orderInfo,
      providerCode,
      extraData
    } = req.body;

    // Validate required fields
    if (!orderId || !amount || !orderInfo) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: orderId, amount, orderInfo'
      });
    }

    const requestId = `${config.partnerCode}${Date.now()}`;
    const requestTime = Date.now();

    // Create raw signature string
    const rawSignature = `partnerCode=${config.partnerCode}&accessKey=${config.accessKey}&requestId=${requestId}&amount=${amount}&orderId=${orderId}&orderInfo=${orderInfo}&returnUrl=${config.callbackUrl}&notifyUrl=${config.callbackUrl}&extraData=${extraData || ''}&requestTime=${requestTime}`;

    const signature = createSignature(rawSignature, config.secretKey);

    const requestBody = {
      partnerCode: config.partnerCode,
      accessKey: config.accessKey,
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      returnUrl: config.callbackUrl,
      notifyUrl: config.callbackUrl,
      extraData: extraData || '',
      requestTime: requestTime,
      providerCode: providerCode || 'viettelmoney',
      signature: signature
    };

    // For demo purposes, simulate successful payment creation
    // In production, you would call the actual ViettelMoney API
    const mockResponse = {
      resultCode: 0,
      message: 'Success',
      paymentUrl: `${config.endpoint}?requestId=${requestId}`,
      qrCodeUrl: `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(orderId)}`,
      requestId: requestId
    };

    res.json({
      success: true,
      paymentUrl: mockResponse.paymentUrl,
      qrCodeUrl: mockResponse.qrCodeUrl,
      message: 'Payment created successfully',
      data: mockResponse
    });

  } catch (error) {
    console.error('ViettelMoney create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment',
      error: error.message
    });
  }
});

/**
 * ViettelMoney callback handler
 * POST /api/viettelmoney/callback
 */
router.post('/callback', (req, res) => {
  try {
    const params = req.body;
    const signature = params.signature;

    // Build signature string (adjust based on actual ViettelMoney documentation)
    const rawSignature = `orderId=${params.orderId}&resultCode=${params.resultCode}&message=${params.message}&requestId=${params.requestId}`;
    
    const checkSignature = createSignature(rawSignature, config.secretKey);

    if (signature !== checkSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    const resultCode = parseInt(params.resultCode);
    const orderId = params.orderId;
    const amount = params.amount;
    const transId = params.transId;

    // Check payment status
    if (resultCode === 0) {
      // Payment successful
      res.json({
        success: true,
        message: 'Payment successful',
        data: {
          orderId,
          amount,
          transId,
          resultCode
        }
      });
    } else {
      // Payment failed
      res.json({
        success: false,
        message: params.message || 'Payment failed',
        data: {
          orderId,
          resultCode
        }
      });
    }
  } catch (error) {
    console.error('ViettelMoney callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process callback',
      error: error.message
    });
  }
});

/**
 * Query transaction status
 * POST /api/viettelmoney/query
 */
router.post('/query', async (req, res) => {
  try {
    const {
      orderId,
      requestId
    } = req.body;

    if (!orderId || !requestId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: orderId, requestId'
      });
    }

    // For demo purposes, return mock response
    // In production, you would call the actual ViettelMoney query API
    const mockResponse = {
      resultCode: 0,
      message: 'Success',
      orderId: orderId,
      requestId: requestId,
      status: 'completed'
    };

    res.json({
      success: true,
      data: mockResponse
    });
  } catch (error) {
    console.error('ViettelMoney query error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to query transaction',
      error: error.message
    });
  }
});

export default router;

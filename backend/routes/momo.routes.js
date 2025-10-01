import express from 'express';
import { MomoUtil } from '../utils/momo.util.js';

const router = express.Router();

// Initialize Momo util
const momoConfig = {
  partnerCode: process.env.MOMO_PARTNER_CODE,
  accessKey: process.env.MOMO_ACCESS_KEY,
  secretKey: process.env.MOMO_SECRET_KEY,
  endpoint: process.env.MOMO_ENDPOINT,
  returnUrl: process.env.MOMO_RETURN_URL,
  notifyUrl: process.env.MOMO_NOTIFY_URL
};

const momo = new MomoUtil(momoConfig);

/**
 * Create Momo payment
 * POST /api/momo/create
 */
router.post('/create', async (req, res) => {
  try {
    const {
      orderId,
      amount,
      orderInfo,
      extraData
    } = req.body;

    // Validate required fields
    if (!orderId || !amount || !orderInfo) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: orderId, amount, orderInfo'
      });
    }

    const result = await momo.createPayment({
      orderId,
      amount,
      orderInfo,
      extraData
    });

    if (result.resultCode === 0) {
      res.json({
        success: true,
        payUrl: result.payUrl,
        deeplink: result.deeplink,
        qrCodeUrl: result.qrCodeUrl,
        message: 'Payment created successfully',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message || 'Failed to create payment',
        data: result
      });
    }
  } catch (error) {
    console.error('Momo create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment',
      error: error.message
    });
  }
});

/**
 * Momo callback handler
 * GET /api/momo/callback
 */
router.get('/callback', (req, res) => {
  try {
    const params = req.query;

    // Verify signature
    const isValid = momo.verifySignature(params);

    if (!isValid) {
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
    console.error('Momo callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process callback',
      error: error.message
    });
  }
});

/**
 * Momo IPN (Instant Payment Notification) handler
 * POST /api/momo/notify
 */
router.post('/notify', (req, res) => {
  try {
    const params = req.body;

    // Verify signature
    const isValid = momo.verifySignature(params);

    if (!isValid) {
      return res.status(204).send();
    }

    const resultCode = parseInt(params.resultCode);
    const orderId = params.orderId;

    // TODO: Update order status in database based on resultCode
    // For now, just return success

    res.status(204).send();
  } catch (error) {
    console.error('Momo IPN error:', error);
    res.status(204).send();
  }
});

/**
 * Query transaction status
 * POST /api/momo/query
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

    const result = await momo.queryTransaction(orderId, requestId);

    res.json({
      success: result.resultCode === 0,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('Momo query error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to query transaction',
      error: error.message
    });
  }
});

export default router;

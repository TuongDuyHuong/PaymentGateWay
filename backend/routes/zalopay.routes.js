import express from 'express';
import { ZaloPayUtil } from '../utils/zalopay.util.js';

const router = express.Router();

// Initialize ZaloPay util
const zalopayConfig = {
  appId: process.env.ZALOPAY_APP_ID,
  key1: process.env.ZALOPAY_KEY1,
  key2: process.env.ZALOPAY_KEY2,
  endpoint: process.env.ZALOPAY_ENDPOINT,
  callbackUrl: process.env.ZALOPAY_CALLBACK_URL
};

const zalopay = new ZaloPayUtil(zalopayConfig);

/**
 * Create ZaloPay payment
 * POST /api/zalopay/create
 */
router.post('/create', async (req, res) => {
  try {
    const {
      orderId,
      amount,
      description,
      items,
      bankCode
    } = req.body;

    // Validate required fields
    if (!orderId || !amount || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: orderId, amount, description'
      });
    }

    const result = await zalopay.createPayment({
      orderId,
      amount,
      description,
      items,
      bankCode
    });

    if (result.return_code === 1) {
      res.json({
        success: true,
        orderUrl: result.order_url,
        appTransId: result.app_trans_id,
        message: 'Payment created successfully',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.return_message || 'Failed to create payment',
        data: result
      });
    }
  } catch (error) {
    console.error('ZaloPay create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment',
      error: error.message
    });
  }
});

/**
 * ZaloPay callback handler
 * POST /api/zalopay/callback
 */
router.post('/callback', (req, res) => {
  try {
    const { data: dataStr, mac: reqMac } = req.body;

    // Verify signature
    const isValid = zalopay.verifyCallback(dataStr, reqMac);

    if (!isValid) {
      return res.json({
        return_code: -1,
        return_message: 'Invalid signature'
      });
    }

    const data = JSON.parse(dataStr);
    const appTransId = data.app_trans_id;
    const amount = data.amount;
    const status = data.status;

    // TODO: Update order status in database
    // For now, just return success

    res.json({
      return_code: 1,
      return_message: 'success'
    });
  } catch (error) {
    console.error('ZaloPay callback error:', error);
    res.json({
      return_code: 0,
      return_message: error.message
    });
  }
});

/**
 * Query transaction status
 * POST /api/zalopay/query
 */
router.post('/query', async (req, res) => {
  try {
    const { appTransId } = req.body;

    if (!appTransId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: appTransId'
      });
    }

    const result = await zalopay.queryTransaction(appTransId);

    res.json({
      success: result.return_code === 1,
      message: result.return_message,
      data: result
    });
  } catch (error) {
    console.error('ZaloPay query error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to query transaction',
      error: error.message
    });
  }
});

export default router;

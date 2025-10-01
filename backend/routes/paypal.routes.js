import express from 'express';
import axios from 'axios';

const router = express.Router();

// PayPal configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';
const PAYPAL_API = PAYPAL_MODE === 'sandbox' 
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

/**
 * Get PayPal access token
 */
const getAccessToken = async () => {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  
  try {
    const response = await axios.post(
      `${PAYPAL_API}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    return response.data.access_token;
  } catch (error) {
    console.error('PayPal get token error:', error);
    throw error;
  }
};

/**
 * Create PayPal order
 * POST /api/paypal/create
 */
router.post('/create', async (req, res) => {
  try {
    const {
      amount,
      currency,
      orderId,
      description
    } = req.body;

    // Validate required fields
    if (!amount || !currency) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: amount, currency'
      });
    }

    const accessToken = await getAccessToken();

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: orderId || `ORDER_${Date.now()}`,
        description: description || 'Purchase from website',
        amount: {
          currency_code: currency,
          value: amount.toFixed(2)
        }
      }],
      application_context: {
        return_url: process.env.PAYPAL_RETURN_URL,
        cancel_url: process.env.PAYPAL_CANCEL_URL,
        brand_name: 'Your Store',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW'
      }
    };

    const response = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders`,
      orderData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const approveLink = response.data.links.find(link => link.rel === 'approve');

    res.json({
      success: true,
      orderId: response.data.id,
      approveUrl: approveLink.href,
      message: 'PayPal order created successfully',
      data: response.data
    });
  } catch (error) {
    console.error('PayPal create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create PayPal order',
      error: error.response?.data || error.message
    });
  }
});

/**
 * Capture PayPal order
 * POST /api/paypal/capture/:orderId
 */
router.post('/capture/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Missing order ID'
      });
    }

    const accessToken = await getAccessToken();

    const response = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const captureStatus = response.data.status;

    res.json({
      success: captureStatus === 'COMPLETED',
      message: captureStatus === 'COMPLETED' ? 'Payment captured successfully' : 'Payment capture failed',
      data: response.data
    });
  } catch (error) {
    console.error('PayPal capture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to capture PayPal payment',
      error: error.response?.data || error.message
    });
  }
});

/**
 * Get PayPal order details
 * GET /api/paypal/order/:orderId
 */
router.get('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Missing order ID'
      });
    }

    const accessToken = await getAccessToken();

    const response = await axios.get(
      `${PAYPAL_API}/v2/checkout/orders/${orderId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('PayPal get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get PayPal order',
      error: error.response?.data || error.message
    });
  }
});

/**
 * PayPal success callback
 * GET /api/paypal/success
 */
router.get('/success', (req, res) => {
  const { token, PayerID } = req.query;
  
  // Redirect to frontend with success parameters
  res.redirect(`${process.env.CORS_ORIGIN}/payment-success?token=${token}&PayerID=${PayerID}`);
});

/**
 * PayPal cancel callback
 * GET /api/paypal/cancel
 */
router.get('/cancel', (req, res) => {
  const { token } = req.query;
  
  // Redirect to frontend with cancel parameters
  res.redirect(`${process.env.CORS_ORIGIN}/payment-cancel?token=${token}`);
});

/**
 * PayPal webhook handler
 * POST /api/paypal/webhook
 */
router.post('/webhook', (req, res) => {
  try {
    const event = req.body;
    
    // TODO: Verify webhook signature
    // TODO: Handle different event types
    
    console.log('PayPal webhook event:', event.event_type);
    
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        // Handle successful payment
        console.log('Payment completed:', event.resource);
        break;
      case 'PAYMENT.CAPTURE.DENIED':
        // Handle denied payment
        console.log('Payment denied:', event.resource);
        break;
      default:
        console.log('Unhandled event type:', event.event_type);
    }
    
    res.status(200).send();
  } catch (error) {
    console.error('PayPal webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process webhook',
      error: error.message
    });
  }
});

export default router;

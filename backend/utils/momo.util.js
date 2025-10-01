import crypto from 'crypto';
import axios from 'axios';

/**
 * Momo Utility Functions
 * Handles Momo e-wallet payment gateway integration
 */

export class MomoUtil {
  constructor(config) {
    this.partnerCode = config.partnerCode;
    this.accessKey = config.accessKey;
    this.secretKey = config.secretKey;
    this.endpoint = config.endpoint;
    this.returnUrl = config.returnUrl;
    this.notifyUrl = config.notifyUrl;
  }

  /**
   * Create HMAC SHA256 signature
   */
  createSignature(data) {
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(data)
      .digest('hex');
  }

  /**
   * Create payment request
   */
  async createPayment(params) {
    const {
      orderId,
      amount,
      orderInfo,
      extraData
    } = params;

    const requestId = `${this.partnerCode}${Date.now()}`;
    const requestType = 'captureWallet';

    // Create raw signature string
    const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData || ''}&ipnUrl=${this.notifyUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.partnerCode}&redirectUrl=${this.returnUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = this.createSignature(rawSignature);

    const requestBody = {
      partnerCode: this.partnerCode,
      accessKey: this.accessKey,
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: this.returnUrl,
      ipnUrl: this.notifyUrl,
      extraData: extraData || '',
      requestType: requestType,
      signature: signature,
      lang: 'vi'
    };

    try {
      const response = await axios.post(this.endpoint, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Momo payment error:', error);
      throw error;
    }
  }

  /**
   * Verify callback signature
   */
  verifySignature(params) {
    const {
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature
    } = params;

    const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData || ''}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${this.partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const checkSignature = this.createSignature(rawSignature);

    return signature === checkSignature;
  }

  /**
   * Query transaction status
   */
  async queryTransaction(orderId, requestId) {
    const rawSignature = `accessKey=${this.accessKey}&orderId=${orderId}&partnerCode=${this.partnerCode}&requestId=${requestId}`;
    const signature = this.createSignature(rawSignature);

    const requestBody = {
      partnerCode: this.partnerCode,
      accessKey: this.accessKey,
      requestId: requestId,
      orderId: orderId,
      signature: signature,
      lang: 'vi'
    };

    try {
      const response = await axios.post(
        'https://test-payment.momo.vn/v2/gateway/api/query',
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Momo query error:', error);
      throw error;
    }
  }
}

export default MomoUtil;

import crypto from 'crypto';
import axios from 'axios';
import moment from 'moment';

/**
 * ZaloPay Utility Functions
 * Handles ZaloPay payment gateway integration
 */

export class ZaloPayUtil {
  constructor(config) {
    this.appId = config.appId;
    this.key1 = config.key1;
    this.key2 = config.key2;
    this.endpoint = config.endpoint;
    this.callbackUrl = config.callbackUrl;
  }

  /**
   * Create HMAC SHA256 signature
   */
  createSignature(data, key) {
    return crypto
      .createHmac('sha256', key)
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
      description,
      items,
      bankCode
    } = params;

    const embedData = {
      redirecturl: this.callbackUrl
    };

    const transId = `${moment().format('YYMMDD')}_${orderId}`;
    const appTime = Date.now();

    const orderData = {
      app_id: parseInt(this.appId),
      app_trans_id: transId,
      app_user: 'user123',
      app_time: appTime,
      amount: amount,
      item: JSON.stringify(items || []),
      embed_data: JSON.stringify(embedData),
      description: description,
      bank_code: bankCode || ''
    };

    // Create signature
    const data = `${this.appId}|${orderData.app_trans_id}|${orderData.app_user}|${orderData.amount}|${orderData.app_time}|${orderData.embed_data}|${orderData.item}`;
    const mac = this.createSignature(data, this.key1);

    orderData.mac = mac;

    try {
      const response = await axios.post(this.endpoint, null, {
        params: orderData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return {
        ...response.data,
        app_trans_id: transId
      };
    } catch (error) {
      console.error('ZaloPay payment error:', error);
      throw error;
    }
  }

  /**
   * Verify callback signature
   */
  verifyCallback(dataStr, reqMac) {
    const mac = this.createSignature(dataStr, this.key2);
    return mac === reqMac;
  }

  /**
   * Query transaction status
   */
  async queryTransaction(appTransId) {
    const data = `${this.appId}|${appTransId}|${this.key1}`;
    const mac = this.createSignature(data, this.key1);

    const postData = {
      app_id: this.appId,
      app_trans_id: appTransId,
      mac: mac
    };

    try {
      const response = await axios.post(
        'https://sb-openapi.zalopay.vn/v2/query',
        null,
        {
          params: postData,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('ZaloPay query error:', error);
      throw error;
    }
  }
}

export default ZaloPayUtil;

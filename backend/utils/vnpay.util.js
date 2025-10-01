import crypto from 'crypto';
import qs from 'qs';
import moment from 'moment';

/**
 * VNPay Utility Functions
 * Handles VNPay payment gateway integration
 */

export class VNPayUtil {
  constructor(config) {
    this.tmnCode = config.tmnCode;
    this.hashSecret = config.hashSecret;
    this.url = config.url;
    this.returnUrl = config.returnUrl;
  }

  /**
   * Sort object by key
   */
  sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach((key) => {
      sorted[key] = obj[key];
    });
    return sorted;
  }

  /**
   * Create HMAC SHA512 signature
   */
  createSignature(data, secretKey) {
    return crypto
      .createHmac('sha512', secretKey)
      .update(Buffer.from(data, 'utf-8'))
      .digest('hex');
  }

  /**
   * Create payment URL
   */
  createPaymentUrl(params) {
    const {
      orderId,
      amount,
      orderInfo,
      bankCode,
      locale,
      ipAddr
    } = params;

    const createDate = moment().format('YYYYMMDDHHmmss');
    const orderType = 'other';

    let vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.tmnCode,
      vnp_Locale: locale || 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: orderType,
      vnp_Amount: amount * 100, // VNPay requires amount in smallest currency unit
      vnp_ReturnUrl: this.returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate
    };

    if (bankCode) {
      vnp_Params.vnp_BankCode = bankCode;
    }

    vnp_Params = this.sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const secureHash = this.createSignature(signData, this.hashSecret);
    vnp_Params.vnp_SecureHash = secureHash;

    const paymentUrl = this.url + '?' + qs.stringify(vnp_Params, { encode: false });

    return paymentUrl;
  }

  /**
   * Verify callback signature
   */
  verifyReturnUrl(vnp_Params) {
    const secureHash = vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;

    const sortedParams = this.sortObject(vnp_Params);
    const signData = qs.stringify(sortedParams, { encode: false });
    const checkSum = this.createSignature(signData, this.hashSecret);

    return secureHash === checkSum;
  }

  /**
   * Query transaction status
   */
  async queryTransaction(params) {
    const {
      orderId,
      transactionDate,
      ipAddr
    } = params;

    const requestDate = moment().format('YYYYMMDDHHmmss');

    let vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'querydr',
      vnp_TmnCode: this.tmnCode,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Query transaction ${orderId}`,
      vnp_TransactionDate: transactionDate,
      vnp_CreateDate: requestDate,
      vnp_IpAddr: ipAddr
    };

    vnp_Params = this.sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const secureHash = this.createSignature(signData, this.hashSecret);
    vnp_Params.vnp_SecureHash = secureHash;

    return vnp_Params;
  }
}

export default VNPayUtil;

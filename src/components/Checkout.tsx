import React, { useState } from 'react';
import { ArrowLeft, MapPin, Phone, Mail, User, AlertCircle, Truck, Zap, Clock, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useCart, CustomerInfo } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CheckoutProps {
  onNavigate: (page: 'cart' | 'payment') => void;
  customerInfo: CustomerInfo;
  onCustomerInfoChange: (customerInfo: CustomerInfo) => void;
}

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
}

export function Checkout({ onNavigate, customerInfo, onCustomerInfoChange }: CheckoutProps) {
  const { cartItems, getTotalPrice } = useCart();
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return 'Email là bắt buộc';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Định dạng email không hợp lệ';
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone.trim()) return 'Số điện thoại là bắt buộc';
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return 'Số điện thoại không hợp lệ (VD: 0901234567)';
    }
    return undefined;
  };

  const validateName = (name: string, fieldName: string): string | undefined => {
    if (!name.trim()) return `${fieldName} là bắt buộc`;
    if (name.trim().length < 2) return `${fieldName} phải có ít nhất 2 ký tự`;
    const nameRegex = /^[a-zA-ZàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđĐ\s]+$/;
    if (!nameRegex.test(name)) return `${fieldName} chỉ được chứa chữ cái`;
    return undefined;
  };

  const validateAddress = (address: string): string | undefined => {
    if (!address.trim()) return 'Địa chỉ là bắt buộc';
    if (address.trim().length < 10) return 'Địa chỉ phải có ít nhất 10 ký tự';
    return undefined;
  };

  const validateCity = (city: string): string | undefined => {
    if (!city.trim()) return 'Tỉnh/Thành phố là bắt buộc';
    if (city.trim().length < 2) return 'Tên tỉnh/thành phố phải có ít nhất 2 ký tự';
    return undefined;
  };

  const validateField = (field: keyof CustomerInfo, value: string): string | undefined => {
    switch (field) {
      case 'firstName':
        return validateName(value, 'Họ');
      case 'lastName':
        return validateName(value, 'Tên');
      case 'email':
        return validateEmail(value);
      case 'phone':
        return validatePhone(value);
      case 'address':
        return validateAddress(value);
      case 'city':
        return validateCity(value);
      default:
        return undefined;
    }
  };

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    const updatedInfo = {
      ...customerInfo,
      [field]: value
    };
    onCustomerInfoChange(updatedInfo);

    // Mark field as touched
    setTouchedFields(prev => new Set([...prev, field]));

    // Validate field in real-time
    const error = validateField(field, value);
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleFieldBlur = (field: keyof CustomerInfo) => {
    setTouchedFields(prev => new Set([...prev, field]));
    const error = validateField(field, customerInfo[field]);
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const isFormValid = () => {
    // Check if all required fields are filled
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city'] as const;
    const allFieldsFilled = requiredFields.every(field => customerInfo[field].trim() !== '');
    
    // Check if there are any validation errors
    const hasValidationErrors = requiredFields.some(field => {
      const error = validateField(field, customerInfo[field]);
      return error !== undefined;
    });
    
    return allFieldsFilled && !hasValidationErrors;
  };

  const shippingCost = getTotalPrice() >= 50000 ? 0 : 50000;
  const expressShippingCost = 50000;
  const totalShippingCost = shippingMethod === 'express' ? expressShippingCost : shippingCost;
  const totalPrice = getTotalPrice() + totalShippingCost;

  const handleProceedToPayment = () => {
    if (isFormValid()) {
      onNavigate('payment');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => onNavigate('cart')}
          className="text-white hover:text-yellow-600 mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại giỏ hàng
        </Button>
        <h1 className="text-2xl text-white">Thông tin giao hàng</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer Information Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Contact Information */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="w-5 h-5 mr-2" />
                Thông tin liên hệ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-white block mb-2">Họ *</Label>
                  <Input
                    id="firstName"
                    value={customerInfo.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    onBlur={() => handleFieldBlur('firstName')}
                    className={`bg-gray-800 border-gray-600 text-white h-11 ${
                      touchedFields.has('firstName') && validationErrors.firstName 
                        ? 'border-red-500 focus:border-red-500' 
                        : ''
                    }`}
                    placeholder="Nhập họ của bạn"
                  />
                  {touchedFields.has('firstName') && validationErrors.firstName && (
                    <div className="flex items-center space-x-1 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{validationErrors.firstName}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-white block mb-2">Tên *</Label>
                  <Input
                    id="lastName"
                    value={customerInfo.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    onBlur={() => handleFieldBlur('lastName')}
                    className={`bg-gray-800 border-gray-600 text-white h-11 ${
                      touchedFields.has('lastName') && validationErrors.lastName 
                        ? 'border-red-500 focus:border-red-500' 
                        : ''
                    }`}
                    placeholder="Nhập tên của bạn"
                  />
                  {touchedFields.has('lastName') && validationErrors.lastName && (
                    <div className="flex items-center space-x-1 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{validationErrors.lastName}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white block mb-2">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => handleFieldBlur('email')}
                    className={`bg-gray-800 border-gray-600 text-white pl-10 h-11 ${
                      touchedFields.has('email') && validationErrors.email 
                        ? 'border-red-500 focus:border-red-500' 
                        : ''
                    }`}
                    placeholder="example@email.com"
                  />
                </div>
                {touchedFields.has('email') && validationErrors.email && (
                  <div className="flex items-center space-x-1 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationErrors.email}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white block mb-2">Số điện thoại *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    onBlur={() => handleFieldBlur('phone')}
                    className={`bg-gray-800 border-gray-600 text-white pl-10 h-11 ${
                      touchedFields.has('phone') && validationErrors.phone 
                        ? 'border-red-500 focus:border-red-500' 
                        : ''
                    }`}
                    placeholder="0901 234 567"
                  />
                </div>
                {touchedFields.has('phone') && validationErrors.phone && (
                  <div className="flex items-center space-x-1 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationErrors.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Địa chỉ giao hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-white block mb-2">Địa chỉ *</Label>
                <Input
                  id="address"
                  value={customerInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  onBlur={() => handleFieldBlur('address')}
                  className={`bg-gray-800 border-gray-600 text-white h-11 ${
                    touchedFields.has('address') && validationErrors.address 
                      ? 'border-red-500 focus:border-red-500' 
                      : ''
                  }`}
                  placeholder="Số nhà, tên đường"
                />
                {touchedFields.has('address') && validationErrors.address && (
                  <div className="flex items-center space-x-1 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationErrors.address}</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ward" className="text-white block mb-2">Phường/Xã</Label>
                  <Input
                    id="ward"
                    value={customerInfo.ward}
                    onChange={(e) => handleInputChange('ward', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white h-11"
                    placeholder="Phường/Xã"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district" className="text-white block mb-2">Quận/Huyện</Label>
                  <Input
                    id="district"
                    value={customerInfo.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white h-11"
                    placeholder="Quận/Huyện"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-white block mb-2">Tỉnh/Thành phố *</Label>
                  <Input
                    id="city"
                    value={customerInfo.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    onBlur={() => handleFieldBlur('city')}
                    className={`bg-gray-800 border-gray-600 text-white h-11 ${
                      touchedFields.has('city') && validationErrors.city 
                        ? 'border-red-500 focus:border-red-500' 
                        : ''
                    }`}
                    placeholder="Tỉnh/Thành phố"
                  />
                  {touchedFields.has('city') && validationErrors.city && (
                    <div className="flex items-center space-x-1 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{validationErrors.city}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-white block mb-2">Ghi chú (tùy chọn)</Label>
                <Textarea
                  id="notes"
                  value={customerInfo.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white min-h-[88px]"
                  placeholder="Ghi chú cho đơn hàng (ví dụ: giao hàng tận tay, gọi trước khi giao...)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Shipping Method */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Phương thức vận chuyển</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="space-y-4">
                {/* Standard Shipping */}
                <div className={`relative rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                  shippingMethod === 'standard' 
                    ? 'border-yellow-500 bg-yellow-500/5 shadow-lg shadow-yellow-500/10' 
                    : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
                }`}>
                  <div className="flex items-start space-x-4 p-5">
                    <RadioGroupItem 
                      value="standard" 
                      id="standard" 
                      className="mt-2 data-[state=checked]:border-yellow-500 data-[state=checked]:text-yellow-500" 
                    />
                    <div className="flex-1">
                      <Label htmlFor="standard" className="cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${
                                shippingMethod === 'standard' 
                                  ? 'bg-yellow-500/20 text-yellow-400' 
                                  : 'bg-gray-700 text-gray-400'
                              }`}>
                                <Truck className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-white font-semibold text-lg">Giao hàng tiêu chuẩn</div>
                                <div className="text-gray-400 text-sm flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>3-5 ngày làm việc</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-400 ml-11">
                              {shippingCost === 0 ? (
                                <div className="flex items-center space-x-1 text-green-400">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Miễn phí cho đơn hàng từ 500.000₫</span>
                                </div>
                              ) : (
                                <span>Phí giao hàng áp dụng cho đơn hàng dưới 500.000₫</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xl font-bold ${
                              shippingMethod === 'standard' ? 'text-yellow-400' : 'text-white'
                            }`}>
                              {shippingCost === 0 ? 'Miễn phí' : formatPrice(shippingCost)}
                            </div>
                            {shippingCost === 0 && (
                              <div className="text-xs text-green-400 font-medium">Được khuyến mãi</div>
                            )}
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                  {shippingMethod === 'standard' && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-yellow-500 text-black p-1 rounded-full">
                        <CheckCircle className="w-4 h-4 fill-current" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Express Shipping */}
                <div className={`relative rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                  shippingMethod === 'express' 
                    ? 'border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/10' 
                    : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
                }`}>
                  <div className="flex items-start space-x-4 p-5">
                    <RadioGroupItem 
                      value="express" 
                      id="express" 
                      className="mt-2 data-[state=checked]:border-blue-500 data-[state=checked]:text-blue-500" 
                    />
                    <div className="flex-1">
                      <Label htmlFor="express" className="cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${
                                shippingMethod === 'express' 
                                  ? 'bg-blue-500/20 text-blue-400' 
                                  : 'bg-gray-700 text-gray-400'
                              }`}>
                                <Zap className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <div className="text-white font-semibold text-lg">Giao hàng nhanh</div>
                                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                    HOT
                                  </div>
                                </div>
                                <div className="text-gray-400 text-sm flex items-center space-x-1">
                                  <Zap className="w-3 h-3" />
                                  <span>1-2 ngày làm việc</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-400 ml-11">
                              <div className="flex items-center space-x-1">
                                <CheckCircle className="w-3 h-3 text-blue-400" />
                                <span>Giao hàng trong nội thành, có thể giao trong ngày</span>
                              </div>
                              <div className="mt-1 text-xs text-blue-400">
                                ⚡ Ưu tiên xử lý và vận chuyển
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xl font-bold ${
                              shippingMethod === 'express' ? 'text-blue-400' : 'text-white'
                            }`}>
                              {formatPrice(expressShippingCost)}
                            </div>
                            <div className="text-xs text-gray-400">Phí ưu tiên</div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                  {shippingMethod === 'express' && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-blue-500 text-white p-1 rounded-full">
                        <CheckCircle className="w-4 h-4 fill-current" />
                      </div>
                    </div>
                  )}
                </div>
              </RadioGroup>
              
              {/* Shipping Info */}
              <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="text-sm text-gray-300">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">Thông tin vận chuyển:</span>
                  </div>
                  <div className="ml-6 space-y-1 text-xs text-gray-400">
                    <div>• Giao hàng toàn quốc qua đối tác vận chuyển uy tín</div>
                    <div>• Đóng gói cẩn thận, bảo vệ sản phẩm tối đa</div>
                    <div>• Hỗ trợ theo dõi vận đơn 24/7</div>
                    <div>• Giao hàng tận nơi, hỗ trợ kiểm tra trước khi nhận</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="bg-gray-900 border-gray-700 sticky top-8">
            <CardHeader>
              <CardTitle className="text-white">Đơn hàng của bạn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 flex-shrink-0">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm truncate">{item.name}</div>
                      <div className="text-gray-400 text-xs">Số lượng: {item.quantity}</div>
                    </div>
                    <div className="text-white text-sm">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator className="bg-gray-700" />
              
              {/* Price Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Phí vận chuyển:</span>
                  <span>
                    {totalShippingCost === 0 ? (
                      <span className="text-green-500">Miễn phí</span>
                    ) : (
                      formatPrice(totalShippingCost)
                    )}
                  </span>
                </div>
              </div>
              
              <Separator className="bg-gray-700" />
              
              <div className="flex justify-between text-xl text-white font-semibold">
                <span>Tổng cộng:</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              
              <div className="space-y-4 pt-2">
                <Button 
                  className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-semibold h-12"
                  onClick={handleProceedToPayment}
                  disabled={!isFormValid()}
                >
                  Tiến hành thanh toán
                </Button>
                
                {!isFormValid() && (
                  <div className="text-center text-sm text-red-400 bg-red-500 bg-opacity-10 p-3 rounded-lg border border-red-500 border-opacity-20">
                    <div className="font-medium mb-1 flex items-center justify-center space-x-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>Thông tin chưa hợp lệ</span>
                    </div>
                    <div>Vui lòng kiểm tra và điền đúng định dạng các trường bắt buộc (*)</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
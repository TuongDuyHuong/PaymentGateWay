import React from 'react';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { useCart } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CartProps {
  onNavigate: (page: 'home' | 'checkout') => void;
}

export function Cart({ onNavigate }: CartProps) {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const shippingCost = getTotalPrice() >= 1000000 ? 0 : 50000;
  const totalPrice = getTotalPrice() + shippingCost;

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl text-white mb-4">Giỏ hàng trống</h2>
          <p className="text-gray-400 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
          <Button 
            onClick={() => onNavigate('home')}
            className="bg-yellow-600 hover:bg-yellow-500 text-black"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tiếp tục mua sắm
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => onNavigate('home')}
          className="text-white hover:text-yellow-600 mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tiếp tục mua sắm
        </Button>
        <h1 className="text-2xl text-white">Giỏ hàng của bạn</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id} className="bg-gray-900 border-gray-700">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-32 h-32 flex-shrink-0">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div>
                      <h3 className="text-white text-lg">{item.name}</h3>
                      <p className="text-gray-400 text-sm">{item.material}</p>
                    </div>
                    
                    <div className="text-yellow-600 font-semibold">
                      {formatPrice(item.price)}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 p-0 border-gray-500 bg-gray-800 bg-opacity-50 text-white hover:bg-gray-700 hover:border-gray-400"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-white px-3">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 p-0 border-gray-500 bg-gray-800 bg-opacity-50 text-white hover:bg-gray-700 hover:border-gray-400"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-400 hover:bg-red-950"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="bg-gray-900 border-gray-700 sticky top-8">
            <CardHeader>
              <CardTitle className="text-white">Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Phí vận chuyển:</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-green-500">Miễn phí</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
                {getTotalPrice() < 1000000 && (
                  <div className="text-sm text-yellow-600">
                    Mua thêm {formatPrice(1000000 - getTotalPrice())} để được miễn phí vận chuyển
                  </div>
                )}
              </div>
              
              <Separator className="bg-gray-700" />
              
              <div className="flex justify-between text-xl text-white font-semibold">
                <span>Tổng cộng:</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              
              <Button 
                className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-semibold"
                onClick={() => onNavigate('checkout')}
              >
                Tiến hành thanh toán
              </Button>
              
              <div className="text-center text-sm text-gray-400">
                Miễn phí đổi trả trong 30 ngày
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
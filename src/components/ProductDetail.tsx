import React, { useState } from 'react';
import { ArrowLeft, Star, ShoppingCart, Truck, Shield, RotateCcw, MessageCircle, User } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import { Product, useCart } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: () => void;
}

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export function ProductDetail({ product, onBack, onAddToCart }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      customerName: 'Nguyễn Thị Mai',
      rating: 5,
      comment: 'Sản phẩm rất đẹp, chất lượng bạc tốt. Đóng gói cẩn thận, giao hàng nhanh.',
      date: '2024-01-15',
      verified: true
    },
    {
      id: '2', 
      customerName: 'Trần Văn Nam',
      rating: 4,
      comment: 'Thiết kế tinh tế, phù hợp làm quà tặng. Price hợp lý.',
      date: '2024-01-10',
      verified: true
    }
  ]);
  
  const { transactions } = useCart();
  
  // Kiểm tra xem khách hàng đã mua sản phẩm này chưa
  const hasUserPurchased = transactions.some(transaction => 
    transaction.status === 'completed' && 
    transaction.items.some(item => item.id === product.id)
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const renderStars = (rating: number, interactive = false, onStarClick?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'} ${
          interactive ? 'cursor-pointer hover:text-yellow-300' : ''
        }`}
        onClick={interactive && onStarClick ? () => onStarClick(i + 1) : undefined}
      />
    ));
  };

  const handleSubmitReview = () => {
    if (userRating === 0 || userComment.trim() === '') {
      alert('Vui lòng đánh giá sao và nhập bình luận');
      return;
    }

    const newReview: Review = {
      id: Date.now().toString(),
      customerName: 'Khách hàng đã mua hàng',
      rating: userRating,
      comment: userComment.trim(),
      date: new Date().toISOString().split('T')[0],
      verified: true
    };

    setReviews(prev => [newReview, ...prev]);
    setUserRating(0);
    setUserComment('');
    alert('Cảm ơn bạn đã đánh giá sản phẩm!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Tính tổng số đánh giá: số đánh giá ban đầu + số đánh giá mới được thêm
  const totalReviews = product.reviews + reviews.length;

  const images = [product.image, product.image, product.image, product.image];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-6 text-white hover:text-yellow-600"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative">
            <ImageWithFallback
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-96 lg:h-[500px] object-cover rounded-lg"
            />
            {product.originalPrice && (
              <Badge className="absolute top-4 left-4 bg-red-600 text-white">
                Giảm 10%
              </Badge>
            )}
          </div>
          
          {/* Thumbnail images */}
          <div className="flex space-x-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`border-2 rounded-lg overflow-hidden ${
                  selectedImage === index ? 'border-yellow-600' : 'border-gray-600'
                }`}
              >
                <ImageWithFallback
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="w-16 h-16 object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="text-yellow-600 text-sm tracking-wider mb-2">AGUST</div>
            <h1 className="text-3xl text-white mb-4">{product.name}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex items-center mr-4">
                {renderStars(product.rating)}
              </div>
              <span className="text-gray-400">({totalReviews} đánh giá)</span>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            {product.originalPrice && (
              <div className="text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </div>
            )}
            <div className="text-3xl text-white">
              {formatPrice(product.price)}
            </div>
            {product.originalPrice && (
              <div className="text-green-500 text-sm">
                Tiết kiệm {formatPrice(product.originalPrice - product.price)}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Chất liệu:</span>
              <span className="text-white">{product.material}</span>
            </div>
            {product.size && (
              <div className="flex justify-between">
                <span className="text-gray-400">Kích thước:</span>
                <span className="text-white">{product.size}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Tình trạng:</span>
              <span className={product.inStock ? 'text-green-500' : 'text-red-500'}>
                {product.inStock ? 'Còn hàng' : 'Hết hàng'}
              </span>
            </div>
          </div>

          <Separator className="bg-gray-700" />

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="text-white">Số lượng:</span>
              <div className="flex items-center border border-gray-600 rounded">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-white hover:bg-gray-700"
                >
                  -
                </Button>
                <span className="px-4 py-1 text-white">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-white hover:bg-gray-700"
                >
                  +
                </Button>
              </div>
            </div>

            <Button 
              className="w-full bg-yellow-600 hover:bg-yellow-500 text-black"
              onClick={onAddToCart}
              disabled={!product.inStock}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Thêm vào giỏ hàng
            </Button>
          </div>

          {/* Features */}
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-yellow-600" />
                <div>
                  <div className="text-white">Miễn phí vận chuyển</div>
                  <div className="text-gray-400 text-sm">Đơn hàng từ 1.000.000 VNĐ</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-yellow-600" />
                <div>
                  <div className="text-white">Bảo hành 12 tháng</div>
                  <div className="text-gray-400 text-sm">Miễn phí bảo trì và làm sạch</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="w-5 h-5 text-yellow-600" />
                <div>
                  <div className="text-white">Đổi trả trong 30 ngày</div>
                  <div className="text-gray-400 text-sm">Hoàn tiền 100% nếu không hài lòng</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-xl text-white">Mô tả sản phẩm</h3>
            <p className="text-gray-300 leading-relaxed">
              {product.description}
            </p>
            <p className="text-gray-300 leading-relaxed">
              Được chế tác từ bạc S925 nguyên chất với độ tinh khiết 92.5%, sản phẩm đảm bảo 
              chất lượng cao và độ bền vượt trời. Thiết kế độc đáo được tạo ra bởi đội ngũ nghệ 
              nhân có kinh nghiệm hơn 20 năm trong ngành trang sức.
            </p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Write Review (Only for customers who purchased) */}
          {hasUserPurchased && (
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Đánh giá sản phẩm
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Đánh giá của bạn:</label>
                  <div className="flex items-center space-x-1">
                    {renderStars(userRating, true, setUserRating)}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Bình luận:</label>
                  <Textarea
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                    className="bg-gray-800 border-gray-600 text-white"
                    rows={4}
                  />
                </div>
                <Button 
                  onClick={handleSubmitReview}
                  className="bg-yellow-600 hover:bg-yellow-500 text-black"
                >
                  Gửi đánh giá
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Display Reviews */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-400" />
                  Đánh giá khách hàng
                </span>
                <Badge className="bg-yellow-600 text-black">
                  {totalReviews} đánh giá
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {totalReviews === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có đánh giá nào</p>
                  <p className="text-sm">Hãy là người đầu tiên đánh giá sản phẩm này</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Hiển thị thông báo về đánh giá ban đầu nếu có */}
                  {product.reviews > 0 && reviews.length === 0 && (
                    <div className="text-center py-4 text-gray-400 border-b border-gray-700">
                      <p className="text-sm">
                        Sản phẩm có {product.reviews} đánh giá từ khách hàng trước
                      </p>
                    </div>
                  )}
                  
                  {/* Hiển thị đánh giá mới */}
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-700 last:border-b-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-white">{review.customerName}</span>
                          {review.verified && (
                            <Badge className="bg-green-600 text-white text-xs">
                              Đã mua hàng
                            </Badge>
                          )}
                        </div>
                        <span className="text-gray-400 text-sm">{formatDate(review.date)}</span>
                      </div>
                      <div className="flex items-center mb-2">
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-gray-300">{review.comment}</p>
                    </div>
                  ))}
                  
                  {/* Placeholder cho đánh giá ban đầu nếu chưa có đánh giá mới */}
                  {product.reviews > 0 && reviews.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <div className="flex items-center justify-center mb-4">
                        {renderStars(product.rating)}
                        <span className="ml-2">Đánh giá trung bình</span>
                      </div>
                      <p className="text-sm">
                        Các đánh giá từ khách hàng trước sẽ được hiển thị sau khi bạn mua sản phẩm
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {!hasUserPurchased && (
          <div className="mt-6 text-center">
            <Card className="bg-gray-900 border-gray-700 inline-block p-4">
              <div className="text-gray-400">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Bạn cần mua sản phẩm này để có thể đánh giá</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
import React from 'react';
import { Star, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Product } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductGridProps {
  onProductClick: (product: Product) => void;
}

export function ProductGrid({ onProductClick }: ProductGridProps) {
  const products: Product[] = [
    {
      id: '1',
      name: 'Mặt dây chuyền Sonian Agust Silver ',
      price: 2400000,
      image: 'https://images.unsplash.com/vector-1757746846451-29923715d69d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8MXx8fGVufDB8fHx8fA%3D%3D',
      rating: 5,
      reviews: 1,
      description: 'Mặt dây chuyền bạc S925 độc đáo với thiết kế Sonian, thể hiện chìa khoá mở ra những cơ hội mới.',
      material: 'Bạc S925',
      inStock: true
    },
    {
      id: '2',
      name: ' Mặt dây chuyền Trident Agust Silver',
      price: 2450000,
      image: 'https://images.unsplash.com/vector-1757747310673-7294acc44908?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8MXx8fGVufDB8fHx8fA%3D%3D',
      rating: 5,
      reviews: 4,
      description: 'Thiết kế độc đáo lấy cảm hứng từ kiếm cổ với chi tiết tinh xảo trên chất liệu bạc S925 cao cấp.',
      material: 'Bạc S925',
      inStock: true
    },
    {
      id: '3',
      name: 'Mặt dây chuyền Stone Gaze Agust Silver',
      price: 2650000,
      image: 'https://images.unsplash.com/vector-1757747668772-ecc0c8403bb2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8MXx8fGVufDB8fHx8fA%3D%3D',
      rating: 5,
      reviews: 6,
      description: 'Mặt dây chuyền với thiết kế sang trọng, kết hợp giữa phong cách cổ điển và hiện đại.',
      material: 'Bạc S925',
      inStock: true
    },
    {
      id: '4',
      name: 'Mặt dây chuyền Staris Agust Silver',
      price: 1750000,
      image: 'https://images.unsplash.com/vector-1757747515609-17f396b14a04?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8MXx8fGVufDB8fHx8fA%3D%3D',
      rating: 5,
      reviews: 5,
      description: 'Thiết kế tinh tế với đường nét sắc sảo, thể hiện phong cách mạnh mẽ và cá tính.',
      material: 'Bạc S925',
      inStock: true
    },
    {
      id: '5',
      name: 'Mặt dây chuyền Scale Agust Silver',
      price: 1485000,
      originalPrice: 1650000,
      image: 'https://images.unsplash.com/vector-1757748198542-58299b103401?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8MXx8fGVufDB8fHx8fA%3D%3D',
      rating: 5,
      reviews: 8,
      description: 'Dây chuyền bạc S925 với họa tiết ngựa kết hợp với đá tiger eye, tượng trưng cho sức mạnh bền bỉ, luôn phấn đấu đạt mục tiêu đích thực.',
      material: 'Bạc S925',
      size: '50cm',
      inStock: true
    },
    {
      id: '6',
      name: 'Mặt dây chuyền Atlas Agust Silver',
      price: 2850000,
      image: 'https://images.unsplash.com/vector-1757747984250-5cc9f5f1bb3d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8MXx8fGVufDB8fHx8fA%3D%3D',
      rating: 5,
      reviews: 3,
      description: 'Mặt dây chuyền hình cánh phượng hoàng với thiết kế tinh xảo, biểu tượng của sự tái sinh và quyền lực.',
      material: 'Bạc S925',
      inStock: true
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
      />
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="relative mb-12 bg-gradient-to-r from-gray-900 to-black rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 text-center py-20 px-6">
          <h1 className="text-4xl md:text-6xl mb-4 text-white">
            MẶT DÂY CHUYỀN BẠC S925 -<br />
            KHẲNG ĐỊNH SỰ KHÁC BIỆT
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Nâng tầm phong cách với mặt dây chuyền bạc S925 được thiết kế độc nhất. Mỗi 
            mặt dây chuyền mang một câu chuyện riêng, giúp người đeo khẳng định cá tính.
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex items-center justify-between mb-8">
        <Button 
          variant="outline" 
          className="border-gray-500 bg-gray-800 bg-opacity-50 text-white hover:bg-gray-700 hover:border-gray-400">
          <Filter className="w-4 h-4 mr-2" />
          FILTERS
        </Button>
        <span className="text-gray-400">{products.length} sản phẩm</span>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card 
            key={product.id} 
            className="bg-gray-900 border-gray-700 hover:border-yellow-600 transition-colors cursor-pointer group"
            onClick={() => onProductClick(product)}
          >
            <CardContent className="p-0">
              <div className="relative overflow-hidden">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.originalPrice && (
                  <Badge className="absolute top-2 left-2 bg-red-600 text-white">
                    10% OFF
                  </Badge>
                )}
                {!product.inStock && (
                  <Badge className="absolute top-2 right-2 bg-gray-600 text-white">
                    Hết hàng
                  </Badge>
                )}
              </div>
              
              <div className="p-4">
                <div className="text-center mb-2">
                  <span className="text-xs text-yellow-600 tracking-wider">AGUST</span>
                </div>
                
                <h3 className="text-white mb-2 line-clamp-2 min-h-[48px]">
                  {product.name}
                </h3>
                
                <div className="flex items-center justify-center mb-2">
                  <div className="flex items-center mr-2">
                    {renderStars(product.rating)}
                  </div>
                  <span className="text-gray-400 text-sm">{product.reviews} đánh giá</span>
                </div>
                
                <div className="text-center mb-4">
                  {product.originalPrice && (
                    <span className="text-gray-500 line-through text-sm mr-2">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                  <span className="text-white font-semibold">
                    {formatPrice(product.price)}
                  </span>
                </div>
                
                <Button 
                  className="w-full bg-yellow-600 hover:bg-yellow-500 text-black"
                  disabled={!product.inStock}
                >
                  {product.inStock ? 'Thêm nhanh' : 'Hết hàng'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}